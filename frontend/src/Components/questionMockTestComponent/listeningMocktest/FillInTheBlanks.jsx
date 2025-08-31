import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [answers, setAnswers] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (data?.question) {
            setAnswers(Array(data.question.blanksCount || 2).fill(''));
        }
    }, [data]);

    useEffect(() => {
        // Send answer data to parent whenever answers change
        if (onAnswerChange) {
            onAnswerChange({
                answers,
                isComplete: answers.every(answer => answer.trim() !== '')
            });
        }
    }, [answers, onAnswerChange]);

    const handleInputChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handlePlayPause = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnd = () => {
        setIsPlaying(false);
    };

    return (
        <div className="listening-question">
            <h2 className="font-bold mb-4">
                Listen to the audio and fill in the blanks with the words you hear.
            </h2>

            <div className="audio-player mb-6">
                <audio
                    ref={audioRef}
                    src={data?.question?.audioUrl}
                    onEnded={handleAudioEnd}
                />
                <button
                    onClick={handlePlayPause}
                    className="play-button"
                    style={{
                        padding: '10px 20px',
                        background: '#2daef5',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                    {isPlaying ? 'Pause' : 'Play'} Audio
                </button>
            </div>

            <div className="transcript-container" style={{ margin: '20px 0' }}>
                {data?.question?.transcript.map((part, index) => {
                    if (part === '__') {
                        const blankIndex = data.question.transcript.slice(0, index).filter(p => p === '__').length;
                        return (
                            <input
                                key={`blank-${blankIndex}`}
                                type="text"
                                value={answers[blankIndex] || ''}
                                onChange={(e) => handleInputChange(blankIndex, e.target.value)}
                                style={{
                                    margin: '0 8px',
                                    padding: '4px 8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    minWidth: '120px'
                                }}
                                placeholder="Type your answer"
                            />
                        );
                    }
                    return <span key={`text-${index}`}>{part} </span>;
                })}
            </div>
        </div>
    );
};

const FillInTheBlanksListening = ({ data, onSubmit, isLoading }) => {
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
            <div className="listening-wrapper container">
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

export default FillInTheBlanksListening; 