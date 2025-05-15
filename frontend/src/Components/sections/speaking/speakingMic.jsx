import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaMicrophone, FaPause, FaRedo } from 'react-icons/fa';
import { setStartTime, pauseTimer, resetTimer } from '../../../reducer/speakingTimerReducer';

// Create a global reference to store the latest audio recording
export const audioRecordingRef = {
  blob: null,
  url: null
};

// Default speaking time in seconds (fallback value)
const DEFAULT_SPEAKING_TIME = 20;

const SpeakingMic = ({ isSubmitted, showTimer = true, speakingTime }) => {
  const dispatch = useDispatch();
  const { isPreparing, isStarted, startTime } = useSelector((state) => state.speakingTimer);

  // Get the speaking time from props or use the default
  const currentSpeakingTime = speakingTime || DEFAULT_SPEAKING_TIME;

  const [status, setStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isTimerOver, setIsTimerOver] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);

  // Update status and control recording
  useEffect(() => {
    // Don't run recording if the question is submitted or shouldn't show timer
    if (isSubmitted || !showTimer) {
      setStatus('Done!');
      if (isRecording) {
        stopRecording();
      }
      return;
    }
    
    if (isPreparing) {
      setStatus('Prepare time... (Click mic to start speaking now)');
      setIsTimerOver(false);
    } else if (isStarted) {
      if (!isRecording && !isPaused) {
        setStatus('Speak now – Recording...');
        startRecording();
        setIsTimerOver(false);
      } else if (isPaused) {
        setStatus('Recording paused');
      } else {
        setStatus('Speak now – Recording...');
      }
    } else if (!isPreparing && !isStarted) {
      if (isRecording) {
        stopRecording();
      }
      setStatus('Done! Try again');
      setIsTimerOver(true);
    }
  }, [isPreparing, isStarted, isSubmitted, showTimer, isRecording, isPaused]);

  // Start audio recording
  const startRecording = async () => {
    if (isRecording || isSubmitted || !showTimer) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunks.current = []; // Clear previous chunks when starting new recording

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        
        // Update the global reference
        audioRecordingRef.blob = audioBlob;
        audioRecordingRef.url = URL.createObjectURL(audioBlob);
        
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      // Set a timeslice to get frequent data chunks (every 250ms)
      // This ensures we have data available when pausing
      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('Mic access denied');
    }
  };

  // Stop recording and cleanup
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    setIsPaused(false);
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      // Request data from the recorder before pausing
      mediaRecorderRef.current.requestData();
      
      // Add a small delay to ensure data is available
      setTimeout(() => {
        // Pause the recording
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        // Create audio URL from current chunks for preview
        if (recordedChunks.current.length > 0) {
          const audioBlob = new Blob(recordedChunks.current, { type: 'audio/webm' });
          const tempUrl = URL.createObjectURL(audioBlob);
          
          // Store in both local state and global ref
          setAudioUrl(tempUrl);
          audioRecordingRef.blob = audioBlob;
          audioRecordingRef.url = tempUrl;
          
          console.log('Audio preview created:', tempUrl);
        } else {
          console.warn('No audio chunks available for preview');
        }
        
        // Pause the speaking timer
        dispatch(pauseTimer());
      }, 100);
    }
  };

  // Submit current recording
  const submitRecording = () => {
    stopRecording();
    // Additional submission logic can be added here
  };

  // Start a new recording (discard current paused recording)
  const startNewRecording = () => {
    // Stop and cleanup current recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    
    // Reset states
    setIsRecording(false);
    setIsPaused(false);
    setAudioUrl(null);
    
    // Reset timer to start from 0
    dispatch(resetTimer());
    
    // Start a fresh recording and set timer to start value
    setTimeout(() => {
      // Use the speaking time from props
      dispatch(setStartTime(currentSpeakingTime));
      
      // Force the isStarted state so the timer shows and counts down
      dispatch({ 
        type: 'speakingTimer/tickPrepareTime'
      });
      
      startRecording();
    }, 100);
  };

  // Handle retrying after timer is over
  const handleRetry = () => {
    // Reset states
    setIsTimerOver(false);
    setIsPaused(false);
    
    // Reset and restart the timer
    dispatch(resetTimer());
    
    setTimeout(() => {
      // Use the speaking time from props
      dispatch(setStartTime(currentSpeakingTime));
      
      // Force the isStarted state so the timer shows and counts down
      dispatch({ 
        type: 'speakingTimer/tickPrepareTime'
      });
      
      startRecording();
    }, 100);
  };

  // Handle manual start of recording when clicking the microphone
  const handleMicClick = () => {
    if (isTimerOver) {
      // If timer is over, treat as retry
      handleRetry();
    } else if (isPreparing) {
      // Manually end prepare time and start speaking time
      dispatch({ 
        type: 'speakingTimer/setPrepareTime', 
        payload: 0 
      });
      
      // Set the speaking time using the value from props
      dispatch(setStartTime(currentSpeakingTime));
      
      // Force the isStarted state
      dispatch({ 
        type: 'speakingTimer/tickPrepareTime'
      });
    } else if (isRecording && !isPaused) {
      // If recording, pause it
      pauseRecording();
    } else if (isPaused) {
      // If paused, start a new recording (discarding the paused one)
      startNewRecording();
    } else if (!isRecording && isStarted) {
      startRecording();
    }
  };

  // Don't render anything if we shouldn't show the microphone
  if (!showTimer) return null;

  return (
    <div className='speakingMic'>
      <h2>{status}</h2>

      <span 
        className={`${isRecording && !isPaused && !isSubmitted ? 'recordingMic' : ''}`} 
        onClick={handleMicClick}
      >
        {isTimerOver ? 
          <FaRedo /> : 
          (isRecording && !isPaused ? <FaPause /> : <FaMicrophone />)
        }
      </span>
      
      {isRecording && !isPaused && (
        <p className='text-center'>
          You are currently speaking <br />
          (पजमा थिच्नुहोस्, रेकरेर्डिङ् सकिएपछि )
        </p>
      )}

      {isPaused && (
        <div className="paused-controls" style={{ marginTop: 15, textAlign: 'center' }}>
          <p>Recording paused</p>
          <p>Click the microphone to restart recording</p>
          {audioUrl && (
            <div style={{ marginTop: 10 }}>
              <h3 className='text-center'>Preview of recorded audio:</h3>
              <div style={{ margin: '10px auto', maxWidth: '300px' }}>
                <audio controls src={audioUrl} style={{ width: '100%' }}></audio>
              </div>
            </div>
          )}
        </div>
      )}

      {isTimerOver && audioUrl && !isRecording && !isPaused && (
        <div style={{ marginTop: 15, textAlign: 'center' }}>
          <p>Click the redo icon above to record again</p>
          <div style={{ marginTop: 10 }}>
            <h3 className='text-center'>Your recording:</h3>
            <div style={{ margin: '10px auto', maxWidth: '300px' }}>
              <audio controls src={audioUrl} style={{ width: '100%' }}></audio>
            </div>
          </div>
        </div>
      )}

      {audioUrl && !isRecording && !isPaused && !isTimerOver && (
        <div style={{ marginTop: 20 }}>
          <h3 className='text-center'>Playback:</h3>
          <audio controls src={audioUrl}></audio>
        </div>
      )}
    </div>
  );
};

export default SpeakingMic;
