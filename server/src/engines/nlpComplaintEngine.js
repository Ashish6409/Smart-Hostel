/**
 * AI Complaint Parsing & Auto-Routing Engine
 * Uses NLP pattern analysis and entity heuristics to extract:
 * 1. Category
 * 2. Priority/Urgency
 * 3. Location/Room Entity
 * 4. Staff assignment recommendations
 */

const CATEGORY_KEYWORDS = {
  'HVAC/AC': [
    'ac', 'air conditioner', 'cooling', 'compressor', 'split ac', 'hot air', 'remote',
    'blower', 'refrigerant', 'chilling', 'rattling ac', 'thermostat'
  ],
  'Plumbing': [
    'leak', 'pipe', 'tap', 'washroom', 'bathroom', 'toilet', 'flush', 'geyser',
    'water', 'drainage', 'basin', 'shower', 'clogged', 'choked', 'sewage', 'dripping'
  ],
  'Electrical': [
    'power', 'switch', 'socket', 'light', 'bulb', 'tube', 'tubelight', 'fan',
    'spark', 'tripped', 'wire', 'mcb', 'shock', 'short circuit', 'current', 'outage', 'blackout'
  ],
  'WiFi/Network': [
    'wifi', 'wi-fi', 'internet', 'router', 'network', 'ethernet', 'lan', 'ping',
    'disconnect', 'no connection', 'slow speed', 'signal', 'access point'
  ],
  'Carpentry': [
    'door', 'lock', 'handle', 'hinge', 'cupboard', 'almirah', 'wardrobe', 'table',
    'chair', 'window', 'drawer', 'latch', 'bed', 'wooden', 'broken key'
  ],
  'Housekeeping': [
    'clean', 'cleaning', 'dust', 'garbage', 'trash', 'broom', 'mop', 'dirty',
    'cockroach', 'pest', 'insect', 'smell', 'odor', 'stain', 'waste'
  ]
};

const PRIORITY_RULES = {
  CRITICAL: [
    'fire', 'smoke', 'spark', 'electric shock', 'short circuit', 'flooding',
    'gas', 'emergency', 'main door broken', 'cannot lock', 'burning smell', 'severe leak'
  ],
  HIGH: [
    'ac not cooling', 'no water', 'geyser not working', 'power cut', 'toilet choked',
    'no power in room', 'water overflowing', 'lock jammed', 'exam tomorrow'
  ],
  LOW: [
    'minor paint', 'squeaky chair', 'loose handle', 'bulb dim', 'cleaning request',
    'wardrobe knob', 'slow wifi', 'minor'
  ]
};

export function parseComplaintText(text, userRoom = null) {
  const cleanText = (text || '').toLowerCase();
  
  // 1. Detect Category
  let detectedCategory = 'Electrical'; // default
  let highestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let matches = 0;
    for (const kw of keywords) {
      if (cleanText.includes(kw)) {
        matches += (kw.length > 5 ? 2 : 1);
      }
    }
    if (matches > highestScore) {
      highestScore = matches;
      detectedCategory = category;
    }
  }

  // 2. Detect Priority
  let detectedPriority = 'MEDIUM'; // baseline
  
  for (const kw of PRIORITY_RULES.CRITICAL) {
    if (cleanText.includes(kw)) {
      detectedPriority = 'CRITICAL';
      break;
    }
  }

  if (detectedPriority !== 'CRITICAL') {
    for (const kw of PRIORITY_RULES.HIGH) {
      if (cleanText.includes(kw)) {
        detectedPriority = 'HIGH';
        break;
      }
    }
  }

  if (detectedPriority === 'MEDIUM') {
    for (const kw of PRIORITY_RULES.LOW) {
      if (cleanText.includes(kw)) {
        detectedPriority = 'LOW';
        break;
      }
    }
  }

  // 3. Extract Location / Room Number
  let detectedRoom = userRoom;
  const roomPattern = /\b([a-c]-\d{3}|[a-c]\d{3}|room\s*#?\s*([a-c]-?\d{3}|\d{3}))\b/i;
  const match = cleanText.match(roomPattern);
  if (match) {
    const rawMatch = match[0].toUpperCase().replace(/\s+/g, '').replace('ROOM', '').replace('#', '');
    if (/^[A-C]\d{3}$/.test(rawMatch)) {
      detectedRoom = `${rawMatch[0]}-${rawMatch.slice(1)}`;
    } else {
      detectedRoom = rawMatch;
    }
  }

  // 4. Generate AI confidence & metadata
  const confidence = highestScore > 0 ? Math.min(98, 65 + (highestScore * 8)) : 60;

  return {
    category: detectedCategory,
    priority: detectedPriority,
    roomNumber: detectedRoom || userRoom || 'Hostel Campus',
    confidence,
    keywordsDetected: highestScore,
    aiSummary: `Detected ${detectedCategory} issue with ${detectedPriority} priority at ${detectedRoom || userRoom || 'room'}.`
  };
}

/**
 * Auto-routes the ticket to the best matching staff member based on domain and current workload
 */
export function autoAssignStaff(complaint, staffList) {
  if (!staffList || staffList.length === 0) return null;

  // Filter staff by category relevance in their name or profile if applicable
  const categoryKeywordsMap = {
    'HVAC/AC': ['ac', 'hvac', 'technician', 'electrician'],
    'Plumbing': ['plumber', 'water', 'pipe'],
    'Electrical': ['electrician', 'electrical', 'wire'],
    'WiFi/Network': ['network', 'it', 'wifi', 'admin'],
    'Carpentry': ['carpenter', 'furniture'],
    'Housekeeping': ['cleaner', 'housekeeper', 'cleaning']
  };

  const domainKeywords = categoryKeywordsMap[complaint.category] || [];

  let candidates = staffList.filter(s => {
    const sName = (s.name || '').toLowerCase();
    return domainKeywords.some(kw => sName.includes(kw));
  });

  if (candidates.length === 0) {
    candidates = staffList; // fallback to general staff pool
  }

  // Sort by lowest active assigned tickets (least busy)
  candidates.sort((a, b) => {
    const countA = (a.assignedJobs || []).filter(j => j.status !== 'RESOLVED' && j.status !== 'CLOSED').length;
    const countB = (b.assignedJobs || []).filter(j => j.status !== 'RESOLVED' && j.status !== 'CLOSED').length;
    return countA - countB;
  });

  return candidates[0] || null;
}
