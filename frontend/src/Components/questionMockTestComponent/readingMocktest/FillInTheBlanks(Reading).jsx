import React, { useEffect, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import Swal from 'sweetalert2';

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

const Question = ({ data, onAnswerChange }) => {
    const [paragraphText, setParagraphText] = useState(data?.question?.paragraphText || []);
    const [availableWords, setAvailableWords] = useState(data?.question?.wordOptions || []);
    const [blanks, setBlanks] = useState(Array(data?.question?.blanksCount || 2).fill(null));
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        if (data?.question) {
            setParagraphText(data.question.paragraphText);
            setAvailableWords(data.question.wordOptions);
            setBlanks(Array(data.question.blanksCount || 2).fill(null));
        }
    }, [data]);

    useEffect(() => {
        // Send answer data to parent component whenever blanks change
        if (onAnswerChange) {
            onAnswerChange({
                answers: blanks,
                isComplete: !blanks.includes(null)
            });
        }
    }, [blanks, onAnswerChange]);

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

    return (
        <div>
            <h2 className='font-bold'>In the text below some words are missing. Drag words from the box below to the appropriate place in the text.</h2>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div style={{ padding: '10px', margin: '30px 0', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
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
                        {availableWords.map((word) => (
                            <DraggableWord key={word} word={word} id={word} />
                        ))}
                    </div>
                </div>
            </DndContext>
        </div>
    );
};

const FillInTheBlanksReading = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ answers: [], isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'Incomplete',
                text: 'Please fill in all the blanks before submitting.',
                icon: 'warning'
            });
            return;
        }

        await Swal.fire({
            title: 'Submit Answer?',
            text: 'Are you sure you want to submit your answer?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.isConfirmed) {
                onSubmit(answer);
            }
        });
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="reading-wrapper container">
                <div className="mock-question-container">
                    <div className="question">
                        <Question
                            data={data}
                            onAnswerChange={handleAnswerChange}
                        />
                    </div>
                </div>
            </div>
            <div className='submit_button'>
                <button
                    onClick={handleSubmit}
                    className='primary-btn'
                    disabled={!answer.isComplete || isLoading}
                >
                    Submit
                </button>
            </div>
        </>
    );
};

export default FillInTheBlanksReading; 