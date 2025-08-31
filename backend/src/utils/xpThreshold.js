function getLevelUpThreshold(level) {
    // Base threshold starts at 30 (requiring at least 3 perfect scores)
    const base = 30;
  
    if (level === 1) return 20;  // First level is easier
    if (level === 2) return 25;  // Second level slightly harder
    if (level === 3) return base;
  
    // For higher levels, increase difficulty exponentially
    return base + Math.floor(Math.pow(level - 3, 1.5) * 10);
  }
  
  module.exports = { getLevelUpThreshold };
  