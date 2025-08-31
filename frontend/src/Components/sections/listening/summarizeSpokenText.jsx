import React, { useEffect, useState, useRef } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import SoundPlayer from './soundPlayer';
// Import the data array
import { summarize_spoken_text } from '../../../reducer/listenerReducer';
import '../section.css';

// Helper function to get random question
const getRandomQuestion = () => {
  const shuffled = [...summarize_spoken_text];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled[0];
};

const SummarizeSpokenText = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [userAnswer, setUserAnswer] = useState('');
  const [isModelAnswerExpanded, setIsModelAnswerExpanded] = useState(false);
  const textareaRef = useRef(null);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      const userAnswerData = Array.isArray(resultData.userAnswers) 
        ? resultData.userAnswers[0] 
        : resultData.userAnswers;
      
      if (userAnswerData && typeof userAnswerData === 'string') {
        setUserAnswer(userAnswerData);
        // Clear localStorage once we have the result
        localStorage.removeItem(`summarizeSpokenAnswer_${questionId}`);
      }
    }
  }, [resultData, questionId]);
  
  // Preserve answer when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswer = localStorage.getItem(`summarizeSpokenAnswer_${questionId}`);
      if (savedAnswer) {
        setUserAnswer(savedAnswer);
      }
    }
  }, [isSubmitted, resultData, questionId]);

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
        type: 'summarizeSpokenText',
        sentence: questionData.sentence || "Please summarize the spoken text.",
        correct_answers: [questionData.correct_answer] // Get correct answer from data
      }));
      
      // Set the question-specific audio
      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId]); // Only depend on questionId
  
  // Initialize timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);
  
  const handleSubmit = () => {
    if (parentSubmit && questionId && audioMap[questionId]) {
      // Get the textarea content
      const textareaContent = textareaRef.current?.value || userAnswer;

      // Store the answer in localStorage before submission to preserve it
      localStorage.setItem(`summarizeSpokenAnswer_${questionId}`, textareaContent.trim());

      // Format the data according to the backend's expected structure
      const submissionData = {
        answer: textareaContent.trim(),
        originalQuestion: {
          ...questionContents[questionId],
          type: 'summarizeSpokenText',
          section: 'listening'
        }
      };
      
      parentSubmit(submissionData);
    }
  };
  
  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
        <p>You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture. You should write 50-70 words. You will have 10 minutes to finish this task. Your response will be judged on the quality of your writing and on how well your response presents the key points presented in the lecture.</p>
        <SoundPlayer audioFile={audioMap[questionId]} />
        <textarea 
          rows={10}
          placeholder={isSubmitted ? "Your submitted answer" : "Summarize the spoken text"}
          ref={textareaRef}
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isSubmitted}
          readOnly={isSubmitted}
        />

        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />

                 {/* Model Answer Section - Show after submission */}
         {isSubmitted && resultData?.correctAnswers && (
           <div className="writing-model-answer-container">
             <div 
               className={`writing-model-answer-header ${isModelAnswerExpanded ? 'active' : ''}`}
               onClick={() => {
                 setIsModelAnswerExpanded(!isModelAnswerExpanded);
               }}
               style={{ cursor: 'pointer' }}
             >
               <span className="writing-model-answer-icon">📝</span>
               <span>Model Answer</span>
               <span className="model-answer-icon">
                 {isModelAnswerExpanded ? '−' : '+'}
               </span>
             </div>
             <div className={`writing-model-answer-content ${isModelAnswerExpanded ? 'active' : ''}`}>
               {(() => {
                 if (Array.isArray(resultData.correctAnswers)) {
                   // Filter out the header and join all points
                   const keyPoints = resultData.correctAnswers
                     .filter(point => point && point.trim() !== '')
                     .map(point => point.trim())
                     .join('\n\n');
                   
                   return keyPoints;
                 } else if (resultData.correctAnswers) {
                   return resultData.correctAnswers;
                 } else {
                   return 'No model answer available for this question.';
                 }
               })()}
             </div>
           </div>
         )}
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  )
}

export default SummarizeSpokenText;