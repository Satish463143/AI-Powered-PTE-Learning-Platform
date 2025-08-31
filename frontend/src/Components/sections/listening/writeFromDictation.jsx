import React, { useEffect, useState, useRef } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import SoundPlayer from './soundPlayer';
import { write_from_dictation } from '../../../reducer/listenerReducer';
import '../section.css';

// Helper function to get random question
const getRandomQuestion = () => {
  const shuffled = [...write_from_dictation];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled[0];
};

const WriteFromDictation = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrectAnswerExpanded, setIsCorrectAnswerExpanded] = useState(false);
  const textareaRef = useRef(null);

  // Get correct answer from resultData
  const correctAnswer = resultData?.correctAnswers?.[0] || '';

  // Set current question when component mounts or questionId changes
  useEffect(() => {
    if (questionId) {
      dispatch(setCurrentQuestion(questionId));
    }
  }, [questionId, dispatch]);

  // Initialize the content for this question if it doesn't exist
  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      // Get random question data
      const questionData = getRandomQuestion();
      
      // Store the content in redux
      dispatch(setQuestionContent(questionId, {
        audioUrl: questionData.audio,
        type: 'writeFromDictation',
        sentence: questionData.correct_answer || '',
        correct_answers: [questionData.correct_answer] // Store as array for consistency
      }));
      
      // Set the question-specific audio
      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId, dispatch, questionContents]); // Only depend on questionId
  
  // Initialize timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      const submittedAnswer = Array.isArray(resultData.userAnswers) 
        ? resultData.userAnswers[0] 
        : resultData.userAnswers;
      
      if (submittedAnswer && typeof submittedAnswer === 'string') {
        setUserAnswer(submittedAnswer);
        // Clear localStorage once we have the result
        localStorage.removeItem(`dictationAnswer_${questionId}`);
      }
    }
  }, [resultData, questionId]);
  
  // Preserve answer when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswer = localStorage.getItem(`dictationAnswer_${questionId}`);
      if (savedAnswer) {
        setUserAnswer(savedAnswer);
      }
    }
  }, [isSubmitted, resultData, questionId]);
  
  const handleSubmit = () => {
    if (parentSubmit && questionId && audioMap[questionId]) {
      // Get the textarea content
      const textareaContent = textareaRef.current?.value || userAnswer;

      // Store the answer in localStorage before submission to preserve it
      localStorage.setItem(`dictationAnswer_${questionId}`, textareaContent.trim());

      // Format the data according to the backend's expected structure
      const submissionData = {
        answer: textareaContent.trim(),
        originalQuestion: {
          ...questionContents[questionId],
          type: 'writeFromDictation',
          section: 'listening',
          sentence: questionContents[questionId]?.sentence || '',
          correct_answers: [questionContents[questionId]?.sentence || '']
        }
      };
      
      parentSubmit(submissionData);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      // Only clear answer when moving to next question, not after submission
      if (!isSubmitted) {
        setUserAnswer(''); // Clear answer for next question
      }
      parentNext();
    }
  };
  
  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
        <p>You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the sentence as you can. You will hear the sentence only once.</p>
        <SoundPlayer audioFile={audioMap[questionId]} />
        <textarea 
          rows={10}
          placeholder='Write the sentence you hear'
          ref={textareaRef}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isSubmitted}
        />

        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />

        {/* Correct Answer Display - Show after submission */}
        {isSubmitted && correctAnswer && (
          <div className="writing-model-answer-container">
            <div 
              className={`writing-model-answer-header ${isCorrectAnswerExpanded ? 'active' : ''}`}
              onClick={() => {
                setIsCorrectAnswerExpanded(!isCorrectAnswerExpanded);
              }}
              style={{ cursor: 'pointer' }}
            >
              <span className="writing-model-answer-icon">✓</span>
              <span>Correct Answer</span>
              <span className="model-answer-icon">
                {isCorrectAnswerExpanded ? '−' : '+'}
              </span>
            </div>
            <div className={`writing-model-answer-content ${isCorrectAnswerExpanded ? 'active' : ''}`}>
              {correctAnswer}
            </div>
          </div>
        )}
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default WriteFromDictation;