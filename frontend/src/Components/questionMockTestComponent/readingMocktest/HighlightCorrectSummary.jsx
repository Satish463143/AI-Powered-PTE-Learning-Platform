import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [selectedAnswer, setSelectedAnswer] = useState('');

    const handleRadioChange = (answer) => {
        setSelectedAnswer(answer);
        onAnswerChange({
            text: answer,
            isComplete: true
        });
    };

    return (
        <div>
            <h2 className="font-bold mb-4">Highlight Correct Summary</h2>
            
            <div className="text-container p-6 bg-white rounded-lg shadow-sm mb-6">
                <p className="text-lg leading-relaxed">
                    {data?.question?.text}
                </p>
            </div>

            <div className="answers-container mt-6">
                {data?.question?.options?.map((option, idx) => (
                    <div key={idx} className="mb-4">
                        <label className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedAnswer === option ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                        }`}>
                            <input
                                type="radio"
                                name="summary"
                                value={option}
                                checked={selectedAnswer === option}
                                onChange={() => handleRadioChange(option)}
                                className="mr-3"
                            />
                            <span>{option}</span>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HighlightCorrectSummary = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ text: '', isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'Incomplete Answer',
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

export default HighlightCorrectSummary; 