import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useStartMockTestMutation } from '../../../api/mockTest.api';

const RecordingBox = ({ prepTime, recordingTime, status }) => {
    const prepTimeInitial = 5; 
    const recordingTimeInitial = 35;
    
    const calculateProgress = () => {
        if (prepTime > 0) {
        return `${((prepTimeInitial - prepTime) / prepTimeInitial) * 100}%`;
        } else if (recordingTime > 0) {
        return `${((recordingTimeInitial - recordingTime) / recordingTimeInitial) * 100}%`;
        } else {
        return '100%';
        }
    };

    return (
        <div className="recording_aboutMe">
        <p className="record-title">Recorded Answer</p>
        <h4 className="status-label">Current Status</h4>
        <h3 className={`status-text ${prepTime > 0 ? 'preparing' : 'recording'}`}>
            {status}
        </h3>
        <div className="progress-bar-container">
            <div 
            className={`progress-bar-fill ${prepTime > 0 ? 'preparing' : 'recording'}`}
            style={{ width: calculateProgress() }}
            ></div>
        </div>
        {recordingTime > 0 && prepTime === 0 && (
            <div className="recording-indicator">
            <div className="recording-dot"></div>
            <span>Recording in progress</span>
            </div>
        )}
        </div>
    );
};

const Question = ({ number, data, prepTime, recordingTime, status, isLoading }) => {
    if (!data?.paragraph) {
        return (
            <div className="loading-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div className="spinner"></div>
                <h2>Loading question...</h2>
                <p>Please wait</p>
            </div>
        );
    }

    return(
        <div>
            <h2 className='font-bold'>
                Look at the text below. In 40 seconds, you must read this text aloud as naturally as possible. You have 35 seconds to read aloud.
            </h2>
            <RecordingBox 
                prepTime={prepTime} 
                recordingTime={recordingTime} 
                status={status}
            />
            <p style={{marginTop: '20px', lineHeight: '1.6', fontSize: '1.1em'}}>{data.paragraph}</p>
        </div>
    )
};

const ReadAloud = ({ onNext, updateProgress, questions: initialQuestions, isGeneratingQuestions }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState(initialQuestions || []);
    const [prepTime, setPrepTime] = useState(5); 
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState("Preparation Time: 40 seconds left");
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const totalQuestions = 7;
    
    const [startTest] = useStartMockTestMutation();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        setPrepTime(5); // Reset to 40 seconds
        setRecordingTime(0);
        setHasStartedRecording(false);
        setRecording(false);
        setStatus(`Preparation Time: 40 seconds left`);
    }, [questionIndex]);
    
    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, updateProgress, totalQuestions]);

    useEffect(() => {
        let timer;
        
        if (prepTime > 0) {
            setStatus(`Preparation Time: ${prepTime} seconds left`);
            timer = setTimeout(() => {
                setPrepTime(prev => prev - 1);
            }, 1000);
        } else if (recordingTime > 0) {
            setStatus(`Recording Now: ${recordingTime} seconds left`);
            timer = setTimeout(() => {
                setRecordingTime(prev => prev - 1);
            }, 1000);
        } else if (recordingTime === 0 && hasStartedRecording) {
            setStatus("Recording Completed");
            stopRecording();
            setTimeout(() => {
                showTimeUpAlert();
            }, 500);
        }
        
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [prepTime, recordingTime, hasStartedRecording]);
    
    useEffect(() => {
        if (prepTime === 0 && !hasStartedRecording) {
            startRecording();
        }
    }, [prepTime, hasStartedRecording]);
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                new Blob(audioChunksRef.current, { type: 'audio/wav' });
            };
            
            mediaRecorder.start();
            setRecording(true);
            setHasStartedRecording(true);
            setRecordingTime(35);
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Failed to start recording. Please check your microphone permissions.",
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setRecording(false);
        }
    };

    const showTimeUpAlert = () => {
        Swal.fire({
            title: "Time's Up",
            text: `Please click "Next" to go to next question`,
            icon: 'warning',
            confirmButtonText: 'Next',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                handleNextQuestion();
            }
        });
    };

    const handleNextQuestion = async () => {
        if (recording) {
            stopRecording();
        }
        
        setRecording(false);
        setHasStartedRecording(false);
        
        if (questionIndex < totalQuestions - 1) {
            setQuestionIndex(prev => prev + 1);
        } else {
            onNext();
        }
    };

    const handleNextButtonClick = () => {
        if (prepTime > 0) {
            Swal.fire({
                title: "Wait!",
                text: "Please complete your preparation time before proceeding to the next question.",
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        if (hasStartedRecording) {
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
        } else {
            handleNextQuestion();
        }
    };

    // Show loading state if no questions available
    if (!questions || questions.length === 0) {
        return (
            <div className="loading-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div className="spinner"></div>
                <h2>Loading questions...</h2>
                <p>Please wait</p>
            </div>
        );
    }

    return (
        <>
            <div className="speaking-wrapper container">
                <div className="mock-question-container">
                    <div className="question">
                        <Question 
                            number={questionIndex + 1}
                            data={questions[questionIndex]}
                            prepTime={prepTime}
                            recordingTime={recordingTime}
                            status={status}
                            isLoading={isLoading}
                        />
                    </div>
                </div>
            </div>
            <div className='next_button'>
                <button 
                    onClick={handleNextButtonClick} 
                    className='primary-btn'
                    disabled={prepTime > 0}
                >
                    Next
                </button>
            </div>
        </>
    );
}

export default ReadAloud;