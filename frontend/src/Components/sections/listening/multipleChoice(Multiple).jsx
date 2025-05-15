import React, { useEffect, useState, useRef } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import '../sectionCss/sectionCss.css';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setAudio } from '../../../reducer/audioReducer';
import defaultAudio from '../../../assets/audio/audio.mp3';
import SoundPlayer from './soundPlayer';

const multipleChoice = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [audioSource, setAudioSource] = useState(defaultAudio);

  // Dummy data for demonstration
  const dummyData = {
    question: "According to the speaker, which of the options below are right?",
    answers: ["Paris", "London", "Berlin", "Madrid"]
  };

  // Use provided data or fallback to dummy data
  const questionData = data.answers ? data : dummyData;

  const handleCheckboxChange = (answer) => {
    setSelectedAnswers(prev =>
      prev.includes(answer)
        ? prev.filter(item => item !== answer)
        : [...prev, answer]
    );
  };
  
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
      parentSubmit(selectedAnswers);
    }
  };
  
  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
        <p>Listen to the recording and answer the question by selecting all the correct responses. You will need to select more than one response.</p>
        <SoundPlayer audioFile={audioSource} />
        <p>{questionData.question}</p>
        <div className='answers'>
          {questionData.answers?.map((answer, idx) => (
            <label key={idx} className="block mb-2">
              <input
                type="checkbox"
                value={answer}
                checked={selectedAnswers.includes(answer)}
                onChange={() => handleCheckboxChange(answer)}
                disabled={isSubmitted}
              />
              <span className="ml-2">{answer}</span>
            </label>
          ))}
        </div>        
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  )
}

export default multipleChoice;