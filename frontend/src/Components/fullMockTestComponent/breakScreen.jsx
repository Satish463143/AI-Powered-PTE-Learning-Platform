import React from 'react';

const BreakScreen = ({ onNext, onSkip }) => {

  const breakContent = (
    <div key="break" className="break-content">
      <h2>Break Time</h2>
      <p>Take 10 minutes to relax before continuing to the next section.</p>
      <p>You can either wait for the break timer to finish or click "Skip Break" to continue immediately.</p>
    </div>
  );

  return (
    <div className="speaking-wrapper container">
          <div  className="question">
            {breakContent}
            <div className="break-buttons">
              <button onClick={onNext} className="primary-btn">
                Next Section
              </button>
              <button onClick={onSkip} className="skip-btn">
                Skip Break
              </button>
            </div>
          </div>           
    </div>
  );
}

export default BreakScreen