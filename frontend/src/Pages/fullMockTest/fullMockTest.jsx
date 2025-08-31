import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SetupContent from '../../Components/fullMockTestComponent/setUpContent';
import ReadingComponent from '../../Components/fullMockTestComponent/readingComponent/readingComponent';
import ListeningComponent from '../../Components/fullMockTestComponent/listeningComponent/listeningComponent';
import BreakScreen from '../../Components/fullMockTestComponent/BreakScreen';
import FinalSaveScreen from '../../Components/fullMockTestComponent/FinalSaveScreen';
import AboutMe from '../../Components/fullMockTestComponent/aboutMe';
import Writing from '../../Components/fullMockTestComponent/writing';
import Writing_2 from '../../Components/fullMockTestComponent/writing_2';
import Writing_3 from '../../Components/fullMockTestComponent/writing_3';
import Writing_4 from '../../Components/fullMockTestComponent/writing_4';
import StartTest from '../../Components/fullMockTestComponent/startTest';
import Listening_1 from '../../Components/fullMockTestComponent/listening_1';
import Listening_2 from '../../Components/fullMockTestComponent/listening_2';
import SpeakingComponent from '../../Components/fullMockTestComponent/speakingComponent/speakingComponent';
import './fullMockTest.css';
import logo from '../../assets/image/logo.png';
import { FaArrowAltCircleDown, FaClock } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useStartMockTestMutation } from '../../api/mockTest.api';
import { useMeQuery } from '../../api/auth.api';


const steps = [  
  'setup',
  'aboutMe',
  'startTest',
  'speaking',
  'writing',
  'writing_2',
  'writing_3',
  'writing_4',
  'break',
  'reading',
  'listening_1',  
  'listening_2', 
  'listening',
  'save',
];

// Define time limits for each section in minutes
const sectionTimes = {
  speaking: 30,
  aboutMe: 55/60, // in minutes (55 seconds)
  startTest: 2,
  writing: 10,
  writing_2: 10,
  writing_3: 20,
  writing_4: 20,
  reading: 40,
  listening_1: 10,
  listening_2: 10,
  listening: 30,
  break: 10
};



// Define sections that should display question progress
const questionSections = ['speaking', 'writing', 'writing_2', 'writing_3', 'writing_4', 'reading', 'listening', 'listening_1', 'listening_2'];

