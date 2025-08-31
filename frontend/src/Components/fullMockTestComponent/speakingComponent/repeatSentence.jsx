import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

// Import all audio files from the RepeatSentence folder
const repeatSentenceAudios = import.meta.glob('../../../assets/audio/Speaking/repeat_sentence/*.mp3', { eager: true });

// Helper function to get audio by index
const getAudioByIndex = (index) => {
  const audios = Object.values(repeatSentenceAudios).map(module => module.default);
  return audios[index % audios.length];
};

// Helper function to get random audio
const getRandomAudio = () => {
  const audios = Object.values(repeatSentenceAudios).map(module => module.default);
  const randomIndex = Math.floor(Math.random() * audios.length);
  return audios[randomIndex];
};

// Create an array of audio URLs that we can use sequentially
const getAudioUrls = () => {
  return Object.values(repeatSentenceAudios).map(module => module.default);
};

// Function to initialize questions with local audio files
const initializeQuestions = (initialQuestions) => {
  const localAudioUrls = getAudioUrls();
  
  if (!initialQuestions || initialQuestions.length === 0) {
    // If no questions provided, create them with local audio files
    return localAudioUrls.map((audioUrl, index) => ({
      sentence: `Repeat Sentence Question ${index + 1}`,
      audioUrl: audioUrl // Local audio file
    }));
  } else {
    // If questions provided from backend, replace remote URLs with local audio files
    return initialQuestions.map((question, index) => {
      // Get the corresponding local audio file
      const localAudioUrl = localAudioUrls[index % localAudioUrls.length];
      
      return {
        ...question,
        audioUrl: localAudioUrl // Replace remote URL with local audio file
      };
    });
  }
};

const RecordingBox = ({ prepTime, recordingTime, status, audioPlaying }) => {
    const prepTimeInitial = 4;
    const recordingTimeInitial = 15;
    
    const calculateProgress = () => {
        if (prepTime > 0) {
            return `${((prepTimeInitial - prepTime) / prepTimeInitial) * 100}%`;
        } else if (audioPlaying) {
            return `${(audioPlaying.currentTime / audioPlaying.duration) * 100}%`;
        } else if (recordingTime > 0) {
            return `${((recordingTimeInitial - recordingTime) / recordingTimeInitial) * 100}%`;
        } else {
            return '100%';
        }
    };

    return (
        <div className="recording_aboutMe">
            <p className="record-title">Repeat Sentence</p>
            <h4 className="status-label">Current Status</h4>
            <h3 className={`status-text ${prepTime > 0 ? 'preparing' : audioPlaying ? 'playing' : 'recording'}`}>
                {status}
            </h3>
            <div className="progress-bar-container">
                <div 
                    className={`progress-bar-fill ${prepTime > 0 ? 'preparing' : audioPlaying ? 'playing' : 'recording'}`}
                    style={{ width: calculateProgress() }}
                />
            </div>
            {recordingTime > 0 && !audioPlaying && prepTime === 0 && (
                <div className="recording-indicator">
                    <div className="recording-dot"></div>
                    <span>Recording in progress</span>
                </div>
            )}
        </div>
    );
};

