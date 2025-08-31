import React, { useEffect, useState, useRef } from 'react'
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay'

import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';

const WriteEssay = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  
  // Initialize with user's submitted answer if available
  const [essayAnswer, setEssayAnswer] = useState('');
  const [isModelAnswerExpanded, setIsModelAnswerExpanded] = useState(false);
  
  // Use ref to store the answer and prevent loss during re-renders
  const answerRef = useRef('');
  const [wordCount, setWordCount] = useState(0);

  const topic = data?.result?.question?.topic || '';
  const question = data?.result?.question?.question || '';

  // Set time in seconds and store it to the redux store ONLY if this is the active question
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 20 * 60, questionId })); // 20 minutes for essay
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Update word count when answer changes
  useEffect(() => {
    const words = essayAnswer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essayAnswer]);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      const userAnswer = Array.isArray(resultData.userAnswers) 
        ? resultData.userAnswers[0] 
        : resultData.userAnswers;
      
      if (userAnswer && typeof userAnswer === 'string') {
        setEssayAnswer(userAnswer);
        // Clear localStorage once we have the result
        localStorage.removeItem(`essayAnswer_${questionId}`);
      }
    }
  }, [resultData, questionId]);
  
  // Preserve answer when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswer = localStorage.getItem(`essayAnswer_${questionId}`);
      if (savedAnswer) {
        setEssayAnswer(savedAnswer);
      }
    }
  }, [isSubmitted, resultData, questionId]);

  const handleSubmit = () => {
    if (parentSubmit) {
      // Store the answer in localStorage before submission to preserve it
      localStorage.setItem(`essayAnswer_${questionId}`, essayAnswer);
      
      // Format the submission data to match the expected structure
      const submissionData = {
        answer: essayAnswer,
        originalQuestion: {
          type: 'writeEssay',
          section: 'writing',
          topic: topic,
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
        setEssayAnswer(''); // Clear answer for next question
        setWordCount(0); // Reset word count
      }
      parentNext();
    }
  };



  // Get word count status and color
  const getWordCountStatus = () => {
    if (wordCount < 200) return { text: 'Too short', color: '#dc3545' };
    if (wordCount > 300) return { text: 'Too long', color: '#dc3545' };
    if (wordCount >= 250 && wordCount <= 300) return { text: 'Good length', color: '#28a745' };
    return { text: 'Acceptable', color: '#ffc107' };
  };

  const wordCountStatus = getWordCountStatus();

  return (
    <div className={`write_essay ${isSubmitted ? 'disabled_section' : ''}`}>
      {showTimer && !isSubmitted && <Timer />}

      <div className="writing-essay-container">
        {/* Essay topic and question */}
        <div className="writing-essay-question">
          <div className="writing-essay-topic">
            {topic}
          </div>
          <div className="writing-essay-question-text">
            {question}
          </div>
        </div>

                 {/* Writing area */}
         <div className="write_essay_answer">
           <textarea
             name="write_essay"
             id="write_essay"
             value={essayAnswer}
             disabled={isSubmitted}
             readOnly={isSubmitted}
             placeholder={isSubmitted ? "Your submitted answer" : "Write your essay here... (200-300 words)"}
             onChange={e => setEssayAnswer(e.target.value)}
             className="writing-essay-textarea"
           />

           {/* Word count indicator */}
           <div className="writing-word-count-container">
             <div>
               <span className="writing-word-count-target">Target: </span>
               <span>200-300 words</span>
             </div>
             <div className={`writing-word-count-display ${wordCountStatus.color === '#28a745' ? 'writing-word-count-good' : 'writing-word-count-bad'}`}>
               Words: {wordCount} ({wordCountStatus.text})
             </div>
           </div>

                       {/* Writing tips */}
           <div className="writing-tips-container">
             <strong>Tips:</strong>
             <ul className="writing-tips-list">
               <li>Include an introduction, body paragraphs, and conclusion</li>
               <li>Support your arguments with examples</li>
               <li>Use academic vocabulary and formal language</li>
               <li>Check grammar and punctuation</li>
               <li>Stay within the word limit (200-300 words)</li>
             </ul>
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

export default WriteEssay;