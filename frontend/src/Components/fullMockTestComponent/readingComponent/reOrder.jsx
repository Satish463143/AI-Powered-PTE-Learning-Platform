import React, { useState, useEffect } from 'react'
import { DndContext,  closestCenter,  KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay} from '@dnd-kit/core';
import {arrayMove,  SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Swal from 'sweetalert2';


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

const dummyData = {
    answers: [
      "Nepal is a beautiful country.",
      "The national flag is in the shape of a triangle.",
      "The national animal is the tiger.",
      "The national food is the momo.",
      "The national bird is the eagle."
    ],
  };

const Question = ({ data }) => {
    const questionData = data ? data : dummyData;
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

    return (
        <div>
            <h2 className='font-bold'>
                The text boxes below have been placed in a random order. Restore the original order by dragging the text boxes.
            </h2>
            <div className='reorder-paragraphs-container'style={{marginTop:'40px'}} >
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
    )
}

const ReOrder = ({ onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const totalQuestions = 2;
    
    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, totalQuestions, updateProgress]);

    const handleNextQuestion = () => {      
      if (questionIndex < totalQuestions - 1) {
          setQuestionIndex((prev) => prev + 1);
      } else {
          onNext();
      }
  };

    const handleNextButtonClick = () => {
      Swal.fire({
          title: "Are you sure?",
          text: "Do you want to proceed to the next question?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
      }).then((result) => {
          if (result.isConfirmed) {
              handleNextQuestion();
          }
      });
  };
  return (
    <>
        <div className="speaking-wrapper container">
            <div className="mock-question-container">
                <div className="question">
                    <Question 
                        key={`question-${questionIndex}`}
                        number={questionIndex + 1}
                        data={null} 
                    />
                </div>
            </div>
            
        </div>
        <div className='next_button'>
            <button onClick={handleNextButtonClick} className='primary-btn'>
                Next
            </button>
        </div>
    </>
  )
}

export default ReOrder