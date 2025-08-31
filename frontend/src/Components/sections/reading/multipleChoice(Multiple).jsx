import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay'
import { setTimer } from '../../../reducer/chatReducer';
import '../section.css';

const multipleChoice = ({ data = {}, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  const options = data?.result?.question?.options;
  const paragraph = data?.result?.question?.passage;
  const questionData = data.result?.question?.question;
  const correctAnswers = data?.result?.question?.correct_answers || [];

  // Get submitted answers and correct answers from resultData prop
  const userAnswers = resultData?.userAnswers || selectedAnswers;
  const correctAnswersFromResult = resultData?.correctAnswers || correctAnswers;

  // Set time in seconds and store it to the redux store ONLY if this is the active question
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 5 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const handleCheckboxChange = (answer) => {
    setSelectedAnswers(prev =>
      prev.includes(answer)
        ? prev.filter(item => item !== answer)
        : [...prev, answer]
    );
  };

  const handleSubmit = () => {
    if (parentSubmit) {
      // Format the submission data to match the expected structure
      const submissionData = {
        answer: selectedAnswers,
        originalQuestion: {
          type: 'multipleChoiceMultiple_reading',
          section: 'reading',
          passage: data?.result?.question?.passage,
          question: data?.result?.question?.question,
          options: data?.result?.question?.options,
          correct_answers: [] // AI will evaluate based on passage
        }
      };
      parentSubmit(submissionData);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      setSelectedAnswers([]); // Clear selections for next question
      parentNext();
    }
  };

  const renderOption = (answer, idx) => {
    if (isSubmitted) {
      // Check if this option was selected by user
      const isUserSelected = userAnswers.includes(answer);
      // Check if this option is correct
      const isCorrect = correctAnswersFromResult.includes(answer);
      
      let optionClass = 'reading-option';
      if (isCorrect) {
        optionClass += ' reading-option-correct';
      } else if (isUserSelected && !isCorrect) {
        optionClass += ' reading-option-incorrect';
      } else {
        optionClass += ' reading-option-neutral';
      }

      return (
        <div key={idx} className={optionClass}>
          <input
            type="checkbox"
            checked={isUserSelected}
            disabled={true}
          />
          <span className="reading-option-text">
            {answer}
          </span>
        </div>
      );
    } else {
      // Not submitted - show normal checkboxes
      return (
        <label key={idx} className="reading-checkbox-label">
          <input
            type="checkbox"
            value={answer}
            checked={selectedAnswers.includes(answer)}
            onChange={() => handleCheckboxChange(answer)}
            disabled={isSubmitted}
          />
          <span>{answer}</span>
        </label>
      );
    }
  };

  return (
    <div className={`${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}

      <div className="reading-multiple-choice-multiple">
        <p>{paragraph}</p>
        <p className='font-bold'>{questionData}</p>
        <div className='answers'>
          {options?.map((answer, idx) => renderOption(answer, idx))}
        </div>
        
        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />
      </div>

      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default multipleChoice;