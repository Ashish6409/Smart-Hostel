import prisma from '../prisma.js';

export async function requestVisitorPass(req, res) {
  try {
    const { visitorName, visitorPhone, purpose, expectedArrival, expectedDeparture, targetStudentId } = req.body;
    
    // Determine student
    const studentId = targetStudentId ? parseInt(targetStudentId, 10) : req.user.id;
    const student = await prisma.user.findUnique({ where: { id: studentId } });

    if (!student) {
      return res.status(404).json({ error: 'Hostel student not found' });
    }

    const passCode = `VP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // If requested by student themselves, auto-approve; else require approval
    const isStudentSelf = req.user && req.user.id === studentId;
    const status = isStudentSelf ? 'APPROVED' : 'PENDING_APPROVAL';

    const pass = await prisma.visitorPass.create({
      data: {
        passCode,
        studentId: student.id,
        visitorName,
        visitorPhone,
        purpose,
        expectedArrival: new Date(expectedArrival || Date.now()),
        expectedDeparture: new Date(expectedDeparture || Date.now() + 4 * 60 * 60 * 1000),
        status
      },
      include: {
        student: { select: { name: true, roomNumber: true, rollNumber: true } }
      }
    });

    res.status(201).json({
      message: 'Visitor pass created successfully',
      passCode,
      pass
    });
  } catch (err) {
    console.error('Error creating visitor pass:', err);
    res.status(500).json({ error: 'Failed to create visitor pass' });
  }
}

export async function updatePassApproval(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    const pass = await prisma.visitorPass.update({
      where: { id: parseInt(id, 10) },
      data: { status },
      include: { student: { select: { name: true, roomNumber: true } } }
    });

    res.json({ message: `Visitor pass ${status.toLowerCase()}`, pass });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pass approval' });
  }
}

export async function scanOrVerifyPass(req, res) {
  try {
    const { passCode } = req.query;
    if (!passCode) {
      return res.status(400).json({ error: 'Pass code or QR token is required' });
    }

    const pass = await prisma.visitorPass.findUnique({
      where: { passCode: passCode.trim().toUpperCase() },
      include: {
        student: { select: { name: true, roomNumber: true, phone: true, rollNumber: true } }
      }
    });

    if (!pass) {
      return res.status(404).json({ valid: false, error: 'Invalid QR Pass: No matching record found.' });
    }

    const now = new Date();
    const isExpired = new Date(pass.expectedDeparture) < now && pass.status !== 'CHECKED_IN';
    const isOverstay = pass.status === 'CHECKED_IN' && new Date(pass.expectedDeparture) < now;

    res.json({
      valid: pass.status === 'APPROVED' || pass.status === 'CHECKED_IN',
      pass,
      isExpired,
      isOverstay,
      status: isOverstay ? 'OVERSTAY' : pass.status
    });
  } catch (err) {
    console.error('Error verifying pass:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

export async function checkInVisitor(req, res) {
  try {
    const { passCode } = req.body;
    const pass = await prisma.visitorPass.findUnique({
      where: { passCode: passCode.trim().toUpperCase() }
    });

    if (!pass) {
      return res.status(404).json({ error: 'Visitor pass not found' });
    }

    if (pass.status !== 'APPROVED') {
      return res.status(400).json({ error: `Cannot check in pass with status: ${pass.status}` });
    }

    const updated = await prisma.visitorPass.update({
      where: { id: pass.id },
      data: {
        status: 'CHECKED_IN',
        actualCheckIn: new Date()
      },
      include: { student: true }
    });

    res.json({ message: `Checked in visitor ${pass.visitorName}`, pass: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check in visitor' });
  }
}

export async function checkOutVisitor(req, res) {
  try {
    const { passCode } = req.body;
    const pass = await prisma.visitorPass.findUnique({
      where: { passCode: passCode.trim().toUpperCase() }
    });

    if (!pass) {
      return res.status(404).json({ error: 'Visitor pass not found' });
    }

    const updated = await prisma.visitorPass.update({
      where: { id: pass.id },
      data: {
        status: 'CHECKED_OUT',
        actualCheckOut: new Date()
      },
      include: { student: true }
    });

    res.json({ message: `Checked out visitor ${pass.visitorName}`, pass: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check out visitor' });
  }
}

export async function getActiveVisitors(req, res) {
  try {
    const active = await prisma.visitorPass.findMany({
      where: {
        status: 'CHECKED_IN'
      },
      include: {
        student: { select: { name: true, roomNumber: true, phone: true } }
      },
      orderBy: { actualCheckIn: 'desc' }
    });

    const now = new Date();
    const formatted = active.map(p => ({
      ...p,
      isOverstay: new Date(p.expectedDeparture) < now,
      minutesInside: p.actualCheckIn ? Math.round((now.getTime() - new Date(p.actualCheckIn).getTime()) / 60000) : 0
    }));

    res.json({
      activeCount: formatted.length,
      overstayCount: formatted.filter(p => p.isOverstay).length,
      visitors: formatted
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active visitors' });
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
        student: { select: { name: true, roomNumber: true, rollNumber: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ passes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch visitor passes' });
  }
}
