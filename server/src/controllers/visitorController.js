import prisma from '../prisma.js';

/**
 * Request either a Student Entry/Exit Outing Pass (EP-...)
 * or a Guest Visitor Pass (VP-...)
 */
export async function requestVisitorPass(req, res) {
  try {
    const { 
      passType = 'STUDENT_OUTING', // 'STUDENT_OUTING' or 'GUEST_VISITOR'
      visitorName, 
      visitorPhone, 
      purpose, 
      expectedArrival, 
      expectedDeparture, 
      targetStudentId,
      destination,
      outingType // DAY_OUTING, NIGHT_OUT, WEEKEND_LEAVE, EMERGENCY_MEDICAL
    } = req.body;
    
    // Determine student
    const studentId = targetStudentId ? parseInt(targetStudentId, 10) : req.user.id;
    const student = await prisma.user.findUnique({ where: { id: studentId } });

    if (!student) {
      return res.status(404).json({ error: 'Hostel student not found' });
    }

    const isStudentPass = passType === 'STUDENT_OUTING';
    const prefix = isStudentPass ? 'EP' : 'VP';
    const passCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Format purpose and phone
    const resolvedName = isStudentPass ? (student.name) : (visitorName || 'Guest Visitor');
    const resolvedPhone = isStudentPass 
      ? (visitorPhone || student.phone || '9876543210') 
      : (visitorPhone || '9876543210');
    
    const formattedPurpose = isStudentPass
      ? `[OUTING: ${outingType || 'DAY_OUTING'}] ${destination || purpose || 'Campus Outing'}`
      : `[GUEST] ${purpose || 'Guest Visit'}`;

    // For student passes:
    // expectedArrival = departure time from hostel
    // expectedDeparture = expected return / curfew time
    const departureTime = expectedArrival ? new Date(expectedArrival) : new Date();
    
    // Default curfew: 9:30 PM today or +4 hours
    let returnCurfewTime;
    if (expectedDeparture) {
      returnCurfewTime = new Date(expectedDeparture);
    } else {
      returnCurfewTime = new Date();
      returnCurfewTime.setHours(21, 30, 0, 0); // 09:30 PM curfew
      if (returnCurfewTime <= departureTime) {
        returnCurfewTime = new Date(departureTime.getTime() + 4 * 60 * 60 * 1000);
      }
    }

    const pass = await prisma.visitorPass.create({
      data: {
        passCode,
        studentId: student.id,
        visitorName: resolvedName,
        visitorPhone: resolvedPhone,
        purpose: formattedPurpose,
        expectedArrival: departureTime,
        expectedDeparture: returnCurfewTime,
        status: 'APPROVED' // Pre-approved for instant gate clearance
      },
      include: {
        student: { select: { id: true, name: true, roomNumber: true, rollNumber: true, phone: true } }
      }
    });

    res.status(201).json({
      message: `${isStudentPass ? 'Student Outing Pass' : 'Visitor Pass'} created successfully`,
      passCode,
      pass
    });
  } catch (err) {
    console.error('Error creating pass:', err);
    res.status(500).json({ error: 'Failed to create pass' });
  }
}

export async function updatePassApproval(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const pass = await prisma.visitorPass.update({
      where: { id: parseInt(id, 10) },
      data: { status },
      include: { student: { select: { name: true, roomNumber: true, rollNumber: true } } }
    });

    res.json({ message: `Pass ${status.toLowerCase()}`, pass });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pass approval' });
  }
}

/**
 * Scan or Verify Pass by Code (supports raw code or QR json)
 */
