/**
 * Smart Room & Roommate Allocation Engine
 * Computes multi-dimensional compatibility vectors and matches students to optimal rooms.
 */

// Weights for compatibility factors
const WEIGHTS = {
  studySchedule: 0.30,
  sleepTime: 0.25,
  cleanliness: 0.25,
  noiseTolerance: 0.20,
};

function parseTimeToHours(timeStr) {
  if (!timeStr) return 23.0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) + (parseInt(parts[1] || '0', 10) / 60);
}

export function calculateCompatibilityScore(prefA, prefB) {
  if (!prefA || !prefB) return 75; // Default baseline compatibility

  // 1. Study Schedule Match
  let scheduleScore = 0.5;
  if (prefA.studySchedule === prefB.studySchedule) {
    scheduleScore = 1.0;
  } else if (prefA.studySchedule === 'FLEXIBLE' || prefB.studySchedule === 'FLEXIBLE') {
    scheduleScore = 0.85;
  } else {
    // NIGHT_OWL vs EARLY_BIRD
    scheduleScore = 0.30;
  }

  // 2. Sleep Time Similarity (Difference in hours)
  const hourA = parseTimeToHours(prefA.sleepTime);
  const hourB = parseTimeToHours(prefB.sleepTime);
  let diff = Math.abs(hourA - hourB);
  if (diff > 12) diff = 24 - diff; // Wrap around midnight
  const sleepScore = Math.max(0, 1 - (diff / 4.0)); // 0 diff = 1.0, 4+ hrs diff = 0.0

  // 3. Cleanliness Similarity (scale 1 to 5)
  const cleanDiff = Math.abs((prefA.cleanlinessLevel || 3) - (prefB.cleanlinessLevel || 3));
  const cleanlinessScore = Math.max(0, 1 - (cleanDiff / 4.0));

  // 4. Noise Tolerance Match
  let noiseScore = 0.5;
  if (prefA.noiseTolerance === prefB.noiseTolerance) {
    noiseScore = 1.0;
  } else if (prefA.noiseTolerance === 'MODERATE' || prefB.noiseTolerance === 'MODERATE') {
    noiseScore = 0.8;
  } else {
    // QUIET vs SOCIAL
    noiseScore = 0.25;
  }

  const rawScore = 
    (scheduleScore * WEIGHTS.studySchedule) +
    (sleepScore * WEIGHTS.sleepTime) +
    (cleanlinessScore * WEIGHTS.cleanliness) +
    (noiseScore * WEIGHTS.noiseTolerance);

  const percentage = Math.round(rawScore * 100);

  return {
    score: percentage,
    factors: {
      scheduleScore: Math.round(scheduleScore * 100),
      sleepScore: Math.round(sleepScore * 100),
      cleanlinessScore: Math.round(cleanlinessScore * 100),
      noiseScore: Math.round(noiseScore * 100),
    },
    recommendationReason: generateMatchReason(prefA, prefB, percentage)
  };
}

function generateMatchReason(a, b, score) {
  const reasons = [];
  if (a.studySchedule === b.studySchedule) reasons.push(`Synchronized ${a.studySchedule.toLowerCase().replace('_', ' ')} study rhythms`);
  if (Math.abs((a.cleanlinessLevel || 3) - (b.cleanlinessLevel || 3)) <= 1) reasons.push('High cleanliness harmony');
  if (a.noiseTolerance === b.noiseTolerance) reasons.push(`Identical ${a.noiseTolerance.toLowerCase()} noise preference`);

  if (score >= 85) {
    return `Excellent match (${score}%): ${reasons.join(', ') || 'Highly aligned preferences'}.`;
  } else if (score >= 70) {
    return `Good match (${score}%): Compatible lifestyle profile with slight variation.`;
  } else {
    return `Moderate match (${score}%): Different sleep or study habits; acceptable if needed.`;
  }
}

/**
 * Ranks all available rooms for a given student
 */
export function rankRoomsForStudent(studentPref, availableRooms) {
  const results = [];

  for (const room of availableRooms) {
    let baseScore = 70;
    const matchReasons = [];

    // Floor preference check
    if (studentPref.preferredFloor === room.floor) {
      baseScore += 10;
      matchReasons.push(`Matches requested Floor ${room.floor}`);
    }

    // AC Preference check
    const roomHasAC = room.type.toLowerCase().includes('ac') && !room.type.toLowerCase().includes('non-ac');
    if (studentPref.acPreference === roomHasAC) {
      baseScore += 10;
      matchReasons.push(roomHasAC ? 'Equipped with desired AC' : 'Standard ventilated room as preferred');
    }

    // Roommate compatibility if room already has occupants
    let roommateScore = null;
    let roommateDetails = null;

    if (room.students && room.students.length > 0) {
      const scores = room.students
        .filter(s => s.preference)
        .map(s => calculateCompatibilityScore(studentPref, s.preference));

      if (scores.length > 0) {
        const avgScore = Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length);
        roommateScore = avgScore;
        roommateDetails = scores;
        baseScore = Math.round((baseScore * 0.4) + (avgScore * 0.6));
        matchReasons.push(`${avgScore}% Roommate Compatibility with existing occupant(s)`);
      }
    } else {
      matchReasons.push('Fresh vacant room ready for optimal pairing');
    }

    const finalScore = Math.min(99, Math.max(35, baseScore));

    results.push({
      room,
      compatibilityScore: finalScore,
      roommateScore,
      reasons: matchReasons,
      matchQuality: finalScore >= 85 ? 'HIGHLY_RECOMMENDED' : (finalScore >= 70 ? 'RECOMMENDED' : 'ACCEPTABLE')
    });
  }

  // Sort descending by score
  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}
