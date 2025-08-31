import React, { useEffect, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import ScoreDisplay from '../../../Common/scoreDisplay/scoreDisplay';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import '../section.css';

const DraggableWord = ({ word, id }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`reading-draggable-word ${isDragging ? 'dragging' : ''}`}
      {...listeners} 
      {...attributes}
    >
      {word}
    </div>
  );
};

const DroppableBlank = ({ id, filledWord, isSubmitted, userAnswer, correctAnswer, isCorrect, hasResultData }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  
  // If submitted AND we have result data, show the result styling
  if (isSubmitted && hasResultData) {
    if (isCorrect) {
      // Correct answer - green background
      return (
        <span className="reading-blank-correct">
          <span className="reading-correct-icon">✓</span>
          {userAnswer}
        </span>
      );
    } else {
      // Incorrect answer - red background with X and correct answer
      return (
        <span className="reading-blank-incorrect">
          <span className="reading-incorrect-icon">✗</span>
          {userAnswer}
          <span className="reading-correct-answer">
            (Answer: {correctAnswer})
          </span>
        </span>
      );
    }
  }
  
  // Not submitted OR submitted but no result yet - show normal styling with user's answer
  let blankClass = 'reading-droppable-blank';
  if (isOver) {
    blankClass += ' drag-over';
  }

  return (
    <span ref={setNodeRef} className={blankClass}>
      {filledWord || '_______'}
    </span>
  );
};

const ReadingFillInTheBlanks = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector((state) => state.chat.submittedQuestions);
  const initializedTimers = useSelector((state) => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Split the paragraph text into an array based on blank spaces
  const paragraphText = data?.result?.question?.paragraph ? data.result.question.paragraph.split('___') : [];
  const wordOptions = data?.result?.question?.blanks || [];

  const [availableWords, setAvailableWords] = useState(wordOptions);
  const [blanks, setBlanks] = useState(Array(wordOptions.length).fill(null));
  const [activeId, setActiveId] = useState(null);

  // Get submitted answers and correct answers from resultData prop
  const userAnswers = resultData?.userAnswers || [];
  const correctAnswers = resultData?.correctAnswers || wordOptions;
  


  // Initialize with resultData if available
  useEffect(() => {
    if (resultData?.userAnswers) {
      // Clear localStorage once we have the result
      localStorage.removeItem(`readingBlanks_${questionId}`);
    }
  }, [resultData, questionId]);
  
  // Preserve answers when submitted but resultData not yet available
  useEffect(() => {
    if (isSubmitted && !resultData?.userAnswers) {
      const savedBlanks = localStorage.getItem(`readingBlanks_${questionId}`);
      if (savedBlanks) {
        try {
          const parsedBlanks = JSON.parse(savedBlanks);
          setBlanks(parsedBlanks);
        } catch (error) {
          console.error('Error parsing saved blanks:', error);
        }
      }
    }
  }, [isSubmitted, resultData, questionId]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { over } = event;
    if (over) {
      const index = parseInt(over.id.split('-')[1]);
      const draggedWord = activeId;
      
      // If there's already a word in this blank, add it back to available words
      if (blanks[index]) {
        setAvailableWords(words => [...words, blanks[index]]);
      }
      
      // Update the blank with the new word
      const newBlanks = [...blanks];
      newBlanks[index] = draggedWord;
      setBlanks(newBlanks);
      
      // Remove the dragged word from available words
      setAvailableWords((words) => words.filter((w) => w !== draggedWord));
    }
    setActiveId(null);
  };

  const handleSubmit = () => {
    if (parentSubmit) {
      // Store the blanks in localStorage before submission to preserve them
      localStorage.setItem(`readingBlanks_${questionId}`, JSON.stringify(blanks));
      
      // Create an object mapping blank positions to words
      const answerMap = {};
      blanks.forEach((word, index) => {
        answerMap[`blank${index + 1}`] = word || ''; // Handle null/undefined values
      });

      // Format the submission data to match the expected structure
      const submissionData = {
        answer: answerMap,
        originalQuestion: {
          type: 'reading_fillInTheBlanks',
          section: 'reading',
          paragraph: data?.result?.question?.paragraph || '',
          blanks: data?.result?.question?.blanks || [],
          // Don't include correct_answers as AI will evaluate based on context
        }
      };
      parentSubmit(submissionData);
    }
  };

  // Get the answers to display - prioritize resultData, then localStorage, then current blanks
  const getDisplayAnswers = () => {
    if (resultData?.userAnswers) {
      return resultData.userAnswers;
    } else if (isSubmitted) {
      // When submitted but no result yet, use the current blanks (which should be from localStorage)
      return blanks;
    } else {
      return blanks;
    }
  };

  const displayAnswers = getDisplayAnswers();

  return (
    <div className={`${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="reading-drag-blanks-container">
          <p className="reading-drag-paragraph">
            {paragraphText.map((part, idx) => (
              <React.Fragment key={`part-${idx}`}>
                <span>{part}</span>
                {idx < paragraphText.length - 1 && (
                  <DroppableBlank 
                    key={`blank-${idx}`} 
                    id={`blank-${idx}`} 
                    filledWord={displayAnswers[idx]} 
                    isSubmitted={isSubmitted}
                    userAnswer={displayAnswers[idx]}
                    correctAnswer={correctAnswers[idx]}
                    isCorrect={isSubmitted ? displayAnswers[idx] === correctAnswers[idx] : null}
                    hasResultData={!!resultData?.userAnswers}
                  />
                )}
              </React.Fragment>
            ))}
          </p>
          {!isSubmitted && (
            <div className="reading-word-bank">
              {availableWords.map((word) => (
                <DraggableWord key={word} word={word} id={word} />
              ))}
            </div>
          )}
        </div>
      </DndContext>

      {/* Score Display */}
      <ScoreDisplay score={resultData?.overallScore} isSubmitted={isSubmitted} />

      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  );
};

export default ReadingFillInTheBlanks;
