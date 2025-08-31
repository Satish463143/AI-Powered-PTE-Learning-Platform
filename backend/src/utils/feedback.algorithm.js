/**
 * Rule-Based Classification Algorithm for Feedback
 * Analyzes performance by question type for practice sessions.
 * Each entry: { type: "reorder_paragraphs", avgScore: 6.5 }
 */
function analyzePerformanceByType(questionScores = []) {
    const result = {
      weakAreas: [],
      moderateAreas: [],
      strongAreas: [],
      suggestedPractice: [],
    };
  
    questionScores.forEach(({ type, avgScore }) => {
      if (avgScore < 6) {
        result.weakAreas.push({ type, avgScore });
        result.suggestedPractice.push(type);
      } else if (avgScore < 7.5) {
        result.moderateAreas.push({ type, avgScore });
      } else {
        result.strongAreas.push({ type, avgScore });
      }
    });
  
    return result;
  }
  
  /**
   * Analyzes performance by section for full mock tests.
   * Each entry: { section: "Reading", score: 68 }
   */
  function analyzePerformanceBySection(sectionScores = []) {
    return sectionScores.map(({ section, score }) => {
      let status = '';
      if (score < 50) status = 'weak';
      else if (score < 75) status = 'moderate';
      else status = 'strong';
  
      return { section, score, status };
    });
  }
  
  module.exports = {
    analyzePerformanceByType,
    analyzePerformanceBySection,
  };
  