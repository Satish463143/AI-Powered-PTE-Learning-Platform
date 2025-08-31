import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FaArrowAltCircleDown, FaClock } from 'react-icons/fa';
import logo from '../../assets/image/logo.png';
import Swal from 'sweetalert2';
import { useStartMockTestMutation } from '../../api/mockTest.api';
import { useMeQuery } from '../../api/auth.api';
import './questionMockTest.css';

// Import Components
import ListeningMocktest from '../../Components/questionMockTestComponent/listeningMocktest/listeningMocktest';
import ReadingMocktest from '../../Components/questionMockTestComponent/readingMocktest/readingMocktest';
import SpeakingMocktest from '../../Components/questionMockTestComponent/speakingMocktest/speakingMocktest';
import WritingMocktest from '../../Components/questionMockTestComponent/writingMocktest/writingMocktest';
import SetupContent from '../../Components/questionMockTestComponent/setupContent/setupContent';

// Import config
import {
  sectionTimes,
  questionSetupData,
  sectionSequences,
  questionTypeMap
} from './questionMockTest.config';

// Section code mapping
const SECTION_CODES = {
  // Speaking section codes
  'RA': 'Speaking',  // Read Aloud
  'RS': 'Speaking',  // Repeat Sentence
  'DI': 'Speaking',  // Describe Image
  'RL': 'Speaking',  // Retell Lecture
  'ASQ': 'Speaking', // Answer Short Question

  // Writing section codes
  'WE': 'Writing',   // Write Essay
  'SWT': 'Writing',  // Summarize Written Text

  // Reading section codes
  'FIB-R': 'Reading',   // Fill in the Blanks (Reading)
  'MCM': 'Reading',     // Multiple Choice Multiple
  'RO': 'Reading',      // Reorder Paragraphs
  'FIB-RW': 'Reading',  // Fill in the Blanks (Reading & Writing)
  'MCS': 'Reading',     // Multiple Choice Single
  'HCS': 'Reading',     // Highlight Correct Summary

  // Listening section codes
  'SST': 'Listening',   // Summarize Spoken Text
  'FIB-L': 'Listening', // Fill in the Blanks (Listening)
  'HIW': 'Listening',   // Highlight Incorrect Words
  'WFD': 'Listening'    // Write from Dictation
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }


  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const QuestionMockTest = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mockTestId = searchParams.get('id');
  const mockTestType = searchParams.get('type') || 'question_set';
  const [startTest] = useStartMockTestMutation();
  const { data: loggedInUser, isLoading: authLoading } = useMeQuery();

  // Consolidate related state into objects to reduce re-renders
  const [testState, setTestState] = useState({
    stepIndex: 0,
    timeRemaining: 0,
    timerActive: false,
    currentQuestionType: null,
    questionProgress: { current: 1, total: 10 },
    loading: true,
    isTestInitialized: false
  });

  const steps = useMemo(() => ['setUp', 'question'], []);
  const currentStep = steps[testState.stepIndex];

  // Get the actual section name from the code if it exists
  const actualSection = useMemo(() => SECTION_CODES[section] || section, [section]);

  // Memoize callback functions
  const handleTimeUp = useCallback(async () => {
    await Swal.fire({
      title: "Time's Up!",
      text: `The time for this question has ended.`,
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    });
    handleNext();
  }, []);

  const handleNext = useCallback(() => {
    if (testState.stepIndex < steps.length - 1) {
      setTestState(prev => ({
        ...prev,
        stepIndex: prev.stepIndex + 1
      }));
    }
  }, [testState.stepIndex, steps.length]);

  const updateProgress = useCallback((current, total) => {
    setTestState(prev => ({
      ...prev,
      questionProgress: { current, total }
    }));
  }, []);

  // Initialize test
  useEffect(() => {
    const initializeTest = async () => {
      if (mockTestId && !testState.isTestInitialized && !authLoading && loggedInUser) {
        try {
          setTestState(prev => ({ ...prev, loading: true }));
          const response = await startTest({
            actionType: 'next',
            mockTestId: mockTestId,
            mockTestType: mockTestType,
            question: null,
            userAnswer: null
          }).unwrap();

          if (response?.message?.toLowerCase().includes('success') || 
              response?.message?.toLowerCase().includes('completed successfully')) {
            setTestState(prev => ({ 
              ...prev, 
              isTestInitialized: true,
              loading: false 
            }));
          } else {
            throw new Error(response?.message || 'Failed to initialize test');
          }
        } catch (error) {
          console.error('Error initializing test:', error);
          Swal.fire({
            title: 'Error',
            text: error.message || 'Failed to initialize test. Please try again.',
            icon: 'error'
          });
          setTestState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeTest();
  }, [mockTestId, mockTestType, authLoading, loggedInUser, testState.isTestInitialized, startTest]);

  // Initialize question type
  useEffect(() => {
    if (actualSection && testState.isTestInitialized) {
      const sectionLower = actualSection.toLowerCase();
      if (sectionSequences[sectionLower]) {
        const initialQuestionType = SECTION_CODES[section] ? section : sectionSequences[sectionLower].sequence[0];
        const totalQuestions = Object.values(sectionSequences[sectionLower].counts)
          .reduce((sum, count) => sum + count, 0);
        
        setTestState(prev => ({
          ...prev,
          currentQuestionType: initialQuestionType,
          questionProgress: { ...prev.questionProgress, total: totalQuestions }
        }));
      }
    }
  }, [actualSection, section, testState.isTestInitialized]);

  // Timer management - consolidated into a single effect
  useEffect(() => {
    let interval = null;

    // Initialize timer when moving to question step
    if (currentStep === 'question' && testState.currentQuestionType && sectionTimes[testState.currentQuestionType]) {
      setTestState(prev => ({
        ...prev,
        timeRemaining: sectionTimes[testState.currentQuestionType],
        timerActive: true
      }));
    }

    // Handle timer countdown
    if (testState.timerActive && testState.timeRemaining > 0) {
      interval = setInterval(() => {
        setTestState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (testState.timeRemaining === 0 && testState.timerActive) {
      setTestState(prev => ({ ...prev, timerActive: false }));
      handleTimeUp();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentStep, testState.currentQuestionType, testState.timerActive, testState.timeRemaining, handleTimeUp]);

  // Memoize formatTime function
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const renderQuestion = () => {
    if (testState.loading) {
      return <div className="loading">Loading...</div>;
    }

    // Use the actual section name for component selection
    switch (actualSection) {
      case 'Reading':
        return <ReadingMocktest 
          updateProgress={updateProgress}
          mockTestId={mockTestId}
          mockTestType={mockTestType}
          currentQuestionType={testState.currentQuestionType}
        />;
      case 'Writing':
        return <WritingMocktest 
          updateProgress={updateProgress}
          mockTestId={mockTestId}
          mockTestType={mockTestType}
          currentQuestionType={testState.currentQuestionType}
        />;
      case 'Listening':
        return <ListeningMocktest 
          updateProgress={updateProgress}
          mockTestId={mockTestId}
          mockTestType={mockTestType}
          currentQuestionType={testState.currentQuestionType}
        />;
      case 'Speaking':
        return <SpeakingMocktest 
          updateProgress={updateProgress}
          mockTestId={mockTestId}
          mockTestType={mockTestType}
          currentQuestionType={testState.currentQuestionType}
        />;
      default:
        return <div className="error">Section "{section}" not found. Please check the URL and try again.</div>;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'setUp':
        const setupData = {
          timeAllowed: questionSetupData[testState.currentQuestionType]?.timeAllowed || "Time varies",
          instructions: questionSetupData[testState.currentQuestionType]?.instructions || 
                       `Complete ${questionTypeMap[testState.currentQuestionType]?.displayName || testState.currentQuestionType} questions`,
          tips: questionSetupData[testState.currentQuestionType]?.tips || []
        };
        return <SetupContent onNext={handleNext} sectionSetupData={setupData} />;
      case 'question':
        return renderQuestion();
      default:
        return <div>Step not found</div>;
    }
  };

  // Authentication check
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

  if (authLoading || testState.loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!loggedInUser) {
    return null;
  }

  const hasTime = currentStep === 'question' && testState.timeRemaining > 0;
  const hasQuestions = currentStep === 'question';

  return (
    <ErrorBoundary>
      <div className="question-mocktest-wrapper">
        <div className="question-mocktest-navbar">
          <div className="container">
            <div className="question-mocktest-menu">
              <div className="mocktest-navbar-left">
                <img src={logo} alt="PTE Sathy logo" width='100px' height='auto' />
              </div>
              <div className="mocktest-navbar-right">
                {hasTime && (
                  <div className="mocktest-time">
                    <FaClock /> {formatTime(testState.timeRemaining)} / {formatTime(sectionTimes[testState.currentQuestionType])}
                  </div>
                )}
                {hasQuestions && (
                  <div className="question-progress">
                    <FaArrowAltCircleDown />
                    <span>Question {testState.questionProgress.current} of {testState.questionProgress.total}</span>
                    <span className="ml-4">Type: {questionTypeMap[testState.currentQuestionType]?.displayName || testState.currentQuestionType}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="question-mocktest-content container">
          {renderStep()}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuestionMockTest;
