// File: services/compatibility.js

/**
 * This file contains the logic for calculating the compatibility score
 * between two roommate profiles, based on the rules defined in the
 * [cite_start]"Supporting Document.pdf". [cite: 454-508]
 */

// --- 1. Define Weights (from PDF table) [cite: 459-460] ---
const WEIGHTS = {
    gender: 11,
    respect: 10,
    cleanliness: 8,
    sleepSchedule: 5,
    noisePreference: 5,
    socialLifestyle: 4, // PDF's "Social Lifestyle"
    friendliness: 4,      // PDF's "Friendly & Sociable"
    budget: 3,
};
  
  // --- 2. Define Scoring Functions (from PDF rules) [cite: 461-508] ---
  
  // Rule 1: Gender (Weight: 11) [cite: 462-464]
function scoreGender(myPreference, theirGender) {
    if (!myPreference || !theirGender) return 0.0;
    if (myPreference === 'no_preference') return 2.0; // No preference is a perfect match
    if (myPreference === theirGender) return 2.0; // Exact match
    return 0.0; // Conflict
}
  
  // Rule 2: Trustworthy & Respectful (Weight: 10) [cite: 465-470]
  // Maps to schema 'respect' field: 'very_respectful', 'respectful_easygoing', 'chill'
function scoreRespect(myPreference, theirRespect) {
    if (!myPreference || !theirRespect) return 0.0;
    if (myPreference === theirRespect) return 2.0; // Exact same
    if (
      (myPreference === 'very_respectful' && theirRespect === 'respectful_easygoing') ||
      (myPreference === 'respectful_easygoing' && theirRespect === 'very_respectful') ||
      (myPreference === 'respectful_easygoing' && theirRespect === 'chill') ||
      (myPreference === 'chill' && theirRespect === 'respectful_easygoing')
    ) {
      return 1.5; // Adjacent [cite: 468-469]
    }
    if (
      (myPreference === 'very_respectful' && theirRespect === 'chill') ||
      (myPreference === 'chill' && theirRespect === 'very_respectful')
    ) {
      return 0.5; //Opposites [cite: 470]
    }
    return 0.0;
}
  
  // Rule 3: Clean & Organized (Weight: 8) [cite: 471-477]
  // Maps to schema 'cleanliness' field: 'very_neat', 'moderate', 'laidback', 'irregular'
function scoreCleanliness(myPreference, theirCleanliness) {
    if (!myPreference || !theirCleanliness) return 0.0;
    // Note: PDF options are slightly different from schema, mapping 'Irregular' and 'Easygoing' to 'laidback'
    const pdfMap = {
      very_neat: 'very_neat',
      moderate: 'moderate',
      laidback: 'easygoing',
      irregular: 'irregular',
    };
    const myPref = pdfMap[myPreference] || myPreference;
    const theirChar = pdfMap[theirCleanliness] || theirCleanliness;
    
    if (myPref === theirChar) return 2.0; // Exact same [cite: 474]
    if (
      (myPref === 'very_neat' && theirChar === 'moderate') || (myPref === 'moderate' && theirChar === 'very_neat') ||
      (myPref === 'moderate' && theirChar === 'irregular') || (myPref === 'irregular' && theirChar === 'moderate') ||
      (myPref === 'irregular' && theirChar === 'easygoing') || (myPref === 'easygoing' && theirChar === 'irregular')
    ) {
      return 1.5; // Adjacent [cite: 475]
    }
    if (
      (myPref === 'very_neat' && theirChar === 'irregular') || (myPref === 'irregular' && theirChar === 'very_neat') ||
      (myPref === 'moderate' && theirChar === 'easygoing') || (myPref === 'easygoing' && theirChar === 'moderate')
    ) {
      return 1.0; // One-step apart [cite: 476]
    }
    if (
      (myPref === 'very_neat' && theirChar === 'easygoing') || (myPref === 'easygoing' && theirChar === 'very_neat')
    ) {
      return 0.5; // Opposites [cite: 477]
    }
    return 0.0;
}
  
  // Rule 4: Sleep Schedule (Weight: 5) [cite: 478-482]
  // Maps to schema 'sleepSchedule' field: 'early_riser', 'balanced', 'night_owl', 'flexible'
