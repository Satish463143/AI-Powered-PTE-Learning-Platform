import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [answer, setAnswer] = useState('');
    const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
    const minWords = 5;
    const maxWords = 75;

    const handleChange = (e) => {
        const newAnswer = e.target.value;
        setAnswer(newAnswer);
        onAnswerChange({
            text: newAnswer,
            isComplete: newAnswer.trim().length > 0 && 
                       wordCount >= minWords && 
                       wordCount <= maxWords
        });
    };

    return (
        <div className="writing-question">
            <h2 className="font-bold mb-4">Summarize Written Text</h2>
            
            <div className="text-container p-6 bg-white rounded-lg shadow-sm mb-6">
                <p className="text-lg leading-relaxed">
                    {data?.question?.text}
                </p>
            </div>

            <div className="answer-container">
                <textarea
                    value={answer}
                    onChange={handleChange}
                    placeholder="Write your summary here..."
                    className="w-full p-4 border rounded-lg min-h-[200px]"
                    style={{
                        resize: 'vertical'
                    }}
                />
                <div className="word-count mt-2 text-sm text-gray-600">
                    Words: {wordCount} / {maxWords} (Min: {minWords})
                </div>
                {wordCount > maxWords && (
                    <div className="error-message text-red-500 text-sm mt-1">
                        Please limit your response to {maxWords} words
                    </div>
                )}
                {wordCount < minWords && wordCount > 0 && (
                    <div className="error-message text-red-500 text-sm mt-1">
                        Please write at least {minWords} words
                    </div>
                )}
            </div>
        </div>
    );
};

const SummarizeWrittenText = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ text: '', isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'Incomplete Answer',
                text: 'Please complete your answer within the word limit before submitting.',
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
            <div className="writing-wrapper container">
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

export default SummarizeWrittenText; 