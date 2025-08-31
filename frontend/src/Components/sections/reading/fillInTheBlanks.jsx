import React, { useState, useEffect } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import Select from 'react-select';
import '../section.css';

const FillInTheBlanks = ({data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData}) => {
  const [answers, setAnswers] = useState({});
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 3 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      // Clear localStorage once we have the result
      localStorage.removeItem(`fillInBlanks_${questionId}`);
    }
  }, [resultData, questionId]);
  
  // Preserve answers when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswers = localStorage.getItem(`fillInBlanks_${questionId}`);
      if (savedAnswers) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          setAnswers(parsedAnswers);
        } catch (error) {
          console.error('Error parsing saved answers:', error);
        }
      }
    }
  }, [isSubmitted, resultData, questionId]);

  const handleChange = (blankKey, selectedOption) => {
    setAnswers(prev => ({ ...prev, [blankKey]: selectedOption.value }));
  };

  const renderParagraph = () => {
    const paragraph = data?.result?.question?.paragraph; 
    const blanks = data?.result?.question?.blanks;

    // Get submitted answers and correct answers from resultData prop
    const userAnswers = resultData?.userAnswers || [];
    const correctAnswers = resultData?.correctAnswers || [];
    


    // Get the answers to display - prioritize resultData, then localStorage, then current answers
    const getDisplayAnswers = () => {
      if (resultData?.userAnswers) {
        return resultData.userAnswers;
      } else if (isSubmitted) {
        // When submitted but no result yet, use the current answers (which should be from localStorage)
        return answers;
      } else {
        return answers;
      }
    };

    const displayAnswers = getDisplayAnswers();

    // Create segments array with text and blanks alternating
    const segments = [];
    const parts = paragraph?.split(/(\{\{blank\d+\}\})/);
    
    parts?.forEach((part, index) => {
      const blankMatch = part.match(/\{\{(blank\d+)\}\}/);
      if (blankMatch) {
        // This is a blank placeholder
        const blankKey = blankMatch[1];
        const blankIndex = parseInt(blankKey.replace('blank', '')) - 1;
        
        if (isSubmitted) {
          // Show result styling after submission
          const userAnswer = userAnswers[blankIndex] || displayAnswers[blankKey] || '';
          const correctAnswer = correctAnswers[blankIndex] || '';
          const isCorrect = userAnswer === correctAnswer;
          
          // Only show result styling if we have actual result data
          if (resultData?.userAnswers) {
            if (isCorrect) {
              // Correct answer - green background
              segments.push(
                <span key={`blank-${index}`} className="mx-1 inline-block">
                  <span className="reading-blank-correct">
                    <span className="reading-correct-icon">✓</span>
                    {userAnswer}
                  </span>
                </span>
              );
            } else {
              // Incorrect answer - red background with X and correct answer
              segments.push(
                <span key={`blank-${index}`} className="mx-1 inline-block">
                  <span className="reading-blank-incorrect">
                    <span className="reading-incorrect-icon">✗</span>
                    {userAnswer}
                    <span className="reading-correct-answer">
                      (Answer: {correctAnswer})
                    </span>
                  </span>
                </span>
              );
            }
          } else {
            // Submitted but no result yet - show normal styling with user's answer
            segments.push(
              <span key={`blank-${index}`} className="mx-1 inline-block">
                <span className="reading-blank-neutral">
                  {userAnswer}
                </span>
              </span>
            );
          }
        } else if (blanks && blanks[blankKey]) {
          // Not submitted - show dropdown
          const options = blanks[blankKey].map(opt => ({ label: opt, value: opt }));
          segments.push(
            <span key={`blank-${index}`} className="mx-1 inline-block w-40">
              <Select
                options={options}
                onChange={selected => handleChange(blankKey, selected)}
                value={
                  displayAnswers[blankKey] ? { label: displayAnswers[blankKey], value: displayAnswers[blankKey] } : null
                }
                isDisabled={isSubmitted}
                placeholder="Select"
              />
            </span>
          );
        } else {
          segments.push(<span key={`missing-${index}`}>{part}</span>);
        }
      } else if (part?.trim()) {
        // This is regular text
        segments.push(<span key={`text-${index}`}>{part}</span>);
      }
    });
    
    return segments.length > 0 ? segments : <div>No segments rendered. Please try again.</div>;
  };

  const handleSubmit = () => {
    if (parentSubmit) {
      // Store the answers in localStorage before submission to preserve them
      localStorage.setItem(`fillInBlanks_${questionId}`, JSON.stringify(answers));
      
      // Format the submission data to match the expected structure
      const submissionData = {
        answer: answers,
        originalQuestion: {
          type: 'fillInTheBlanks_reading',
          section: 'reading',
          paragraph: data?.result?.question?.paragraph || '',
          blanks: data?.result?.question?.blanks || {},
          // Don't include correct_answers as AI will evaluate based on context
        }
      };
      parentSubmit(submissionData);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      // Only clear answers when moving to next question, not after submission
      if (!isSubmitted) {
        setAnswers({}); // Clear answers for next question
      }
      parentNext();
    }
  };

  return (
    <div className={`space-y-4 ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <h2>Fill in the blanks</h2>
      <div className="reading-fill-blanks-container">
        {renderParagraph()}
      </div>
      
      {/* Score Display */}
      <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />
      
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default FillInTheBlanks;
