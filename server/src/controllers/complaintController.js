import prisma from '../prisma.js';
import { parseComplaintText, autoAssignStaff } from '../engines/nlpComplaintEngine.js';
import { checkAndTriggerPredictiveAlerts } from '../engines/predictiveMaintenanceEngine.js';

export async function previewAIExtraction(req, res) {
  try {
    const { text, roomNumber } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for AI preview' });
    }

    const aiResult = parseComplaintText(text, roomNumber || req.user?.roomNumber);
    res.json({ aiResult });
  } catch (err) {
    res.status(500).json({ error: 'AI parsing failed' });
  }
}

export async function createComplaint(req, res) {
  try {
    const { text, manualCategory, manualPriority, manualRoom } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length < 5) {
      return res.status(400).json({ error: 'Please enter a descriptive complaint message.' });
    }

    // 1. NLP AI Extraction
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const userRoom = user?.roomNumber;
    const aiResult = parseComplaintText(text, manualRoom || userRoom);

    const category = manualCategory || aiResult.category;
    const priority = manualPriority || aiResult.priority;
    const targetRoomNumber = manualRoom || aiResult.roomNumber || userRoom || 'Hostel Campus';

    // 2. Find room record if exists
    const room = await prisma.room.findUnique({
      where: { roomNumber: targetRoomNumber }
    });

    // 3. Auto-route to suitable staff
    const staffMembers = await prisma.user.findMany({
      where: { role: 'STAFF' },
      include: { assignedJobs: true }
    });
    const assignedStaff = autoAssignStaff({ category, priority }, staffMembers);

    // 4. Generate unique Ticket Number (e.g. TKT-2026-9481)
    const ticketNumber = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const title = text.length > 50 ? `${text.substring(0, 47)}...` : text;

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        userId,
        roomId: room?.id || null,
        roomNumber: targetRoomNumber,
        rawText: text,
        title,
        category,
        priority,
        status: assignedStaff ? 'ASSIGNED' : 'OPEN',
        aiExtractedData: JSON.stringify(aiResult),
        assignedToStaffId: assignedStaff?.id || null
      },
      include: {
        user: { select: { name: true, email: true, rollNumber: true } },
        assignedStaff: { select: { id: true, name: true, phone: true } }
      }
    });

    // 5. Trigger Predictive Maintenance Engine evaluation
    let triggeredAlerts = [];
    try {
      triggeredAlerts = await checkAndTriggerPredictiveAlerts(prisma);
    } catch (alertErr) {
      console.error('Error running predictive maintenance check:', alertErr);
    }

    res.status(201).json({
      message: 'Complaint submitted and AI routed successfully',
      complaint,
      aiAnalysis: aiResult,
      assignedTechnician: assignedStaff ? { name: assignedStaff.name, id: assignedStaff.id } : null,
      triggeredAlerts
    });
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to create complaint ticket' });
  }
}

export async function getAllComplaints(req, res) {
  try {
    const { category, priority, status, roomNumber, assignedToMe } = req.query;

    const where = {};
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (roomNumber) where.roomNumber = roomNumber;

    if (assignedToMe === 'true' && req.user?.id) {
      where.assignedToStaffId = req.user.id;
    } else if (req.user?.role === 'STUDENT') {
      where.userId = req.user.id;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, roomNumber: true } },
        assignedStaff: { select: { id: true, name: true, phone: true } },
        room: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ complaints });
  } catch (err) {
    console.error('Error getting complaints:', err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

export async function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedToStaffId } = req.body;

    const existing = await prisma.complaint.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const dataToUpdate = {};
    if (status) {
      dataToUpdate.status = status;
      if (status === 'RESOLVED' || status === 'CLOSED') {
        dataToUpdate.resolvedAt = new Date();
      }
    }
    if (resolutionNotes !== undefined) dataToUpdate.resolutionNotes = resolutionNotes;
    if (assignedToStaffId) dataToUpdate.assignedToStaffId = parseInt(assignedToStaffId, 10);

    const updated = await prisma.complaint.update({
      where: { id: parseInt(id, 10) },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true } },
        assignedStaff: { select: { id: true, name: true } }
      }
    });

    res.json({ message: 'Complaint status updated', complaint: updated });
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
}
