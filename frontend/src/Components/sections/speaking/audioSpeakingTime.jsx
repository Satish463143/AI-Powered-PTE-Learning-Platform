import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { tickPrepareTime, tickStartTime, resetTimer, setStartTime } from '../../../reducer/speakingTimerReducer';
import { FaMicrophone, FaPlay } from 'react-icons/fa';

// Create a reference to store the latest audio recording
export const audioRecordingRef = {
  blob: null,
  url: null
};

const AudioSpeakingTime = ({ 
  isSubmitted, 
  showTimer = true, 
  audioFile,
  onAudioEnd
}) => {
  const dispatch = useDispatch();
  const { prepareTime, startTime, isPreparing, isStarted } = useSelector((state) => state.speakingTimer);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  // Format seconds as MM:SS
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Handle prep time countdown
  useEffect(() => {
    if (isSubmitted || !showTimer) return;

    let interval;
    if (isPreparing || isStarted) {
      interval = setInterval(() => {
        if (isPreparing) {
          dispatch(tickPrepareTime());
        } else if (isStarted) {
          dispatch(tickStartTime());
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPreparing, isStarted, dispatch, isSubmitted, showTimer]);

  // Auto-play audio when prep time ends
  useEffect(() => {
    if (!isPreparing && !audioPlaying && !audioFinished && audioRef.current && !isSubmitted) {
      audioRef.current.play().catch(err => {
        console.warn('Auto-play prevented:', err);
      });
      setAudioPlaying(true);
    }
  }, [isPreparing, audioPlaying, audioFinished, isSubmitted]);

  // Stop recording when time runs out
  useEffect(() => {
    if (isRecording && startTime <= 0) {
      stopRecording();
    }
  }, [startTime, isRecording]);

  // Reset timer and start countdown
  const resetAndStartTimer = () => {
    dispatch(resetTimer());
    dispatch(setStartTime(15));
    // Force the timer to start counting down
    dispatch({ type: 'speakingTimer/setPrepareTime', payload: 0 });
    dispatch({ type: 'speakingTimer/tickPrepareTime' });
  };

  // Recording functions
  const startRecording = async () => {
    if (isRecording || isSubmitted || !showTimer) return;
    
    try {
      // Reset and start timer
      resetAndStartTimer();

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        audioRecordingRef.blob = audioBlob;
        audioRecordingRef.url = url;
        setRecordedAudioUrl(url);
      };

      // Clear previous recording URL
      setRecordedAudioUrl(null);

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error('Mic access error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  };

  // Handle audio end
  const handleAudioEnd = async () => {
    setAudioPlaying(false);
    setAudioFinished(true);
    if (onAudioEnd) onAudioEnd();
    
    // Small delay to ensure audio has completely finished
    setTimeout(async () => {
      try {
        await startRecording();
      } catch (err) {
        console.error('Failed to start recording:', err);
      }
    }, 100);
  };

  // Handle mic click
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (audioFinished) {
      startRecording();
    }
  };

  // Add replay function
  const handleReplayAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setAudioPlaying(true);
      audioRef.current.play().catch(err => {
        console.warn('Auto-play prevented:', err);
      });
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
      dispatch(resetTimer());
    };
  }, []);

  if (!showTimer) return null;

  return (
    <div>
      {/* Audio Playing Box */}
      <div className="audio_playing_box">
        <div style={{display:'grid', gridTemplateColumns:'90% 10%', justifyContent:'space-between', width:'100%', gap:'8%'}}>
          <div>
            <div className="audio_header">
              <div className="audio_title_container">
                <p className="audio_title">Current Status</p>                  
              </div>
              {audioPlaying && audioRef.current && (
                <div className="audio_time">
                  {formatTime(audioRef.current.currentTime)} / {formatTime(audioRef.current.duration)}
                </div>
              )}
            </div>          
            <div className="audio_progress_container">
              <p className={`audio_status ${audioPlaying ? 'audio_status_playing' : ''}`}>
                {audioPlaying ? 'Playing Audio' : isPreparing ? `Preparation Time : ${prepareTime} seconds left` : 'Audio Complete'}
              </p>
              <div className="audio_progress_bg"></div>
              <div 
                className={`audio_progress_fill ${audioPlaying ? 'audio_progress_playing' : ''}`} 
                style={{
                  width: audioPlaying && audioRef.current ? 
                    `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%` : 
                    undefined
                }}
              ></div>
            </div>
          </div>
          
          {/* Volume Control */}
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

        {/* Replay Button */}
        {audioFinished && !audioPlaying && (
          <div style={{textAlign: 'center', marginTop: '10px'}}>
            <button 
              onClick={handleReplayAudio}
              className="primary-btn"
              style={{
                padding: '8px 15px',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FaPlay /> Play Audio Again
            </button>
          </div>
        )}
      </div>

      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={audioFile}
        onEnded={handleAudioEnd}
        style={{ display: 'none' }}
      />

      {/* Speaking Mic */}
      <div className='speakingMic' style={{margin: '30px 0'}}>
        <h2>{isRecording ? 'Recording... (Click to stop recording.) ' : 'Click to start recording'}</h2>
        <span 
          className={isRecording ? 'recordingMic' : ''} 
          onClick={handleMicClick}
          style={{cursor: 'pointer'}}
        >
          <FaMicrophone />
        </span>
        {isRecording && <p className='text-center'>Recording... {formatTime(startTime)}</p>}

        {/* Show recorded audio player when recording is stopped */}
        {recordedAudioUrl && !isRecording && (
          <div style={{marginTop: '20px', width: '100%'}}>
            <p className='text-center' style={{marginBottom: '10px'}}>Your Recording:</p>
            <audio controls src={recordedAudioUrl} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioSpeakingTime; 