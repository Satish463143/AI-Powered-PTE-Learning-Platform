import React, { useState, useEffect, useRef,useCallback} from 'react'
import './progressChat.css'
import { Link } from 'react-router-dom'
const progressChat = ({handleMenuBar}) => {
    const [checked, setChecked] = useState(false)
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const messagesEndRef = useRef(null);
    const handleChange = () => {
        setChecked(!checked)
    }
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, []);

       // Execute scrollToBottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
        scrollToBottom();
        }
    }, [messages, scrollToBottom]);

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
    // req and res message for user input
    const handleInputSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
        setMessages([...messages, { type: 'user', text: inputValue }]);
        setInputValue('');
        // call  AI chat API
        setTimeout(() => {
            const aiResponse = 'This is a sample AI response.';
            setMessages(prev => [...prev, { type: 'ai', text: aiResponse }]);
            speakText(aiResponse);
        }, 1000);
        }
    };

    //handle sound option
    const speakText = (text) => {
        if (checked && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          window.speechSynthesis.speak(utterance);
        }
      };
    //   handling mic option
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


  return (
    <div>
        <div className={`progressChat ${handleMenuBar ? 'progress_bar_active' : ''}`}>
            <div className="container">
                <div className="border"></div>
                <h2 style={{marginTop: '20px', fontSize: '20px', fontWeight: '500'}}>Ai Chat Window(थप प्रश्नन सोध्नुहोस्)</h2> 
                <div className="chat_box">
                    <div className={`chatPageNavbar_sound ${handleMenuBar ? 'chatPageNavbar_active' : ''}`}>
                        <p>‘AI’ आवाज</p>
                        <input
                            type="checkbox"
                            id='check'
                            className='sound_toggle_btn'
                            onChange={handleChange}
                            checked={checked}        
                        />
                        <label htmlFor="check"></label>
                    </div>
                    <div className="chat_messages">
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.type}`}>
                            {message.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat_input chat_div_input" style={{bottom:'10px'}}>
                        <form onSubmit={handleInputSubmit} className="input_container">
                            <input 
                            type="text" 
                            placeholder='आफ्नो प्रश्नन लेख्नुहोस्' 
                            style={{height:'40px'}}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            />
                            <span className='chat_mic' onClick={handleMicClick} style={{right:'35px', transform:'translateY(-30%)', cursor: 'pointer'}}>
                                <svg 
                                    className="bi bi-mic" 
                                    fill={isListening ? "red" : "currentColor"} 
                                    height="36" 
                                    viewBox="0 0 16 26" 
                                    width="36" 
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                                    <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                                </svg>
                            </span>
                            <button type="submit" className="send-button">
                                <svg style={{enableBackground:'new 0 0 24 24', cursor:'pointer'}} height='30px' width='30px' version="1.1" viewBox="0 0 24 24" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><path d="M21.5,11.1l-17.9-9C2.7,1.7,1.7,2.5,2.1,3.4l2.5,6.7L16,12L4.6,13.9l-2.5,6.7c-0.3,0.9,0.6,1.7,1.5,1.2l17.9-9   C22.2,12.5,22.2,11.5,21.5,11.1z" id="send"/></g></svg>
                            </button>
                        </form>
                        </div>
                </div>
                <div className="chat_video">
                    <Link to=''>
                        <div className="chat_video_content">
                            <span>
                                <svg
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    width="30"
                                    height="30"
                                >
                                    <defs>
                                    <style>
                                        {`
                                        .cls-1 { fill: #8d6de8; }
                                        .cls-2 { fill: #a78eef; }
                                        .cls-3 { fill: url(#linear-gradient); }
                                        .cls-4 { fill: #6c2e7c; }
                                        `}
                                    </style>
                                    <linearGradient
                                        gradientUnits="userSpaceOnUse"
                                        id="linear-gradient"
                                        x1="12"
                                        x2="12"
                                        y1="0.447"
                                        y2="23.944"
                                    >
                                        <stop offset="0" stopColor="#5d5c66" />
                                        <stop offset="1" stopColor="#48474f" />
                                    </linearGradient>
                                    </defs>
                                    <g id="Icons">
                                    <path
                                        className="cls-1"
                                        d="M11,3V23H5V3A2.006,2.006,0,0,1,7,1H9A2.006,2.006,0,0,1,11,3Z"
                                    />
                                    <path
                                        className="cls-1"
                                        d="M21,11V23H15V11a2.006,2.006,0,0,1,2-2h2A2.006,2.006,0,0,1,21,11Z"
                                    />
                                    <path
                                        className="cls-2"
                                        d="M11,3V18H5V3A2.006,2.006,0,0,1,7,1H9A2.006,2.006,0,0,1,11,3Z"
                                    />
                                    <path
                                        className="cls-2"
                                        d="M21,11v7H15V11a2.006,2.006,0,0,1,2-2h2A2.006,2.006,0,0,1,21,11Z"
                                    />
                                    <path
                                        className="cls-3"
                                        d="M23,24H4a4,4,0,0,1-4-4V1A1,1,0,0,1,2,1V20a2,2,0,0,0,2,2H23a1,1,0,0,1,0,2Z"
                                    />
                                    </g>
                                    <g data-name="Layer 4" id="Layer_4">
                                    <path
                                        className="cls-4"
                                        d="M23,22H22V11a3,3,0,0,0-3-3H17a3,3,0,0,0-3,3V22H12V3A3,3,0,0,0,9,0H7A3,3,0,0,0,4,3V22a2,2,0,0,1-2-2V1A1,1,0,0,0,0,1V20a4,4,0,0,0,4,4H23a1,1,0,0,0,0-2ZM6,22V3A1,1,0,0,1,7,2H9a1,1,0,0,1,1,1V22Zm10,0V11a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V22Z"
                                    />
                                    </g>
                                </svg>
                            </span>
                            <h2>Progress Section, How to use it?</h2>
                            <span>
                                <svg viewBox="0 0 24 24" width='30px' height='30px' xmlns="http://www.w3.org/2000/svg"><g><path d="M0 0h24v24H0z" fill="none"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM10.622 8.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z"/></g></svg>
                            </span>
                        </div>
                    </Link>
                </div>
            </div>                            
        </div>
    </div>
  )
}

export default progressChat