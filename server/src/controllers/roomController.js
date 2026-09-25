import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { rankRoomsForStudent, calculateCompatibilityScore } from '../engines/allocationEngine.js';

async function getEnrichedRooms(where = {}) {
  const rooms = await prisma.room.findMany({
    where,
    include: {
      alerts: {
        where: { status: 'ACTIVE' }
      }
    },
    orderBy: [{ block: 'asc' }, { roomNumber: 'asc' }]
  });

  const roomNumbers = rooms.map(r => r.roomNumber);
  const students = await prisma.user.findMany({
    where: {
      roomNumber: { in: roomNumbers }
    },
    select: {
      id: true,
      name: true,
      email: true,
      rollNumber: true,
      roomNumber: true,
      preference: true
    }
  });

  const studentsByRoom = {};
  for (const s of students) {
    if (!studentsByRoom[s.roomNumber]) {
      studentsByRoom[s.roomNumber] = [];
    }
    studentsByRoom[s.roomNumber].push(s);
  }

  return rooms.map(r => ({
    ...r,
    students: studentsByRoom[r.roomNumber] || []
  }));
}

export async function getAllRooms(req, res) {
  try {
    const { block, floor, type, availableOnly } = req.query;

    const where = {};
    if (block) where.block = block;
    if (floor) where.floor = parseInt(floor, 10);
    if (type) where.type = type;

    const enrichedRooms = await getEnrichedRooms(where);

    const filtered = availableOnly === 'true'
      ? enrichedRooms.filter(r => r.occupancy < r.capacity)
      : enrichedRooms;

    res.json({ rooms: filtered });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

export async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const {
      studySchedule,
      sleepTime,
      cleanlinessLevel,
      noiseTolerance,
      acPreference,
      preferredFloor,
      targetRoommateEmail
    } = req.body;

    const pref = await prisma.studentPreference.upsert({
      where: { userId },
      update: {
        studySchedule,
        sleepTime,
        cleanlinessLevel: parseInt(cleanlinessLevel, 10) || 4,
        noiseTolerance,
        acPreference: Boolean(acPreference),
        preferredFloor: parseInt(preferredFloor, 10) || 1,
        targetRoommateEmail
      },
      create: {
        userId,
        studySchedule: studySchedule || 'FLEXIBLE',
        sleepTime: sleepTime || '23:00',
        cleanlinessLevel: parseInt(cleanlinessLevel, 10) || 4,
        noiseTolerance: noiseTolerance || 'MODERATE',
        acPreference: Boolean(acPreference),
        preferredFloor: parseInt(preferredFloor, 10) || 1,
        targetRoommateEmail
      }
    });

    res.json({ message: 'Preferences updated successfully', preference: pref });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
}

export async function getMyAllocation(req, res) {
  try {
    const userId = req.user.id;
    const student = await prisma.user.findUnique({
      where: { id: userId },
      include: { preference: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!student.roomNumber) {
      return res.json({
        allocated: false,
        student: {
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email
        },
        preference: student.preference,
        status: 'PENDING_WARDEN_ALLOCATION',
        message: 'Your room allotment is pending review by the Block Warden. The Warden uses AI lifestyle matching to pair you with compatible roommates.'
      });
    }

    // Fetch room details
    const room = await prisma.room.findUnique({
      where: { roomNumber: student.roomNumber }
    });

    // Fetch roommates in the same room
    const otherStudents = await prisma.user.findMany({
      where: {
        roomNumber: student.roomNumber,
        id: { not: student.id }
      },
      include: { preference: true }
    });

    const roommates = otherStudents.map(other => {
      const match = calculateCompatibilityScore(student.preference, other.preference);
      return {
        id: other.id,
        name: other.name,
        rollNumber: other.rollNumber,
        email: other.email,
        phone: other.phone,
        preference: other.preference,
        compatibilityScore: match.score,
        compatibilityFactors: match.factors,
        harmonyReason: match.recommendationReason
      };
    });

    const wardenAuthority = room?.block === 'Block A' 
      ? 'Dr. Arthur Vance (Chief Warden & Block A Manager)' 
      : 'Prof. Margaret Cole (Block Warden)';

    res.json({
      allocated: true,
      allotmentRef: `ALLOT-${new Date().getFullYear()}-${student.roomNumber.replace('-', '')}-${student.rollNumber || student.id}`,
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        phone: student.phone
      },
      roomNumber: student.roomNumber,
      room,
      roommates,
      wardenAuthority,
      allocationDate: student.updatedAt,
      term: 'Academic Year 2026 – Spring Semester',
      rules: [
        'Curfew: Main hostel gate closes at 10:30 PM on weekdays.',
        'Quiet hours observed between 11:00 PM and 06:00 AM.',
        'High-load electrical heating appliances strictly prohibited.',
        'Visitors permitted only between 09:00 AM and 07:00 PM with verified digital QR pass.'
      ]
    });
  } catch (err) {
    console.error('Error fetching student allocation detail:', err);
    res.status(500).json({ error: 'Failed to retrieve allocation details' });
  }
}


export async function getStudentRecommendations(req, res) {
  try {
    const targetUserId = req.query.userId ? parseInt(req.query.userId, 10) : req.user.id;

    const studentPref = await prisma.studentPreference.findUnique({
      where: { userId: targetUserId }
    });

    if (!studentPref) {
      return res.status(400).json({ error: 'Please set your room preferences first' });
    }

    const allRooms = await getEnrichedRooms();
    const vacantRooms = allRooms.filter(r => r.occupancy < r.capacity);
    const ranked = rankRoomsForStudent(studentPref, vacantRooms);

    res.json({
      recommendations: ranked.slice(0, 10),
      studentPreference: studentPref
    });
  } catch (err) {
    console.error('Error getting recommendations:', err);
    res.status(500).json({ error: 'Failed to compute room recommendations' });
  }
}

export async function getAdminAllocationQueue(req, res) {
  try {
    // Unallocated students with preferences
    const unallocatedStudents = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        roomNumber: null
      },
      include: {
        preference: true
      }
    });

    // Available rooms
    const allRooms = await getEnrichedRooms();
    const availableRooms = allRooms.filter(r => r.occupancy < r.capacity);

    // Compute smart suggestions for each unallocated student
    const queue = unallocatedStudents.map(student => {
      const pref = student.preference || {
        studySchedule: 'FLEXIBLE',
        sleepTime: '23:00',
        cleanlinessLevel: 3,
        noiseTolerance: 'MODERATE',
        acPreference: false,
        preferredFloor: 1
      };

      const topRanked = rankRoomsForStudent(pref, availableRooms);
      return {
        student,
        preference: pref,
        topRecommendations: topRanked.slice(0, 3)
      };
    });

    res.json({
      unallocatedCount: unallocatedStudents.length,
      availableCapacity: availableRooms.reduce((sum, r) => sum + (r.capacity - r.occupancy), 0),
      queue
    });
  } catch (err) {
    console.error('Error in admin queue:', err);
    res.status(500).json({ error: 'Failed to get allocation queue' });
  }
}

