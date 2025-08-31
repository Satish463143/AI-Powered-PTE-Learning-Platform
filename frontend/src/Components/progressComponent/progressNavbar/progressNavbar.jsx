import React, { useState, useEffect } from 'react';
import './progressNavbar.css';

const ProgressNavbar = ({ handleMenuBar, xpData }) => {
  const score = xpData?.result?.overall?.progress;
  const [selectedScore, setSelectScore] = useState(null);
  const [toggleScore, setToggleScore] = useState(false);
  const [targetScore, setTargetScore] = useState(100);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const currentXP = xpData?.result?.overall?.level;
  const xpPercentage = (currentXP / 10) * 100;

  useEffect(() => {
    const percentage = (score / targetScore) * 100;
    setProgressPercentage(Math.min(percentage, 100));
  }, [score, targetScore]);

  const handleToggleScore = () => {
    setToggleScore(!toggleScore);
  };

  const handleSelectScore = (scoreRange) => {
    setSelectScore(scoreRange);
    const [_, max] = scoreRange.split('-').map(Number);
    setTargetScore(max);
    setTimeout(() => {
      setToggleScore(false);
    }, 500);
  };

  return (
    <div className="container">
      <div className="progress_navbar">
        <div className={`progress_bar ${handleMenuBar ? 'progress_bar_active' : ''}`}>
          <h3>
            Progress
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="35px"
              width="35px"
              viewBox="0 0 512 512"
              style={{ enableBackground: 'new 0 0 512 512' }}
            >
              {/* SVG content omitted for brevity */}
            </svg>
          </h3>

          <div className="progress_line">
            <div className="progress_line_bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>

          <h3 style={{ marginTop: '20px', fontSize: '18px' }}>Your overall experience point</h3>
          <div className="xp_bar">
            <div className="xp_bar_fill" style={{ width: `${xpPercentage}%` }}></div>
            <div className="xp_bar_score">{currentXP}/10</div>
          </div>
        </div>

        <div className="progress_score">
          <div className="select_score">
            <div className="score_menu">
              <h3>लक्ष्य स्कोर कति राख्न चाहनुहुन्छ?</h3>
              <h2 onClick={handleToggleScore}>Set Score</h2>
            </div>
            <div className={`score_disable ${toggleScore ? 'score_active' : ''}`}>
              <h3>हजुरको Desired स्कोर कति हो?</h3>
              <div className="scores_btn">
                <button
                  onClick={() => handleSelectScore('50-65')}
                  className={selectedScore === '50-65' ? 'selected' : ''}
                >
                  (50-65)
                </button>
                <button
                  onClick={() => handleSelectScore('65-75')}
                  className={selectedScore === '65-75' ? 'selected' : ''}
                >
                  (65-75)
                </button>
                <button
                  onClick={() => handleSelectScore('75-90')}
                  className={selectedScore === '75-90' ? 'selected' : ''}
                >
                  (75-90)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressNavbar;
