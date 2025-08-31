import React, { useEffect, useState } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { listening_multiple_choice_nultiple } from '../../../reducer/listenerReducer';
import SoundPlayer from './soundPlayer';
import '../section.css';

const MultipleChoice = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);

  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      const userAnswerData = Array.isArray(resultData.userAnswers) 
        ? resultData.userAnswers 
        : [resultData.userAnswers];
      
      if (userAnswerData && userAnswerData.length > 0) {
        setSelectedAnswers(userAnswerData);
        // Clear localStorage once we have the result
        localStorage.removeItem(`listeningMultipleAnswers_${questionId}`);
      }
    }
  }, [resultData, questionId]);
  
  // Preserve answer when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswer = localStorage.getItem(`listeningMultipleAnswers_${questionId}`);
      if (savedAnswer) {
        try {
          const parsedAnswer = JSON.parse(savedAnswer);
          setSelectedAnswers(parsedAnswer);
        } catch (error) {
          console.error('Error parsing saved answer:', error);
        }
      }
    }
  }, [isSubmitted, resultData, questionId]);

  // Shuffle utility
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomQuestion = () => {
    const shuffled = shuffleArray(listening_multiple_choice_nultiple);
    return shuffled[0];
  };

  // Set current question
  useEffect(() => {
    if (questionId) {
      dispatch(setCurrentQuestion(questionId));
    }
  }, [questionId, dispatch]);

  // Initialize question content/audio
  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      const questionData = getRandomQuestion();

      dispatch(setQuestionContent(questionId, {
        audioUrl: questionData.audio,
        type: 'multipleChoiceMultiple_listening',
        question: questionData.question,
        options: questionData.options,               // ✅ Correct key
        correct_answers: questionData.correct_answer // ✅ Correct key
      }));

      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId, questionContents, dispatch]);

  // Timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
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
    if (parentSubmit && questionId) {
      // Store the answer in localStorage before submission to preserve it
      localStorage.setItem(`listeningMultipleAnswers_${questionId}`, JSON.stringify(selectedAnswers));

      const originalQuestion = {
        ...questionContents[questionId],
        type: 'multipleChoiceMultiple_listening',
        section: 'listening'
      };
      parentSubmit({
        answer: selectedAnswers,  // Changed from selectedAnswers to answer
        originalQuestion
      });
    }
  };

  const handleNext = () => {
    if (parentNext) {
      // Clear selections for next question
      setSelectedAnswers([]);
      parentNext();
    }
  };

  // Get Redux-loaded question content
  const content = questionContents[questionId];
  if (!content) return null; // ✅ Prevent early crash

  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{ margin: '30px 0' }}>
        <p>
          Listen to the recording and answer the question by selecting all the correct responses.
          You will need to select more than one response.
        </p>
        <SoundPlayer audioFile={audioMap[questionId]} />
        <p>{content.question}</p>
        <div className="listening-multiple-choice-multiple">
          <div className="answers">
            {content.options.map((answer, idx) => {
              const isSelected = selectedAnswers.includes(answer);
              const isCorrect = resultData?.correctAnswers?.includes(answer);
              
              // Determine styling based on submission state and correctness
              let answerStyle = '';
              if (isSubmitted && resultData?.correctAnswers) {
                if (isCorrect && isSelected) {
                  answerStyle = 'correct-answer'; // Both correct and selected
                } else if (isCorrect && !isSelected) {
                  answerStyle = 'correct-answer'; // Correct but not selected
                } else if (!isCorrect && isSelected) {
                  answerStyle = 'incorrect-answer'; // Incorrect but selected
                }
              }

              return (
                <label key={idx} className={`listening-checkbox-label ${answerStyle}`}>
                  <input
                    type="checkbox"
                    value={answer}
                    checked={isSelected}
                    onChange={() => handleCheckboxChange(answer)}
                    disabled={isSubmitted}
                  />
                  <span>{answer}</span>
                  {isSubmitted && resultData?.correctAnswers && (
                    <span className="answer-indicator">
                      {isCorrect ? ' ✓' : isSelected && !isCorrect ? ' ✗' : ''}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />
      </div>
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default MultipleChoice;
