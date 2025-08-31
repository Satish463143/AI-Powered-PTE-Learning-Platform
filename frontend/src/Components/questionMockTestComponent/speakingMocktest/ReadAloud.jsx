import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';

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

const Question = ({ number, text, prepTime, recordingTime, status }) => (
    <div>
        <h2 className='font-bold'>
            Look at the text below. In 5 seconds, you must read this text aloud as naturally as possible. You have 35 seconds to read aloud.
        </h2>
        <RecordingBox 
            prepTime={prepTime}
            recordingTime={recordingTime} 
            status={status}
        />
        <p style={{
            marginTop: '20px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%'
        }}>
            {text}
        </p>
    </div>
);

const ReadAloud = ({ data, onSubmit }) => {
    const [prepTime, setPrepTime] = useState(5);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState("Preparation Time: 5 seconds left");
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [questionText, setQuestionText] = useState('');
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    useEffect(() => {
        // Reset state when new question data is received
        if (data?.question) {
            setPrepTime(5);
            setRecordingTime(0);
            setHasStartedRecording(false);
            setRecording(false);
            setStatus(`Preparation Time: 5 seconds left`);
            setQuestionText(data.question.text || data.question.paragraph || '');
        }
    }, [data]);

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
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                if (onSubmit) {
                    onSubmit({ audioBlob });
                }
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
            text: `Your recording has been submitted`,
            icon: 'success',
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            allowEscapeKey: false
        });
    };

    const handleNextButtonClick = () => {
        if (prepTime > 0) {
            Swal.fire({
                title: "Wait!",
                text: "Please complete your preparation time before proceeding.",
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        if (hasStartedRecording && recordingTime > 0) {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to submit your recording now?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.isConfirmed) {
                    stopRecording();
                }
            });
        }
    };

    return (
        <>
            <div className="speaking-wrapper container">
                <h1 className="section-title">Speaking - Read Aloud</h1>
                <div className="mock-question-container">
                    <div className="question">
                        <Question 
                            text={questionText}
                            prepTime={prepTime} 
                            recordingTime={recordingTime} 
                            status={status}
                        />
                    </div>
                </div>
            </div>
            <div className='next_button'>
                <button onClick={handleNextButtonClick} className='primary-btn'>
                    Next
                </button>
            </div>
        </>
    );
};

export default ReadAloud; 