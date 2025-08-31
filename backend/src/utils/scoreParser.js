module.exports = function extractScoreAndFeedback(aiText) {
    // Try multiple patterns to match different score formats (now supporting scores out of 5)
    const patterns = [
        /\*\*score\*\*[:\- ]+([1-5])(?:\/5)?/i,      // **Score:** 4/5 or **Score:** 4
        /score[:\- ]+([1-5])(?:\/5)?/i,              // Score: 4/5 or score: 4
        /([1-5])\/5/i,                               // 4/5
        /([1-5])\s*out\s*of\s*5/i,                   // 4 out of 5
        // Fallback patterns for old 100-based scores (convert to 5-scale)
        /\*\*score\*\*[:\- ]+(\d{1,3})(?:\/100)?/i,  // **Score:** 90/100
        /score[:\- ]+(\d{1,3})(?:\/100)?/i,          // Score: 90/100 or score: 90
        /(\d{1,3})\/100/i,                           // 90/100
        /(\d{1,3})\s*%/i,                            // 90%
        /(\d{1,3})\s*out\s*of\s*100/i               // 90 out of 100
    ];
    
    let score = 0;
    for (const pattern of patterns) {
        const match = aiText.match(pattern);
        if (match) {
            let extractedScore = parseInt(match[1]);
            
            // Convert scores > 5 to 5-point scale (assuming they're out of 100)
            if (extractedScore > 5) {
                score = Math.round((extractedScore / 100) * 5);
                // Ensure score stays within 1-5 range
                score = Math.max(1, Math.min(5, score));
            } else {
                score = extractedScore;
            }
            break;
        }
    }
    
    return {
      score,
      feedback: aiText
    };
  };