import React from 'react';
import './scoreDisplay.css';

const ScoreDisplay = ({ score, isSubmitted }) => {
  if (!isSubmitted || !score) {
    return null;
  }

  // Parse the score properly - extract the actual score from "X/5" format
  const parseScore = (scoreValue) => {
    const scoreStr = String(scoreValue).trim();
    
    // If it's in "X/5" format, extract just the X part
    if (scoreStr.includes('/')) {
      const parts = scoreStr.split('/');
      return parts[0].trim();
    }
    
    // If it contains spaces (like "0 5"), take the last number
    if (scoreStr.includes(' ')) {
      const parts = scoreStr.split(' ').filter(part => part.trim() !== '');
      return parts[parts.length - 1]; // Get the last part
    }
    
    return scoreStr;
  };

  const displayScore = parseScore(score);

  return (
    <div className="question-score-display">
      <span className="score-label">Score: </span>
      <span className="score-value">{displayScore}/5</span>
    </div>
  );
};

export default ScoreDisplay; 