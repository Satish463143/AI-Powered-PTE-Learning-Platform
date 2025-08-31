/**
 * Calculate XP based on score and user level.
 *
 * @param {number} rawScore - Raw score from practice or mock test (0-5 for practice questions)
 * @param {number} level - Current user level
 * @param {object} options - Optional tuning parameters
 * @param {number} options.baseMultiplier - Controls base XP (default 1)
 * @param {number} options.difficultyFactor - XP slows down by this rate per level (default 0.5)
 * @param {boolean} options.normalize - If true, score will be normalized (for mock test sections)
 * @param {number} options.maxScore - The max score to normalize against (default 5 for practice, 90 for mock test)
 * @returns {number} Final XP (integer, capped at 10)
 */
function calculateXP(
    rawScore,
    level,
    {
      baseMultiplier = 1,
      difficultyFactor = 0.5,
      normalize = false,
      maxScore = 5  // Default to 5 for practice questions
    } = {}
  ) {
    let score = rawScore;
  
    // For practice questions (0-5 scale)
    if (!normalize) {
      // Validate score is within 0-5 range
      if (score < 0 || score > 5) {
        throw new Error('Practice question scores must be between 0 and 5');
      }
      
      // Scale up the 0-5 score to give more meaningful XP but with a steeper curve
      score = Math.pow(score / 5, 2) * 10; // Quadratic scaling, perfect score (5) gives 10 points before multipliers
    }
    // For mock tests or other normalized scores
    else if (normalize && maxScore > 0) {
      score = Math.pow(rawScore / maxScore, 2) * 10; // Quadratic scaling for normalized scores too
    }
  
    // Apply difficulty scaling with steeper penalty
    const levelPenalty = Math.pow(1 + (level - 1) * difficultyFactor, 1.5);
    const scaledXP = (score * baseMultiplier) / levelPenalty;
  
    // Cap at 10 XP and round down
    return Math.min(10, Math.floor(scaledXP));
  }
  
  module.exports = { calculateXP };
  