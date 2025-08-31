import React, { useState } from 'react';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [dropdownStates, setDropdownStates] = useState({});

    const handleDropdownToggle = (blankId) => {
        setDropdownStates(prev => ({
            ...prev,
            [blankId]: !prev[blankId]
        }));
    };

    const handleOptionSelect = (blankId, option) => {
        const newAnswers = {
            ...selectedAnswers,
            [blankId]: option
        };
        setSelectedAnswers(newAnswers);
        setDropdownStates(prev => ({
            ...prev,
            [blankId]: false
        }));

        // Check if all blanks are filled
        const allBlanksFilled = data?.question?.blanks?.every(
            blank => newAnswers[blank.id] !== undefined
        );

        onAnswerChange({
            answers: newAnswers,
            isComplete: allBlanksFilled
        });
    };

    const renderText = () => {
        if (!data?.question?.text || !data?.question?.blanks) return null;

        let text = data.question.text;
        const blanks = data.question.blanks;

        // Sort blanks by position to replace from end to start
        const sortedBlanks = [...blanks].sort((a, b) => b.position - a.position);

        // Replace each blank position with a dropdown
        sortedBlanks.forEach(blank => {
            const dropdown = (
                <div className="inline-block relative min-w-[120px]">
                    <button
                        onClick={() => handleDropdownToggle(blank.id)}
                        className={`min-w-[120px] px-4 py-2 text-left bg-white border rounded-md ${
                            selectedAnswers[blank.id] ? 'text-black' : 'text-gray-400'
                        }`}
                    >
                        {selectedAnswers[blank.id] || 'Select answer'}
                    </button>
                    {dropdownStates[blank.id] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                            {blank.options.map((option, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleOptionSelect(blank.id, option)}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );

            text = text.replace(`[BLANK${blank.id}]`, dropdown);
        });

        return text;
    };

    return (
        <div className="reading-question">
            <h2 className="font-bold mb-4">Fill in the Blanks (Reading & Writing)</h2>
            
            <div className="text-container p-6 bg-white rounded-lg shadow-sm mb-6">
                <div className="text-content text-lg leading-relaxed">
                    {renderText()}
                </div>
            </div>
        </div>
    );
};

const FillInTheBlanksReadingWriting = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ answers: {}, isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'Incomplete Answer',
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

export default FillInTheBlanksReadingWriting; 