import React, { useEffect } from 'react';
import SpeakingTime from './speakingTime';
import SpeakingMic, { audioRecordingRef } from './speakingMic';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';
import './readAloud.css';
import Swal from 'sweetalert2';

// Constants for timer durations
const PREPARE_TIME = 40; // seconds
const SPEAKING_TIME = 40; // seconds

const ReadAloud = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  // Extract paragraph from data, handling different data structures
  const activeData = data?.question?.paragraph || data?.result?.question?.paragraph;

  useEffect(() => {
    if (!data) {
      console.error('No data provided to ReadAloud component');
      return;
    }
    if (!activeData) {
      console.error('No paragraph found in data:', data);
    }
  }, [data, activeData]);

  // Set timers on mount, only if the question is not submitted and should show timer
  useEffect(() => {
    if (showTimer && !isSubmitted) {
      // Initialize chat timer (needed for submit button to work)
      if (!isTimerInitialized && questionId) {
        dispatch(setTimer({ duration: 40, questionId })); 
      }

      // Set read aloud specific timers
      dispatch(setPrepareTime(PREPARE_TIME)); 
      dispatch(setStartTime(SPEAKING_TIME));
    } else {
      // Reset timer for submitted questions or inactive questions
      dispatch(resetTimer());
    }
    
    // Cleanup when component unmounts
    return () => {
      if (showTimer) {
        dispatch(resetTimer());
      }
    };
  }, [dispatch, isSubmitted, showTimer, questionId, isTimerInitialized]);

  const handleSubmit = () => {
    if (parentSubmit) {
      // Get the audio recording from the global reference
      const audioData = {
        audioBlob: audioRecordingRef.blob,
        audioUrl: audioRecordingRef.url,
        questionId
      };

      // Add the question data to the submission
      const submissionData = {
        answer: audioData,
        originalQuestion: {
          paragraph: activeData,
          section: data?.section || 'Speaking',
          questionType: data?.questionType || 'readAloud'
        }
      };
      
      parentSubmit(submissionData);
    }
  };

  const handleNext = () => {
    // Reset audio recording ref
    if (audioRecordingRef) {
      audioRecordingRef.blob = null;
      audioRecordingRef.url = null;
    }

    // Reset timers
    if (showTimer) {
      dispatch(resetTimer());
      dispatch(setPrepareTime(PREPARE_TIME));
    }

    if (parentNext) {
      parentNext();
    }
  };

  return (
    <div className={`read-aloud-container ${isSubmitted ? 'disabled_section' : ''}`}>
      <SpeakingTime isSubmitted={isSubmitted} showTimer={showTimer} />
      
      <div className="read-aloud-instructions">
        <p>Look at the text below. In {PREPARE_TIME} seconds, you must read this text aloud as naturally and clearly as possible. You have {SPEAKING_TIME} seconds to read aloud.</p>
      </div>
      
      <div className="read-aloud-text border-dotted border">
        {activeData ? (
          <p className="text-content" style={{padding:'10px'}}>{activeData}</p>
        ) : (
          <p className="error-text" style={{padding:'10px', color: 'red'}}>
            {data ? 'Error loading question text' : 'Loading question text...'}
          </p>
        )}
      </div>

      <SpeakingMic 
        isSubmitted={isSubmitted} 
        showTimer={showTimer} 
        speakingTime={SPEAKING_TIME}
      />

      {/* Score Display */}
      <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />

      <div className="read-aloud-answers-button">
        <AnswersButton 
          onSubmit={handleSubmit} 
          onNext={handleNext} 
          questionId={questionId}
          disabled={isSubmitted}
        />
      </div>
    </div>
  );
};

export default ReadAloud;
