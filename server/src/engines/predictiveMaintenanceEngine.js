/**
 * Predictive Maintenance Engine
 * Detects chronic and recurrent failures over a rolling 30-day window.
 * Generates proactive inspection warnings before total equipment breakdown.
 */

export async function checkAndTriggerPredictiveAlerts(prisma) {
  const windowDays = 30;
  const thresholdCount = 3;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - windowDays);

  // Fetch complaints within rolling window
  const recentComplaints = await prisma.complaint.findMany({
    where: {
      createdAt: {
        gte: cutoffDate
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  // Group by roomNumber + category
  const groups = {};
  for (const c of recentComplaints) {
    if (!c.roomNumber || c.roomNumber === 'Hostel Campus') continue;
    const key = `${c.roomNumber}___${c.category}`;
    if (!groups[key]) {
      groups[key] = {
        roomNumber: c.roomNumber,
        roomId: c.roomId,
        category: c.category,
        complaints: []
      };
    }
    groups[key].complaints.push(c);
  }

  const generatedAlerts = [];

  for (const [key, item] of Object.entries(groups)) {
    const count = item.complaints.length;
    if (count >= thresholdCount) {
      // Calculate Mean Time Between Failures (MTBF) in days
      let mtbfDays = 7;
      if (count > 1) {
        const first = new Date(item.complaints[0].createdAt).getTime();
        const last = new Date(item.complaints[count - 1].createdAt).getTime();
        const diffDays = Math.max(1, (last - first) / (1000 * 60 * 60 * 24));
        mtbfDays = Math.round((diffDays / (count - 1)) * 10) / 10;
      }

      const severity = count >= 4 ? 'CRITICAL' : 'WARNING';
      const message = `⚠️ Maintenance Alert: ${item.category} in ${item.roomNumber} has ${count} complaints in ${windowDays} days (MTBF: ${mtbfDays} days).`;
      
      let recommendation = `Schedule comprehensive diagnostic inspection for ${item.category} unit in room ${item.roomNumber}.`;
      if (item.category === 'HVAC/AC') {
        recommendation = `Consider full compressor overhaul or unit replacement. Repeated cooling & refrigerant loss detected.`;
      } else if (item.category === 'Plumbing') {
        recommendation = `Inspect main riser valve and internal concealed piping. High risk of wall seepage.`;
      } else if (item.category === 'Electrical') {
        recommendation = `Inspect circuit breaker / MCB and check for short-circuit wire leakage immediately.`;
      }

      // Check if alert already exists for this room & category
      const existingAlert = await prisma.maintenanceAlert.findFirst({
        where: {
          roomNumber: item.roomNumber,
          category: item.category,
          status: { in: ['ACTIVE', 'ACKNOWLEDGED'] }
        }
      });

      if (!existingAlert) {
        const newAlert = await prisma.maintenanceAlert.create({
          data: {
            roomNumber: item.roomNumber,
            roomId: item.roomId,
            category: item.category,
            complaintCount: count,
            windowDays,
            severity,
            message,
            recommendation,
            status: 'ACTIVE'
          }
        });
        generatedAlerts.push(newAlert);
      } else if (existingAlert.complaintCount !== count) {
        // Update count & message
        const updated = await prisma.maintenanceAlert.update({
          where: { id: existingAlert.id },
          data: {
            complaintCount: count,
            severity,
            message,
            recommendation
          }
        });
        generatedAlerts.push(updated);
      }
    }
  }

  return generatedAlerts;
}
