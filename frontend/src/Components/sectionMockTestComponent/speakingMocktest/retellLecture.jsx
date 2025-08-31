import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import audio from '../../../assets/audio/audio-2.mp3';

const RecordingBox = ({ prepTime, recordingTime, status }) => {
    const prepTimeInitial = 10;
    const recordingTimeInitial = 40;
    
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

const AudioPlayingBox = ({ audioPlaying, isLoading }) => {
    // Status text based on current state
    const getAudioStatus = () => {
        if (isLoading) {
            return 'Loading Audio';
        } else if (audioPlaying) {
            return 'Playing Audio';
        } else {
            return 'Audio Completed';
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
        if (isLoading) return 'audio_status_waiting';
        if (audioPlaying) return 'audio_status_playing';
        return 'audio_status_complete';
    };
    
    const getIconClass = () => {
        if (isLoading) return 'audio_icon_waiting';
        if (audioPlaying) return 'audio_icon_playing';
        return 'audio_icon_complete';
    };
    
    const getProgressClass = () => {
        if (isLoading) return 'audio_progress_waiting';
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
                    {isLoading ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f39c12" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="10" y1="12" x2="16" y2="12"></line>
                            <line x1="10" y1="8" x2="12" y2="8"></line>
                        </svg>
                    ) : audioPlaying ? (
                        <div className="wave_container">
                            {[1, 2, 3].map(i => (
                                <div 
                                    key={i} 
                                    className="wave_bar"
                                    style={{
                                        height: `${8 + (i % 3) * 6}px`,
                                        backgroundColor: audioPlaying ? '#3498db' : '#2ecc71',
                                        animation: `waveAnimation${i} 0.8s infinite ease-in-out`,
                                        animationDelay: `${i * 0.2}s`
                                    }} 
                                />
                            ))}
                        </div>
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
                        width: isLoading ? '0%' : audioPlaying ? `${audioPlaying.progress * 100}%` : '100%' 
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

const Question = ({ data, prepTime, audioPlaying, recordingTime, status, audioRef, isLoading }) => (
    <div>
      <h2 className='font-bold'>
        You will hear a lecture. After listening to the lecture, in 10 seconds, please speak into the microphone and retell what you have just heard from the lecture in your own words. You will have 40 seconds to give your response.
      </h2>
      <AudioBox audioUrl={audio} audioRef={audioRef} />
      <AudioPlayingBox audioPlaying={audioPlaying} isLoading={isLoading} />
      <RecordingBox 
        prepTime={prepTime}
        recordingTime={recordingTime} 
        status={status}
      />
    </div>
  );

const RetellLecture = ({ onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [prepTime, setPrepTime] = useState(0);
    const [audioPlaying, setAudioPlaying] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState("Loading Audio");
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [audioEnded, setAudioEnded] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const totalQuestions = 1; 
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioRef = useRef(null);
    
    useEffect(() => {
        setPrepTime(0);
        setAudioPlaying(null);
        setRecordingTime(0);
        setHasStartedRecording(false);
        setAudioEnded(false);
        setAudioStarted(false);
        setRecording(false);
        setStatus(`Loading Audio`);
        setIsLoading(true);
        
        // Start playing audio after a short delay when component mounts or question changes
        const timer = setTimeout(() => {
            if (!audioStarted) {
                playAudio();
                setAudioStarted(true);
                setIsLoading(false);
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [questionIndex]);
    
    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, updateProgress]);

    useEffect(() => {
        let timer;
        
        if (audioEnded && prepTime > 0) {
            // After audio ends, preparation time starts
            setStatus(`Preparation Time: ${prepTime} seconds left`);
            timer = setTimeout(() => {
                setPrepTime(prev => prev - 1);
            }, 1000);
        } else if (audioEnded && prepTime === 0 && !hasStartedRecording) {
            // When prep time ends, start recording
            startRecording();
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
    }, [audioEnded, prepTime, recordingTime, hasStartedRecording]);
    
    // Update status when audio state changes
    useEffect(() => {
        if (audioPlaying && !audioEnded) {
            setStatus("Playing Audio");
        }
    }, [audioPlaying, audioEnded]);
    
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
                setAudioEnded(true);
                setPrepTime(10); // Start 10 seconds preparation time after audio ends
            });
            
            // Start playing
            audioRef.current.play().catch(error => {
                console.error("Audio playback failed:", error);
                // Fallback if audio fails - go to prep time
                setAudioEnded(true);
                setPrepTime(10);
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
            setRecordingTime(40); // Set to 40 seconds for recording time
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
        if (audioPlaying) {
            Swal.fire({
                title: "Wait!",
                text: "Please wait for the audio to finish playing before proceeding.",
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        if (audioEnded && prepTime > 0) {
            Swal.fire({
                title: "Wait!",
                text: "Please complete your preparation time before proceeding to the next question.",
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
            <h1 className="section-title">Speaking - Read Aloud</h1>
            <div className="mock-question-container">
                <div className="question">
                    <Question 
                        number={questionIndex + 1}
                        data={null} 
                        prepTime={prepTime} 
                        recordingTime={recordingTime} 
                        status={status}
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
}

export default RetellLecture