export async function allocateRoom(req, res) {
  try {
    const { studentId, roomId, studentData } = req.body;

    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId, 10) }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.occupancy >= room.capacity) {
      return res.status(400).json({ error: `Room ${room.roomNumber} is already at full capacity (${room.capacity}/${room.capacity}).` });
    }

    let student;

    if (studentData && studentData.email) {
      const email = studentData.email.trim().toLowerCase();
      const rollNumber = studentData.rollNumber ? studentData.rollNumber.trim() : null;
      
      // Check if user already exists
      student = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(rollNumber ? [{ rollNumber }] : [])
          ]
        }
      });

      if (student) {
        if (student.roomNumber) {
          return res.status(400).json({
            error: `Student ${student.name} is already allocated to Room ${student.roomNumber}. Please vacate them first if reallocating.`
          });
        }
        // Update details if provided
        student = await prisma.user.update({
          where: { id: student.id },
          data: {
            name: studentData.name || student.name,
            phone: studentData.phone || student.phone,
            rollNumber: rollNumber || student.rollNumber
          }
        });
      } else {
        // Create new student
        const passwordHash = await bcrypt.hash('hostel123', 10);
        student = await prisma.user.create({
          data: {
            name: studentData.name || 'New Resident',
            email,
            rollNumber: rollNumber || `STD-${Date.now().toString().slice(-6)}`,
            phone: studentData.phone || null,
            role: 'STUDENT',
            passwordHash
          }
        });
      }

      // Upsert preferences
      await prisma.studentPreference.upsert({
        where: { userId: student.id },
        update: {
          studySchedule: studentData.studySchedule || 'FLEXIBLE',
          sleepTime: studentData.sleepTime || '23:00',
          cleanlinessLevel: parseInt(studentData.cleanlinessLevel, 10) || 4,
          noiseTolerance: studentData.noiseTolerance || 'MODERATE',
          acPreference: studentData.acPreference !== undefined ? Boolean(studentData.acPreference) : room.type.includes('AC'),
          preferredFloor: room.floor,
          allocated: true
        },
        create: {
          userId: student.id,
          studySchedule: studentData.studySchedule || 'FLEXIBLE',
          sleepTime: studentData.sleepTime || '23:00',
          cleanlinessLevel: parseInt(studentData.cleanlinessLevel, 10) || 4,
          noiseTolerance: studentData.noiseTolerance || 'MODERATE',
          acPreference: studentData.acPreference !== undefined ? Boolean(studentData.acPreference) : room.type.includes('AC'),
          preferredFloor: room.floor,
          allocated: true
        }
      });
    } else if (studentId) {
      student = await prisma.user.findUnique({
        where: { id: parseInt(studentId, 10) }
      });

      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      if (student.roomNumber) {
        return res.status(400).json({
          error: `Student ${student.name} is already allocated to Room ${student.roomNumber}.`
        });
      }
    } else {
      return res.status(400).json({ error: 'Either studentId or studentData must be provided.' });
    }

    // Allocate student to room
    await prisma.$transaction([
      prisma.user.update({
        where: { id: student.id },
        data: { roomNumber: room.roomNumber }
      }),
      prisma.room.update({
        where: { id: room.id },
        data: { occupancy: { increment: 1 } }
      }),
      prisma.studentPreference.updateMany({
        where: { userId: student.id },
        data: { allocated: true }
      })
    ]);

    // Create initial fee invoice if none exists
    const existingInvoice = await prisma.feeInvoice.findFirst({
      where: { userId: student.id }
    });

    if (!existingInvoice) {
      const baseRent = room.basePrice || 45000;
      const messFee = 18000;
      const amenitiesFee = 3500;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      await prisma.feeInvoice.create({
        data: {
          invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
          userId: student.id,
          term: 'Spring 2026',
          baseRent,
          messFee,
          amenitiesFee,
          totalAmount: baseRent + messFee + amenitiesFee,
          dueDate,
          status: 'UNPAID'
        }
      });
    }

    res.json({
      message: `Successfully allocated Student ${student.name} (${student.rollNumber || student.email}) to Room ${room.roomNumber}`,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber,
        roomNumber: room.roomNumber
      },
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        block: room.block,
        floor: room.floor,
        type: room.type,
        occupancy: room.occupancy + 1,
        capacity: room.capacity
      }
    });
  } catch (err) {
    console.error('Allocation error:', err);
    res.status(500).json({ error: 'Failed to allocate room: ' + (err.message || 'Server error') });
  }
}

