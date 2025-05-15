import React, { useEffect, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import '../sectionCss/sectionCss.css';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';

const DraggableWord = ({ word, id }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    padding: '8px 12px',
    margin: '5px',
    background: '#2daef5',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'grab',
    display: 'inline-block',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {word}
    </div>
  );
};

const DroppableBlank = ({ id, filledWord }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style = {
    border: '1px dashed #aaa',
    padding: '8px',
    minWidth: '120px',
    minHeight: '30px',
    margin: '5px',
    backgroundColor: isOver ? '#e6f7ff' : '#fff',
    borderRadius: '4px',
    textAlign: 'center',
  };

  return (
    <span ref={setNodeRef} style={style}>
      {filledWord || '_______'}
    </span>
  );
};

const ReadingFillInTheBlanks = ({ data, onSubmit: parentSubmit,onNext: parentNext,  showTimer = true, questionId}) => {
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

  const paragraphText = data?.paragraphText || [
    'Last night, I went to a grand music show at the city hall. The auditorium was filled with excited audiences. Some people, unfortunately, were chatting',
    '__',
    ', ignoring the performers onstage. I closed my eyes,',
    '__',
    ', and immersed myself in the music.',
  ];

  const wordOptions = ['constantly', 'However', 'trying', 'immersed'];

  const [availableWords, setAvailableWords] = useState(wordOptions);
  const [blanks, setBlanks] = useState([null, null]);
  const [activeId, setActiveId] = useState(null);

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
      parentSubmit(blanks);
    }
  };
  

  return (
    <div className={`${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ padding: '10px',margin:'30px 0', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
          <p style={{ lineHeight: '2em' }}>
            {paragraphText.map((part, idx) => {
              if (part === '__') {
                const blankIndex = paragraphText.slice(0, idx).filter(p => p === '__').length;
                return (
                  <DroppableBlank 
                    key={`blank-${blankIndex}`} 
                    id={`blank-${blankIndex}`} 
                    filledWord={blanks[blankIndex]} 
                  />
                );
              } else {
                return <span key={`text-${idx}`}>{part} </span>;
              }
            })}
          </p>
          <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap' }}>
            {availableWords.map((word, index) => (
              <DraggableWord key={word} word={word} id={word} />
            ))}
          </div>
        </div>
      </DndContext>

      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  );
};

export default ReadingFillInTheBlanks;
