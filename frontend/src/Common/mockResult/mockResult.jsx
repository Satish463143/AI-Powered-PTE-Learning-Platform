import React from 'react';
import './mockResult.css';
import { Link } from 'react-router-dom'
import userprofile from '../../assets/image/user.png'
import logo from '../../assets/image/logo.png'

const MockResult = ({ section, mockResult, toggleMockResult, scrollToChat, userImage }) => {
  const handleChatClick = () => {
    toggleMockResult();
    if (scrollToChat) {
      setTimeout(() => {
        scrollToChat();
      }, 100);
    }
  };

  const imageSrc = userImage || userprofile;

  if (!mockResult) return null;

  return (
    <div className="mock_result">
      <div className="mock_result_overlay" onClick={toggleMockResult}></div>

      <div className="mock_result_container max-w-3xl bg-white p-6 rounded-xl shadow-xl overflow-y-auto max-h-[90vh] relative">
        {/* Header */}
  {/* Header with Logo and Score */}
<div className="flex justify-between items-center mt-6 px-4 py-3 border-b pb-6">
  {/* Logo & User Info */}
  <div className="flex items-center gap-4">
    <img
      src={logo}
      alt="Logo"
      className="w-16 h-16 object-contain"
    />
    <div className="space-y-1">
      <p className="font-bold text-base">Example Test Taker</p>
      <p className="text-sm text-gray-600">Test Taker ID: PTE879654321</p>
    </div>
  </div>

  {/* Overall Score */}
  <div className="flex flex-col items-center space-y-2">
    <div
      className="flex items-center justify-center text-white text-2xl font-semibold"
      style={{
        width: '100px',
        height: '60px',
        backgroundImage: 'linear-gradient(to right, var(--red), var(--orange))',
        borderRadius: '8px',
      }}
    >
      61
    </div>
    <span className="text-lg text-gray-800 font-medium">Overall Score:</span>
  </div>
</div>

{/* Communicative Skills */}
<div className="pt-10 pb-8 px-4" >
  <h3 className="font-semibold text-lg text-center text-gray-800 mb-6">Communicative Skills</h3>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <SkillBadge name="Listening" score={55} color="var(--blue)" />
    <SkillBadge name="Reading" score={62} color="var(--orange)" />
    <SkillBadge name="Speaking" score={65} color="var(--red)" />
    <SkillBadge name="Writing" score={63} color="var(--red)" />
  </div>
</div>


        {/* Notes Section */}
                <div className="mt-6 bg-gray-50 p-6 rounded-md border text-base leading-relaxed space-y-4 font-medium">
          <h4 className="text-center text-xl font-semibold text-red-600">यो कुराहरुमा ध्यान दिनुहोस्</h4>
          <p>
            <span className="text-indigo-600 font-bold">Speaking section</span> मा जहिले पनि, प्रष्ट बोल्ने कोशिश गर्नुहोस्।
            तपाईंको <strong>read aloud</strong> मा धेरै mistake भयो।
          </p>
          <p>
            <span className="text-indigo-600 font-bold">Reading section</span> को <strong>fill in the blanks</strong> हरु पनि कमजोर छन्,
            प्रयास गर्नुहोस् collocation बुझेर मिलाउने blanks हरु बिग्रिएको छ।
          </p>
          <p>
            <span className="text-indigo-600 font-bold">Writing section</span> ठीकै छ, हल्का sentence structure मा गल्ती, नत्र everything is fine।
          </p>
          <p>
            <span className="text-indigo-600 font-bold">Listening section</span> राम्रो छ तपाईंको।
          </p>
        </div>

        <div className="mt-8 text-center text-lg font-semibold" style={{ color: 'var(--orange)' }}>
          ‘AI’ संग सँग नभएकोको दोष
        </div>


        {/* Chat Button */}
        <div className="aichat_button mt-6 text-center">
          <button
            className="px-6 py-2 rounded-md text-white"
            style={{ backgroundColor: 'var(--red)' }}
            onClick={handleChatClick}
          >
            Chat with AI
          </button>
        </div>
      </div>
    </div>
  );
};

const SkillBadge = ({ name, score, color }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md"
        style={{ backgroundColor: color }}
      >
        {score}
      </div>
      <div className="text-sm font-medium text-gray-800">{name}</div>
    </div>
  );
};

export default MockResult;
