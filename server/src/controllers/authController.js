import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { generateToken } from '../middleware/auth.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const identifier = (email || '').trim();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { name: { equals: identifier, mode: 'insensitive' } }
        ]
      },
      include: { preference: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch && password !== 'hostel123') { // Allow quick demo password
      return res.status(401).json({ error: 'Invalid email/username or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber,
        rollNumber: user.rollNumber,
        preference: user.preference
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, rollNumber, preferences } = req.body;

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { rollNumber: rollNumber || undefined }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'A user with this email or roll number already exists.' });
    }

    const passwordHash = await bcrypt.hash(password || 'hostel123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: 'STUDENT',
        rollNumber,
        preference: {
          create: {
            studySchedule: preferences?.studySchedule || 'FLEXIBLE',
            sleepTime: preferences?.sleepTime || '23:00',
            cleanlinessLevel: preferences?.cleanlinessLevel || 4,
            noiseTolerance: preferences?.noiseTolerance || 'MODERATE',
            acPreference: Boolean(preferences?.acPreference),
            preferredFloor: preferences?.preferredFloor || 1
          }
        }
      },
      include: { preference: true }
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register student account' });
  }
}

export async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        preference: true,
        invoices: { orderBy: { createdAt: 'desc' }, take: 3 },
        complaints: { orderBy: { createdAt: 'desc' }, take: 5 },
        passes: { orderBy: { createdAt: 'desc' }, take: 3 }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
}

// Quick demo role switcher endpoint
export async function switchDemoRole(req, res) {
  try {
    const { role } = req.body; // ADMIN, WARDEN, STUDENT, SECURITY, STAFF
    const roleTargetEmails = {
      ADMIN: 'admin@hostel.edu',
      WARDEN: 'warden@hostel.edu',
      STUDENT: 'rahul.sharma@hostel.edu',
      SECURITY: 'guard.ramesh@hostel.edu',
      STAFF: 'tech.suresh@hostel.edu'
    };

    const targetEmail = roleTargetEmails[role?.toUpperCase()] || 'rahul.sharma@hostel.edu';

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: { preference: true }
    });

    if (!user) {
      // Fallback: pick any user with this role
      user = await prisma.user.findFirst({
        where: { role: role?.toUpperCase() },
        include: { preference: true }
      });
    }

    if (!user) {
      return res.status(404).json({ error: `No user found for role ${role}` });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber,
        rollNumber: user.rollNumber,
        preference: user.preference
      }
    });
  } catch (err) {
    console.error('Switch role error:', err);
    res.status(500).json({ error: 'Failed to switch demo role' });
  }
}
