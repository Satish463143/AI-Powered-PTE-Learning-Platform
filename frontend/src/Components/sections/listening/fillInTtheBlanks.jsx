import React, { useEffect, useState } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import SoundPlayer from './soundPlayer';
import { listening_fill_in_the_blanks } from '../../../reducer/listenerReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import '../section.css';

const fillInTtheBlanks = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [answers, setAnswers] = useState({});
  const [answerArray, setAnswerArray] = useState([]);

  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      const userAnswerData = Array.isArray(resultData.userAnswers) 
        ? resultData.userAnswers 
        : [resultData.userAnswers];
      
      if (userAnswerData && userAnswerData.length > 0) {
        // Convert array back to object format
        const answersObj = {};
        userAnswerData.forEach(answer => {
          if (answer.blankId && answer.value) {
            answersObj[answer.blankId] = answer.value;
          }
        });
        setAnswers(answersObj);
        setAnswerArray(userAnswerData);
        // Clear localStorage once we have the result
        localStorage.removeItem(`listeningFillBlanksAnswers_${questionId}`);
        localStorage.removeItem(`listeningFillBlanksArray_${questionId}`);
      }
    }
  }, [resultData, questionId]);
  
  // Preserve answer when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedAnswers = localStorage.getItem(`listeningFillBlanksAnswers_${questionId}`);
      const savedArray = localStorage.getItem(`listeningFillBlanksArray_${questionId}`);
      if (savedAnswers && savedArray) {
        try {
          const parsedAnswers = JSON.parse(savedAnswers);
          const parsedArray = JSON.parse(savedArray);
          setAnswers(parsedAnswers);
          setAnswerArray(parsedArray);
        } catch (error) {
          console.error('Error parsing saved answers:', error);
        }
      }
    }
  }, [isSubmitted, resultData, questionId]);

  // Function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random question from the array
  const getRandomQuestion = () => {
    const shuffledQuestions = shuffleArray(listening_fill_in_the_blanks);
    return shuffledQuestions[0];
  };

  // Set current question when component mounts or questionId changes
  useEffect(() => {
    if (questionId) {
      dispatch(setCurrentQuestion(questionId));
    }
  }, [questionId, dispatch]);

  // Initialize the content for this question if it doesn't exist
  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      // If no existing content, get from data or generate new content
      const questionData = getRandomQuestion();
      
      // Store the content in redux
      dispatch(setQuestionContent(questionId, {
        audioUrl: questionData.audio,
        type: 'fillInTheBlanks_listening',
        paragraph: questionData.paragraph,
        correct_answers: questionData.correct_answer
      }));
      
      // Set the question-specific audio
      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId, data, dispatch]);

  // Initialize timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const handleChange = (blankKey, value) => {
    // Update the answers object
    setAnswers(prev => ({
      ...prev,
      [blankKey]: value
    }));

    // Extract blank number from blankKey (e.g., "blank1" -> 1)
    const blankNumber = parseInt(blankKey.replace('blank', ''));
    
    // Update the answer array
    setAnswerArray(prev => {
      const newArray = [...prev];
      // Find existing answer or create new one
      const index = newArray.findIndex(a => a.blankId === blankKey);
      const newAnswer = { blankId: blankKey, value: value.trim(), index: blankNumber - 1 };
      
      if (index >= 0) {
        newArray[index] = newAnswer;
      } else {
        newArray.push(newAnswer);
      }
      
      // Sort by index to maintain order
      return newArray.sort((a, b) => a.index - b.index);
    });
  };

  // Render paragraph with blanks
  const renderParagraph = () => {
    if (!questionContents[questionId]) return null;

    // Get submitted answers and correct answers from resultData prop
    const userAnswers = resultData?.userAnswers || [];
    const correctAnswers = resultData?.correctAnswers || questionContents[questionId]?.correct_answers || [];

    const segments = [];
    const parts = questionContents[questionId].paragraph.split(/(\{\{blank\d+\}\})/);
    
    parts.forEach((part, index) => {
      const blankMatch = part.match(/\{\{(blank\d+)\}\}/);
      if (blankMatch) {
        // This is a blank placeholder
        const blankKey = blankMatch[1];
        const blankIndex = parseInt(blankKey.replace('blank', '')) - 1;
        
        if (isSubmitted) {
          // Show user's answer after submission
          const userAnswer = userAnswers[blankIndex] || answers[blankKey] || '';
          
          if (resultData?.correctAnswers) {
            // Results have arrived - show correct/incorrect styling
            const correctAnswer = correctAnswers[blankIndex] || '';
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) {
              // Correct answer - green background
              segments.push(
                <span key={`blank-${index}`} className="mx-1 inline-block">
                  <span 
                    style={{
                      border: '2px solid #28a745',
                      padding: '8px 12px',
                      minWidth: '120px',
                      minHeight: '30px',
                      backgroundColor: '#d4edda',
                      color: '#155724',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>✓</span>
                    {userAnswer}
                  </span>
                </span>
              );
            } else {
              // Incorrect answer - red background with X and correct answer
              segments.push(
                <span key={`blank-${index}`} className="mx-1 inline-block">
                  <span 
                    style={{
                      border: '2px solid #dc3545',
                      padding: '8px 12px',
                      minWidth: '120px',
                      minHeight: '30px',
                      backgroundColor: '#f8d7da',
                      color: '#721c24',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>✗</span>
                    {userAnswer}
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#28a745', 
                      marginLeft: '8px',
                      fontWeight: 'normal'
                    }}>
                      (Answer: {correctAnswer})
                    </span>
                  </span>
                </span>
              );
            }
          } else {
            // Results haven't arrived yet - show user's answer in neutral styling
            segments.push(
              <span key={`blank-${index}`} className="mx-1 inline-block">
                <span 
                  style={{
                    border: '2px solid #6c757d',
                    padding: '8px 12px',
                    minWidth: '120px',
                    minHeight: '30px',
                    backgroundColor: '#f8f9fa',
                    color: '#495057',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {userAnswer}
                </span>
              </span>
            );
          }

        } else {
          // Not submitted - show input field
          segments.push(
            <span key={`blank-${index}`} className="mx-1 inline-block">
              <input
                type="text"
                style={{border:'1px solid #000', padding:'5px', borderRadius:'5px', marginTop:'5px'}}
                value={answers[blankKey] || ''}
                onChange={(e) => handleChange(blankKey, e.target.value)}
                disabled={isSubmitted}
              />
            </span>
          );
        }
      } else if (part.trim()) {
        // This is regular text
        segments.push(<span key={`text-${index}`}>{part}</span>);
      }
    });
    
    return segments;
  };

  const handleSubmit = () => {
    if (parentSubmit && questionId) {
      // Store the answers in localStorage before submission to preserve them
      localStorage.setItem(`listeningFillBlanksAnswers_${questionId}`, JSON.stringify(answers));
      localStorage.setItem(`listeningFillBlanksArray_${questionId}`, JSON.stringify(answerArray));

      const submissionData = {
        answer: answerArray,
        originalQuestion: {
          ...questionContents[questionId],
          type: 'fillInTheBlanks_listening',
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
        <p>You will hear a recording. Type the missing words in each blank.</p>
        <SoundPlayer audioFile={audioMap[questionId]} />
        <div className="fill-blanks-paragraph">
          {renderParagraph()}
        </div>

        {/* Score Display */}
        <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  )
}

export default fillInTtheBlanks;