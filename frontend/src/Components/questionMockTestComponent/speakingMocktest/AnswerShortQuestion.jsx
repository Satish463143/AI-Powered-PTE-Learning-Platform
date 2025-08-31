import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';
import audio from '../../../assets/audio/audio-2.mp3';

const RecordingBox = ({ prepTime, recordingTime, status }) => {
    const prepTimeInitial = 4;
    const recordingTimeInitial = 9;
    
    const calculateProgress = () => {
        if (prepTime > 0) {
            return `${((prepTimeInitial - prepTime) / prepTimeInitial) * 100}%`;
        } else if (recordingTime > 0) {
            return `${((recordingTimeInitial - recordingTime) / recordingTimeInitial) * 100}%`;
        } else {
            return '100%';
        }
    };
  
    return (
        <div className="recording_aboutMe">
            <p className="record-title">Recorded Answer</p>
            <h4 className="status-label">Current Status</h4>
            <h3 className={`status-text ${prepTime > 0 ? 'preparing' : status === "Playing Audio" ? 'audio-playing' : 'recording'}`}>
                {status}
            </h3>
            <div className="progress-bar-container">
                <div 
                    className={`progress-bar-fill ${prepTime > 0 ? 'preparing' : status === "Playing Audio" ? 'audio-playing' : 'recording'}`}
                    style={{ width: calculateProgress() }}
                ></div>
            </div>
            {recordingTime > 0 && prepTime === 0 && status !== "Playing Audio" && (
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

const Question = ({ data, prepTime, audioPlaying, recordingTime, status, audioRef }) => (
    <div>
        <h2 className='font-bold'>
            You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.
        </h2>
        <AudioBox audioUrl={data?.question?.audioUrl || audio} audioRef={audioRef} />
        <AudioPlayingBox audioPlaying={audioPlaying} prepTime={prepTime} />
        <RecordingBox 
            prepTime={prepTime}
            recordingTime={recordingTime} 
            status={status}
        />
    </div>
);

const AnswerShortQuestion = ({ data, onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [prepTime, setPrepTime] = useState(4);
    const [audioPlaying, setAudioPlaying] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState("Preparation Time: 4 seconds left");
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const totalQuestions = 6;
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);
    
    useEffect(() => {
        setPrepTime(4);
        setAudioPlaying(null);
        setRecordingTime(0);
        setHasStartedRecording(false);
        setHasPlayedAudio(false);
        setRecording(false);
        setStatus(`Preparation Time: 4 seconds left`);
    }, [questionIndex]);

    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, updateProgress]);

    useEffect(() => {
        let timer;
        
        if (prepTime > 0) {
            setStatus(`Preparation Time: ${prepTime} seconds left`);
            timer = setTimeout(() => {
                setPrepTime(prev => prev - 1);
            }, 1000);
        } else if (prepTime === 0 && !hasPlayedAudio) {
            // When prep time ends, play audio
            playAudio();
            setHasPlayedAudio(true);
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
    }, [prepTime, recordingTime, hasStartedRecording, hasPlayedAudio]);
    
    // Update status when audio state changes
    useEffect(() => {
        if (audioPlaying && prepTime === 0 && !hasStartedRecording) {
            setStatus("Playing Audio");
        }
    }, [audioPlaying, prepTime, hasStartedRecording]);
    
    const playAudio = () => {
        if (audioRef.current) {
            // Set up audio progress tracking
            const updateAudioProgress = () => {
                if (audioRef.current) {
                    const duration = audioRef.current.duration || 1;
                    const currentTime = audioRef.current.currentTime;
                    setAudioPlaying({
                        progress: currentTime / duration,
                        currentTime,
                        duration
                    });
                }
            };
            
            // Set up audio event listeners
            audioRef.current.addEventListener('timeupdate', updateAudioProgress);
            audioRef.current.addEventListener('ended', () => {
                setAudioPlaying(null);
                startRecording();
            });
            
            // Start playing
            audioRef.current.play().catch(error => {
                console.error("Audio playback failed:", error);
                // Fallback to recording if audio fails
                startRecording();
            });
            setAudioPlaying({ progress: 0, currentTime: 0, duration: audioRef.current.duration || 0 });
            setStatus("Playing Audio");
        }
    };

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
                new Blob(audioChunksRef.current, { type: 'audio/wav' });
            };
            
            mediaRecorder.start();
            setRecording(true);
            setHasStartedRecording(true);
            setRecordingTime(9);
        } catch (error) {
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
        if (recording) {
            stopRecording();
        }
        
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        
        setRecording(false);
        setHasStartedRecording(false);
        setAudioPlaying(null);
        
        if (questionIndex < totalQuestions - 1) {
            setQuestionIndex((prev) => prev + 1);
        } else {
            onNext();
        }
    };

    const handleNextButtonClick = () => {
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
            <div className="speaking-wrapper container">
                <h1 className="section-title">Speaking - Answer Short Question</h1>
                <div className="mock-question-container">
                    <div className="question">
                        <Question
                            data={data}
                            prepTime={prepTime} 
                            audioPlaying={audioPlaying}
                            recordingTime={recordingTime} 
                            status={status}
                            audioRef={audioRef}
                        />
                    </div>
                </div>
            </div>
            <div className='next_button'>
                <button onClick={handleNextButtonClick} className='primary-btn'>
                    Next
                </button>
            </div>
        </>
    );
};

export default AnswerShortQuestion; 