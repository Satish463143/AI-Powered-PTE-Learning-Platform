import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import { setTimer } from '../../../reducer/chatReducer';


const multipleChoice = ({ data = {}, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [selectedAnswer, setSelectedAnswer] = useState('');

  // Dummy data for demonstration
  const dummyData = {
    question: "What is the capital of USA?",
    answers: ["Paris", "London", "Berlin", "Washington"]
  };

  // Use provided data or fallback to dummy data
  const questionData = data.answers ? data : dummyData;

   // Set time in seconds and store it to the redux store ONLY if this is the active question
   useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 5 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const handleRadioChange = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (parentSubmit) {
      parentSubmit(selectedAnswer);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      parentNext();
    }
  };
  return (
    <div className={ `${isSubmitted && 'disabled_section' }`}>
      {showTimer && !isSubmitted && <Timer />}

      <div className={`multiple_choice `} style={{margin:'30px 0'}}>
        <p>{questionData.question}</p>
        <div className='answers'>
          {questionData.answers?.map((answer, index) => (
            <label key={index} className="block mb-2 ">
              <input
                type="radio"
                value={answer}
                checked={selectedAnswer === answer}
                onChange={() => handleRadioChange(answer)}
                disabled={isSubmitted}
              />
              <span className="ml-2">{answer}</span>
            </label>
          ))}
        </div>
      </div>

      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  )
}

export default multipleChoice