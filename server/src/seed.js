import bcrypt from 'bcryptjs';
import prisma from './prisma.js';

async function main() {
  console.log('🌱 Starting Smart Hostel database seeding...');

  // Clear existing records cleanly
  await prisma.feeInvoice.deleteMany();
  await prisma.visitorPass.deleteMany();
  await prisma.studentLeave.deleteMany();
  await prisma.mealLog.deleteMany();
  await prisma.maintenanceAlert.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.studentPreference.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();

  console.log('Cleared existing data.');

  // 1. Seed Rooms
  const roomsData = [
    // Block A (High occupancy ~96%)
    { roomNumber: 'A-101', block: 'Block A', floor: 1, type: 'Single AC', capacity: 1, occupancy: 1, basePrice: 65000, amenities: 'AC, Attached Bath, Study Desk' },
    { roomNumber: 'A-102', block: 'Block A', floor: 1, type: 'Double AC', capacity: 2, occupancy: 2, basePrice: 50000, amenities: 'AC, WiFi, Balcony' },
    { roomNumber: 'A-103', block: 'Block A', floor: 1, type: 'Double Non-AC', capacity: 2, occupancy: 2, basePrice: 38000, amenities: 'Ceiling Fan, Shared Bath' },
    { roomNumber: 'A-104', block: 'Block A', floor: 1, type: 'Double AC', capacity: 2, occupancy: 2, basePrice: 50000, amenities: 'AC, Split Inverter, Study Table' },
    { roomNumber: 'A-105', block: 'Block A', floor: 1, type: 'Triple Non-AC', capacity: 3, occupancy: 3, basePrice: 32000, amenities: 'High Speed WiFi, Lockers' },
    { roomNumber: 'A-201', block: 'Block A', floor: 2, type: 'Single AC', capacity: 1, occupancy: 1, basePrice: 65000, amenities: 'AC, Attached Bath, Garden View' },
    { roomNumber: 'A-202', block: 'Block A', floor: 2, type: 'Double AC', capacity: 2, occupancy: 2, basePrice: 50000, amenities: 'AC, High Ceiling, Balcony' },
    { roomNumber: 'A-203', block: 'Block A', floor: 2, type: 'Double Non-AC', capacity: 2, occupancy: 2, basePrice: 38000, amenities: 'Balcony, Study Lamps' },
    { roomNumber: 'A-301', block: 'Block A', floor: 3, type: 'Single AC', capacity: 1, occupancy: 1, basePrice: 65000, amenities: 'AC, Top Floor Quiet, Terrace Access' },
    { roomNumber: 'A-302', block: 'Block A', floor: 3, type: 'Double AC', capacity: 2, occupancy: 1, basePrice: 50000, amenities: 'AC, Panoramic Window' }, // 1 spot available

    // Block B
    { roomNumber: 'B-101', block: 'Block B', floor: 1, type: 'Double Non-AC', capacity: 2, occupancy: 1, basePrice: 38000, amenities: 'Ground Floor, Accessible' },
    { roomNumber: 'B-102', block: 'Block B', floor: 1, type: 'Double Non-AC', capacity: 2, occupancy: 2, basePrice: 38000, amenities: 'Attached Bath, Storage' },
    { roomNumber: 'B-201', block: 'Block B', floor: 2, type: 'Single AC', capacity: 1, occupancy: 1, basePrice: 65000, amenities: 'AC, Private Bath, High Speed LAN' },
    { roomNumber: 'B-202', block: 'Block B', floor: 2, type: 'Double AC', capacity: 2, occupancy: 0, basePrice: 50000, amenities: 'AC, Dual Study Desks' }, // vacant
    { roomNumber: 'B-204', block: 'Block B', floor: 2, type: 'Triple Non-AC', capacity: 3, occupancy: 1, basePrice: 32000, amenities: 'Spacious, Three Wardrobes' }, // 2 spots

    // Block C
    { roomNumber: 'C-101', block: 'Block C', floor: 1, type: 'Double AC', capacity: 2, occupancy: 1, basePrice: 50000, amenities: 'AC, Modern Flooring' },
    { roomNumber: 'C-102', block: 'Block C', floor: 1, type: 'Double Non-AC', capacity: 2, occupancy: 0, basePrice: 38000, amenities: 'Well Ventilated, Sunny' }, // vacant
    { roomNumber: 'C-201', block: 'Block C', floor: 2, type: 'Single AC', capacity: 1, occupancy: 0, basePrice: 65000, amenities: 'AC, Premium Suite' }, // vacant
    { roomNumber: 'C-202', block: 'Block C', floor: 2, type: 'Triple Non-AC', capacity: 3, occupancy: 0, basePrice: 32000, amenities: 'Triple Bed, High Speed WiFi' }, // vacant
  ];

  for (const r of roomsData) {
    await prisma.room.create({ data: r });
  }
  console.log(`Created ${roomsData.length} rooms.`);

  // 2. Seed Users
  const defaultPasswordHash = await bcrypt.hash('hostel123', 10);

  // Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Arthur Vance (Chief Warden & Admin)',
      email: 'admin@hostel.edu',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      phone: '+91 98765 00001'
    }
  });

  // Warden
  const warden = await prisma.user.create({
    data: {
      name: 'Prof. Margaret Cole (Block Warden)',
      email: 'warden@hostel.edu',
      passwordHash: defaultPasswordHash,
      role: 'WARDEN',
      phone: '+91 98765 00002'
    }
  });

  // Security Guard
  const guard = await prisma.user.create({
    data: {
      name: 'Ramesh Singh (Main Gate Security)',
      email: 'guard.ramesh@hostel.edu',
      passwordHash: defaultPasswordHash,
      role: 'SECURITY',
      phone: '+91 98765 00003'
    }
  });

  // Maintenance Staff (Domain Specialists)
  const staffElectrical = await prisma.user.create({
    data: {
      name: 'Suresh Kumar (Senior Electrician & HVAC)',
      email: 'tech.suresh@hostel.edu',
      passwordHash: defaultPasswordHash,
      role: 'STAFF',
      phone: '+91 98765 00004'
    }
  });

  const staffPlumbing = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Master Plumber)',
      email: 'tech.rajesh@hostel.edu',
      passwordHash: defaultPasswordHash,
      role: 'STAFF',
      phone: '+91 98765 00005'
    }
  });

  const staffCivil = await prisma.user.create({
    data: {
      name: 'Anil Verma (Carpentry & Civil Support)',
      email: 'tech.anil@hostel.edu',
      passwordHash: defaultPasswordHash,
      role: 'STAFF',
      phone: '+91 98765 00006'
    }
  });

  // Students
  const studentsData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@hostel.edu',
      rollNumber: 'CS23B042',
      roomNumber: 'A-104',
      phone: '+91 91234 56789',
      preference: {
        studySchedule: 'NIGHT_OWL',
        sleepTime: '02:00',
        cleanlinessLevel: 4,
        noiseTolerance: 'MODERATE',
        acPreference: true,
        preferredFloor: 1,
        allocated: true
      }
    },
    {
      name: 'Amit Patel',
      email: 'amit.patel@hostel.edu',
      rollNumber: 'CS23B043',
      roomNumber: 'A-104',
      phone: '+91 91234 56790',
      preference: {
        studySchedule: 'NIGHT_OWL',
        sleepTime: '01:30',
        cleanlinessLevel: 4,
        noiseTolerance: 'MODERATE',
        acPreference: true,
        preferredFloor: 1,
        allocated: true
      }
    },
    {
      name: 'Priya Verma',
      email: 'priya.verma@hostel.edu',
      rollNumber: 'EC23B018',
      roomNumber: 'B-201',
      phone: '+91 91234 56791',
      preference: {
        studySchedule: 'EARLY_BIRD',
        sleepTime: '22:30',
        cleanlinessLevel: 5,
        noiseTolerance: 'QUIET',
        acPreference: true,
        preferredFloor: 2,
        allocated: true
      }
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@hostel.edu',
      rollNumber: 'ME23B099',
      roomNumber: 'C-101',
      phone: '+91 91234 56792',
      preference: {
        studySchedule: 'FLEXIBLE',
        sleepTime: '23:30',
        cleanlinessLevel: 4,
        noiseTolerance: 'MODERATE',
        acPreference: true,
        preferredFloor: 1,
        allocated: true
      }
    },
    // Unallocated Students ready for Smart Room Allocation testing
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@hostel.edu',
      rollNumber: 'CS24B001',
      roomNumber: null,
      phone: '+91 91234 56793',
      preference: {
        studySchedule: 'NIGHT_OWL',
        sleepTime: '01:30',
        cleanlinessLevel: 4,
        noiseTolerance: 'MODERATE',
        acPreference: true,
        preferredFloor: 2,
        allocated: false
      }
    },
    {
      name: 'Ananya Joshi',
      email: 'ananya.joshi@hostel.edu',
      rollNumber: 'CS24B002',
      roomNumber: null,
      phone: '+91 91234 56794',
      preference: {
        studySchedule: 'EARLY_BIRD',
        sleepTime: '22:00',
        cleanlinessLevel: 5,
        noiseTolerance: 'QUIET',
        acPreference: true,
        preferredFloor: 3,
        allocated: false
      }
    },
    {
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@hostel.edu',
      rollNumber: 'EE24B055',
      roomNumber: null,
      phone: '+91 91234 56795',
      preference: {
        studySchedule: 'FLEXIBLE',
        sleepTime: '23:00',
        cleanlinessLevel: 3,
        noiseTolerance: 'SOCIAL',
        acPreference: false,
        preferredFloor: 1,
        allocated: false
      }
    }
  ];

  const createdStudents = [];
  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
        rollNumber: s.rollNumber,
        roomNumber: s.roomNumber,
        phone: s.phone,
        preference: {
          create: s.preference
        }
      }
    });
    createdStudents.push(student);
  }
  console.log(`Created ${createdStudents.length} students with preferences.`);

  // 3. Seed Complaints (Specifically create 4 HVAC/AC complaints in A-104 within 30 days to trigger Predictive Maintenance Alert!)
  const now = new Date();
  const complaints = [
    {
      ticketNumber: 'TKT-2026-1011',
      userId: createdStudents[0].id, // Rahul
      roomNumber: 'A-104',
      rawText: 'AC in room A-104 isn’t cooling properly and blowing warm humid air.',
      title: 'AC blowing warm air in A-104',
      category: 'HVAC/AC',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignedToStaffId: staffElectrical.id,
      resolutionNotes: 'Topped up refrigerant gas and cleaned filter.',
      createdAt: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
      resolvedAt: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000)
    },
    {
      ticketNumber: 'TKT-2026-1024',
      userId: createdStudents[1].id, // Amit
      roomNumber: 'A-104',
      rawText: 'AC in room A-104 making loud rattling and vibrating noise during operation.',
      title: 'AC rattling noise in A-104',
      category: 'HVAC/AC',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedToStaffId: staffElectrical.id,
      resolutionNotes: 'Tightened loose mounting bracket of outer unit.',
      createdAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000), // 17 days ago
      resolvedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000)
    },
    {
      ticketNumber: 'TKT-2026-1038',
      userId: createdStudents[0].id, // Rahul
      roomNumber: 'A-104',
      rawText: 'AC in room A-104 is tripping the room MCB switch every 20 minutes.',
      title: 'AC tripping MCB circuit breaker in A-104',
      category: 'HVAC/AC',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignedToStaffId: staffElectrical.id,
      resolutionNotes: 'Replaced electrical capacitor.',
      createdAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
      resolvedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000)
    },
    {
      ticketNumber: 'TKT-2026-1049',
      userId: createdStudents[1].id, // Amit
      roomNumber: 'A-104',
      rawText: 'AC in room A-104 isn’t working at all now. Completely stopped turning on.',
      title: 'AC dead in room A-104',
      category: 'HVAC/AC',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      assignedToStaffId: staffElectrical.id,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    // Plumbing complaints in B-102
    {
      ticketNumber: 'TKT-2026-1052',
      userId: createdStudents[2].id,
      roomNumber: 'B-102',
      rawText: 'Severe water leakage from bathroom sink pipe in B-102 flooding floor.',
      title: 'Bathroom water leakage in B-102',
      category: 'Plumbing',
      priority: 'HIGH',
      status: 'RESOLVED',
      assignedToStaffId: staffPlumbing.id,
      resolutionNotes: 'Replaced cracked connector pipe.',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000)
    },
    {
      ticketNumber: 'TKT-2026-1065',
      userId: createdStudents[2].id,
      roomNumber: 'B-102',
      rawText: 'Bathroom tap in B-102 is leaking continuously and low pressure.',
      title: 'Tap leaking in B-102',
      category: 'Plumbing',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedToStaffId: staffPlumbing.id,
      resolutionNotes: 'Washer replaced.',
      createdAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      ticketNumber: 'TKT-2026-1077',
      userId: createdStudents[2].id,
      roomNumber: 'B-102',
      rawText: 'Flush tank in B-102 toilet not refilling with water.',
      title: 'Flush tank issue in B-102',
      category: 'Plumbing',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedToStaffId: staffPlumbing.id,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    },
    // WiFi complaint
    {
      ticketNumber: 'TKT-2026-1088',
      userId: createdStudents[3].id,
      roomNumber: 'C-101',
      rawText: 'Corridor WiFi access point on 1st floor Block C is blinking red and unreachable.',
      title: 'WiFi AP offline in Block C',
      category: 'WiFi/Network',
      priority: 'MEDIUM',
      status: 'OPEN',
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) // 5 hours ago
    }
  ];

  for (const c of complaints) {
    await prisma.complaint.create({ data: c });
  }
  console.log(`Created ${complaints.length} complaints.`);

  // 4. Seed Meal Logs (Historical attendance logs highlighting Tuesday dinner trend)
  const meals = ['Breakfast', 'Lunch', 'Dinner'];
  for (let i = 21; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

    for (const m of meals) {
      let expected = 430;
      let prevAvg = 465;
      let prep = 440;
      let turnout = 425;

      if (m === 'Breakfast') {
        expected = 380;
        prevAvg = 405;
        prep = 390;
        turnout = 378;
      } else if (m === 'Lunch') {
        expected = 445;
        prevAvg = 470;
        prep = 455;
        turnout = 448;
      } else if (m === 'Dinner') {
        // Tuesday dinner trend: consistently lower attendance (~420 vs 465 prep)
        if (dayName === 'Tuesday') {
          expected = 420;
          prevAvg = 465;
          prep = 430; // with smart engine recommendation
          turnout = 418;
        } else {
          expected = 450;
          prevAvg = 475;
          prep = 460;
          turnout = 452;
        }
      }

      const wastedKg = Math.max(1.5, Math.round((prep - turnout) * 0.35 * 10) / 10);
      const savings = Math.max(120, (prevAvg - prep) * 65);

      await prisma.mealLog.create({
        data: {
          date: dateStr,
          mealType: m,
          expectedHeadcount: expected,
          previousAverage: prevAvg,
          recommendedPrep: prep,
          actualTurnout: turnout,
          foodWastedKg: wastedKg,
          savingsEstimated: savings
        }
      });
    }
  }
  console.log('Seeded 21 days of meal analytics logs.');

  // 5. Seed Visitor Passes
  await prisma.visitorPass.create({
    data: {
      passCode: 'VP-882194',
      studentId: createdStudents[0].id,
      visitorName: 'Sunil Sharma (Father)',
      visitorPhone: '+91 98111 22334',
      purpose: 'Semester fee discussion & family visit',
      expectedArrival: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      expectedDeparture: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      status: 'CHECKED_IN',
      actualCheckIn: new Date(now.getTime() - 95 * 60 * 1000)
    }
  });

  // Overstay visitor pass for security alerts demo
  await prisma.visitorPass.create({
    data: {
      passCode: 'VP-OVERSTAY',
      studentId: createdStudents[2].id,
      visitorName: 'Karan Mehra (Friend)',
      visitorPhone: '+91 98222 33445',
      purpose: 'Project notes delivery',
      expectedArrival: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      expectedDeparture: new Date(now.getTime() - 60 * 60 * 1000), // departed 1 hr ago
      status: 'CHECKED_IN',
      actualCheckIn: new Date(now.getTime() - 4 * 60 * 60 * 1000)
    }
  });

  // Approved QR pass awaiting entry
  await prisma.visitorPass.create({
    data: {
      passCode: 'VP-QR9910',
      studentId: createdStudents[1].id,
      visitorName: 'Deepak Patel (Brother)',
      visitorPhone: '+91 98333 44556',
      purpose: 'Laptop delivery',
      expectedArrival: new Date(now.getTime() + 1 * 60 * 60 * 1000),
      expectedDeparture: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      status: 'APPROVED'
    }
  });
  console.log('Seeded visitor passes.');

  // 6. Seed Fee Invoices
  await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2026-S1-001',
      userId: createdStudents[0].id,
      term: 'Spring 2026',
      baseRent: 50000,
      messFee: 18000,
      amenitiesFee: 4000,
      lateFine: 0,
      totalAmount: 72000,
      dueDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000),
      status: 'PAID',
      paidAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      paymentMethod: 'UPI / NetBanking',
      transactionId: 'TXN-HDFC-99482103'
    }
  });

  await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2026-S1-002',
      userId: createdStudents[1].id,
      term: 'Spring 2026',
      baseRent: 50000,
      messFee: 18000,
      amenitiesFee: 4000,
      lateFine: 450,
      totalAmount: 72450,
      dueDate: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days overdue
      status: 'OVERDUE'
    }
  });

  await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2026-S1-003',
      userId: createdStudents[2].id,
      term: 'Spring 2026',
      baseRent: 65000,
      messFee: 18000,
      amenitiesFee: 5000,
      lateFine: 0,
      totalAmount: 88000,
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: 'UNPAID'
    }
  });
  console.log('Seeded fee invoices.');

  // Synchronize PostgreSQL sequences to current max IDs
  const tables = ['User', 'Room', 'Complaint', 'FeeInvoice', 'MealLog', 'VisitorPass', 'StudentLeave', 'StudentPreference', 'MaintenanceAlert'];
  for (const t of tables) {
    try {
      const res = await prisma.$queryRawUnsafe(`SELECT COALESCE(MAX(id), 1) as max_id FROM "${t}"`);
      const maxId = Number(res[0].max_id);
      await prisma.$executeRawUnsafe(`SELECT setval('"${t}_id_seq"', ${maxId})`);
    } catch (_) {
      // Ignore for non-postgres or non-sequence databases
    }
  }

  console.log('✨ Seed complete! Database is primed and production-ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
