import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay'
import { setTimer } from '../../../reducer/chatReducer';
import '../section.css';

const MultipleChoiceSingle = ({ data = {}, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [selectedAnswer, setSelectedAnswer] = useState('');

  const options = data?.result?.question?.options || [];
  const paragraph = data?.result?.question?.passage || '';
  const questionText = data?.result?.question?.question || '';

  // Get submitted answers and correct answers from resultData prop
  const userAnswer = resultData?.userAnswers?.[0] || selectedAnswer;
  const correctAnswer = resultData?.correctAnswers?.[0] || '';

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
      // Format the submission data to match the expected structure
      const submissionData = {
        answer: [selectedAnswer], // Wrap in array to match service expectations
        originalQuestion: {
          type: 'multipleChoiceSingle_reading',
          section: 'reading',
          passage: paragraph,
          question: questionText,
          options: options,
          // Don't include correct_answers as AI will evaluate based on passage context
        }
      };
      parentSubmit(submissionData);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      setSelectedAnswer(''); // Clear selection for next question
      parentNext();
    }
  };

  const renderOption = (answer, index) => {
    if (isSubmitted) {
      // Check if this option was selected by user
      const isUserSelected = userAnswer === answer;
      // Check if this option is correct
      const isCorrect = correctAnswer === answer;
      
      let optionClass = 'reading-option';
      if (isCorrect) {
        optionClass += ' reading-option-correct';
      } else if (isUserSelected && !isCorrect) {
        optionClass += ' reading-option-incorrect';
      } else {
        optionClass += ' reading-option-neutral';
      }

      return (
        <div key={index} className={optionClass}>
          <input
            type="radio"
            checked={isUserSelected}
            disabled={true}
          />
          <span className="reading-option-text">
            {answer}
          </span>
        </div>
      );
    } else {
      // Not submitted - show normal radio buttons
      return (
        <label
          key={index}
          className="reading-radio-label"
        >
          <input
            type="radio"
            value={answer}
            checked={selectedAnswer === answer}
            onChange={() => handleRadioChange(answer)}
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

      <div className="reading-multiple-choice-single">
        {/* Reading passage */}
        <div className="reading-passage">
          {paragraph}
        </div>

        {/* Question */}
        <div className="reading-question">
          {questionText}
        </div>

        {/* Options */}
        <div className="reading-answers">
          {options.map((answer, index) => renderOption(answer, index))}
        </div>
        
        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />
      </div>

      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default MultipleChoiceSingle;