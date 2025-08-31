import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const handleAnswerSelect = (answerId) => {
        setSelectedAnswer(answerId);
        onAnswerChange({
            selectedAnswer: answerId,
            isComplete: true
        });
    };

    return (
        <div className="reading-question">
            <h2 className="font-bold mb-4">Multiple Choice (Single Answer)</h2>
            
            <div className="text-container p-6 bg-white rounded-lg shadow-sm mb-6">
                <p className="text-lg leading-relaxed mb-4">
                    {data?.question?.text}
                </p>
                <div className="question-prompt mb-4 font-medium">
                    {data?.question?.prompt}
                </div>
            </div>

            <div className="answers-container">
                {data?.question?.options?.map((option, index) => (
                    <div
                        key={option.id || index}
                        className="answer-option mb-4"
                    >
                        <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                checked={selectedAnswer === option.id}
                                onChange={() => handleAnswerSelect(option.id)}
                                className="mt-1 mr-3"
                            />
                            <span>{option.text}</span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MultipleChoiceSingle = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ selectedAnswer: null, isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'No Answer Selected',
                text: 'Please select an answer before submitting.',
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

export default MultipleChoiceSingle; 