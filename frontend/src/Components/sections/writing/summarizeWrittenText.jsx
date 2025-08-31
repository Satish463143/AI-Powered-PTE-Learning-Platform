
import React, { useEffect, useState, useRef } from 'react'
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay'

import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';

const SummarizeWrittenText = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  
  // Initialize with user's submitted answer if available
  const [summarizeAnswer, setSummarizeAnswer] = useState('');
  const [isModelAnswerExpanded, setIsModelAnswerExpanded] = useState(false);
  
  // Use ref to store the answer and prevent loss during re-renders
  const answerRef = useRef('');
  const [wordCount, setWordCount] = useState(0);

  const passage = data?.result?.question?.passage || '';
  const question = data?.result?.question?.question || '';

  // Set time in seconds and store it to the redux store ONLY if this is the active question
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Update word count when answer changes
  useEffect(() => {
    const words = summarizeAnswer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [summarizeAnswer]);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      const userAnswer = Array.isArray(resultData.userAnswers) 
        ? resultData.userAnswers[0] 
        : resultData.userAnswers;
      
      if (userAnswer && typeof userAnswer === 'string') {
        setSummarizeAnswer(userAnswer);
        // Clear localStorage once we have the result
        localStorage.removeItem(`summarizeAnswer_${questionId}`);
      }
    }
  }, [resultData, questionId]);
  
  // Preserve answer when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswer = localStorage.getItem(`summarizeAnswer_${questionId}`);
      if (savedAnswer) {
        setSummarizeAnswer(savedAnswer);
      }
    }
  }, [isSubmitted, resultData, questionId]);

  const handleSubmit = () => {
    if (parentSubmit) {
      // Store the answer in localStorage before submission to preserve it
      localStorage.setItem(`summarizeAnswer_${questionId}`, summarizeAnswer);
      
      // Format the submission data to match the expected structure
      const submissionData = {
        answer: summarizeAnswer,
        originalQuestion: {
          type: 'summarizeWrittenText',
          section: 'writing',
          passage: passage,
          question: question,
          // Don't include correct_answers as AI will evaluate based on content
        }
      };
      parentSubmit(submissionData);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      // Only clear answer when moving to next question, not after submission
      if (!isSubmitted) {
        setSummarizeAnswer(''); // Clear answer for next question
        setWordCount(0); // Reset word count
      }
      parentNext();
    }
  };



  return (
    <div className={`write_essay ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}

      <div className="writing-summarize-container">
        {/* Reading passage */}
        <div className="writing-essay-question">
          <div className="writing-summarize-passage">
            {passage}
          </div>
          <div className="writing-essay-question-text">
            {question}
          </div>
        </div>

                 {/* Answer section */}
         <div className="write_essay_answer">
           <textarea
             name="write_essay"
             id="write_essay"
             value={summarizeAnswer}
             disabled={isSubmitted}
             readOnly={isSubmitted}
             placeholder={isSubmitted ? "Your submitted answer" : "Write your summary here... (5-75 words)"}
             onChange={e => setSummarizeAnswer(e.target.value)}
             className="writing-summarize-textarea"
           />
           
                       {/* Word count indicator */}
           <div className={`writing-summarize-word-count ${wordCount < 5 || wordCount > 75 ? 'writing-summarize-word-count-bad' : 'writing-summarize-word-count-good'}`}>
             Words: {wordCount} {wordCount < 5 ? '(Too short)' : wordCount > 75 ? '(Too long)' : '(Good length)'}
           </div>

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
      </div>

      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default SummarizeWrittenText;