import React, { useState, useEffect, useRef, useCallback } from 'react'
import './chatWIthAi.css'
import logo from '../../../assets/image/logo_half.png'
import { useLocation } from 'react-router-dom';

const chatWithAi = ({ isSoundOn, selectedScore, selectedContent, resetChat, setShowChatWithAi, showChatWithAi, setMessages }) => {
 
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [hasResponded, setHasResponded] = useState(false);
  const processedFromHomePage = useRef(false);

  const location = useLocation();
  const selectedContentFromHomePage = location.state?.selectedContent || '';
  
  // Handle content selection from allSections page
  useEffect(() => {
    if (selectedContentFromHomePage && !hasResponded && !processedFromHomePage.current) {
      processedFromHomePage.current = true;
      setShowChatWithAi(false);
      const userMessage = `Selected option: ${selectedContentFromHomePage}`;
      // Use the function form to avoid dependency on messages
      setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
      
      setTimeout(() => {
        const aiResponse = `I'll help you with ${selectedContentFromHomePage.toLowerCase()}.`;
        setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
        if (isSoundOn) {
          speakText(aiResponse);
        }
        setHasResponded(true);
      }, 500);
    }
  }, [selectedContentFromHomePage, hasResponded, isSoundOn, setMessages, setShowChatWithAi]);

  // Handle reset chat
  useEffect(() => {
    if (resetChat) {
      setShowChatWithAi(true);
      setInputValue('');
      setSelectedOption('');
      setHasResponded(false);
      processedFromHomePage.current = false;
    }
  }, [resetChat, setShowChatWithAi]);

  // Reset hasResponded when new selections are made
  useEffect(() => {
    setHasResponded(false);
  }, [selectedScore, selectedContent]);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      //You can change this to your preferred language
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognition);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  useEffect(() => {
    // Only respond if we haven't responded to these values yet
    // This is for direct score and content selection (not from homepage)
    if (selectedScore && selectedContent && !hasResponded && 
        // Don't process if we've already processed from homepage or if the content matches homepage content
        (!processedFromHomePage.current || selectedContent !== selectedContentFromHomePage)) {
      setShowChatWithAi(false);
      const userMessage = `Selected score: ${selectedScore}, Content: ${selectedContent}`;
      setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
      
      setTimeout(() => {
        const aiResponse = `I'll help you with ${selectedContent} at score level ${selectedScore}.`;
        setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
        if (isSoundOn) {
          speakText(aiResponse);
        }
        setHasResponded(true);
      }, 500);
    }
  }, [selectedScore, selectedContent, hasResponded, selectedContentFromHomePage, isSoundOn, setMessages, setShowChatWithAi]);

  const speakText = (text) => {
    if (isSoundOn && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // handling mic option
  const handleMicClick = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  // req and res message for user input
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
      setInputValue('');
      setShowChatWithAi(false);
      // call AI chat API
      setTimeout(() => {
        const aiResponse = 'This is a sample AI response.';
        setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
        speakText(aiResponse);
      }, 500);
    }
  };

  // req and res messaage for the selected options 
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setShowChatWithAi(false);
    const userMessage = `Selected option: ${option}`;
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setTimeout(() => {
      const aiResponse = `I'll help you with ${option.toLowerCase()}.`;
      setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
      speakText(aiResponse);
    }, 500);
  };

  return (
    <div className='container'>
      {showChatWithAi && (
        <div className="chatWithAi">
            <div className="chat_logo">
                <img src={logo} alt="" />
            </div>
            <div className="chat_input">
                <form onSubmit={handleInputSubmit} className="input_container">                
                    <input 
                        type="text" 
                        placeholder='आफ्नो प्रश्नन लेख्नुहोस्' 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <span className='chat_mic' onClick={handleMicClick} style={{ cursor: 'pointer' }}>
                        <svg 
                            className="bi bi-mic" 
                            fill={isListening ? "red" : "currentColor"} 
                            height="46" 
                            viewBox="0 0 16 26" 
                            width="46" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                            <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                        </svg>
                    </span>
                    <button type="submit" className="send-button">
                        <svg style={{enableBackground:'new 0 0 24 24', cursor:'pointer'}} height='40px' width='40px' version="1.1" viewBox="0 0 24 24" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><path d="M21.5,11.1l-17.9-9C2.7,1.7,1.7,2.5,2.1,3.4l2.5,6.7L16,12L4.6,13.9l-2.5,6.7c-0.3,0.9,0.6,1.7,1.5,1.2l17.9-9   C22.2,12.5,22.2,11.5,21.5,11.1z" id="send"/></g></svg>
                    </button>
                </form>
            </div>
            <div className="chat_option">
                <div className="chat_option_btn">
                <div className="chat_option_btn_1" onClick={() => handleOptionClick('Reading')}>
                    <span>
                    <svg enableBackground="new 0 0 48 48" height="30px" id="Layer_1" version="1.1" viewBox="0 0 48 48" width="30px" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><path clipRule="evenodd" d="M41,46L41,46c0,0.553-0.447,1-1,1H12l0,0c-2.762,0-5-2.238-5-5V6  c0-2.761,2.238-5,5-5l0,0h26l0,0c0.414,0,0.77,0.252,0.922,0.611C38.972,1.73,39,1.862,39,2v0v7l0,0h1l0,0  c0.278,0,0.529,0.115,0.711,0.298C40.889,9.479,41,9.726,41,10c0,0,0,0,0,0V46z M9,42L9,42L9,42c0,1.657,1.344,3,3,3h3V11h-3l0,0  c-1.131,0-2.162-0.39-3-1.022V42z M37,9V3H12l0,0l0,0c-1.656,0-3,1.343-3,3s1.344,3,3,3H37L37,9z M39,11H17v34h22V11z M12,7  c-0.553,0-1-0.448-1-1s0.447-1,1-1h22c0.553,0,1,0.448,1,1s-0.447,1-1,1H12z" fillRule="evenodd"/></svg>
                    </span>
                    <h3>Reading</h3>
                </div>
                <div className="chat_option_btn_1" onClick={() => handleOptionClick('Writing')}>
                    <span>
                    <svg className="icon icon-tabler icon-tabler-writing-sign" fill="none" height="30" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="30" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none" stroke="none"/><path d="M3 19c3.333 -2 5 -4 5 -6c0 -3 -1 -3 -2 -3s-2.032 1.085 -2 3c.034 2.048 1.658 2.877 2.5 4c1.5 2 2.5 2.5 3.5 1c.667 -1 1.167 -1.833 1.5 -2.5c1 2.333 2.333 3.5 4 3.5h2.5"/><path d="M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z"/><path d="M16 7h4"/></svg>
                    </span>
                    <h3>Writing</h3>
                </div>                    
                </div>
                <div className="chat_electric_icon">
                <span>
                    <svg height="68px" version="1.1" viewBox="0 0 48 48" width="68px" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><title/><desc/><g fill="none" fillRule="evenodd" id="Page-1" stroke="none" strokeWidth="1"><g id="Artboard-Copy" transform="translate(-347.000000, -369.000000)"><path d="M368.9199,395.002 L362.110021,395.002 C361.879194,395.002 361.655475,394.922146 361.476818,394.775986 C361.049358,394.426277 360.986327,393.796257 361.336036,393.368797 L374.77157,376.946096 C375.028907,376.631544 375.451018,376.504019 375.839473,376.623469 C376.367364,376.785795 376.663712,377.345326 376.501386,377.873217 L373.0799,389 L379.891387,389 C380.122264,389 380.346028,389.079888 380.524702,389.226105 C380.952112,389.575875 381.015052,390.205904 380.665282,390.633314 L367.22817,407.053133 C366.970805,407.367628 366.548712,407.495098 366.160291,407.375629 C365.632411,407.213265 365.336102,406.653713 365.498466,406.125834 L368.9199,395.002 Z" fill="#000000" id="flash"/><g id="slices" transform="translate(47.000000, 9.000000)"/></g></g></svg>
                </span>
                </div>
                <div className="chat_option_btn">
                <div className="chat_option_btn_1" onClick={() => handleOptionClick('Listening')}>
                    <span>
                    <svg height="30" width="30" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="M216 260c0 15.464-12.536 28-28 28s-28-12.536-28-28c0-44.112 35.888-80 80-80s80 35.888 80 80c0 15.464-12.536 28-28 28s-28-12.536-28-28c0-13.234-10.767-24-24-24s-24 10.766-24 24zm24-176c-97.047 0-176 78.953-176 176 0 15.464 12.536 28 28 28s28-12.536 28-28c0-66.168 53.832-120 120-120s120 53.832 120 120c0 75.164-71.009 70.311-71.997 143.622L288 404c0 28.673-23.327 52-52 52-15.464 0-28 12.536-28 28s12.536 28 28 28c59.475 0 107.876-48.328 108-107.774.595-34.428 72-48.24 72-144.226 0-97.047-78.953-176-176-176zm-80 236c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zM32 448c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32zm480-187.993c0-1.518-.012-3.025-.045-4.531C510.076 140.525 436.157 38.47 327.994 1.511c-14.633-4.998-30.549 2.809-35.55 17.442-5 14.633 2.81 30.549 17.442 35.55 85.906 29.354 144.61 110.513 146.077 201.953l.003.188c.026 1.118.033 2.236.033 3.363 0 15.464 12.536 28 28 28s28.001-12.536 28.001-28zM152.971 439.029l-80-80L39.03 392.97l80 80 33.941-33.941z"/></svg>
                    </span>
                    <h3>Listening</h3>
                </div>
                <div className="chat_option_btn_1" onClick={() => handleOptionClick('Speaking')}>
                    <span>
                    <svg fill="none" height="30" strokeWidth="1.5" viewBox="0 0 24 24" width="30" xmlns="http://www.w3.org/2000/svg"><rect height="12" rx="3" stroke="currentColor" strokeWidth="1.5" width="6" x="9" y="2"/><path d="M5 3V5M1 2V6M19 3V5M23 2V6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10V11C5 14.866 8.13401 18 12 18V18V18C15.866 18 19 14.866 19 11V10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18V22M12 22H9M12 22H15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <h3>Speaking</h3>
                </div>                    
                </div>
            </div>
        </div>
      )}
    </div>
  )
}

export default chatWithAi