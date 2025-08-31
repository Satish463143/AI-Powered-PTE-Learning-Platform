import React, { useState, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Question = ({ data, onAnswerChange }) => {
    const [answer, setAnswer] = useState('');
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const audioRef = useRef(null);

    const playAudio = () => {
        if (!isAudioPlaying && data?.question?.audioUrl) {
            audioRef.current = new Audio(data.question.audioUrl);
            audioRef.current.onended = () => {
                setIsAudioPlaying(false);
            };
            audioRef.current.play();
            setIsAudioPlaying(true);
        } else if (isAudioPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsAudioPlaying(false);
        }
    };

    const handleAnswerChange = (e) => {
        const newAnswer = e.target.value;
        setAnswer(newAnswer);
        onAnswerChange({
            text: newAnswer,
            isComplete: newAnswer.trim().length > 0
        });
    };

    return (
        <div className="listening-question">
            <h2 className="font-bold mb-4">Write from Dictation</h2>
            
            <div className="audio-container p-6 bg-white rounded-lg shadow-sm mb-6">
                <button
                    onClick={playAudio}
                    className="audio-btn"
                    style={{
                        padding: '12px 24px',
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
                    {isAudioPlaying ? <FaPause /> : <FaPlay />}
                    {isAudioPlaying ? 'Pause Audio' : 'Play Audio'}
                </button>
            </div>

            <div className="answer-container p-6 bg-white rounded-lg shadow-sm">
                <div className="instructions mb-4 text-gray-600">
                    Listen to the audio and type what you hear.
                </div>
                <textarea
                    value={answer}
                    onChange={handleAnswerChange}
                    placeholder="Type your answer here..."
                    className="w-full h-32 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
            </div>
        </div>
    );
};

const WriteFromDictation = ({ data, onSubmit, isLoading }) => {
    const [answer, setAnswer] = useState({ text: '', isComplete: false });

    const handleAnswerChange = (newAnswer) => {
        setAnswer(newAnswer);
    };

    const handleSubmit = async () => {
        if (!answer.isComplete) {
            await Swal.fire({
                title: 'No Answer',
                text: 'Please write your answer before submitting.',
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

export default WriteFromDictation; 