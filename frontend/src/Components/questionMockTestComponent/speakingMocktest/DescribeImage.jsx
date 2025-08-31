import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';
import defaultImage from '../../../assets/image/graphs-3-01.webp';
import { useSelector, useDispatch } from 'react-redux';
import { setQuestionImage } from '../../../reducer/describeImageReducer';

// Import images directly
import bbc from '../../../assets/image/describe_image/bbc.png';
import chapter from '../../../assets/image/describe_image/chapter.png';
import course from '../../../assets/image/describe_image/course.png';
import destinationCountries from '../../../assets/image/describe_image/destination_countries.png';
import fuel from '../../../assets/image/describe_image/fuel.png';
import game from '../../../assets/image/describe_image/game.png';
import loggingSystem from '../../../assets/image/describe_image/logging_system.png';
import smartphone from '../../../assets/image/describe_image/smartphone.png';
import spendingChart from '../../../assets/image/describe_image/Spending-chart-2016.png';
import stub from '../../../assets/image/describe_image/stub.png';

// Define images array - we'll use this temporarily until API integration is complete
const TEMP_IMAGES = [
    { id: 1, imageUrl: bbc, title: 'BBC Chart' },
    { id: 2, imageUrl: chapter, title: 'Chapter Information' },
    { id: 3, imageUrl: course, title: 'Course Details' },
    { id: 4, imageUrl: destinationCountries, title: 'Destination Countries' },
    { id: 5, imageUrl: fuel, title: 'Fuel Consumption' },
    { id: 6, imageUrl: game, title: 'Game Statistics' },
    { id: 7, imageUrl: loggingSystem, title: 'Logging System' },
    { id: 8, imageUrl: smartphone, title: 'Smartphone Usage' },
    { id: 9, imageUrl: spendingChart, title: 'Spending Chart 2016' },
    { id: 10, imageUrl: stub, title: 'Data Analysis' }
];

const RecordingBox = ({ prepTime, recordingTime, status }) => {
    const prepTimeInitial = 25;
    const recordingTimeInitial = 40;
    
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

const Question = ({ data, prepTime, recordingTime, status }) => (
    <div>
        <h2 className='font-bold'>
            Look at the image below. In 25 seconds, please describe what you see in the image. You will have 40 seconds to speak.
        </h2>
        <img 
            src={data?.imageUrl || defaultImage} 
            alt={data?.title || "PTE Speaking Question"} 
            width='350px' 
            height='auto' 
            style={{margin:'20px 0'}}
            onError={(e) => {
                console.error('Image failed to load:', data?.imageUrl);
                e.target.src = defaultImage;
            }}
        />
        <RecordingBox 
            prepTime={prepTime}
            recordingTime={recordingTime} 
            status={status}
        />
    </div>
);

const DescribeImage = ({ onNext, updateProgress }) => {
    const dispatch = useDispatch();
    const [questionIndex, setQuestionIndex] = useState(0);
    const [prepTime, setPrepTime] = useState(25);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState("Preparation Time: 25 seconds left");
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const totalQuestions = 10;
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    // Get current image from Redux store
    const questionImages = useSelector(state => state.describeImage.questionImages);
    const currentImage = questionImages[questionIndex] || TEMP_IMAGES[questionIndex] || { imageUrl: defaultImage, title: 'PTE Speaking Question' };
    
    useEffect(() => {
        // If image doesn't exist in store for this question, set it from our temporary array
        if (!questionImages[questionIndex]) {
            const imageData = TEMP_IMAGES[questionIndex];
            dispatch(setQuestionImage(questionIndex, {
                imageUrl: imageData.imageUrl,
                title: imageData.title
            }));
        }

        // Reset states for new question
        setPrepTime(25);
        setRecordingTime(0);
        setHasStartedRecording(false);
        setRecording(false);
        setRecordedBlob(null);
        setStatus(`Preparation Time: 25 seconds left`);
        
        console.log('Question changed to:', questionIndex + 1, 'Image:', TEMP_IMAGES[questionIndex].title);
    }, [questionIndex, dispatch, questionImages]);
    
    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, updateProgress]);

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
                setRecordedBlob(audioBlob);
            };
            
            mediaRecorder.start();
            setRecording(true);
            setHasStartedRecording(true);
            setRecordingTime(40);
        } catch (error) {
            console.error('Recording error:', error);
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

    const handleNextQuestion = () => {
        if (recording) {
            stopRecording();
        }
        
        setRecording(false);
        setHasStartedRecording(false);
        
        if (questionIndex < totalQuestions - 1) {
            setQuestionIndex((prev) => prev + 1);
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

    return (
        <>
            <div className="speaking-wrapper container">
                <h1 className="section-title">Speaking - Describe Image</h1>
                <div className="mock-question-container">
                    <div className="question">
                        <Question 
                            data={currentImage}
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

export default DescribeImage; 