import prisma from '../prisma.js';
import { predictMessDemand } from '../engines/messPredictionEngine.js';

export async function getMessDemandPrediction(req, res) {
  try {
    const { mealType = 'Dinner', dayOfWeek = 'Tuesday', isExamPeriod = false } = req.query;

    // Mess kitchen caters to entire campus population (default 485 enrolled hostelers)
    const studentCount = await prisma.user.count({
      where: { role: 'STUDENT' }
    });
    const currentOccupancy = studentCount >= 100 ? studentCount : 485;

    // Count students with approved leaves overlapping today
    const todayStr = new Date().toISOString().slice(0, 10);
    const activeLeavesCount = await prisma.studentLeave.count({
      where: {
        status: 'APPROVED',
        skipMeals: true,
        startDate: { lte: todayStr },
        endDate: { gte: todayStr }
      }
    });

    const prediction = await predictMessDemand({
      mealType: String(mealType),
      dayOfWeek: String(dayOfWeek),
      isExamPeriod: isExamPeriod === 'true' || isExamPeriod === true,
      activeLeaves: activeLeavesCount || 18,
      currentOccupancy,
      prisma
    });

    res.json({
      ...prediction,
      activeApprovedLeaves: activeLeavesCount || 18,
      totalHostelStudents: currentOccupancy,
      mealType,
      dayOfWeek
    });
  } catch (err) {
    console.error('Error calculating mess demand:', err);
    res.status(500).json({ error: 'Failed to predict mess demand' });
  }
}

export async function getMealHistory(req, res) {
  try {
    const logs = await prisma.mealLog.findMany({
      orderBy: { date: 'desc' },
      take: 21
    });

    // Compute weekly averages and total waste saved
    const totalWasteKg = logs.reduce((sum, item) => sum + (item.foodWastedKg || 0), 0);
    const totalSavings = logs.reduce((sum, item) => sum + (item.savingsEstimated || 0), 0);

    res.json({
      logs: logs.reverse(), // chronological order for charts
      totalWasteKg: Math.round(totalWasteKg * 10) / 10,
      totalSavingsEstimated: Math.round(totalSavings)
    });
  } catch (err) {
    console.error('Error fetching meal history:', err);
    res.status(500).json({ error: 'Failed to fetch meal history' });
  }
}

export async function submitStudentLeave(req, res) {
  try {
    const userId = req.user.id;
    const { startDate, endDate, reason, skipMeals } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const leave = await prisma.studentLeave.create({
      data: {
        userId,
        studentName: user?.name || 'Student',
        roomNumber: user?.roomNumber || 'Unassigned',
        startDate,
        endDate,
        reason,
        skipMeals: skipMeals !== undefined ? Boolean(skipMeals) : true,
        status: 'APPROVED' // Auto-approve for demo
      }
    });

    res.status(201).json({
      message: 'Leave submitted successfully. Mess headcount automatically updated.',
      leave
    });
  } catch (err) {
    console.error('Error creating student leave:', err);
    res.status(500).json({ error: 'Failed to submit leave' });
  }
}

export async function getStudentLeaves(req, res) {
  try {
    const where = {};
    if (req.user?.role === 'STUDENT') {
      where.userId = req.user.id;
    }

    const leaves = await prisma.studentLeave.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student leaves' });
  }
}