const AudioPlayingBox = ({ audioPlaying, prepTime }) => {
    // Status text based on current state
    const getAudioStatus = () => {
        if (prepTime > 0) {
            return 'Waiting for preparation';
        } else if (audioPlaying) {
            return 'Playing Audio';
        } else {
            return 'Audio Complete';
        }
    };
    
    // Format time display (if audio is playing)
    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' + secs : secs}`;
    };
    
    // Determine class names based on current state
    const getStatusClass = () => {
        if (prepTime > 0) return 'audio_status_waiting';
        if (audioPlaying) return 'audio_status_playing';
        return 'audio_status_complete';
    };
    
    const getIconClass = () => {
        if (prepTime > 0) return 'audio_icon_waiting';
        if (audioPlaying) return 'audio_icon_playing';
        return 'audio_icon_complete';
    };
    
    const getProgressClass = () => {
        if (prepTime > 0) return 'audio_progress_waiting';
        if (audioPlaying) return 'audio_progress_playing';
        return 'audio_progress_complete';
    };
    
    return (
        <div className="audio_playing_box">
            <div className="audio_header">
                <div className="audio_title_container">
                    <p className="audio_title">Audio Playback</p>
                    <p className={`audio_status ${getStatusClass()}`}>
                        {getAudioStatus()}
                    </p>
                </div>
                
                {audioPlaying && (
                    <div className="audio_time">
                        {formatTime(audioPlaying.currentTime)} / {formatTime(audioPlaying.duration)}
                    </div>
                )}
                
                <div className={`audio_icon_container ${getIconClass()}`}>
                    {audioPlaying ? (
                        <div className="wave_container">
                            {[1, 2, 3].map(i => (
                                <div 
                                    key={i} 
                                    className="wave_bar"
                                    style={{
                                        height: `${8 + (i % 3) * 6}px`,
                                        backgroundColor: prepTime > 0 ? '#f39c12' : audioPlaying ? '#3498db' : '#2ecc71',
                                        animation: `waveAnimation${i} 0.8s infinite ease-in-out`,
                                        animationDelay: `${i * 0.2}s`
                                    }} 
                                />
                            ))}
                        </div>
                    ) : prepTime > 0 ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="10" y1="12" x2="16" y2="12"></line>
                            <line x1="10" y1="8" x2="12" y2="8"></line>
                        </svg>
                    ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    )}
                </div>
            </div>
            
            <div className="audio_progress_container">
                <div className="audio_progress_bg"></div>
                <div 
                    className={`audio_progress_fill ${getProgressClass()}`}
                    style={{ 
                        width: audioPlaying ? `${audioPlaying.progress * 100}%` : undefined 
                    }}
                ></div>
            </div>
        </div>
    );
};
  
const AudioBox = ({ audioUrl, audioRef }) => (
  <div className="audio-box">
    <audio 
      src={audioUrl} 
      ref={audioRef}
      style={{ display: 'none' }}
    />
  </div>
);

const Question = ({ number, prepTime, recordingTime, status, audioPlaying }) => {
    return (
        <div>
            <h2 className='font-bold'>
                You will hear a sentence. Please repeat the sentence exactly as you hear it. You will have 15 seconds to repeat the sentence.
            </h2>
            <RecordingBox 
                prepTime={prepTime} 
                recordingTime={recordingTime} 
                status={status}
                audioPlaying={audioPlaying}
            />
        </div>
    );
};