function scoreSleepSchedule(myPreference, theirSchedule) {
    if (!myPreference || !theirSchedule) return 0.0;
    if (myPreference === 'no_preference' || theirSchedule === 'flexible') return 1.5; // Flexible with any [cite: 481]
    if (myPreference === theirSchedule) return 2.0; // Exact same [cite: 480]
    if (
      (myPreference === 'early_riser' && theirSchedule === 'balanced') ||
      (myPreference === 'balanced' && theirSchedule === 'early_riser') ||
      (myPreference === 'night_owl' && theirSchedule === 'balanced') ||
      (myPreference === 'balanced' && theirSchedule === 'night_owl')
    ) {
      return 1.5; // Adjacent [cite: 481]
    }
    if (
      (myPreference === 'early_riser' && theirSchedule === 'night_owl') ||
      (myPreference === 'night_owl' && theirSchedule === 'early_riser')
    ) {
      return 0.5; // Opposites [cite: 482]
    }
    return 0.0;
  }
  
  // Rule 5: Social Lifestyle (Weight: 4) [cite: 483-487]
  // Maps to schema 'socialLifestyle' field: 'social', 'moderate', 'reserved', 'flexible'
  function scoreSocialLifestyle(myPreference, theirLifestyle) {
    if (!myPreference || !theirLifestyle) return 0.0;
    if (theirLifestyle === 'flexible') return 1.5; // Flexible with any [cite: 486]
    if (myPreference === theirLifestyle) return 2.0; // Exact same [cite: 485]
    if (
      (myPreference === 'social' && theirLifestyle === 'moderate') ||
      (myPreference === 'moderate' && theirLifestyle === 'social') ||
      (myPreference === 'reserved' && theirLifestyle === 'moderate') ||
      (myPreference === 'moderate' && theirLifestyle === 'reserved')
    ) {
      return 1.5; // Adjacent [cite: 486]
    }
    if (
      (myPreference === 'social' && theirLifestyle === 'reserved') ||
      (myPreference === 'reserved' && theirLifestyle === 'social')
    ) {
      return 0.5; // Opposites [cite: 487]
    }
    return 0.0;
}
  
  // Rule 6: Quiet/Study-Friendly (Weight: 5) [cite: 488-492]
  // Maps to schema 'noisePreference' field: 'quiet', 'moderate', 'lively'
function scoreNoisePreference(myPreference, theirNoise) {
    if (!myPreference || !theirNoise) return 0.0;
    if (myPreference === 'no_preference') return 1.0; // Assuming 1.0 for "No Preference"
    if (myPreference === theirNoise) return 2.0; // Exact same [cite: 490]
    if (
      (myPreference === 'quiet' && theirNoise === 'moderate') ||
      (myPreference === 'moderate' && theirNoise === 'quiet') ||
      (myPreference === 'moderate' && theirNoise === 'lively') ||
      (myPreference === 'lively' && theirNoise === 'moderate')
    ) {
      return 1.5; // Adjacent [cite: 491]
    }
    if (
      (myPreference === 'quiet' && theirNoise === 'lively') ||
      (myPreference === 'lively' && theirNoise === 'quiet')
    ) {
      return 0.5; // Opposites [cite: 492]
    }
    return 0.0;
}
  
  // Rule 7: Friendly & Sociable (Weight: 4) [cite: 493-497]
  // ** MISMATCH COMMENT **
  // The PDF defines "Friendly & Sociable" [cite: 493] separate from "Social Lifestyle"[cite: 483].
  // Our schema only has 'socialLifestyle' and 'respect'.
  // We are mapping "Trustworthy & Respectful" (Weight 10) to our 'respect' field.
  // We are mapping "Friendly & Sociable" (Weight 4) to our 'socialLifestyle' field.
  // We are mapping "Social Lifestyle" (Weight 4) to our 'socialLifestyle' field again.
  // This means 'socialLifestyle' is double-counted with different weights.
  // The PDF's preference options for this rule also differ from the schema.
  // For now, we will apply the 'socialLifestyle' logic for this rule.
