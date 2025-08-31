import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './aiRecommendation.css';
import { useGenerateFeedbackMutation } from '../../../api/practiceFeedback.api';

const AiRecommendation = ({ handleMenuBar, xpData , onSectionUpdate}) => {
  const [activeTab, setActiveTab] = useState("Overall");
  const currentXP = xpData?.result?.level;
  const xpPercentage = (currentXP / 10) * 100;
  const [feedback] = useGenerateFeedbackMutation()
  const [feedbackResponse, setFeedbackResponse] = useState(null)

  const tabs = [
    { value: 'Overall', label: 'Overall' },
    { value: 'Reading', label: 'Reading' },
    { value: 'Writing', label: 'Writing' },
    { value: 'Speaking', label: 'Speaking' },
    { value: 'Listening', label: 'Listening' }
    
  ];
  // console.log(xpData);

  const handlefeedback = async(section='overall') => {
    try{
      const response = await feedback({section})
      setFeedbackResponse(response?.data?.result?.feedback)
    }catch(exception){
      console.log(exception)
    }
  }

  useEffect(() => {
    // Fetch initial feedback for Overall section when component mounts
    handlefeedback('overall');

  }, []); // Empty dependency array means this runs once when component mounts

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    onSectionUpdate(tab.toLowerCase());
    handlefeedback(tab.toLowerCase())
  };

  const XpBar = () => (
    <>
      <h3 style={{ marginTop: '20px', fontSize: '18px' }}>
        Your {activeTab} experience point
      </h3>
      <div className="xp_bar" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="xp_bar_fill" style={{ width: `${xpPercentage}%` }}></div>
        <div className="xp_bar_score">{currentXP}/10</div>
      </div>
    </>
  );

  return (
    <div className="container">
      <div className={`ai_recommendation ${handleMenuBar ? 'progress_bar_active' : ''}`}>
        <div className="ai_recommendation_content">
          <h2>AI Recommendation</h2>
        </div>

        <div className="ai_recommendation_tabs">
          {/* Button Tabs - for screens > 770px */}
          <div className="ai_recommendation_tab">
            {tabs.map((item, index) => (
              <button
                key={index}
                onClick={() => handleTabClick(item.value)}
                className={activeTab === item.value ? 'active_tab' : ''}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Dropdown - only for screens ≤ 770px */}
          <div className="ai_recommendation_dropdown">
            <Select
              options={tabs}
              value={tabs.find(tab => tab.value === activeTab)}
              onChange={(selected) => handleTabClick(selected.value)}
              placeholder="Select a skill area..."
            />
          </div>

          <h2 className="text-center" style={{ marginTop: '20px' }}>
            🧠 Top Recommendations:
          </h2>

          <div className="ai_recommendation_tabs_content">
            <XpBar />
            <div
              className="feedback_content text-start"
              dangerouslySetInnerHTML={{
                __html: feedbackResponse ? feedbackResponse
                  .replace(/<[^>]*>\s*Score:\s*[^<]*<\/[^>]*>/gi, '')
                  .replace(/Score:\s*[A-Za-z0-9\/\-\.]+/gi, '')
                  : ''
              }}
            >
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiRecommendation;