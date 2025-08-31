import React, { useEffect, useState } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { multiple_choice_single } from '../../../reducer/listenerReducer';
import SoundPlayer from './soundPlayer';
import '../section.css';

const MultipleChoiceSingle = ({ onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);

  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  const [selectedAnswer, setSelectedAnswer] = useState('');

  // Get submitted answers and correct answers from resultData prop
  const userAnswer = resultData?.userAnswers?.[0] || selectedAnswer;
  
  // Handle both array and string formats for correct answers
  let correctAnswer = '';
  if (resultData?.correctAnswers) {
    if (Array.isArray(resultData.correctAnswers)) {
      correctAnswer = resultData.correctAnswers[0] || '';
    } else {
      correctAnswer = resultData.correctAnswers;
    }
  }
  // Fallback to question content if not in resultData
  if (!correctAnswer) {
    correctAnswer = questionContents[questionId]?.correct_answers?.[0] || '';
  }

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomQuestion = () => {
    const shuffled = shuffleArray(multiple_choice_single);
    return shuffled[0];
  };

  useEffect(() => {
    if (questionId) {
      dispatch(setCurrentQuestion(questionId));
    }
  }, [questionId, dispatch]);

  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      const questionData = getRandomQuestion();

      dispatch(setQuestionContent(questionId, {
        audioUrl: questionData.audio,
        type: 'multipleChoiceSingle_listening',
        question: questionData.question,
        options: questionData.options,
        correct_answers: [questionData.correct_answer] // wrapped in array for consistency
      }));

      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId, questionContents, dispatch]);

  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const handleRadioChange = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (parentSubmit && questionId) {
      const originalQuestion = {
        ...questionContents[questionId],
        type: 'multipleChoiceSingle_listening',
        section: 'listening'
      };
      parentSubmit({
        answer: selectedAnswer ? [selectedAnswer] : [], // Convert to array format
        originalQuestion
      });
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
      
      // Only show correct/incorrect colors if resultData is available
      const hasResultData = resultData && (resultData.correctAnswers || resultData.userAnswers);
      
      let optionClass = 'listening-option';
      if (hasResultData) {
        if (isCorrect) {
          optionClass += ' listening-option-correct';
        } else if (isUserSelected && !isCorrect) {
          optionClass += ' listening-option-incorrect';
        } else {
          optionClass += ' listening-option-neutral';
        }
      } else {
        // No result data yet, keep everything neutral
        optionClass += ' listening-option-neutral';
      }

      return (
        <div 
          key={index} 
          className={optionClass}
          style={hasResultData ? (isCorrect ? {
            backgroundColor: '#d4edda',
            borderColor: '#28a745',
            color: '#155724'
          } : isUserSelected && !isCorrect ? {
            backgroundColor: '#f8d7da',
            borderColor: '#dc3545',
            color: '#721c24'
          } : {}) : {}}
        >
          <input
            type="radio"
            checked={isUserSelected}
            disabled={true}
          />
          <span className="listening-option-text">
            {answer}
          </span>
          {hasResultData && isCorrect && <span className="listening-correct-icon">✓</span>}
          {hasResultData && isUserSelected && !isCorrect && <span className="listening-incorrect-icon">✗</span>}
        </div>
      );
    } else {
      // Not submitted - show normal radio buttons
      return (
        <label
          key={index}
          className="listening-radio-label"
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

  const content = questionContents[questionId];
  if (!content) return null;

  return (
    <div className={`${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      
      <div className="listening-multiple-choice-single">
        <p>Listen to the recording and answer the single-choice question by selecting the correct response. Only one response is correct.</p>
        <SoundPlayer audioFile={audioMap[questionId]} />
        <div className="listening-question">
          {content.question}
        </div>
        <div className="listening-answers">
          {content.options.map((answer, index) => renderOption(answer, index))}
        </div>
        
        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />
      </div>

      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default MultipleChoiceSingle;
