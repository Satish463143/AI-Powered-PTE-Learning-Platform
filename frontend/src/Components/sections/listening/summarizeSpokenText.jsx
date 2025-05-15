import React, { useEffect, useState, useRef } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import '../sectionCss/sectionCss.css';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setAudio } from '../../../reducer/audioReducer';
import defaultAudio from '../../../assets/audio/audio.mp3';
import SoundPlayer from './soundPlayer';

const SummarizeSpokenText = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [userAnswer, setUserAnswer] = useState('');
  const [audioSource, setAudioSource] = useState(defaultAudio);
  const textareaRef = useRef(null);
  
  // Initialize timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

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
      const textareaContent = textareaRef.current?.value || userAnswer;
      parentSubmit(textareaContent);
    }
  };
  
  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
        <p>You will hear a short report. Write a summary for a fellow student who was not present. You should write 20-30 words. You have 8 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.</p>
        <SoundPlayer audioFile={audioSource} />
        <textarea 
          rows={10}
          placeholder='Summarize the spoken text'
          ref={textareaRef}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
        />
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  )
}

export default SummarizeSpokenText;