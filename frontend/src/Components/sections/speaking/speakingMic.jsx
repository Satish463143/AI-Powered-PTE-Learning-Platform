import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaMicrophone, FaPause, FaRedo } from 'react-icons/fa';
import { setStartTime, pauseTimer, resetTimer } from '../../../reducer/speakingTimerReducer';

// Create a global reference to store the latest audio recording
export const audioRecordingRef = {
  blob: null,
  url: null
};

const DEFAULT_SPEAKING_TIME = 20;

// Setup speech recognition (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

const SpeakingMic = ({ isSubmitted, showTimer = true, speakingTime, readyToRecord = true }) => {
  const dispatch = useDispatch();
  const { isPreparing, isStarted } = useSelector((state) => state.speakingTimer);

  const currentSpeakingTime = speakingTime || DEFAULT_SPEAKING_TIME;

  const [status, setStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isTimerOver, setIsTimerOver] = useState(false);
  const [transcript, setTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!SpeechRecognition || recognitionRef.current) return;

    recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const speechResult = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(speechResult);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setStatus('Microphone access denied');
      }
    };
  };

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
      stopRecording();
    };
  }, []);

  const startRecognition = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.warn('Speech recognition already started');
    }
  };

  const stopRecognition = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Speech recognition already stopped');
    }
  };

  useEffect(() => {
    if (isSubmitted || !showTimer) {
      setStatus('Done!');
      if (isRecording) stopRecording();
      return;
    }

    if (!readyToRecord) {
      setStatus('Please wait for audio to finish...');
      setIsTimerOver(false);
      return;
    }

    if (isPreparing) {
      setStatus('Prepare time... (Click mic to start speaking)');
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
    } else {
      if (isRecording) stopRecording();
      setStatus('Done! Try again');
      setIsTimerOver(true);
    }
  }, [isPreparing, isStarted, isSubmitted, showTimer, isRecording, isPaused, readyToRecord]);

  const startRecording = async () => {
    if (isRecording || isSubmitted || !showTimer) return;
    
    try {
      // Stop any existing recording first
      stopRecording();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100,
          sampleSize: 16
        } 
      });
      
      // Set audio context options for echo prevention
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();
      
      // Create and configure audio nodes
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 0.8; // Reduce volume slightly
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(destination);
      
      // Use the processed stream for recording
      const processedStream = destination.stream;
      streamRef.current = processedStream;

      const mediaRecorder = new MediaRecorder(processedStream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks.current, { 
          type: 'audio/webm;codecs=opus'
        });
        const url = URL.createObjectURL(audioBlob);
        audioRecordingRef.blob = audioBlob;
        audioRecordingRef.url = url;
        setAudioUrl(url);
        
        // Cleanup audio context
        audioContext.close();
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setIsPaused(false);
      setTranscript('');
      startRecognition();
    } catch (err) {
      console.error('Mic access error:', err);
      setStatus('Mic access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    stopRecognition();
    setIsRecording(false);
    setIsPaused(false);
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

    mediaRecorderRef.current.requestData();
    setTimeout(() => {
      mediaRecorderRef.current?.pause();
      setIsPaused(true);
      dispatch(pauseTimer());

      if (recordedChunks.current.length > 0) {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        const tempUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(tempUrl);
        audioRecordingRef.blob = audioBlob;
        audioRecordingRef.url = tempUrl;
      }
      stopRecognition();
    }, 100);
  };

  const startNewRecording = () => {
    stopRecording();
    setAudioUrl(null);
    dispatch(resetTimer());
    setTimeout(() => {
      dispatch(setStartTime(currentSpeakingTime));
      dispatch({ type: 'speakingTimer/tickPrepareTime' });
      startRecording();
    }, 100);
  };

  const handleRetry = () => {
    setIsTimerOver(false);
    setIsPaused(false);
    dispatch(resetTimer());
    setTimeout(() => {
      dispatch(setStartTime(currentSpeakingTime));
      dispatch({ type: 'speakingTimer/tickPrepareTime' });
      startRecording();
    }, 100);
  };

  const handleMicClick = () => {
    if (!readyToRecord) return; // Don't allow recording if not ready
    if (isTimerOver) return handleRetry();
    if (isPreparing) {
      dispatch({ type: 'speakingTimer/setPrepareTime', payload: 0 });
      dispatch(setStartTime(currentSpeakingTime));
      dispatch({ type: 'speakingTimer/tickPrepareTime' });
    } else if (isRecording && !isPaused) {
      pauseRecording();
    } else if (isPaused) {
      startNewRecording();
    } else if (!isRecording && isStarted) {
      startRecording();
    }
  };

  // Add audio playback with echo prevention
  const renderAudioPlayer = (url) => {
    if (!url) return null;
    
    return (
      <audio 
        controls 
        className="mt-2 w-full"
        onPlay={(e) => {
          // Reduce volume during playback to prevent echo
          e.target.volume = 0.5;
        }}
      >
        <source src={url} type="audio/webm;codecs=opus" />
        Your browser does not support the audio element.
      </audio>
    );
  };

  if (!showTimer) return null;

  return (
    <div className='speakingMic'>
      <h2>{status}</h2>
      <span
        className={`${isRecording && !isPaused && !isSubmitted ? 'recordingMic' : ''} ${!readyToRecord ? 'disabled-mic' : ''}`}
        onClick={handleMicClick}
        style={{ opacity: readyToRecord ? 1 : 0.5, cursor: readyToRecord ? 'pointer' : 'not-allowed' }}
      >
        {isTimerOver ? <FaRedo /> : isRecording && !isPaused ? <FaPause /> : <FaMicrophone />}
      </span>

      {isRecording && !isPaused && <p className='text-center'>Recording... Click to pause.</p>}

      {isPaused && (
        <p className='text-center'>
          Recording paused. Click mic to start a new recording.
          {audioUrl && renderAudioPlayer(audioUrl)}
        </p>
      )}

    </div>
  );
};

export default SpeakingMic;
