/**
 * Smart Hostel AI Assistant Engine
 * Integrates Google Gemini API with seamless local contextual fallback.
 * Enriched with real-time user database state (room, fees, complaints, roommates)
 * and campus hostel handbook knowledge.
 */

const HOSTEL_KNOWLEDGE_BASE = `
HOSTEL RULES & REGULATIONS:
- Main Gate Curfew: Closes strictly at 10:30 PM on weekdays (Mon-Fri) and 11:00 PM on weekends (Sat-Sun). Late entry requires warden approval.
- Quiet Hours: 11:00 PM to 06:00 AM daily. Loud music or noisy gatherings are prohibited.
- Visitor Policy: Permitted between 09:00 AM and 07:00 PM. Visitors must be invited by a resident and have an active digital QR visitor pass verified at the security gate. Overnight visitor stays are prohibited.
- Electrical Policy: High-wattage heating appliances (immersion rods, induction stoves, room heaters) are strictly banned for fire safety.
- Room Maintenance: Report any electrical, plumbing, carpentry, or AC faults through the AI Complaints tab. Urgent issues are addressed within 4 to 24 hours.

MESS SCHEDULE & MEAL POLICY:
- Breakfast: 07:30 AM – 09:30 AM
- Lunch: 12:30 PM – 02:30 PM
- Evening Tea & Snacks: 05:00 PM – 06:00 PM
- Dinner: 07:30 PM – 09:30 PM
- Meal Exemption/Leave: Submit leave 24 hours in advance via the Mess Portal to pause mess charges and help reduce campus food waste.

FEES & REFUND POLICY:
- Hostel semester fees cover Base Room Rent + Mess Charges (₹18,000) + Amenities (₹3,500).
- Dues must be settled within 14 days of invoice generation. Late fine of ₹50/day applies past due date.
- Digital receipts are automatically generated in the Fee Management tab upon payment.

ROOM ALLOCATION POLICY:
- Rooms are allocated exclusively by the Hostel Warden Authority using AI lifestyle compatibility vectors (study schedule, bedtime harmony, cleanliness).
- Room change requests can be made after semester completion or with warden sanction.
`;

/**
 * Generates an answer using Google Gemini API if GEMINI_API_KEY is available,
 * otherwise falls back to the smart local contextual knowledge engine.
 */
export async function generateAssistantResponse({ message, userContext, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // 1. Try Google Gemini API if key is present
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const systemInstruction = `
You are the "SmartHostel AI Assistant", an official, polite, and helpful campus hostel intelligence assistant.
Answer student and warden questions accurately, concisely, and supportively.

CURRENT LOGGED-IN USER CONTEXT:
- Name: ${userContext.name}
- Role: ${userContext.role}
- Email: ${userContext.email}
- Room Number: ${userContext.roomNumber || 'Not yet allocated (Pending review)'}
${userContext.roomDetails ? `- Room Specs: ${userContext.roomDetails.block}, Floor ${userContext.roomDetails.floor}, ${userContext.roomDetails.type}` : ''}
${userContext.roommates?.length ? `- Roommates: ${userContext.roommates.map(r => `${r.name} (${r.rollNumber || r.email})`).join(', ')}` : '- Roommates: None / Single occupancy'}
${userContext.feeSummary ? `- Fee Status: ${userContext.feeSummary}` : ''}
${userContext.activeComplaints?.length ? `- Active Complaints: ${userContext.activeComplaints.map(c => `#${c.ticketNumber} [${c.category}] "${c.title}" - Status: ${c.status}`).join('; ')}` : '- Active Complaints: None'}

CAMPUS HANDBOOK KNOWLEDGE BASE:
${HOSTEL_KNOWLEDGE_BASE}

GUIDELINES:
- Keep answers concise, clear, and friendly (2-4 paragraphs max). Use bullet points where appropriate.
- When the user asks about their personal room, fees, or complaints, use the personalized context above.
- If they ask about maintenance issues, guide them to use the "Complaints" portal where our NLP router assigns technicians automatically.
      `.trim();

      // Format previous history for Gemini
      const contents = [];
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return {
            text: candidate,
            source: 'Google Gemini 1.5 Flash (Live AI)',
            model: 'gemini-1.5-flash'
          };
        }
      } else {
        const errText = await response.text();
        console.warn('Gemini API call returned non-200:', errText);
      }
    } catch (geminiErr) {
      console.warn('Error calling Gemini API, falling back to smart local engine:', geminiErr.message);
    }
  }

  // 2. High-Accuracy Local Fallback Engine (Runs offline & zero-cost)
  return generateContextualFallbackResponse(message, userContext);
}

