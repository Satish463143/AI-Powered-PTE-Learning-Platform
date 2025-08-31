import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [paragraphs, setParagraphs] = useState(
        data?.question?.paragraphs?.map((text, index) => ({
            id: `paragraph-${index}`,
            text,
            originalIndex: index
        })) || []
    );

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(paragraphs);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setParagraphs(items);
        onAnswerChange({
            orderedParagraphs: items.map(item => item.originalIndex),
            isComplete: true
        });
    };

    return (
        <div className="reading-question">
            <h2 className="font-bold mb-4">Reorder Paragraphs</h2>
            
            <div className="instructions p-4 bg-gray-50 rounded-lg mb-6">
                <p>Drag and drop the paragraphs to arrange them in the correct order.</p>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="paragraphs">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="paragraphs-container"
                        >
                            {paragraphs.map((paragraph, index) => (
                                <Draggable
                                    key={paragraph.id}
                                    draggableId={paragraph.id}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`paragraph-item p-4 mb-4 bg-white rounded-lg border ${
                                                snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                                            }`}
                                            style={{
                                                ...provided.draggableProps.style,
                                                cursor: 'grab'
                                            }}
                                        >
                                            <div className="flex items-start">
                                                <span className="mr-4 text-gray-500">
                                                    {index + 1}.
                                                </span>
                                                <p>{paragraph.text}</p>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

const ReorderParagraph = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ orderedParagraphs: [], isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'Incomplete Answer',
                text: 'Please reorder the paragraphs before submitting.',
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

export default ReorderParagraph; 