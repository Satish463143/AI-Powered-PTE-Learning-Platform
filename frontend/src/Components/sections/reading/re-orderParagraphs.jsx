import React, { useEffect, useState } from 'react'
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import '../sectionCss/sectionCss.css'
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { DndContext,  closestCenter,  KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay} from '@dnd-kit/core';
import {arrayMove,  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item component
const SortableItem = ({ id, content, fixedIndex }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '16px',
    margin: '0 0 8px 0',
    background: isDragging ? '#eaf5ff' : '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'grab',
    userSelect: 'none',
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong style={{ marginRight: '10px', minWidth: '25px' }}>{fixedIndex + 1}.</strong>
      <div>{content}</div>
    </div>
  );
};

const ReorderParagraphs = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  // Set time in seconds and store it to the redux store ONLY if this is the active question
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const dummyData = {
    question: "Reorder the following statements to make a meaningful paragraph.",
    answers: [
      "Nepal is a beautiful country.",
      "The national flag is in the shape of a triangle.",
      "The national animal is the tiger.",
      "The national food is the momo.",
      "The national bird is the eagle."
    ],
  };

  const questionData = data?.answers ? data : dummyData;
  
  // Create array of items with unique ids and fixed indices
  const initialItems = questionData.answers.map((answer, index) => ({
    id: `item-${index}`,
    content: answer,
    fixedIndex: index  // This index will stay with the content
  }));
  
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState(null);

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };

  const handleSubmit = () => {
    if (parentSubmit) {
      // Extract just the content from the items for submission
      const answerContent = items.map(item => item.content);
      parentSubmit(answerContent);
    }
  };

  const handleNext = () => {
    if (parentNext) {
      parentNext();
    }
  };

  return (
    <div className={ `${isSubmitted && 'disabled_section' }`}>
      {showTimer && !isSubmitted && <Timer />}
      <div className={`reorder-paragraphs`}>
        <p>{questionData.question}</p>
        
        <div className='reorder-paragraphs-container' >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  content={item.content}
                  fixedIndex={item.fixedIndex}
                  index={index}
                />
              ))}
            </SortableContext>
            
            <DragOverlay>
              {activeId ? (
                <div className='drag-overlay'>
                  <strong style={{ marginRight: '10px', minWidth: '25px' }}>
                    {items.find(item => item.id === activeId)?.fixedIndex + 1}.
                  </strong>
                  <div>
                    {items.find(item => item.id === activeId)?.content}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} /> 
    </div>
  );
};

export default ReorderParagraphs;