export async function scanOrVerifyPass(req, res) {
  try {
    let { passCode } = req.query;
    if (!passCode) {
      return res.status(400).json({ error: 'Pass code or QR token is required' });
    }

    passCode = passCode.trim();

    // Check if the scanned string is JSON from a QR code
    if (passCode.startsWith('{') && passCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(passCode);
        if (parsed.passCode) passCode = parsed.passCode;
      } catch (e) {
        // keep as is
      }
    }

    // Extract (EP|VP)-... code if embedded in JSON, URL, or raw string
    const match = passCode.match(/(EP|VP)-[A-Z0-9\-]+/i);
    const normalizedCode = match ? match[0].toUpperCase() : passCode.toUpperCase();

    let pass = await prisma.visitorPass.findUnique({
      where: { passCode: normalizedCode },
      include: {
        student: { select: { id: true, name: true, roomNumber: true, phone: true, rollNumber: true } }
      }
    });

    if (!pass) {
      pass = await prisma.visitorPass.findFirst({
        where: {
          passCode: {
            equals: normalizedCode,
            mode: 'insensitive'
          }
        },
        include: {
          student: { select: { id: true, name: true, roomNumber: true, phone: true, rollNumber: true } }
        }
      });
    }

    if (!pass) {
      return res.status(404).json({ valid: false, error: `Invalid QR Pass: No matching pass found for "${normalizedCode}". Please verify code or create a new pass.` });
    }

    const isStudentPass = pass.passCode.startsWith('EP-') || pass.purpose.includes('[OUTING:');
    const now = new Date();

    // Check Curfew / Overstay logic
    const curfewTime = new Date(pass.expectedDeparture);
    const isPastCurfew = now > curfewTime;
    const minutesLate = isPastCurfew ? Math.round((now.getTime() - curfewTime.getTime()) / 60000) : 0;

    let nextAllowedAction = null;
    let actionLabel = '';

    if (isStudentPass) {
      if (pass.status === 'APPROVED') {
        nextAllowedAction = 'EXIT';
        actionLabel = 'Stamp Exit (Student Leaving Campus)';
      } else if (pass.status === 'CHECKED_OUT') {
        nextAllowedAction = 'ENTRY';
        actionLabel = isPastCurfew 
          ? `Stamp Entry (Late Return: ${minutesLate}m late)` 
          : 'Stamp Entry (Student Returning to Campus)';
      } else if (pass.status === 'CHECKED_IN') {
        actionLabel = 'Completed: Student has already returned safely to campus.';
      }
    } else {
      // Guest Visitor Pass
      if (pass.status === 'APPROVED') {
        nextAllowedAction = 'ENTRY';
        actionLabel = 'Stamp Entry (Guest Check-In)';
      } else if (pass.status === 'CHECKED_IN') {
        nextAllowedAction = 'EXIT';
        actionLabel = 'Stamp Exit (Guest Check-Out)';
      } else if (pass.status === 'CHECKED_OUT') {
        actionLabel = 'Completed: Visitor has already checked out of campus.';
      }
    }

    res.json({
      valid: true,
      pass,
      isStudentPass,
      isPastCurfew,
      minutesLate,
      nextAllowedAction,
      actionLabel,
      status: pass.status
    });
  } catch (err) {
    console.error('Error verifying pass:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

/**
 * Stamp Gate Action (EXIT or ENTRY)
 */
export async function stampGateAction(req, res) {
  try {
    const { passCode, action } = req.body; // action: 'EXIT' or 'ENTRY'
    if (!passCode) {
      return res.status(400).json({ error: 'Pass code is required' });
    }

    const match = passCode.trim().match(/(EP|VP)-[A-Z0-9\-]+/i);
    const normalizedCode = match ? match[0].toUpperCase() : passCode.trim().toUpperCase();

    let pass = await prisma.visitorPass.findUnique({
      where: { passCode: normalizedCode },
      include: { student: true }
    });

    if (!pass) {
      pass = await prisma.visitorPass.findFirst({
        where: {
          passCode: {
            equals: normalizedCode,
            mode: 'insensitive'
          }
        },
        include: { student: true }
      });
    }

    if (!pass) {
      return res.status(404).json({ error: `Pass "${normalizedCode}" not found in records.` });
    }

    const isStudentPass = pass.passCode.startsWith('EP-') || pass.purpose.includes('[OUTING:');
    const now = new Date();
    let newStatus = pass.status;
    const updateData = {};

    if (action === 'EXIT') {
      newStatus = 'CHECKED_OUT';
      updateData.status = 'CHECKED_OUT';
      updateData.actualCheckOut = now;
    } else if (action === 'ENTRY') {
      newStatus = 'CHECKED_IN';
      updateData.status = 'CHECKED_IN';
      updateData.actualCheckIn = now;
    }

    const updated = await prisma.visitorPass.update({
      where: { id: pass.id },
      data: updateData,
      include: { student: { select: { id: true, name: true, roomNumber: true, rollNumber: true, phone: true } } }
    });

    // Check if entry was late
    const isLate = action === 'ENTRY' && isStudentPass && now > new Date(pass.expectedDeparture);
    const minutesLate = isLate ? Math.round((now.getTime() - new Date(pass.expectedDeparture).getTime()) / 60000) : 0;

    res.json({
      message: `Successfully stamped ${action} for ${isStudentPass ? pass.student?.name : pass.visitorName}`,
      pass: updated,
      isLate,
      minutesLate
    });
  } catch (err) {
    console.error('Error stamping gate action:', err);
    res.status(500).json({ error: 'Failed to stamp gate action' });
  }
}

export async function checkInVisitor(req, res) {
  req.body.action = 'ENTRY';
  return stampGateAction(req, res);
}

export async function checkOutVisitor(req, res) {
  req.body.action = 'EXIT';
  return stampGateAction(req, res);
}

/**
 * Gate Guard Live Roster
 */
export async function getActiveVisitors(req, res) {
  try {
    const now = new Date();

    // 1. Visitors inside
    const visitorsInside = await prisma.visitorPass.findMany({
      where: {
        status: 'CHECKED_IN',
        passCode: { startsWith: 'VP-' }
      },
      include: {
        student: { select: { name: true, roomNumber: true, phone: true } }
      },
      orderBy: { actualCheckIn: 'desc' }
    });

    // 2. Students currently outside
    const studentsOutside = await prisma.visitorPass.findMany({
      where: {
        status: 'CHECKED_OUT',
        passCode: { startsWith: 'EP-' }
      },
      include: {
        student: { select: { name: true, roomNumber: true, rollNumber: true, phone: true } }
      },
      orderBy: { actualCheckOut: 'desc' }
    });

    const formattedVisitors = visitorsInside.map(p => ({
      ...p,
      isOverstay: new Date(p.expectedDeparture) < now,
      minutesInside: p.actualCheckIn ? Math.round((now.getTime() - new Date(p.actualCheckIn).getTime()) / 60000) : 0
    }));

    const formattedStudents = studentsOutside.map(p => {
      const curfewTime = new Date(p.expectedDeparture);
      const isPastCurfew = now > curfewTime;
      const minutesOutside = p.actualCheckOut ? Math.round((now.getTime() - new Date(p.actualCheckOut).getTime()) / 60000) : 0;
      const minutesLate = isPastCurfew ? Math.round((now.getTime() - curfewTime.getTime()) / 60000) : 0;
      return {
        ...p,
        isPastCurfew,
        minutesOutside,
        minutesLate
      };
    });

    res.json({
      visitorsInside: formattedVisitors,
      studentsOutside: formattedStudents,
      activeVisitorsCount: formattedVisitors.length,
      studentsOutsideCount: formattedStudents.length,
      overstayCount: formattedVisitors.filter(p => p.isOverstay).length + formattedStudents.filter(p => p.isPastCurfew).length,
      visitors: formattedVisitors // for backward compatibility
    });
  } catch (err) {
    console.error('Error fetching gate roster:', err);
    res.status(500).json({ error: 'Failed to fetch active gate roster' });
  }
}

export async function getAllVisitorPasses(req, res) {
  try {
    const where = {};
    if (req.user?.role === 'STUDENT') {
      where.studentId = req.user.id;
    }

    const passes = await prisma.visitorPass.findMany({
      where,
      include: {
        student: { select: { name: true, roomNumber: true, rollNumber: true, phone: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 60
    });

    res.json({ passes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch passes' });
  }
}
