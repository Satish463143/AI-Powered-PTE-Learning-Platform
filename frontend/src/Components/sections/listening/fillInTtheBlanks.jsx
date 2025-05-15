import React, { useEffect, useState } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import '../sectionCss/sectionCss.css';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setAudio } from '../../../reducer/audioReducer';
import defaultAudio from '../../../assets/audio/audio.mp3';
import SoundPlayer from './soundPlayer';

const fillInTtheBlanks = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [answers, setAnswers] = useState({});
  const [audioSource, setAudioSource] = useState(defaultAudio);

  // Dummy data for demonstration
  const dummyData = {
    paragraph: "The free phone is the Samsung U740 handheld {{blank1}} device, which has MP3, {{blank2}}, text-message and instant-message {{blank3}}."
  };

  // Use provided data or fallback to dummy data
  const activeData = data && data.paragraph ? data : dummyData;

  const handleChange = (blankKey, value) => {
    setAnswers(prev => ({
      ...prev,
      [blankKey]: value
    }));
  };
  
  // Initialize timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Render paragraph with blanks
  const renderParagraph = () => {
    const segments = [];
    const parts = activeData.paragraph.split(/(\{\{blank\d+\}\})/);
    
    parts.forEach((part, index) => {
      const blankMatch = part.match(/\{\{(blank\d+)\}\}/);
      if (blankMatch) {
        // This is a blank placeholder
        const blankKey = blankMatch[1];
        segments.push(
          <span key={`blank-${index}`} className="mx-1 inline-block">
            <input
              type="text"
              style={{border:'1px solid #000', padding:'5px', borderRadius:'5px', marginTop:'5px'}}
              value={answers[blankKey] || ''}
              onChange={(e) => handleChange(blankKey, e.target.value)}
              disabled={isSubmitted}
            />
          </span>
        );
      } else if (part.trim()) {
        // This is regular text
        segments.push(<span key={`text-${index}`}>{part}</span>);
      }
    });
    
    return segments;
  };

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
      parentSubmit(answers);
    }
  };
  
  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
        <p>You will hear a recording. Type the missing words in each blank.</p>
        <SoundPlayer audioFile={audioSource} />
        <div className="fill-blanks-paragraph">
          {renderParagraph()}
        </div>        
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  )
}

export default fillInTtheBlanks;