import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [essay, setEssay] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const minWords = 200;
    const maxWords = 300;

    useEffect(() => {
        const words = essay.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        
        onAnswerChange({
            essay,
            wordCount: words.length,
            isComplete: words.length >= minWords && words.length <= maxWords
        });
    }, [essay, onAnswerChange]);

    return (
        <div className="writing-question">
            <h2 className="font-bold mb-4">Write an essay on the following topic:</h2>
            
            <div className="topic-container p-6 bg-white rounded-lg shadow-sm mb-6">
                <p className="text-lg font-medium">
                    {data?.question?.topic}
                </p>
                {data?.question?.description && (
                    <p className="text-gray-600 mt-2">
                        {data.question.description}
                    </p>
                )}
            </div>

            <div className="writing-container">
                <div className="word-count-info mb-3">
                    <span className={`font-medium ${wordCount < minWords || wordCount > maxWords ? 'text-red-500' : 'text-green-500'}`}>
                        Word Count: {wordCount} / {minWords}-{maxWords}
                    </span>
                </div>

                <textarea
                    value={essay}
                    onChange={(e) => setEssay(e.target.value)}
                    className="w-full p-4 border rounded-lg"
                    style={{
                        minHeight: '300px',
                        resize: 'vertical',
                        fontFamily: 'Arial, sans-serif',
                        lineHeight: '1.6'
                    }}
                    placeholder="Write your essay here..."
                />

                <div className="writing-guidelines mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-2">Guidelines:</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Write between {minWords}-{maxWords} words</li>
                        <li>Structure your essay with introduction, body paragraphs, and conclusion</li>
                        <li>Support your arguments with relevant examples</li>
                        <li>Check your grammar and spelling before submitting</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

const WriteEssay = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ essay: '', wordCount: 0, isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'Word Count Requirements',
                text: `Your essay must be between 200-300 words. Current count: ${answer.wordCount}`,
                icon: 'warning'
            });
            return;
        }

        await Swal.fire({
            title: 'Submit Essay?',
            text: 'Are you sure you want to submit your essay?',
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

export default WriteEssay; 