export async function testCompatibility(req, res) {
  try {
    const { prefA, prefB } = req.body;
    const result = calculateCompatibilityScore(prefA, prefB);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Invalid preference input for score calculation' });
  }
}

export async function getAllAllocatedStudents(req, res) {
  try {
    const { block, floor, search } = req.query;

    const where = {
      role: 'STUDENT',
      roomNumber: { not: null }
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { rollNumber: { contains: search } },
        { roomNumber: { contains: search } }
      ];
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        preference: true
      },
      orderBy: [
        { roomNumber: 'asc' },
        { name: 'asc' }
      ]
    });

    const roomNumbers = [...new Set(students.map(s => s.roomNumber).filter(Boolean))];
    const rooms = await prisma.room.findMany({
      where: { roomNumber: { in: roomNumbers } }
    });

    const roomMap = {};
    for (const r of rooms) {
      roomMap[r.roomNumber] = r;
    }

    // Find roommates sharing the same room
    const enriched = students.map(s => {
      const roommates = students
        .filter(other => other.id !== s.id && other.roomNumber === s.roomNumber)
        .map(other => ({ id: other.id, name: other.name, rollNumber: other.rollNumber }));

      return {
        ...s,
        roomDetails: roomMap[s.roomNumber] || null,
        roommates
      };
    }).filter(s => {
      if (block && s.roomDetails?.block !== block) return false;
      if (floor && s.roomDetails?.floor !== parseInt(floor, 10)) return false;
      return true;
    });

    res.json({
      totalAllocated: enriched.length,
      students: enriched
    });
  } catch (err) {
    console.error('Error fetching allocated students:', err);
    res.status(500).json({ error: 'Failed to fetch allocated students' });
  }
}

export async function deallocateStudent(req, res) {
  try {
    const { studentId } = req.body;
    const student = await prisma.user.findUnique({
      where: { id: parseInt(studentId, 10) }
    });

    if (!student || !student.roomNumber) {
      return res.status(400).json({ error: 'Student is not allocated to any room.' });
    }

    const room = await prisma.room.findUnique({
      where: { roomNumber: student.roomNumber }
    });

    const roomNum = student.roomNumber;

    await prisma.user.update({
      where: { id: student.id },
      data: { roomNumber: null }
    });

    await prisma.studentPreference.updateMany({
      where: { userId: student.id },
      data: { allocated: false }
    });

    if (room && room.occupancy > 0) {
      await prisma.room.update({
        where: { id: room.id },
        data: { occupancy: { decrement: 1 } }
      });
    }

    res.json({
      message: `Successfully de-allocated Student ${student.name} from Room ${roomNum}`,
      studentId: student.id
    });
  } catch (err) {
    console.error('Deallocation error:', err);
    res.status(500).json({ error: 'Failed to de-allocate student' });
  }
}

