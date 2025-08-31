import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReadingMocktest from '../../Components/sectionMockTestComponent/readingMocktest/readingMocktest'
import WritingMocktest from '../../Components/sectionMockTestComponent/writingMocktest/writingMocktest'
import ListeningMocktest from '../../Components/sectionMockTestComponent/listeningMocktest/listeningMocktest'
import SpeakingMocktest from '../../Components/sectionMockTestComponent/speakingMocktest/speakingMocktest'
import SetupContent from '../../Components/sectionMockTestComponent/setUpContent'
import logo from '../../assets/image/logo.png';
import { FaArrowAltCircleDown, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useMeQuery } from '../../api/auth.api'

const SectionMocktest = () => {
    const { section } = useParams()
    const navigate = useNavigate()
    const { data: loggedInUser, isLoading: authLoading } = useMeQuery()
    
    const [stepIndex, setStepIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [questionProgress, setQuestionProgress] = useState({ current: 1, total: 1 });

    const steps = [
        'setUp',
        'section'
    ]
    
    const currentStep = steps[stepIndex];
    
    // Section times in minutes
    const sectionTimes = {
        reading: 73,
        writing: 105,
        listening: 63,
        speaking: 35
    }

    // Section-specific setup data for the table
    const sectionSetupData = {
        reading: {
            timeAllowed: "73 minutes",
            questionTypes: [
                "Read Aloud ",
                "Summarize Written Text",
                "Reading & Writing: Fill in the Blanks ",
                "Multiple Choice (Multiple)",
                "Re-order Paragraphs ", 
                "Reading: Fill in the Blanks ",
                "Highlight Correct Summary",
                "Multiple Choice (Single) ",
                "Highlight Incorrect Words",                         
            ]
        },
        writing: {
            timeAllowed: "105 minutes",
            questionTypes: [
                "Summarize Written Text ",
                "Write Essay ",
                "Reading & Writing：Fill in the blanks",
                "Summarize Spoken Text ",
                "Fill in the Blanks",
                "Write from Dictation"
            ]
        },
        listening: {
            timeAllowed: "63 minutes", 
            questionTypes: [
                "Repeat Sentence ",
                "Re-tell Lecture",	
                "Answer Short Question",
                "Summarize Spoken Text",
                "Multiple Choice (Multiple)",
                "Fill in the Blanks",
                "Multiple Choice (Single) ",
                "Highlight Correct Summary", 
                "Highlight Incorrect Words",
                "Write from Dictation",               
            ]
        },
        speaking: {
            timeAllowed: "35 minutes",
            questionTypes: [
                "Read Aloud ",
                "Repeat Sentence", 
                "Describe Image",
                "Re-tell Lecture",
                "Answer Short Question"
            ]
        }
    }

    // Get the section key (lowercase) from the URL parameter
    const sectionKey = section?.toLowerCase();

    // Initialize timer when moving to section step
    useEffect(() => {
        if (currentStep === 'section' && sectionKey && sectionTimes[sectionKey]) {
            setTimeRemaining(sectionTimes[sectionKey] * 60); // Convert to seconds
            setTimerActive(true);
        }
    }, [currentStep, sectionKey]);

    // Timer countdown
    useEffect(() => {
        let interval = null;
        if (timerActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(time => time - 1);
            }, 1000);
        } else if (timeRemaining === 0 && timerActive) {
            setTimerActive(false);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeRemaining]);

    // Handle time up alert
    useEffect(() => {
        if (timeRemaining === 0 && timerActive && sectionTimes[sectionKey]) {
            setTimerActive(false);
            Swal.fire({
                title: "Time's Up!",
                text: `The ${section} section time has ended.`,
                icon: 'warning',
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        }
    }, [timeRemaining, timerActive, sectionKey, section]);

    // Format time display in MM:SS format
    const formatTime = (seconds) => {
        const totalMinutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Handle next step (from setup to section)
    const handleNext = () => {
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        }
    };

    // Update question progress from child components
    const updateProgress = (current, total) => {
        setQuestionProgress({ current, total });
    };

    const renderSection = () => {
        if (section === 'Reading') {
            return <ReadingMocktest updateProgress={updateProgress} />
        } else if (section === 'Writing') {
            return <WritingMocktest updateProgress={updateProgress} />
        } else if (section === 'Listening') {
            return <ListeningMocktest updateProgress={updateProgress} />
        } else if (section === 'Speaking') {
            return <SpeakingMocktest updateProgress={updateProgress} />
        }
        return <div>Section not found</div>
    }

    const renderStep = () => {
        switch (currentStep) {
            case 'setUp':
                return <SetupContent onNext={handleNext} sectionSetupData={sectionSetupData[section.toLowerCase()]} />
            case 'section':
                return renderSection()
            default:
                return <div>Step not found</div>
        }
    }

    // Determine what to show in navbar
    const hasTime = currentStep === 'section' && sectionKey && sectionTimes[sectionKey];
    const hasQuestions = currentStep === 'section';

    // Check authentication
    useEffect(() => {
        if (!authLoading && !loggedInUser) {
            Swal.fire({
                title: 'Please Login to continue',
                text: 'You need to be logged in to access this page',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Go to Home',
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login')
                } else {
                    navigate('/')
                }
            })
        }
    }, [loggedInUser, authLoading, navigate])

    // Show loading state while checking authentication
    if (authLoading) {
        return <div>Loading...</div>
    }

    // Don't render the page content if user is not logged in
    if (!loggedInUser) {
        return null
    }

    return (
        <>
            <div className="full_mockTest_navbar">
                <div className="container">
                    <div className="full_mockTest_menu">
                        <div className="mockTest_navbar_left">
                            <img src={logo} alt="PTE Sathy logo" width='100px' height='auto' />
                        </div>
                        <div className="mockTest_navbar_right">
                            {hasTime && (
                                <div className="full_mockTest_time" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaClock /> {formatTime(timeRemaining)} / {formatTime(sectionTimes[sectionKey] * 60)}
                                </div>
                            )}
                            {hasQuestions && (
                                <div className="total_question" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaArrowAltCircleDown />{`${questionProgress.current} of ${questionProgress.total}`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {renderStep()}
            </div>
        </>
    )
}

export default SectionMocktest