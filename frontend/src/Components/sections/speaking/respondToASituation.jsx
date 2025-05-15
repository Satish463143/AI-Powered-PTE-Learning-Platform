import React, { useEffect, useState } from 'react'
import SoundPlayer from '../listening/soundPlayer';
import SpeakingTime from './speakingTime';
import { setAudio } from '../../../reducer/audioReducer';
import defaultAudio from '../../../assets/audio/audio.mp3';
import { useDispatch, useSelector } from 'react-redux';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';
import SpeakingMic, { audioRecordingRef } from './speakingMic';
import AnswersButton from '../../../Common/answersButton/answersButton';

// Constants for timer durations
const PREPARE_TIME = 20; // seconds
const SPEAKING_TIME = 40; // seconds


const respondToASituation = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [audioSource, setAudioSource] = useState(defaultAudio);

  const dummyData = {
    question:"You're leading a community book club, and during this month's meeting, you discover several books are missing from the club's library. You want to address the issue respectfully, reminding members to return books on time for everyone's benefit. What would you say to your members?"
  }

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

  // Set up audio source
  useEffect(() => {
    try {
      let audioToUse = defaultAudio;
      
      if (data) {
        if (typeof data === 'string') {
          audioToUse = data;
        } else if (data.audio) {
          audioToUse = data.audio;
        } else if (data.audioUrl) {
          audioToUse = data.audioUrl;
        }
      }
      
      setAudioSource(audioToUse);
      dispatch(setAudio(audioToUse));
    } catch (error) {
      console.error("Error setting audio:", error);
    }
  }, [data, dispatch]);

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
      <p>Listen to and read a description of a situation. You will have 20 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.</p>
      <div style={{margin:'30px 0'}}>
        
        <SoundPlayer audioFile={audioSource} />               
      </div>
      <div style={{ margin: '20px 0' }}  className='border-dotted border'>
        <p style={{padding:'10px'}}>{activeData.question}</p>
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

export default respondToASituation