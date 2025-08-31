import React, { useState, useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import audio from '../../../assets/audio/audio-2.mp3'

// Dummy data for demonstration
const dummyData = {
    question: "According to the speaker, which one of the options below is right?",
    answers: ["Paris", "London", "Berlin", "Madrid"]
  };

  const AudioPlayingBox = ({ audioPlaying, prepTime, audioRef }) => {
    const [volume, setVolume] = useState(0.7); // Default volume at 70%
    
    // Update the audio volume when volume state changes
    useEffect(() => {
      if (audioRef && audioRef.current) {
        audioRef.current.volume = volume;
      }
    }, [volume, audioRef]);
    
    // Handle volume change
    const handleVolumeChange = (e) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
    };
  
    // Status text based on current state
    const getAudioStatus = () => {
        if (prepTime > 0) {
            return `Preparation Time : ${prepTime} seconds left`;
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
    const getProgressClass = () => {
        if (prepTime > 0) return 'audio_progress_waiting';
        if (audioPlaying) return 'audio_progress_playing';
        return 'audio_progress_complete';
    };
    
    // Get color based on current state
    const getStateColor = () => {
      if (prepTime > 0) return '#f39c12';
      if (audioPlaying) return '#3498db';
      return '#2ecc71';
    };
    
    return (
        <div className="audio_playing_box">
          <div style={{display:'grid', gridTemplateColumns:'90% 10%', justifyContent:'space-between', width:'100%', gap:'8%'}}>
            <div>
              <div className="audio_header">
                  <div className="audio_title_container">
                      <p className="audio_title">Current Status</p>                  
                  </div>
                  
                  {audioPlaying && (
                      <div className="audio_time">
                          {formatTime(audioPlaying.currentTime)} / {formatTime(audioPlaying.duration)}
                      </div>
                  )}
                  
              </div>          
              <div className="audio_progress_container">
                  <p className={`audio_status ${getStatusClass()}`}>
                        {getAudioStatus()}
                  </p>
                  <div className="audio_progress_bg"></div>
                  <div className={`audio_progress_fill ${getProgressClass()}`} style={{  width: audioPlaying ? `${audioPlaying.progress * 100}%` : undefined  }}></div>
              </div>
            </div>
             
            <div className="volume-control">
                <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#000"
                    strokeWidth="2"
                >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    {volume > 0.1 && (
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    )}
                    {volume > 0.5 && (
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    )}
                </svg>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={handleVolumeChange} 
                    style={{
                        width: '4px',
                        height: '80px',
                        appearance: 'slider-vertical',
                        writingMode: 'bt-lr',
                        marginTop: '5px'
                    }} 
                />
            </div>
          </div>
            
        </div>
    );
  };
  
  const AudioBox = ({ audioUrl, audioRef, onLoadedMetadata }) => (
    <div className="audio-box">
      <audio 
        src={audioUrl} 
        ref={audioRef}
        preload="auto"
        onLoadedMetadata={onLoadedMetadata}
        style={{ display: 'none' }}
      />
    </div>
  );

  const Question = ({ data, audioRef, audioPlaying, prepTime, onAudioLoad }) => {
    const questionData = data ? data : dummyData;
    const [selectedAnswers, setSelectedAnswer] = useState([]);

    const handleRadioChange = (answer) => {
        setSelectedAnswer(answer);
      };
 
    
    return (
      <div>
        <h2 className='font-bold'>
            You will hear a recording. Click on the paragraph that best relates to the recording.
        </h2>
        <AudioBox audioUrl={data ? data.audio : audio} audioRef={audioRef} onLoadedMetadata={onAudioLoad} />
        <AudioPlayingBox audioPlaying={audioPlaying} prepTime={prepTime} audioRef={audioRef} />
        <div className={`multiple_choice`} style={{margin:'30px 0'}}>
            <p style={{margin:'40px 0 0 0'}}>{questionData.question}</p>            
            {questionData.answers?.map((answer, idx) => (
                <div style={{marginTop:'10px '}}>
                    <label 
                        key={idx} 
                        className={`block mb-2 p-2 rounded ${selectedAnswers.includes(answer) ? 'bg-blue-100' : ''}`}
                    >
                    <input
                        type="checkbox"
                        value={answer}
                        checked={selectedAnswers.includes(answer)}
                        onChange={() => handleRadioChange(answer)}
                    />
                    <span style={{marginLeft:'10px'}}>{answer}</span>
                    </label>
                </div>
            ))}
        </div>        
      </div>
    );
  };

const MultipleChoiceSingle = ({ onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const totalQuestions = 1;
    const [prepTime, setPrepTime] = useState(7);
    const [audioPlaying, setAudioPlaying] = useState(null);
    const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
    const [audioLoaded, setAudioLoaded] = useState(false);

    const audioRef = useRef(null);
  
    // Handle audio loaded event
    const handleAudioLoad = () => {
      setAudioLoaded(true);
    };
    
    // Initialize audio event listeners
    useEffect(() => {
      if (audioRef.current) {
        const audio = audioRef.current;
        
        const handleCanPlay = () => {
          setAudioLoaded(true);
        };
        
        const handleError = (error) => {
          console.error('Audio loading error:', error);
          setAudioLoaded(false);
        };
              
        // Add event listeners
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
        
        // Cleanup
        return () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
        };
      }
    }, []);
    
    // Prep time countdown
    useEffect(() => {
      let timer;
      if (prepTime > 0) {
        timer = setTimeout(() => {
          setPrepTime(prev => prev - 1);
        }, 1000);
      } else if (prepTime === 0 && !hasPlayedAudio) {
        // Auto-play audio when prep time ends
        playAudioAfterPrepTime();
        setHasPlayedAudio(true);
      }
      
      return () => clearTimeout(timer);
    }, [prepTime, hasPlayedAudio]);
    
    // Function to play audio after prep time
    const playAudioAfterPrepTime = () => {    
      audioRef.current.play();    
    };
    
    // Track audio progress
    const updateAudioState = () => {
      if (!audioRef.current) return;
      
      const audio = audioRef.current;
      
      const updateProgress = () => {
        if (audio.duration) {
          setAudioPlaying({
            currentTime: audio.currentTime,
            duration: audio.duration,
            progress: audio.currentTime / audio.duration
          });
        }
      };
      
      const handleAudioEnd = () => {
        setAudioPlaying(null);
      };
      
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleAudioEnd);
      
      // Initial update
      updateProgress();
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleAudioEnd);
      };
    };

    useEffect(() => {
        if (hasPlayedAudio) {
          const cleanup = updateAudioState();
          return cleanup;
        }
      }, [hasPlayedAudio]);
      
    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, totalQuestions, updateProgress]);

    const handleNextQuestion = () => {  
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          
          setAudioPlaying(null);
          setPrepTime(7);
          setHasPlayedAudio(false);    
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
        if(hasPlayedAudio){
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
        }
      
  };
  return (
    <>
    <div className="speaking-wrapper container">
        <div className="mock-question-container">
            <div className="question">
                <Question 
                    key={`question-${questionIndex}`}
                    number={questionIndex + 1}
                    data={null} 
                    audioRef={audioRef}
                    audioPlaying={audioPlaying}
                    prepTime={prepTime}
                    onAudioLoad={handleAudioLoad}
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
  )
}

export default MultipleChoiceSingle