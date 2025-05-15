import React, { useEffect } from 'react';
import SpeakingTime from './speakingTime';
import SpeakingMic, { audioRecordingRef } from './speakingMic';
import AnswersButton from '../../../Common/answersButton/answersButton';
import { useDispatch, useSelector } from 'react-redux';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';
import '../sectionCss/sectionCss.css';
import './readAloud.css';

// Constants for timer durations
const PREPARE_TIME = 40; // seconds
const SPEAKING_TIME = 40; // seconds

const ReadAloud = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  // Dummy data for demonstration
  const dummyData = {
    paragraph:
      "The free phone is the Samsung U740 handheld {{blank1}} device, which has MP3, {{blank2}}, text-message and instant-message {{blank3}}.",
  };

  // Use provided data or fallback to dummy data
  const activeData = data && data.paragraph ? data : dummyData;

  // Set timers on mount, only if the question is not submitted and should show timer
  useEffect(() => {
    if (showTimer && !isSubmitted) {
      // Initialize chat timer (needed for submit button to work)
      // We need this small timer for the submit button to work, but we don't display it
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
      
      parentSubmit(audioData);
    }
  };

  return (
    <div className={isSubmitted ? 'disabled_section' : ''}>
      <SpeakingTime isSubmitted={isSubmitted} showTimer={showTimer} />
      <p>Look at the text below. In 40 seconds, you must read this text aloud as naturally and clearly as possible. You have 40 seconds to read aloud.</p>
      
      <div style={{ margin: '20px 0' }}  className='border-dotted border'>
        <p style={{padding:'10px'}}>{activeData.paragraph}</p>
      </div>

      <SpeakingMic 
        isSubmitted={isSubmitted} 
        showTimer={showTimer} 
        speakingTime={SPEAKING_TIME}
      />

      <div className="read-aloud-answers-button">
        <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
      </div>
    </div>
  );
};

export default ReadAloud;