const FullMockTest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: loggedInUser, isLoading: authLoading } = useMeQuery();
  const [stepIndex, setStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionProgress, setQuestionProgress] = useState({ current: 0, total: 0 });
  const [timerActive, setTimerActive] = useState(false);
  const [mockTestId, setMockTestId] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [startTest, { isLoading }] = useStartMockTestMutation();
  
  const currentStep = steps[stepIndex];
  
  // Extract mockTestId from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (id) {
      setMockTestId(id);
    }
  }, [location]);

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
          navigate('/login');
        } else {
          navigate('/');
        }
      });
    }
  }, [loggedInUser, authLoading, navigate]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (timerActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timerActive, timeRemaining]);
  
  // Set up timer when section changes
  useEffect(() => {
    if (sectionTimes[currentStep]) {
      setTimeRemaining(sectionTimes[currentStep] * 60); // Convert to seconds
      setTimerActive(true);
      
      // Only show question progress for question-based sections
      if (!questionSections.includes(currentStep)) {
        setQuestionProgress({ current: 0, total: 0 });
      }
    } else {
      setTimerActive(false);
      setTimeRemaining(0);
      setQuestionProgress({ current: 0, total: 0 });
    }
  }, [currentStep]);

  // Initialize test only if needed
  useEffect(() => {
    const initializeTest = async () => {
      try {
        // Check URL for existing test ID
        const searchParams = new URLSearchParams(location.search);
        const urlId = searchParams.get('id');
        
        // Only initialize if we don't have an ID from URL or state
        if (!urlId && !mockTestId) {
          const result = await startTest({
            actionType: 'next',
            question: null,
            userAnswer: null
          }).unwrap();
          
          if (result?.mockTestId) {
            setMockTestId(result.mockTestId);
            // Update URL with new test ID
            const newUrl = `${window.location.pathname}?id=${result.mockTestId}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
          } else {
            throw new Error('No mockTestId received from server');
          }
        } else if (urlId && !mockTestId) {
          // If we have a URL ID but no state ID, set it
          setMockTestId(urlId);
        }
      } catch (err) {
        console.error('Failed to start test:', err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to initialize the test. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => {
          // Redirect to home page on error
          navigate('/');
        });
      }
    };

    if (!authLoading && loggedInUser) {
      initializeTest();
    }
  }, [location.search, authLoading, loggedInUser]); // Add dependencies

  const next = () => {
    if (stepIndex < steps.length - 1) setStepIndex((prev) => prev + 1);
  };
  
  const updateQuestionProgress = useCallback((current, total) => {
    if (current <= total) {  // Add validation
      setQuestionProgress({ current, total });
    }
  }, []); // Empty dependency array since this function doesn't depend on any props or state
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle time up alert
  useEffect(() => {
    if (timeRemaining === 0 && timerActive && sectionTimes[currentStep]) {
      setTimerActive(false); // Stop the timer
      Swal.fire({
        title: "Time's Up!",
        text: `Please click "Next" to go to the next section`,
        icon: 'warning',
        confirmButtonText: 'Next',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then((result) => {
        if (result.isConfirmed) {
          next();
        }
      });
    }
  }, [timeRemaining, timerActive, currentStep]);

  const handleStartTestComplete = (questionData) => {
    setQuestions(questionData);
    next();
  };

  const updateQuestions = (newQuestions) => {
    setQuestions(prevQuestions => {
      // If prevQuestions is null, initialize with empty array
      const currentQuestions = prevQuestions || [];
      // Add new questions, replacing any existing ones of the same type
      const filteredQuestions = currentQuestions.filter(q => 
        !newQuestions.some(newQ => newQ.questionType === q.questionType)
      );
      return [...filteredQuestions, ...newQuestions];
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'listening_1':
        return <Listening_1 onNext={next} updateProgress={updateQuestionProgress} />;
      case 'listening_2':
        return <Listening_2 onNext={next} updateProgress={updateQuestionProgress} />;
      case 'listening':
        return <ListeningComponent onNext={next} updateProgress={updateQuestionProgress} />;
      case 'setup':
        return <SetupContent onNext={next} />;
      case 'aboutMe':
        return <AboutMe onNext={next} />;
      case 'startTest':
        return <StartTest onNext={handleStartTestComplete} />;
      case 'speaking':
        return <SpeakingComponent 
          onNext={next} 
          updateProgress={updateQuestionProgress}
          questions={questions}
          onQuestionsGenerated={updateQuestions}
        />;
      case 'writing':
        return <Writing 
          onNext={next} 
          updateProgress={updateQuestionProgress} 
          questions={questions?.filter(q => q.questionType === 'summarizeWrittenText')}
          onQuestionsGenerated={updateQuestions}
        />;
      case 'writing_2':
        return <Writing_2 
          onNext={next} 
          updateProgress={updateQuestionProgress}
          questions={questions?.filter(q => q.questionType === 'summarizeWrittenText')}
          onQuestionsGenerated={updateQuestions}
        />;
      case 'writing_3':
        return <Writing_3 
          onNext={next} 
          updateProgress={updateQuestionProgress}
          questions={questions?.filter(q => q.questionType === 'writeEssay')}
          onQuestionsGenerated={updateQuestions}
        />;
      case 'writing_4':
        return <Writing_4 
          onNext={next} 
          updateProgress={updateQuestionProgress}
          questions={questions?.filter(q => q.questionType === 'writeEssay')}
          onQuestionsGenerated={updateQuestions}
        />;
      case 'break':
        return <BreakScreen onNext={next} onSkip={next} />;
      case 'reading':
        return <ReadingComponent onNext={next} updateProgress={updateQuestionProgress} />;
      case 'save':
        return <FinalSaveScreen />;
      default:
        return null;
    }
  };

  // Check if the current section has a time limit
  const hasTime = timeRemaining > 0;
  
  // Check if the current section has questions
  const hasQuestions = questionSections.includes(currentStep) && questionProgress.total > 0;

  // Show loading state while checking authentication or loading test
  if (authLoading || isLoading) {
    return <div>Loading...</div>;
  }

  // Don't render the page content if user is not logged in
  if (!loggedInUser) {
    return null;
  }

  return (
    <>
      <div className="full_mockTest_navbar">
        <div className="container">
          <div className="full_mockTest_menu">
            <div className="mockTest_navbar_left">
              <img src={logo} alt="PTE Sathy logo" width='100px' height='auto'/>
            </div>
            <div className="mockTest_navbar_right">
              {hasTime && (
                <div className="full_mockTest_time" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                 <FaClock /> {formatTime(timeRemaining)} / {formatTime(sectionTimes[currentStep] * 60)}
                </div>
              )}
              {hasQuestions && (
                <div className="total_question" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <FaArrowAltCircleDown/>{`${questionProgress.current} of ${questionProgress.total}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="step-wrapper question">
        {renderStep()}
      </div>
    </>
  );
};

export default FullMockTest;