function generateContextualFallbackResponse(message, userContext) {
  const q = message.toLowerCase().trim();

  // Room / Roommate inquiries
  if (q.includes('room') || q.includes('roommate') || q.includes('allot') || q.includes('bed')) {
    if (userContext.roomNumber) {
      const roomInfo = userContext.roomDetails 
        ? `${userContext.roomDetails.block}, Floor ${userContext.roomDetails.floor} (${userContext.roomDetails.type})` 
        : 'Assigned Block';
      const roommateList = userContext.roommates && userContext.roommates.length > 0
        ? `You are sharing with: **${userContext.roommates.map(r => `${r.name} (${r.rollNumber || 'Resident'})`).join(', ')}**.`
        : 'You are currently in a **Single Occupancy** room.';

      return {
        text: `📍 **Your Residential Details:**\n\n- **Allotted Room:** Room **${userContext.roomNumber}** (${roomInfo})\n- **Occupants:** ${roommateList}\n\nYou can view your full official Allotment Certificate under the **Room Allocation** tab.`,
        source: 'SmartHostel Campus Engine (Realtime PostgreSQL)',
        model: 'contextual-nlp'
      };
    } else {
      return {
        text: `⏳ **Allotment Pending Review**\n\nYour profile has not yet been assigned a permanent room. Room allocations are officially executed by the **Hostel Warden** based on AI lifestyle compatibility vectors (sleep time, study schedule, cleanliness).\n\nYou can monitor status or submit lifestyle preferences under the **Room Allocation** tab.`,
        source: 'SmartHostel Campus Engine (Realtime PostgreSQL)',
        model: 'contextual-nlp'
      };
    }
  }

  // Curfew & Timings
  if (q.includes('curfew') || q.includes('timing') || q.includes('gate') || q.includes('hours') || q.includes('time') || q.includes('quiet')) {
    return {
      text: `🕒 **Hostel Timings & Curfew Guidelines:**\n\n- **Main Gate Curfew:** Closes at **10:30 PM** on weekdays, and **11:00 PM** on weekends.\n- **Quiet Hours:** Observed daily between **11:00 PM and 06:00 AM** to ensure peaceful study and sleep.\n- **Late Entry:** Requires prior written sanction from the Block Warden.\n- **Security Protocol:** Fingerprint/ID check is logged at the main security barrier.`,
      source: 'SmartHostel Campus Engine (Hostel Bylaws)',
      model: 'contextual-nlp'
    };
  }

  // Mess & Meals
  if (q.includes('mess') || q.includes('food') || q.includes('meal') || q.includes('lunch') || q.includes('dinner') || q.includes('breakfast')) {
    return {
      text: `🍽️ **Dining & Mess Schedule:**\n\n- **Breakfast:** 07:30 AM – 09:30 AM\n- **Lunch:** 12:30 PM – 02:30 PM\n- **Evening Tea:** 05:00 PM – 06:00 PM\n- **Dinner:** 07:30 PM – 09:30 PM\n\n💡 *Tip:* Our kitchen uses a **Scikit-Learn ML Model** to forecast meal turnout and reduce food waste. You can see real-time headcounts and report upcoming absences under the **Mess Demand** tab!`,
      source: 'SmartHostel Campus Engine (Hostel Bylaws)',
      model: 'contextual-nlp'
    };
  }

  // Fees & Invoices
  if (q.includes('fee') || q.includes('invoice') || q.includes('pay') || q.includes('rent') || q.includes('due') || q.includes('cost')) {
    const feeStatus = userContext.feeSummary || 'No pending invoices currently recorded.';
    return {
      text: `💳 **Fee & Payment Overview:**\n\n${feeStatus}\n\n- **Standard Term Fee:** Base Room Rent + Mess (₹18,000) + Amenities (₹3,500).\n- **Payment Window:** Invoices must be cleared within 14 days of issue to avoid a ₹50/day late penalty.\n- You can view receipts and settle dues directly under the **Fee Management** portal.`,
      source: 'SmartHostel Campus Engine (Realtime PostgreSQL)',
      model: 'contextual-nlp'
    };
  }

  // Complaints & Maintenance
  if (q.includes('complaint') || q.includes('maintenance') || q.includes('broken') || q.includes('repair') || q.includes('leak') || q.includes('ac') || q.includes('wifi')) {
    const activeCompText = userContext.activeComplaints && userContext.activeComplaints.length > 0
      ? `You have **${userContext.activeComplaints.length} active ticket(s)** currently in progress.`
      : 'You have no unresolved maintenance complaints.';

    return {
      text: `🛠️ **Maintenance & Repair Portal:**\n\n${activeCompText}\n\n**How to report an issue:**\n1. Go to the **AI Complaints** tab.\n2. Simply describe the problem (e.g. *"AC in A-104 is not cooling"*).\n3. Our NLP engine automatically detects category, urgency, and routes it directly to electricians or plumbers!`,
      source: 'SmartHostel Campus Engine (Realtime PostgreSQL)',
      model: 'contextual-nlp'
    };
  }

  // Visitor Passes
  if (q.includes('visitor') || q.includes('guest') || q.includes('pass') || q.includes('friend') || q.includes('parent')) {
    return {
      text: `🎫 **Visitor Policy & Digital Passes:**\n\n- **Visiting Hours:** 09:00 AM – 07:00 PM daily.\n- **Digital Passes:** Residents can generate a digital QR pass in the **Smart Security** tab.\n- **Entry Verification:** Your visitor simply presents the QR code to Guard Ramesh at the gate for timestamped check-in.\n- *Note: Overnight visitor stays are strictly prohibited.*`,
      source: 'SmartHostel Campus Engine (Hostel Bylaws)',
      model: 'contextual-nlp'
    };
  }

  // Default Greeting / Help
  return {
    text: `👋 Hello **${userContext.name}**!\n\nI am your **SmartHostel AI Assistant**. Here are a few things I can assist you with right away:\n\n- 🛏️ **Room & Roommates:** *"Who is sharing my room?"*\n- 🕒 **Hostel Rules:** *"What are the curfew & quiet hours?"*\n- 🍽️ **Dining Timings:** *"What time is dinner served?"*\n- 💳 **Fee Invoices:** *"Do I have any pending fee dues?"*\n- 🛠️ **Repairs:** *"How do I submit an AC or plumbing complaint?"*\n\nFeel free to ask me anything about your hostel life!`,
    source: 'SmartHostel Campus Engine (Hostel Bylaws)',
    model: 'contextual-nlp'
  };
}
