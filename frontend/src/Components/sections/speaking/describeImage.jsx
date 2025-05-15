import React, { useState, useEffect } from 'react'
import defaultImage from '../../../assets/image/pen.png'
import SpeakingTime from './speakingTime'
import SpeakingMic, { audioRecordingRef } from './speakingMic'
import AnswersButton from '../../../Common/answersButton/answersButton'
import { useDispatch, useSelector } from 'react-redux';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';

// Constants for timer durations
const PREPARE_TIME = 25; // seconds
const SPEAKING_TIME = 40; // seconds

const describeImage = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  const activeData = data && data.image ? data : defaultImage;

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
  }

  return (
    <div className={isSubmitted ? 'disabled_section' : ''}>
      <SpeakingTime isSubmitted={isSubmitted} showTimer={showTimer} />
      <p>Look at the graph below. In 25 seconds, please speak into the microphone and describe in detail what the graph is showing. You will have 40 seconds to give your response.</p>
      <div className='describe-image-image' style={{margin:'20px 0',display:'flex',justifyContent:'center'}}>
        <img src={activeData} alt='describeImage' width='300px' height='auto'/>
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
  )
}

export default describeImage