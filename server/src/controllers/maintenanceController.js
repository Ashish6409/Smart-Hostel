import prisma from '../prisma.js';
import { checkAndTriggerPredictiveAlerts } from '../engines/predictiveMaintenanceEngine.js';

export async function getPredictiveAlerts(req, res) {
  try {
    // 1. Run check to ensure freshest alerts
    await checkAndTriggerPredictiveAlerts(prisma);

    // 2. Fetch all alerts
    const alerts = await prisma.maintenanceAlert.findMany({
      orderBy: [
        { severity: 'desc' },
        { complaintCount: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // 3. Repeated complaint patterns summary
    const repeatedSummary = alerts.map(a => ({
      roomNumber: a.roomNumber,
      category: a.category,
      count: a.complaintCount,
      windowDays: a.windowDays,
      severity: a.severity,
      message: a.message,
      recommendation: a.recommendation,
      status: a.status
    }));

    res.json({
      activeAlertsCount: alerts.filter(a => a.status === 'ACTIVE').length,
      alerts,
      repeatedSummary
    });
  } catch (err) {
    console.error('Error fetching predictive alerts:', err);
    res.status(500).json({ error: 'Failed to fetch maintenance alerts' });
  }
}

export async function updateAlertStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE, ACKNOWLEDGED, RESOLVED

    const updated = await prisma.maintenanceAlert.update({
      where: { id: parseInt(id, 10) },
      data: { status }
    });

    res.json({ message: 'Alert status updated', alert: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
}

export async function getMaintenanceAnalytics(req, res) {
  try {
    const allComplaints = await prisma.complaint.findMany({
      select: {
        id: true,
        category: true,
        priority: true,
        status: true,
        roomNumber: true,
        createdAt: true,
        resolvedAt: true
      }
    });

    // Calculate Average MTTR (Mean Time To Resolution) in hours
    const resolved = allComplaints.filter(c => c.resolvedAt);
    let avgResolutionHours = 14.5;
    if (resolved.length > 0) {
      const totalHours = resolved.reduce((acc, c) => {
        const diff = (new Date(c.resolvedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60);
        return acc + diff;
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolved.length) * 10) / 10;
    }

    // Category distribution
    const categoryCounts = {};
    for (const c of allComplaints) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }

    res.json({
      totalComplaints: allComplaints.length,
      resolvedCount: resolved.length,
      pendingCount: allComplaints.length - resolved.length,
      avgResolutionHours,
      categoryDistribution: categoryCounts
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch maintenance analytics' });
  }
}
