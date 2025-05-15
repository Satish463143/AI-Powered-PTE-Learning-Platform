
import React, { useEffect } from 'react'
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import '../sectionCss/sectionCss.css'
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';

const summarizeWrittenText = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  
 

  // Set time in seconds and store it to the redux store ONLY if this is the active question
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const handleSubmit = () => {
    if (parentSubmit) {
      parentSubmit();
    }
  };

  const handleNext = () => {
    if (parentNext) {
      parentNext();
    }
  };

  return (
    <div className={ ` write_essay ${isSubmitted && 'disabled_section' }`}>
      {showTimer && !isSubmitted && <Timer />}

      <div className='write_essay_question'>
        <p>{data.question || "Write an essay on the given topic."}</p>
      </div>
      <div className='write_essay_answer'>
        <textarea 
          name="write_essay" 
          id="write_essay"
          disabled={isSubmitted}
          readOnly={isSubmitted}
          placeholder={isSubmitted ? "Your submitted answer" : "Write your answer here..."}
        >          
        </textarea>
      </div>
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} /> 
    </div>
  )
}

export default summarizeWrittenText