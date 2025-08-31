import React, { useRef, useState, useEffect } from 'react';
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'
import { useSaveAboutMeMutation } from '../../api/mockTest.api';



const AboutMe = ({ onNext }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [recording, setRecording] = useState(false);
    const [prepTime, setPrepTime] = useState(5);
    const [recordingTime, setRecordingTime] = useState(30);
    const [status, setStatus] = useState('Prepare to record');
    const [audioBlob, setAudioBlob] = useState(null);
    const [hasStartedRecording, setHasStartedRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [saveAudio, {isLoading:isSaving}] = useSaveAboutMeMutation()

    // Timer effect for preparation and recording
    useEffect(() => {
        let timer;
        
        if (prepTime > 0) {
            setStatus(`Preparing: ${prepTime} seconds left`);
            timer = setTimeout(() => {
                setPrepTime(prepTime - 1);
            }, 1000);
        } else if (recordingTime > 0) {
            if (recordingTime === 30 && !recording) {
                startRecording();
            }
            setStatus(`Recording: ${recordingTime} seconds left`);
            timer = setTimeout(() => {
                setRecordingTime(recordingTime - 1);
            }, 1000);
        } else if (recordingTime === 0) {
            stopRecording();
            showTimeUpAlert();
        }
        
        return () => clearTimeout(timer);
    }, [prepTime, recordingTime]);
    
    // Request microphone access and start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorderRef.current.onstop = async() => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                
                // Create form data with proper filename
                const formData = new FormData();
                formData.append('file', audioBlob, 'recording.wav');  // Using .wav extension which is allowed by backend
                
                try {
                    await saveAudio(formData).unwrap();
                } catch (error) {
                    console.error('Error saving audio:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to save your recording. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
                
                // Store in sessionStorage
                saveRecording(audioBlob);
                
                // Stop all tracks of the stream
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorderRef.current.start();
            setRecording(true);
            setHasStartedRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatus("Error: Could not access microphone");
        }
    };
    
    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };
    
    // Save recording (to session storage or other state management)
    const saveRecording = (blob) => {
        // Create a URL for the blob
        const audioURL = URL.createObjectURL(blob);
        
        // Store reference to audio blob in sessionStorage (as URL string)
        sessionStorage.setItem('aboutMeRecording', audioURL);
        
    };
    
    // Show time's up alert
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
                onNext();
            }
        });
    };

    // Handle next step with validations
    const handleNextStep = () => {
        // During preparation time - don't allow proceeding
        if (prepTime > 0) {
            Swal.fire({
                title: "Wait!",
                text: "Please complete your answer before proceeding to the next section.",
                icon: 'warning',
                confirmButtonText: 'OK',
            });
            return;
        }
        
        // If recording has started, confirm before proceeding
        if (hasStartedRecording) {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to proceed to the next section?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.isConfirmed) {
                    // If still recording, stop it first
                    if (recording) {
                        stopRecording();
                    }
                    
                    // Proceed to next step or section
                    if (stepIndex < steps.length - 1) {
                        setStepIndex((prev) => prev + 1);
                    } else {
                        onNext(); // Move to next main section
                    }
                }
            });
        }
    };

    const steps = [ 
        <div>
            <h3 className='font-bold'>Read the prompt below. In 25 seconds, you must reply in your own words, as naturally and clearly as possible. You have 30 seconds to record your response. Your response will be sent together with your score report to the institutions selected by you.</h3>
            <p style={{marginTop: '20px'}}>Please Introduce yourself. For example, you could talk about one of the following:</p>
            <ul style={{listStyleType: 'disc', marginLeft: '20px', marginTop: '10px'}}>
                <li>Your interests</li>
                <li>Your plans for future study</li>
                <li>Why you want to study abroad</li>
                <li>Why you need to learn English</li>
                <li>Why you chose this test</li>
            </ul>
            <div className="recording_aboutMe">
                <p className="record-title">Recorded Answer</p>
                <h4 className="status-label">Current Status</h4>
                <h3 className={`status-text ${prepTime > 0 ? 'preparing' : 'recording'}`}>
                    {status}
                </h3>
                <div className="progress-bar-container">
                    <div 
                        className={`progress-bar-fill ${prepTime > 0 ? 'preparing' : 'recording'}`}
                        style={{
                            width: `${prepTime > 0 
                                ? ((25 - prepTime) / 25) * 100 
                                : ((30 - recordingTime) / 30) * 100}%`
                        }}
                    ></div>
                </div>
                {recording && (
                    <div className="recording-indicator">
                        <div className="recording-dot"></div>
                        <span>Recording in progress</span>
                    </div>
                )}
            </div>
        </div>
    ];

    return (
        <>
            <div className="speaking-wrapper container">
                <div className="mock-question-container">
                    <div  className="question">{steps[stepIndex]}</div>
                </div>
            </div>
            <div className='next_button'>
                <button onClick={handleNextStep} className='primary-btn'>
                    {stepIndex === steps.length - 1 ? 'Next Section' : isSaving?"Saving...":"Next"}
                </button>
            </div>
        </>
    );
};

export default AboutMe;