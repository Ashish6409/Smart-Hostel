import prisma from '../prisma.js';
import { generateAssistantResponse } from '../engines/aiAssistantEngine.js';

export async function chatWithAssistant(req, res) {
  try {
    const userId = req.user?.id;
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    // 1. Assemble rich real-time context for the current user
    let userContext = {
      name: req.user?.name || 'Resident Student',
      email: req.user?.email || '',
      role: req.user?.role || 'STUDENT',
      roomNumber: null,
      roomDetails: null,
      roommates: [],
      feeSummary: 'No active dues recorded.',
      activeComplaints: []
    };

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          invoices: { where: { status: { not: 'PAID' } } },
          complaints: { where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }
        }
      });

      if (user) {
        userContext.name = user.name;
        userContext.email = user.email;
        userContext.role = user.role;
        userContext.roomNumber = user.roomNumber;
        userContext.activeComplaints = user.complaints || [];

        // Check fee invoices
        if (user.invoices && user.invoices.length > 0) {
          const totalUnpaid = user.invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
          userContext.feeSummary = `You have ${user.invoices.length} pending invoice(s) totaling ₹${totalUnpaid.toLocaleString()} (Invoice #${user.invoices[0].invoiceNumber}, Due: ${new Date(user.invoices[0].dueDate).toLocaleDateString()}).`;
        } else {
          userContext.feeSummary = 'All term fees and mess charges are currently marked fully PAID. No outstanding dues!';
        }

        // Check room and roommates
        if (user.roomNumber) {
          const room = await prisma.room.findUnique({
            where: { roomNumber: user.roomNumber }
          });
          userContext.roomDetails = room;

          const roommates = await prisma.user.findMany({
            where: {
              roomNumber: user.roomNumber,
              id: { not: user.id }
            },
            select: { name: true, rollNumber: true, email: true, phone: true }
          });
          userContext.roommates = roommates;
        }
      }
    }

    // 2. Generate response via Gemini or smart local fallback
    const result = await generateAssistantResponse({
      message,
      userContext,
      history: history || []
    });

    res.json({
      reply: result.text,
      source: result.source,
      model: result.model
    });
  } catch (err) {
    console.error('Error in assistant chat controller:', err);
    res.status(500).json({ error: 'Failed to process assistant query: ' + err.message });
  }
}
