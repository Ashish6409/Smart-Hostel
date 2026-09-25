import prisma from '../prisma.js';

export async function getStudentInvoices(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();

    const invoices = await prisma.feeInvoice.findMany({
      where: { userId },
      orderBy: { dueDate: 'desc' }
    });

    // Auto-compute late fine if overdue
    const updatedInvoices = invoices.map(inv => {
      let lateFine = inv.lateFine;
      let status = inv.status;
      if (status === 'UNPAID' && new Date(inv.dueDate) < now) {
        status = 'OVERDUE';
        const daysLate = Math.ceil((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        lateFine = Math.min(2500, daysLate * 50); // $50 or ₹50/day late fine capped
      }
      return {
        ...inv,
        status,
        lateFine,
        totalPayable: inv.status === 'PAID' ? inv.totalAmount : (inv.totalAmount + lateFine)
      };
    });

    res.json({ invoices: updatedInvoices });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

export async function getAllInvoices(req, res) {
  try {
    const { status, term } = req.query;
    const where = {};
    if (status) where.status = status;
    if (term) where.term = term;

    const invoices = await prisma.feeInvoice.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, rollNumber: true, roomNumber: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ invoices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all invoices' });
  }
}

export async function payInvoice(req, res) {
  try {
    const { id } = req.params;
    const { paymentMethod = 'UPI / NetBanking' } = req.body;

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: parseInt(id, 10) }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ error: 'Invoice has already been settled.' });
    }

    const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const updated = await prisma.feeInvoice.update({
      where: { id: invoice.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod,
        transactionId
      }
    });

    res.json({
      message: 'Payment processed successfully',
      invoice: updated,
      transactionId
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ error: 'Payment transaction failed' });
  }
}

export async function getFeeAnalytics(req, res) {
  try {
    const invoices = await prisma.feeInvoice.findMany();

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
    const totalCollected = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueInvoices = invoices.filter(inv => inv.status === 'OVERDUE' || (inv.status === 'UNPAID' && new Date(inv.dueDate) < new Date()));
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    res.json({
      totalBilled,
      totalCollected,
      totalOverdue,
      collectionRate,
      paidCount: paidInvoices.length,
      unpaidCount: invoices.length - paidInvoices.length,
      overdueCount: overdueInvoices.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate fee analytics' });
  }
}
