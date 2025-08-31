import React, { useEffect, useState } from 'react'
import Timer from '../../../Common/timer/timer'
import AnswersButton from '../../../Common/answersButton/answersButton'
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { DndContext,  closestCenter,  KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay} from '@dnd-kit/core';
import {arrayMove,  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import '../section.css';

// Sortable item component
const SortableItem = ({ id, content, fixedIndex, isSubmitted }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isSubmitted });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`reading-sortable-item ${isDragging ? 'dragging' : ''} ${isSubmitted ? 'disabled' : ''}`}
      {...attributes} 
      {...listeners}
    >
      <strong className="reading-item-number">{fixedIndex + 1}.</strong>
      <div className="reading-item-content">{content}</div>
    </div>
  );
};

const ReorderParagraphs = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId, resultData }) => {
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

  const questionData = data?.result?.question?.questions || [];
  
  // Get submitted answers and correct answers from resultData prop
  const userAnswers = resultData?.userAnswers || [];
  const correctAnswers = resultData?.correctAnswers || [];
  
  // Initialize items with proper structure for DnD
  const [items, setItems] = useState(() => 
    questionData.map((content, index) => ({
      id: `item-${index}`,
      content,
      fixedIndex: index
    }))
  );
  const [activeId, setActiveId] = useState(null);

  // Update items when data changes, but preserve user's arrangement if submitted
  useEffect(() => {
    if (data?.result?.question?.questions && !isSubmitted) {
      setItems(data.result.question.questions.map((content, index) => ({
        id: `item-${index}`,
        content,
        fixedIndex: index
      })));
    }
  }, [data, isSubmitted]);

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
    
    if (over && active.id !== over.id && !isSubmitted) {
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
      // Format the submission data to match the expected structure
      const submissionData = {
        answer: items.map(item => item.content),
        originalQuestion: {
          type: 'reorderParagraph',
          section: 'reading',
          questions: data?.result?.question?.questions || [],
          
        }
      };
      parentSubmit(submissionData);
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
        <p>Re-order the following paragraphs to make a meaningful paragraph.</p>
        
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
                   isSubmitted={isSubmitted}
                 />
               ))}
            </SortableContext>
            
            <DragOverlay>
              {activeId ? (
                <div className='drag-overlay'>
                  <strong className="reading-item-number">
                    {items.find(item => item.id === activeId)?.fixedIndex + 1}.
                  </strong>
                  <div className="reading-item-content">
                    {items.find(item => item.id === activeId)?.content}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Display correct answer ordering after submission */}
        {isSubmitted && correctAnswers.length > 0 && (
          <div className="reading-result-container">
            <h3 className="reading-result-title">
              <span className="reading-result-icon correct">✓</span>
              Correct Answer Order:
            </h3>
            <div className="reading-result-item correct">
              {correctAnswers.map((paragraph, index) => {
                // Strip the paragraph number from the beginning (e.g., "1. " -> "")
                const cleanParagraph = paragraph.replace(/^\d+\.\s*/, '');
                
                // Find the original paragraph number for this content
                const originalIndex = questionData.findIndex(q => q === cleanParagraph);
                const paragraphNumber = originalIndex + 1;
                
                return (
                  <span 
                    key={index} 
                    className="reading-result-text"
                  >
                    {paragraphNumber || '?'}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} /> 
    </div>
  );
};

export default ReorderParagraphs;