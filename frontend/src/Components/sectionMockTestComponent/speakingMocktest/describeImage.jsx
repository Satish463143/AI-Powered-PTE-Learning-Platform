import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import defaultImage from '../../../assets/image/graphs-3-01.webp'

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


const Question = ({ data, prepTime, recordingTime, status, }) => (
    <div>
      <h2 className='font-bold'>
        Look at the image below. In 25 seconds, please describe what you see in the image. You will have 40 seconds to speak.
      </h2>
      <img src={data? data.image : defaultImage} alt="PTE Speaking Question" width='350px' height='auto' style={{margin:'20px 0'}}/>
      <RecordingBox 
        prepTime={prepTime}
        recordingTime={recordingTime} 
        status={status}
      />
    </div>
  );

const DescribeImage = ({ onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [prepTime, setPrepTime] = useState(25);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(false);
    const [status, setStatus] = useState("Preparation Time: 25 seconds left");
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const totalQuestions = 3;
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    useEffect(() => {
        setPrepTime(25);
        setRecordingTime(0);
        setHasStartedRecording(false);
        setRecording(false);
        setStatus(`Preparation Time: 25 seconds left`);
    }, [questionIndex]);
    
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
                new Blob(audioChunksRef.current, { type: 'audio/wav' });
            };
            
            mediaRecorder.start();
            setRecording(true);
            setHasStartedRecording(true);
            setRecordingTime(40);
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
            <h1 className="section-title">Speaking - Read Aloud</h1>
            <div className="mock-question-container">
                <div className="question">
                    <Question 
                        number={questionIndex + 1}
                        data={null} 
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
}

export default DescribeImage