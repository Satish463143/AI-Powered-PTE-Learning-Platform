import React from 'react';
import './setupContent.css';

const SetupContent = ({ onNext, sectionSetupData }) => {
  return (
    <div className="setup-content">
      <div className="setup-header">
        <h2>Question Instructions</h2>
      </div>
      
      <div className="setup-body">
        <div className="time-info">
          <h3>Time Allowed</h3>
          <p>{sectionSetupData.timeAllowed}</p>
        </div>

        <div className="instructions">
          <h3>Instructions</h3>
          <p>{sectionSetupData.instructions}</p>
        </div>

        {sectionSetupData.tips && sectionSetupData.tips.length > 0 && (
          <div className="tips">
            <h3>Tips</h3>
            <ul>
              {sectionSetupData.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="setup-footer">
        <button 
          onClick={onNext}
          className="start-button"
        >
          Start Question
        </button>
      </div>
    </div>
  );
};

export default SetupContent; 