function scoreFriendliness(myPreference, theirFriendliness) {
    // Options: 'social', 'moderate', 'reserved'
    if (!myPreference || !theirFriendliness) return 0.0;
    if (myPreference === theirFriendliness) return 2.0;
    if (
      (myPreference === 'social' && theirFriendliness === 'moderate') ||
      (myPreference === 'moderate' && theirFriendliness === 'social') ||
      (myPreference === 'moderate' && theirFriendliness === 'reserved') ||
      (myPreference === 'reserved' && theirFriendliness === 'moderate')
    ) {
      return 1.5;
    }
    if (
      (myPreference === 'social' && theirFriendliness === 'reserved') ||
      (myPreference === 'reserved' && theirFriendliness === 'social')
    ) {
      return 0.5;
    }
    return 0.0;
}
  
  // Rule 8: Budget (Weight: 3) [cite: 498-508]
function scoreBudget(myMinPreference, theirMaxBudget) {
    // Ensure inputs are numbers
    const myMin = Number(myMinPreference);
    const theirMax = Number(theirMaxBudget);
    if (!myMin || !theirMax || myMin <= 0 || theirMax <= 0) return 0.0; // Ignore if budgets aren't set
  
    if (theirMax >= myMin) return 2.0; // [cite: 503]
    
    const gap = myMin - theirMax;
    if (gap <= 20000) return 1.5; // [cite: 505]
    if (gap <= 50000) return 1.0; // [cite: 506]
    if (gap <= 100000) return 0.5; // [cite: 507]
    return 0.0; // [cite: 508]
}
  
  // --- 3. The Main Calculator Function ---
  
  /**
   * Calculates a compatibility score between two user profiles.
   * @param {object} me - The current user's personProfile document.
   * @param {object} them - The other user's personProfile document.
   * @returns {number} A compatibility percentage (0-100).
   */
export const calculateCompatibility = (me, them) => {
    // Check for minimum required data to calculate
    if (!me || !them || !me.preferences || !them.characteristics) {
      console.warn('Compatibility check failed: Missing profile data.');
      //console.log(me, them)
      return 0;
    }
  
    let totalScore = 0;
    const { preferences: myPref } = me;
    const { characteristics: theirChars, gender: theirGender, maxBudget: theirMaxBudget } = them;
  
    totalScore += scoreGender(myPref.preferredGender, theirGender) * WEIGHTS.gender;
    totalScore += scoreRespect(myPref.preferredRespect, theirChars.respect) * WEIGHTS.respect;
    totalScore += scoreCleanliness(myPref.preferredCleanliness, theirChars.cleanliness) * WEIGHTS.cleanliness;
    totalScore += scoreSleepSchedule(myPref.preferredSleepSchedule, theirChars.sleepSchedule) * WEIGHTS.sleepSchedule;
    totalScore += scoreSocialLifestyle(myPref.preferredSocialLifestyle, theirChars.socialLifestyle) * WEIGHTS.socialLifestyle;
    totalScore += scoreNoisePreference(myPref.preferredNoiseLevel, theirChars.noisePreference) * WEIGHTS.noisePreference;
    
    // ** MISMATCH COMMENT **
    // Applying "Friendly & Sociable" logic (Weight 4) using 'preferredSocialLifestyle' and 'socialLifestyle'
    totalScore += scoreFriendliness(myPref.preferredSocialLifestyle, theirChars.socialLifestyle) * WEIGHTS.friendliness;
    
    totalScore += scoreBudget(myPref.preferredMinBudget, theirMaxBudget) * WEIGHTS.budget;
    
    // Max possible score is 100. Round to nearest integer.
    return Math.round(totalScore);
};
  