const RepeatSentence = ({ onNext, updateProgress, questions: initialQuestions, isLoading = false, onSectionComplete }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);  // Start with empty array
    const [prepTime, setPrepTime] = useState(4);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [status, setStatus] = useState("Waiting for questions...");
    const [audioPlaying, setAudioPlaying] = useState(null);
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const [isAudioStarted, setIsAudioStarted] = useState(false);
    const [backendLoaded, setBackendLoaded] = useState(false);
    const totalQuestions = 11;

    const audioContextRef = useRef(null);
    const prepAudioSourceRef = useRef(null);
    const mainAudioSourceRef = useRef(null);
    const prepIntervalRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);

    const cleanupAudio = () => {
        try {
            // Clear the interval if it exists
            if (prepIntervalRef.current) {
                clearInterval(prepIntervalRef.current);
                prepIntervalRef.current = null;
            }

            // Disconnect sources if they exist
            if (prepAudioSourceRef.current) {
                try {
                    prepAudioSourceRef.current.disconnect();
                } catch (e) {
                    // Ignore disconnect errors
                }
                prepAudioSourceRef.current = null;
            }
            
            if (mainAudioSourceRef.current) {
                try {
                    mainAudioSourceRef.current.disconnect();
                } catch (e) {
                    // Ignore disconnect errors
                }
                mainAudioSourceRef.current = null;
            }

            // Close AudioContext if it exists and isn't closed
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                try {
                    audioContextRef.current.close();
                } catch (e) {
                    // Ignore close errors
                }
            }
            audioContextRef.current = null;
            
            // Reset audio state
            setIsAudioStarted(false);
        } catch (error) {
            console.warn("Cleanup warning (non-critical):", error);
        }
    };

    const startCombinedAudio = async () => {
        if (isAudioStarted) {
            console.warn("Audio already started, skipping...");
            return;
        }

        try {
            // Clean up any existing audio before starting
            cleanupAudio();

            // Create new AudioContext
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create and setup prep silence buffer
            const silentBuffer = audioContextRef.current.createBuffer(
                1, 
                audioContextRef.current.sampleRate * 4,
                audioContextRef.current.sampleRate
            );

            prepAudioSourceRef.current = audioContextRef.current.createBufferSource();
            prepAudioSourceRef.current.buffer = silentBuffer;

            // Use the local audio URL from questions array
            const audioUrl = questions[questionIndex].audioUrl;
            const mainAudioResponse = await fetch(audioUrl);
            const mainAudioArrayBuffer = await mainAudioResponse.arrayBuffer();
            const mainAudioBuffer = await audioContextRef.current.decodeAudioData(mainAudioArrayBuffer);

            mainAudioSourceRef.current = audioContextRef.current.createBufferSource();
            mainAudioSourceRef.current.buffer = mainAudioBuffer;

            // Connect audio nodes
            prepAudioSourceRef.current.connect(audioContextRef.current.destination);
            mainAudioSourceRef.current.connect(audioContextRef.current.destination);

            // Schedule audio playback
            const startTime = audioContextRef.current.currentTime;
            prepAudioSourceRef.current.start(startTime);
            mainAudioSourceRef.current.start(startTime + 4);
            setIsAudioStarted(true);

            // Setup prep time countdown
            let currentPrepTime = 4;
            if (prepIntervalRef.current) {
                clearInterval(prepIntervalRef.current);
            }
            
            prepIntervalRef.current = setInterval(() => {
                currentPrepTime--;
                setPrepTime(currentPrepTime);
                setStatus(`Preparation Time: ${currentPrepTime} seconds left`);
                
                if (currentPrepTime <= 0) {
                    clearInterval(prepIntervalRef.current);
                    prepIntervalRef.current = null;
                    setStatus("Playing Audio");
                    setAudioPlaying({ progress: 0, currentTime: 0, duration: mainAudioBuffer.duration });
                }
            }, 1000);

            // Setup main audio ended handler
            mainAudioSourceRef.current.onended = () => {
                setAudioPlaying(null);
                setHasPlayedAudio(true);
                startRecording();
            };

        } catch (error) {
            console.error("Audio setup failed:", error);
            cleanupAudio();
            Swal.fire({
                title: "Audio Error",
                text: "Failed to setup audio. Please refresh the page and try again.",
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    // Reset state when question changes
    useEffect(() => {
        setPrepTime(4);
        setAudioPlaying(null);
        setRecordingTime(0);
        setHasStartedRecording(false);
        setHasPlayedAudio(false);
        setRecording(false);
        setStatus("Get Ready");
        setIsAudioStarted(false);
    }, [questionIndex]);

    // Add cleanup effect when component unmounts or question changes
    useEffect(() => {
        return () => {
            cleanupAudio();
        };
    }, [questionIndex]);

    // Wait for backend data before starting
    useEffect(() => {
        if (initialQuestions && initialQuestions.length > 0) {
            // Map local audio files to backend questions
            const localAudioUrls = getAudioUrls();
            const questionsWithAudio = initialQuestions.map((question, index) => ({
                ...question,
                audioUrl: localAudioUrls[index % localAudioUrls.length]
            }));
            setQuestions(questionsWithAudio);
            setBackendLoaded(true);
            setStatus("Get Ready");
        }
    }, [initialQuestions]);

    // Don't allow starting until backend data is loaded
    useEffect(() => {
        if (!backendLoaded) {
            return;
        }
        const timer = setTimeout(() => {
            startCombinedAudio();
        }, 100);
        return () => clearTimeout(timer);
    }, [questionIndex, backendLoaded]);

    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, updateProgress]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                // Here you can handle the recorded audio blob
                // For example, you could upload it to your server
                console.log('Recording stopped, blob created:', audioBlob);
            };
            
            mediaRecorder.start();
            setRecording(true);
            setHasStartedRecording(true);
            setRecordingTime(15); // 15 seconds for repeat sentence
        } catch (error) {
            console.error("Recording error:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to start recording. Please check your microphone permissions.",
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
        }
    };

    useEffect(() => {
        let timer;
        
        if (prepTime > 0) {
            setStatus(`Preparation Time: ${prepTime} seconds left`);
            timer = setTimeout(() => {
                setPrepTime(prev => prev - 1);
            }, 1000);
        } else if (recordingTime > 0) {
            setStatus(`Recording Now: ${recordingTime} seconds left`);
            timer = setTimeout(() => {
                setRecordingTime(prev => prev - 1);
            }, 1000);
        } else if (recordingTime === 0 && hasStartedRecording) {
            setStatus("Recording Completed");
            stopRecording();
            setTimeout(() => {
                showTimeUpAlert();
            }, 500);
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [prepTime, recordingTime, hasStartedRecording]);

    const showTimeUpAlert = () => {
        Swal.fire({
            title: "Time's Up",
            text: `Please click "Next" to go to next question`,
            icon: 'warning',
            confirmButtonText: 'Next',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                handleNextQuestion();
            }
        });
    };
    const handleNextQuestion = () => {
        if (!backendLoaded) {
            Swal.fire({
                title: "Please wait",
                text: "Still waiting for questions to be generated...",
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });
            return;
        }

        if (recording) {
            stopRecording();
        }
        
        cleanupAudio();
        
        setRecording(false);
        setHasStartedRecording(false);
        setAudioPlaying(null);
        
        if (questionIndex < totalQuestions - 1) {
            setQuestionIndex((prev) => prev + 1);
        } else {
            if (onSectionComplete) {
                onSectionComplete();
            }
            onNext();
        }
    };
    const handleNextButtonClick = () => {
        if (!backendLoaded) {
            Swal.fire({
                title: "Please wait",
                text: "Still waiting for questions to be generated...",
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });
            return;
        }

        if (prepTime > 0) {
            Swal.fire({
                title: "Wait!",
                text: "Please complete your preparation time before proceeding to the next question.",
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        if (audioPlaying) {
            Swal.fire({
                title: "Wait!",
                text: "Please wait for the audio to finish playing before proceeding.",
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        if (hasStartedRecording) {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to proceed to the next question?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.isConfirmed) {
                    handleNextQuestion();
                }
            });
        } else {
            handleNextQuestion();
        }
    };

  return (
    <>
        <div className="speaking-component">
            {(!backendLoaded || isLoading) ? (
                <div className="loading-container">
                    <h2>Generating questions...</h2>
                    <div className="loading-spinner"></div>
                    <p>Please wait while we prepare your questions</p>
                </div>
            ) : (
                <>
            <Question 
                number={questionIndex + 1}
                prepTime={prepTime}
                recordingTime={recordingTime}
                status={status}
                audioPlaying={audioPlaying}
            />
            <div className="button-container">
                <button 
                    className="next-button"
                    onClick={handleNextButtonClick}
                    disabled={!hasPlayedAudio && !hasStartedRecording}
                >
                    {questionIndex < totalQuestions - 1 ? 'Next' : 'Finish'}
                </button>
            </div>
                </>
            )}
        </div>
    </>
  );
}

export default RepeatSentence;