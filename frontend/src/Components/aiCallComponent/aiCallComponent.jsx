import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { minimizeCall, maximizeCall, endCall } from '../../reducer/callReducer';
import Draggable from 'react-draggable';
import './aiCallComponent.css'
import logo from '../../assets/image/logo_half.png'
import callAudio from '../../assets/audio/call.mp3'
import AiCallXp from './aiCallXp';
import HistoryAiCall from './historyAiCall';
import { useStartCallMutation, useEndCallMutation } from '../../api/call.api';
import { createLiveConnection } from '../../config/gemini.config';
import { useMeQuery } from '../../api/auth.api';
import { useGetCallHistoryQuery } from '../../api/call.api';
import { toast } from 'react-toastify';

const AiCallComponent = () => {
    const { isCallActive, isMinimized } = useSelector((state) => state.call);
    const dispatch = useDispatch();
    const nodeRef = useRef(null);
    const audioRef = useRef(null);
    const geminiConnectionRef = useRef(null);

    const [audioPlayed, setIsAudioPlayed] = useState(false);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [questionAsked, setQuestionAsked] = useState(false);
    const [value, setValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isUserSpeaking, setIsUserSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isHistory, setIsHistory] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [activeTab, setActiveTab] = useState('chat');
    const [transcript, setTranscript] = useState('');
    const isEndingRef = useRef(false);
    const connectingRef = useRef(false);
    
    // API mutations and queries
    const [startCall] = useStartCallMutation();
    const [endCallMutation] = useEndCallMutation();
    const { data: userData } = useMeQuery();
    
    // Get userId from me query
    const userId = userData?.result?._id;

    const { data: callHistory } = useGetCallHistoryQuery();
   
    // Gemini Live states
    const [geminiToken, setGeminiToken] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    
    // Scoring states (0-100 scale to match backend)
    const [scores, setScores] = useState({
        pronunciationScore: 0,
        oralFluencyScore: 0,
        vocabularyScore: 0,
        contentScore: 0
    });
    
    // XP System - Level based (1-10 levels, each level needs 10 XP to advance)
    const [currentLevel, setCurrentLevel] = useState(1);
    const [currentXP, setCurrentXP] = useState(1);

    // Add new state for AI chat messages
    const [aiChats, setAiChats] = useState([]);

    // Update XP and Level
    const updateXP = useCallback((xpGain) => {
        setCurrentXP(prevXP => {
          const total = prevXP + xpGain;
          const levelsGained = Math.floor(total / 10);
          if (levelsGained > 0) {
            setCurrentLevel(prev => Math.min(10, prev + levelsGained));
          }
          return Math.min(total % 10, 10);
        });
      }, [])

    // Gemini Live connection handler
    const handleGeminiData = useCallback((evt) => {
        if (evt?.type === 'transcript_partial') {
          setTranscript(prev => prev + (prev ? '\n' : '') + evt.text);
        } else if (evt?.type === 'transcript_final') {
          setAiChats(prev => [...prev, evt.text]);
        }
      
        if (evt?.type === 'output_audio' && evt?.audio instanceof Float32Array) {
          // Optional: play with WebAudio
        }
      
        // Fallback events
        if (evt?.serverContent?.modelTurn?.parts) {
          for (const part of evt.serverContent.modelTurn.parts) {
            if (part.text) {
              setTranscript(prev => prev + '\nAI: ' + part.text);
              setAiChats(prev => [...prev, part.text]);
            }
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              try {
                const audioBlob = new Blob(
                  [Uint8Array.from(atob(part.inlineData.data), c => c.charCodeAt(0))],
                  { type: part.inlineData.mimeType }
                );
                const url = URL.createObjectURL(audioBlob);
                const a = new Audio(url);
                a.onended = () => URL.revokeObjectURL(url);
                a.play().catch(console.error);
              } catch (e) {
                console.error('❌ Error processing audio data:', e);
              }
            }
          }
        }
      
        if (evt?.error) {
          console.error('❌ Gemini Live error:', evt.error);
          toast.error('Gemini Live error: ' + evt.error.message);
        }
      
        // Mock scoring when *evt* arrives (was `data` before)
        if (evt?.serverContent) {
          const mockScores = {
            pronunciationScore: Math.min(100, Math.random() * 60 + 40),
            oralFluencyScore:   Math.min(100, Math.random() * 60 + 40),
            vocabularyScore:    Math.min(100, Math.random() * 60 + 40),
            contentScore:       Math.min(100, Math.random() * 60 + 40),
          };
          setScores(mockScores);
          const avg = Object.values(mockScores).reduce((a,b)=>a+b,0)/4;
          updateXP(Math.max(0, Math.floor(avg/10)));
        }
      }, [updateXP]);

    // Initialize Gemini Live connection
    const initializeGeminiConnection = useCallback(async (token) => {
        const conn = await createLiveConnection(
          token,
          // onEvent
          (evt) => {
            // your existing handler
            handleGeminiData(evt);
          },
          // onError
          (error) => {
            console.error('❌ Gemini connection error:', error);
            toast.error('Gemini connection error: ' + (error?.message || error));
            setIsConnected(false);
          },
          // onConnected
          () => {
            setIsConnected(true);
          }
        );
      
        geminiConnectionRef.current = conn; // { sendMic, stopMic, sendText, close, live }
        return conn;
      }, [handleGeminiData]);

    // Start audio capture and streaming to Gemini
    const startAudioCapture = useCallback(async () => {
        try {
          if (!geminiConnectionRef.current) throw new Error('No live connection');
          await geminiConnectionRef.current.sendMic();
          setIsListening(true);
        } catch (error) {
          console.error('❌ Failed to start audio capture:', error);
          if (error.name === 'NotAllowedError') {
            toast.error('Microphone permission denied. Please allow microphone access.');
          } else if (error.name === 'NotFoundError') {
            toast.error('No microphone found. Please check your audio devices.');
          } else {
            toast.error('Failed to start audio capture: ' + error.message);
          }
          throw error;
        }
      }, []);

    // Stop audio capture
    const stopAudioCapture = useCallback(() => {
        try { geminiConnectionRef.current?.stopMic?.(); } catch {}
        setIsListening(false);
      }, []);

    // Update handleCallStart function
    const handleCallStart = async () => {
        if (connectingRef.current) return;
        connectingRef.current = true;
      
        try {
          const res = await startCall().unwrap();
          if (!res?.token?.startsWith('auth_tokens/')) {
            throw new Error('Backend did not return a Live ephemeral token');
          }
          console.log('Live token prefix:', res.token.split('/')[0] + '/'); // keep short for safety
      
          setGeminiToken(res.token);
      
          const conn = await initializeGeminiConnection(res.token);
      
          // Give the socket one tick after onConnected before sending
          setTimeout(async () => {
            try {
              if (!isMuted) {
                await conn.sendMic();
                setIsListening(true);
              }
              await conn.sendText(
                'Hello! I would like to practice PTE speaking. Please introduce yourself and ask how you can help me improve my speaking skills today.'
              );
            } catch (e) {
              console.error('❌ Failed to start mic or send greeting:', e);
            }
          }, 100);
        } catch (err) {
          console.error('❌ Failed to start call:', err);
          toast.error('Failed to start call: ' + (err?.message || err));
          setIsConnected(false);
        } finally {
          connectingRef.current = false;
        }
      };

      const handleCallEnd = async () => {
        if (isEndingRef.current) return;
        isEndingRef.current = true;
      
        try {
          stopAudioCapture();
      
          try { await geminiConnectionRef.current?.close?.(); } catch {}
          geminiConnectionRef.current = null;
          setIsConnected(false);
          setIsListening(false);
          setIsUserSpeaking(false);
      
          const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n || 0))));
          const payload = {
            scores: {
              pronunciationScore: clamp(scores.pronunciationScore),
              oralFluencyScore:   clamp(scores.oralFluencyScore),
              vocabularyScore:    clamp(scores.vocabularyScore),
              contentScore:       clamp(scores.contentScore),
            },
            hasChat: Array.isArray(aiChats) && aiChats.length > 0,
            chat: (Array.isArray(aiChats) ? aiChats.join('\n') : (transcript || '')).slice(0, 10000),
          };
      
          try {
            await endCallMutation(payload).unwrap();
            toast.success('Call ended and saved ✅');
          } catch (e) {
            console.error('❌ endCall API failed:', e);
            toast.error(e?.data?.message || 'Failed to save call. Please try again.');
          }
      
          dispatch(endCall());
          setScores({ pronunciationScore: 0, oralFluencyScore: 0, vocabularyScore: 0, contentScore: 0 });
          setTranscript('');
          setAiChats([]);
          setQuestionAsked(false);
          setValue('');
          setGeminiToken(null);
        } catch (err) {
          console.error('❌ Failed to clean up call resources:', err);
        } finally {
          isEndingRef.current = false;
        }
    };
    // Add renderConversation function before the renderMobileContent function
    const renderConversation = () => {
        if (aiChats.length === 0) return null;

        return (
            <div className="ai-feedback-container">
                {aiChats.map((chat, index) => (
                    <div key={index} className="ai-feedback-message">
                        <div className="ai-feedback-content">
                            {chat}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Remove hardcoded scores
    const historyToggle = () => {
      setIsHistory(!isHistory);
    }

    // Add cleanup for speech synthesis when component unmounts
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel(); // Cancel any ongoing speech
        };
    }, []);

    // Reset all states when call becomes inactive
    useEffect(() => {
        if (!isCallActive) {
            stopAudioCapture();
            if (geminiConnectionRef.current) {
                geminiConnectionRef.current.close();
                geminiConnectionRef.current = null;
            }
            
            // Reset all local state variables
            setIsAudioPlayed(false);
            setAudioPlaying(false);
            setQuestionAsked(false);
            setValue('');
            setIsListening(false);
            setIsUserSpeaking(false);
            setIsMuted(false);
            setIsConnected(false);
            setGeminiToken(null);
        }
    }, [isCallActive, stopAudioCapture]);

    // Play audio when call becomes active and not minimized
    useEffect(() => {
        if (isCallActive && !isMinimized && !audioPlayed && !audioPlaying) {
            setAudioPlaying(true);
            if (audioRef.current) {
                audioRef.current.play().catch(error => {
                    handleAudioEnd();
                });
            }
        }
    }, [isCallActive, isMinimized, audioPlayed, audioPlaying]);

    const handleAudioEnd = () => {
        setAudioPlaying(false);
        setIsAudioPlayed(true);
        
        // Auto-start API call and audio capture after intro audio ends
        setTimeout(async () => {
            await handleCallStart();
        }, 500);
    };

    const handleQuestionSelect = async (selectedValue) => {
        setValue(selectedValue);
        setQuestionAsked(true);
        // Add the selected option to aiChats
        setAiChats(prev => [...prev, `Practice Instructions: Let's practice ${selectedValue}`]);
        
        // Send the selected option as an instruction to AI (call should already be started)
        if (geminiConnectionRef.current && isConnected) {
            
            try {
                await geminiConnectionRef.current.sendText(
                    `I want to practice ${selectedValue} for PTE exam. Please give me a specific exercise and provide feedback on my speaking.`
                  );
            } catch (error) {
                console.error('❌ Failed to send question instruction:', error);
                toast.error('Failed to send question. Please try again.');
            }
        } else {
            toast.warn('Please wait for connection to be established');
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            // Unmute and start listening
            setIsMuted(false);
            if (isConnected && geminiConnectionRef.current) {
            setTimeout(() => {
                    startAudioCapture();
            }, 100);
            } else {
                toast.warn('Please select a question first to start the conversation');
            }
        } else {
            // Mute and stop listening
            setIsMuted(true);
            setIsUserSpeaking(false);
            stopAudioCapture();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isCallActive) return null;

    const bounds = {
        top: -window.innerHeight + 80,
        bottom: 0
    };

    const renderMobileContent = () => (
        <>
            <div className={`ai_call_chat_content ${activeTab === 'chat' ? 'active' : ''}`}>
                <div className="ai_call_icon">
                    <div className={`logo-container ${audioPlaying ? 'ai-speaking' : ''}`}>
                        <img width={audioPlayed ? '0px' : '160px'} src={logo} alt="PTE sathy logo" />
                        {audioPlaying && (
                            <div className="ai-speaking-waves">
                                <div className="wave wave1"></div>
                                <div className="wave wave2"></div>
                                <div className="wave wave3"></div>
                            </div>
                        )}
                    </div>
                    {audioPlayed && !questionAsked && (
                        <div className="ai_call_chat_content_question">
                            <p>हजुरलाई speaking को कुन प्रश्न गाह्रो लाग्छ?</p>
                            <div className="ai_call_chat_content_question_answer">
                                <p onClick={() => handleQuestionSelect('Describe Image')}>Describe Image</p>
                                <p onClick={() => handleQuestionSelect('Read Aloud')}>Read Aloud</p>
                                <p onClick={() => handleQuestionSelect('Repeat Sentence')}>Repeat Sentence</p>
                                <p onClick={() => handleQuestionSelect('Retell Lecture')}>Retell Lecture</p>
                                <p onClick={() => handleQuestionSelect('Answer Short Question')}>Answer Short Question</p>
                            </div>
                        </div>
                    )}
                    {questionAsked && (
                        <div className="ai_call_chat">
                            {renderConversation()}
                        </div>
                    )}
                    <div className="ai_call_controls">
                        <div className="mic-container">
                            <button onClick={toggleMute} style={{backgroundColor: isMuted ? 'red' : (isListening ? '#4CAF50' : '#353434')}}>
                                <span>
                                    {isMuted ? (
                                        <svg height="30" viewBox="0 0 512 512" width="30" fill='white' xmlns="http://www.w3.org/2000/svg">
                                            <title/>
                                            <line style={{fill: '#fff', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}} x1="432" x2="96" y1="400" y2="64"/>
                                            <path d="M400,240V208.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,368,208v32a111.68,111.68,0,0,1-2.68,24.38,2,2,0,0,0,.53,1.84l22.59,22.59a2,2,0,0,0,3.29-.72A143.27,143.27,0,0,0,400,240Z"/>
                                            <path d="M256,352A112.36,112.36,0,0,1,144,240V208.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,112,208v32c0,74,56.1,135.12,128,143.11V432H192.45c-8.61,0-16,6.62-16.43,15.23A16,16,0,0,0,192,464H319.55c8.61,0,16-6.62,16.43-15.23A16,16,0,0,0,320,432H272V383.11a143.08,143.08,0,0,0,52-16.22,4,4,0,0,0,.91-6.35l-18.4-18.39a3,3,0,0,0-3.41-.58A111,111,0,0,1,256,352Z"/>
                                            <path d="M257.14,48a79.66,79.66,0,0,0-68.47,36.57,4,4,0,0,0,.54,5L332.59,233a2,2,0,0,0,3.41-1.42V128.91C336,85,301,48.6,257.14,48Z"/>
                                            <path d="M179.41,215a2,2,0,0,0-3.41,1.42V239a80.89,80.89,0,0,0,23.45,56.9,78.55,78.55,0,0,0,77.8,21.19,2,2,0,0,0,.86-3.35Z"/>
                                        </svg>
                                    ) : (
                                        <svg height="30" viewBox="0 0 512 512" width="30" xmlns="http://www.w3.org/2000/svg">
                                            <title>Microphone</title>
                                            <line style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}} x1="192" x2="320" y1="448" y2="448"/>
                                            <path d="M384,208v32c0,70.4-57.6,128-128,128h0c-70.4,0-128-57.6-128-128V208" style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}}/>
                                            <line style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}} x1="256" x2="256" y1="368" y2="448"/>
                                            <path d="M256,64a63.68,63.68,0,0,0-64,64V239c0,35.2,29,65,64,65s64-29,64-65V128C320,92,292,64,256,64Z" style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}}/>
                                        </svg>
                                    )}
                                </span>
                            </button>
                            {isUserSpeaking && (
                                <div className="user-speaking-indicator">
                                    <div className="sound-wave">
                                        <div className="sound-bar bar1"></div>
                                        <div className="sound-bar bar2"></div>
                                        <div className="sound-bar bar3"></div>
                                        <div className="sound-bar bar4"></div>
                                        <div className="sound-bar bar5"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleCallEnd} style={{backgroundColor: 'red'}}>
                            <svg height="30" viewBox="0 0 48 48" width="30" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0h48v48h-48z" fill="none"/>
                                <path fill='white' d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59l-4.95-4.95c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42 6.09-5.79 14.34-9.34 23.41-9.34s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21c-2.9-.93-5.99-1.43-9.2-1.43z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`ai_call_xp ${activeTab === 'xp' ? 'active' : ''}`}>
                <AiCallXp 
                    currentLevel={currentLevel} 
                    currentXP={currentXP} 
                    score={Math.round((scores.pronunciationScore + scores.oralFluencyScore + scores.vocabularyScore + scores.contentScore) / 4)} 
                    pronounciationScore={scores.pronunciationScore} 
                    oralFluencyScore={scores.oralFluencyScore} 
                    vocabularyScore={scores.vocabularyScore} 
                    contentScore={scores.contentScore}
                />
            </div>

            <div className={`ai_call_history ${activeTab === 'history' ? 'active' : ''}`}>
                <div className='ai_call_history_header'>
                    <p>Previous History</p>
                </div>
                <div className='ai_call_xp_container'>
                    <div className='ai_call_xp_bar'>
                        <h3>Your Speaking experience point</h3>
                        <h3>Level {currentLevel}</h3>
                        <div className="xp_bar_container">
                            <span>
                                <svg width='30px' height='30px'  viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg"><path fill='var(--orange)' d="M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z"/></svg>
                            </span>
                            <div style={{width: '100%'}}>
                                <p style={{fontSize: '13px'}}>
                                    {currentLevel < 10 ? `Earn ${10 - currentXP} XP to reach Level ${currentLevel + 1}` : 'Max Level Reached!'}
                                </p>
                                <div className="xp_bar">
                                    <div className="xp_bar_fill" style={{width: `${(currentXP/10) * 100}%`}}></div>
                                    <div className="xp_bar_score">{currentXP}/10</div>
                                </div>
                            </div>
                        </div>
                        <p>Level {currentLevel}/10 - {currentLevel < 10 ? 'Keep practicing to level up!' : 'Congratulations! You\'ve reached the maximum level!'}</p>
                    </div>
                    <div className="ai_call_score_bar">
                        <h3>Your 'AI' prediction score</h3>
                        <div className="score_bar_container">
                            <p>Pronunciation</p>
                            <div className="score_bar">
                                <div className="score_bar_fill" style={{width: `${scores.pronunciationScore}%`}}></div>
                            </div>
                        </div>
                        <div className="score_bar_container">
                            <p>Oral Fluency</p>
                            <div className="score_bar">
                                <div className="score_bar_fill" style={{width: `${scores.oralFluencyScore}%`}}></div>
                            </div>
                        </div>
                        <div className="score_bar_container">
                            <p>Vocabulary</p>
                            <div className="score_bar">
                                <div className="score_bar_fill" style={{width: `${scores.vocabularyScore}%`}}></div>
                            </div>
                        </div>
                        <div className="score_bar_container">
                            <p>Content</p>
                            <div className="score_bar">
                                <div className="score_bar_fill" style={{width: `${scores.contentScore}%`}}></div>
                            </div>
                        </div>
                        <div className="overall_score">
                            <p>{Math.round((scores.pronunciationScore + scores.oralFluencyScore + scores.vocabularyScore + scores.contentScore) / 4)}/100</p>
                        </div>
                    </div>
                    <div className="ai_call_pdf">
                        <p>Download your class notes</p>              
                        <a href='' download="Individual_Preparation_Plan.pdf" style={{display: 'flex', alignItems: 'center',}}>
                            <span>
                                <svg data-name="Layer 1" id="Layer_1" height='40' width='40' viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><defs><style>{`.cls-1{fill:#f44336;}.cls-2{fill:#ff8a80;}.cls-3{fill:#ffebee;}`}</style></defs><title/><path class="cls-1" d="M16.5,22h-9a3,3,0,0,1-3-3V5a3,3,0,0,1,3-3h6.59a1,1,0,0,1,.7.29l4.42,4.42a1,1,0,0,1,.29.7V19A3,3,0,0,1,16.5,22Z"/><path class="cls-2" d="M18.8,7.74H15.2a1.5,1.5,0,0,1-1.5-1.5V2.64a.55.55,0,0,1,.94-.39L19.19,6.8A.55.55,0,0,1,18.8,7.74Z"/><path class="cls-3" d="M7.89,19.13a.45.45,0,0,1-.51-.51V15.69a.45.45,0,0,1,.5-.51.45.45,0,0,1,.5.43.78.78,0,0,1,.35-.32,1.07,1.07,0,0,1,.51-.12,1.17,1.17,0,0,1,.64.18,1.2,1.2,0,0,1,.43.51,2,2,0,0,1,0,1.57A1.2,1.2,0,0,1,8.75,18a.86.86,0,0,1-.35-.3v.91a.5.5,0,0,1-.13.38A.52.52,0,0,1,7.89,19.13Zm1-1.76a.48.48,0,0,0,.38-.18.81.81,0,0,0,.14-.55.82.82,0,0,0-.14-.55.5.5,0,0,0-.38-.17.51.51,0,0,0-.39.17.89.89,0,0,0-.14.55.87.87,0,0,0,.14.55A.48.48,0,0,0,8.92,17.37Z"/><path class="cls-3" d="M12.17,18.11a1.1,1.1,0,0,1-.63-.17,1.22,1.22,0,0,1-.44-.51,2,2,0,0,1,0-1.57,1.22,1.22,0,0,1,.44-.51,1.11,1.11,0,0,1,.63-.18,1.06,1.06,0,0,1,.5.12.91.91,0,0,1,.35.28V14.48a.45.45,0,0,1,.51-.51.49.49,0,0,1,.37.13.5.5,0,0,1,.13.38v3.11a.5.5,0,0,1-1,.08.76.76,0,0,1-.34.32A1.14,1.14,0,0,1,12.17,18.11Zm.33-.74a.48.48,0,0,0,.38-.18.8.8,0,0,0,.15-.55.82.82,0,0,0-.15-.55.5.5,0,0,0-.38-.17.49.49,0,0,0-.38.17.82.82,0,0,0-.15.55.8.8,0,0,0,.15.55A.46.46,0,0,0,12.5,17.37Z"/><path class="cls-3" d="M15.52,18.1a.46.46,0,0,1-.51-.51V16h-.15a.34.34,0,0,1-.39-.38c0-.25.13-.37.39-.37H15a1.2,1.2,0,0,1,.34-.87,1.52,1.52,0,0,1,.92-.36h.17a.39.39,0,0,1,.29,0,.35.35,0,0,1,.15.17.55.55,0,0,1,0,.22.38.38,0,0,1-.09.19.27.27,0,0,1-.18.1h-.08a.66.66,0,0,0-.41.12.41.41,0,0,0-.11.31v.09h.32c.26,0,.39.12.39.37a.34.34,0,0,1-.39.38H16v1.6A.45.45,0,0,1,15.52,18.1Z"/></svg>
                            </span>
                            <span>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="25" 
                                    height="25" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    style={{ marginRight: '4px', verticalAlign: 'middle' }}
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg> 
                            </span> 
                        </a>
                    </div>
                </div>
            </div>
        </>
    );

    const renderMobileView = () => (
        <div className="ai_call_container">
            <audio 
                ref={audioRef}
                src={callAudio}
                onEnded={handleAudioEnd}
                onError={handleAudioEnd}
            />
            
            <div className="ai_call_nav">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <span className="minimize_icon" onClick={() => setActiveTab('chat')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="white"/>
                        </svg>
                    </span>
                    <span className="minimize_icon" onClick={() => dispatch(minimizeCall())}>
                        <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path fill="white" d="M14.567 8.02947L20.9105 1.76929L22.3153 3.19282L15.9916 9.43352L19.5614 9.44772L19.5534 11.4477L12.5535 11.4199L12.5813 4.41992L14.5813 4.42788L14.567 8.02947Z"/>
                            <path d="M7.97879 14.5429L4.40886 14.5457L4.40729 12.5457L11.4073 12.5402L11.4128 19.5402L9.41277 19.5417L9.40995 15.9402L3.09623 22.2306L1.68463 20.8138L7.97879 14.5429Z" fill="white"/>
                        </svg>
                    </span>
                </div>
                <div style={{ flex: '1', textAlign: 'center', color: 'white', marginRight: '48px'}}>
                    <p style={{fontSize:'20px',lineHeight:'1'}}>AI Call</p>
                    <p style={{fontSize:'13px',lineHeight:'1', color: isConnected ? '#4CAF50' : '#f44336', fontWeight:'500'}}>
                        {isConnected ? 'Connected to Gemini Live' : 'Connecting...'}
                    </p>
                </div>
            </div>

            <div className="ai_call_content">
                {renderMobileContent()}
            </div>

            <div className="ai_call_mobile_footer">
                <div className={`mobile_footer_tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                    <span>Chat</span>
                </div>
                <div className={`mobile_footer_tab ${activeTab === 'xp' ? 'active' : ''}`} onClick={() => setActiveTab('xp')}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.11-.9 2-2 2h-2v2h4v2H9v-4c0-1.11.9-2 2-2h2V9H9V7h4c1.1 0 2 .89 2 2v2z"/></svg>
                    <span>XP</span>
                </div>
                <div className={`mobile_footer_tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
                    <span>History</span>
                </div>
          </div>
        </div>
    );

    const renderDesktopView = () => (
      <div className="ai_call_container">
        <audio 
          ref={audioRef}
          src={callAudio}
          onEnded={handleAudioEnd}
          onError={handleAudioEnd}
        />
        
        <div className="ai_call_container_overlay"></div>
        <div className="ai_call_content container">          
          <div style={{width: '100%', height: '100%', position: 'relative'}}>
            <div className="ai_call_nav">
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span className="minimize_icon" onClick={() => dispatch(minimizeCall())}>
                                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="white" d="M14.567 8.02947L20.9105 1.76929L22.3153 3.19282L15.9916 9.43352L19.5614 9.44772L19.5534 11.4477L12.5535 11.4199L12.5813 4.41992L14.5813 4.42788L14.567 8.02947Z"/>
                                    <path d="M7.97879 14.5429L4.40886 14.5457L4.40729 12.5457L11.4073 12.5402L11.4128 19.5402L9.41277 19.5417L9.40995 15.9402L3.09623 22.2306L1.68463 20.8138L7.97879 14.5429Z" fill="white"/>
                                </svg>
                </span>
                            <span className="minimize_icon" onClick={historyToggle}>
                                <svg height="28" viewBox="0 0 48 48" width="28" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 0h48v48h-48z" fill="none"/>
                                    <path fill='white' d="M25.99 6c-9.95 0-17.99 8.06-17.99 18h-6l7.79 7.79.14.29 8.07-8.08h-6c0-7.73 6.27-14 14-14s14 6.27 14 14-6.27 14-14 14c-3.87 0-7.36-1.58-9.89-4.11l-2.83 2.83c3.25 3.26 7.74 5.28 12.71 5.28 9.95 0 18.01-8.06 18.01-18s-8.06-18-18.01-18zm-1.99 10v10l8.56 5.08 1.44-2.43-7-4.15v-8.5h-3z" opacity=".9"/>
                                </svg>
                </span>
              </div>
              <div style={{ flex: '1', textAlign: 'center', color: 'white'}}>
                <p style={{fontSize:'25px',lineHeight:'1'}}>AI Call</p>
                <p style={{fontSize:'15px',lineHeight:'1', color: isConnected ? '#4CAF50' : '#f44336', fontWeight:'500'}}>
                  {isConnected ? 'Connected to Gemini Live' : 'Connecting...'}
                </p>
              </div>
            </div>
            <div className="ai_call_chat_content">
                <div className="ai_call_icon">
                  <div className={`logo-container ${audioPlaying ? 'ai-speaking' : ''}`}>
                    <img width={audioPlayed ? '0px' : '200px'} src={logo} alt="PTE sathy logo" />
                    {audioPlaying && (
                      <div className="ai-speaking-waves">
                        <div className="wave wave1"></div>
                        <div className="wave wave2"></div>
                        <div className="wave wave3"></div>
                      </div>
                    )}
                  </div>
                  {audioPlayed && !questionAsked && (
                    <div className="ai_call_chat_content_question">
                      <p>हजुरलाई speaking को कुन प्रश्न गाह्रो लाग्छ?</p>
                      <div className="ai_call_chat_content_question_answer">
                        <p onClick={() => handleQuestionSelect('Describe Image')}>Describe Image</p>
                        <p onClick={() => handleQuestionSelect('Read Aloud')}>Read Aloud</p>
                        <p onClick={() => handleQuestionSelect('Repeat Sentence')}>Repeat Sentence</p>
                        <p onClick={() => handleQuestionSelect('Retell Lecture')}>Retell Lecture</p>
                        <p onClick={() => handleQuestionSelect('Answer Short Question')}>Answer Short Question</p>
                      </div>
                    </div>
                  )}
                  {questionAsked && (
                    <div className="ai_call_chat">
                      {renderConversation()}
                    </div>
                  )}
                </div>
            </div>
            <div className="ai_call_footer">
              <div className="mic-container">
                <button onClick={toggleMute} style={{backgroundColor: isMuted ? 'red' : (isListening ? '#4CAF50' : '#353434')}}>
                  <span>
                    {isMuted ? (
                        <svg height="30" viewBox="0 0 512 512" width="30" fill='white' xmlns="http://www.w3.org/2000/svg">
                            <title/>
                            <line style={{fill: '#fff', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}} x1="432" x2="96" y1="400" y2="64"/>
                            <path d="M400,240V208.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,368,208v32a111.68,111.68,0,0,1-2.68,24.38,2,2,0,0,0,.53,1.84l22.59,22.59a2,2,0,0,0,3.29-.72A143.27,143.27,0,0,0,400,240Z"/>
                            <path d="M256,352A112.36,112.36,0,0,1,144,240V208.45c0-8.61-6.62-16-15.23-16.43A16,16,0,0,0,112,208v32c0,74,56.1,135.12,128,143.11V432H192.45c-8.61,0-16,6.62-16.43,15.23A16,16,0,0,0,192,464H319.55c8.61,0,16-6.62,16.43-15.23A16,16,0,0,0,320,432H272V383.11a143.08,143.08,0,0,0,52-16.22,4,4,0,0,0,.91-6.35l-18.4-18.39a3,3,0,0,0-3.41-.58A111,111,0,0,1,256,352Z"/>
                            <path d="M257.14,48a79.66,79.66,0,0,0-68.47,36.57,4,4,0,0,0,.54,5L332.59,233a2,2,0,0,0,3.41-1.42V128.91C336,85,301,48.6,257.14,48Z"/>
                            <path d="M179.41,215a2,2,0,0,0-3.41,1.42V239a80.89,80.89,0,0,0,23.45,56.9,78.55,78.55,0,0,0,77.8,21.19,2,2,0,0,0,.86-3.35Z"/>
                        </svg>
                    ) : (
                      <svg height="30" viewBox="0 0 512 512" width="30" xmlns="http://www.w3.org/2000/svg">
                        <title>Microphone</title>
                            <line style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}} x1="192" x2="320" y1="448" y2="448"/>
                            <path d="M384,208v32c0,70.4-57.6,128-128,128h0c-70.4,0-128-57.6-128-128V208" style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}}/>
                            <line style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}} x1="256" x2="256" y1="368" y2="448"/>
                            <path d="M256,64a63.68,63.68,0,0,0-64,64V239c0,35.2,29,65,64,65s64-29,64-65V128C320,92,292,64,256,64Z" style={{fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '32px'}}/>
                      </svg>
                    )}
                  </span>              
                </button>
                
                {isUserSpeaking && (
                  <div className="user-speaking-indicator">
                    <div className="sound-wave">
                      <div className="sound-bar bar1"></div>
                      <div className="sound-bar bar2"></div>
                      <div className="sound-bar bar3"></div>
                      <div className="sound-bar bar4"></div>
                      <div className="sound-bar bar5"></div>
                    </div>
                  </div>
                )}
              </div>
              
              <button onClick={handleCallEnd} style={{backgroundColor: 'red'}}>
                            <svg height="30" viewBox="0 0 48 48" width="30" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 0h48v48h-48z" fill="none"/>
                                <path fill='white' d="M24 18c-3.21 0-6.3.5-9.2 1.44v6.21c0 .79-.46 1.47-1.12 1.8-1.95.98-3.74 2.23-5.33 3.7-.36.35-.85.57-1.4.57-.55 0-1.05-.22-1.41-.59l-4.95-4.95c-.37-.37-.59-.87-.59-1.42 0-.55.22-1.05.59-1.42 6.09-5.79 14.34-9.34 23.41-9.34s17.32 3.55 23.41 9.34c.37.36.59.87.59 1.42 0 .55-.22 1.05-.59 1.41l-4.95 4.95c-.36.36-.86.59-1.41.59-.54 0-1.04-.22-1.4-.57-1.59-1.47-3.38-2.72-5.33-3.7-.66-.33-1.12-1.01-1.12-1.8v-6.21c-2.9-.93-5.99-1.43-9.2-1.43z"/>
                            </svg>
              </button>
            </div>
          </div>  
          <AiCallXp currentLevel={currentLevel} currentXP={currentXP} score={Math.round((scores.pronunciationScore + scores.oralFluencyScore + scores.vocabularyScore + scores.contentScore) / 4)} pronounciationScore={scores.pronunciationScore} oralFluencyScore={scores.oralFluencyScore} vocabularyScore={scores.vocabularyScore} contentScore={scores.contentScore} />   
          <div className={`ai_call_history ${isHistory ? 'activeHistory' : ''}`}>
            <div className='ai_call_history_header'>
              <p>Previous History</p>
              <p onClick={historyToggle} className='close_history'>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                  <path d="M8.3,15.7C8.5,15.9,8.7,16,9,16s0.5-0.1,0.7-0.3l2.3-2.3l2.3,2.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12l2.3-2.3c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0L12,10.6L9.7,8.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l2.3,2.3l-2.3,2.3C7.9,14.7,7.9,15.3,8.3,15.7z"/>
                  <path d="M12,21c5,0,9-4,9-9s-4-9-9-9s-9,4-9,9S7,21,12,21z M12,5c3.9,0,7,3.1,7,7s-3.1,7-7,7s-7-3.1-7-7S8.1,5,12,5z"/>
                </svg>
              </p>
            </div>
            <HistoryAiCall callHistory={callHistory} />
          </div>
        </div>
      </div>
    );

    return isMinimized ? (
        <Draggable
            nodeRef={nodeRef}
            axis="y"
            bounds={bounds}
        >
            <div
                ref={nodeRef}
                className="fixed rounded-full cursor-grab shadow-xl z-50"
                style={{ 
                    transition: 'all 0.3s',
                    width: '60px',
                    height: '60px',
                    right: '20px',
                    bottom: '20px',
                }}
                onClick={() => dispatch(maximizeCall())}
            >
                <div>
                    <svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" height='60px' width='60px'>
                        <title/>
                        <g data-name="Layer 2" id="Layer_2">
                            <g data-name="Layer 2" id="Layer_2-2">
                                <path fill="var(--orange)" d="M48,0A48,48,0,1,0,96,48,48,48,0,0,0,48,0Zm2.71,25.64c10.69.33,19.93,10,19.8,20.37a4.15,4.15,0,0,0,.05.79c0,.85-.05,1.73-1.23,1.7-1.34,0-1.15-1.32-1.23-2.33V45.9c-1.43-11-6.55-16.21-17.71-17.9-.93-.11-2.33.05-2.3-1.13C48.22,25.09,49.86,25.78,50.71,25.64ZM65,45.49a.86.86,0,0,1-.85.88c-1.21.22-1.4-.49-1.48-1.29a5.23,5.23,0,0,0-.08-.93C61.41,37.46,59,35,52.14,33.48c-1-.22-2.58-.11-2.3-1.62s1.65-1,2.74-.85c6.85.85,12.48,6.69,12.45,13.13C65,44.53,65.05,45.08,65,45.49Zm-5.7-.88a1.31,1.31,0,0,1-.6.16,1.07,1.07,0,0,1-.93-.36,1.9,1.9,0,0,1-.33-.93,4.94,4.94,0,0,0-4.61-4.8c-.85-.14-1.7-.44-1.29-1.53.27-.77,1-.85,1.7-.85,3-.08,6.61,3.51,6.55,6.61A1.86,1.86,0,0,1,59.27,44.61Zm11.38,19.3c-1.18,3.24-5.24,6.55-8.72,6.5a12.59,12.59,0,0,1-2.33-.63C47.15,64.55,37.5,56.54,30.94,45.57a59,59,0,0,1-4-8c-2.11-5.07.08-9.35,5.43-11.13a4.53,4.53,0,0,1,2.82,0c2.3.85,8.06,8.61,8.17,10.94.08,1.78-1.12,2.74-2.36,3.54A3.77,3.77,0,0,0,39,44.39a6.35,6.35,0,0,0,.58,2.19,20.55,20.55,0,0,0,11,10.5c1.78.8,3.51.71,4.74-1.1,2.17-3.21,4.85-3,7.79-1.07,1.43,1,3,2,4.36,3.1C69.39,59.56,71.8,60.76,70.65,63.91Z"/>
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        </Draggable>
    ) : isMobile ? renderMobileView() : renderDesktopView();
};

export default AiCallComponent;