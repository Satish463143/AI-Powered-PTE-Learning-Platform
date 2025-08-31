import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { Link } from 'react-router-dom'

// Helper function to safely render HTML
const createMarkup = (html) => {
    return { __html: html };
};

const MockTestChat = forwardRef(({handleMenuBar}, ref) => {
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

    // Function to add AI greeting message
    const addAIGreeting = useCallback(() => {
        const greetingMessage = "How can I help you with the result?";
        setMessages(prev => {
            // Check if greeting already exists to avoid duplicates
            const hasGreeting = prev.some(msg => msg.type === 'ai' && msg.text === greetingMessage);
            if (!hasGreeting) {
                const newMessage = { type: 'ai', text: greetingMessage };
                // Speak the greeting if sound is enabled
                if (checked) {
                    setTimeout(() => speakText(greetingMessage), 100);
                }
                return [...prev, newMessage];
            }
            return prev;
        });
    }, [checked]);

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
        addAIGreeting
    }), [addAIGreeting]);

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
        <div className={`progressChat`}>
            <div className="container">
                <div className={`progress_bar ${handleMenuBar ? 'progress_bar_active' : ''}`}>
                <div className="border"></div>
                <h2 style={{marginTop: '20px', fontSize: '20px', fontWeight: '500'}}>Ai Chat Window(थप प्रश्नन सोध्नुहोस्)</h2> 
                <div className="chat_box">
                    <div className={`chatPageNavbar_sound `}>
                        <p>'AI' आवाज</p>
                        <input
                            type="checkbox"
                            id='check'
                            className='sound_toggle_btn'
                            onChange={handleChange}
                            checked={checked}        
                        />
                        <label htmlFor="check"></label>
                    </div>
                    <div className="chat_messages" style={{height:'calc(100% - 80px)'}}>
                        {messages.map((message, index) => (
                            <div key={index} className={`message ${message.type}`}>
                                <div dangerouslySetInnerHTML={createMarkup(message.text)} />
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
                </div>                
            </div>                            
        </div>
    </div>
  )
})

export default MockTestChat