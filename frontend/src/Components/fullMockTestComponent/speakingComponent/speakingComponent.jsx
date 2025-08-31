import React, { useState, useEffect, useCallback } from 'react'
import ReadAloud from './readAloud'
import RepeatSentence from './repeatSentence'
import DescribeImage from './describeImage'
import RetellLecture from './retellLecture'
import ShortAnswer from './shortAnswer'
import { useStartMockTestMutation } from '../../../api/mockTest.api'
import Swal from 'sweetalert2'

const SpeakingComponent = ({ onNext, updateProgress, questions: initialQuestions, onQuestionsGenerated }) => {
  const [section, setSection] = useState('readAloud');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questions, setQuestions] = useState(initialQuestions || []);
  const [startTest] = useStartMockTestMutation();
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Fixed question counts based on PTE format
  const QUESTION_COUNTS = {
    readAloud: 7,
    repeatSentence: 11,
    describeImage: 3,
    retellLecture: 1,
    shortAnswer: 6
  };
  
  // Filter questions by type
  const readAloudQuestions = questions?.filter(q => q.questionType === 'readAloud') || [];
  const repeatSentenceQuestions = questions?.filter(q => q.questionType === 'repeatSentence') || [];
  const describeImageQuestions = questions?.filter(q => q.questionType === 'describeImage') || [];
  const retellLectureQuestions = questions?.filter(q => q.questionType === 'retellLecture') || [];
  const shortAnswerQuestions = questions?.filter(q => q.questionType === 'shortAnswer') || [];
  
  const totalQuestions = QUESTION_COUNTS.readAloud + 
                        QUESTION_COUNTS.repeatSentence + 
                        QUESTION_COUNTS.describeImage + 
                        QUESTION_COUNTS.retellLecture + 
                        QUESTION_COUNTS.shortAnswer;

  const handleProgressUpdate = useCallback(() => {
    if (updateProgress && currentQuestion <= totalQuestions) {
      updateProgress(currentQuestion, totalQuestions);
    }
  }, [currentQuestion, totalQuestions, updateProgress]);

  useEffect(() => {
    handleProgressUpdate();
  }, [handleProgressUpdate]);

  const generateQuestionsForNextSection = async (nextSection) => {
    setIsGeneratingQuestions(true);
    try {
      const mockTestId = questions[0]?.mockTestId;
      if (!mockTestId) {
        throw new Error('Mock test ID not found');
      }

      // Create empty questions array for repeat sentence section
      if (nextSection === 'repeatSentence') {
        const dummyQuestions = Array(QUESTION_COUNTS.repeatSentence).fill(null).map((_, index) => ({
          questionType: 'repeatSentence',
          mockTestId,
          questionNumber: index,
          // Add any other required fields with dummy/empty values
          text: '',
          correctAnswer: '',
          score: 0
        }));
        setQuestions(prevQuestions => [...prevQuestions, ...dummyQuestions]);
        return true;
      }

      // For other sections, use the backend API
      const response = await startTest({
        actionType: 'generate_all_questions',
        mockTestId: mockTestId
      }).unwrap();

      if (response?.result?.questions) {
        const newQuestions = response.result.questions.map(question => ({
          ...question,
          mockTestId
        }));
        
        setQuestions(prevQuestions => [...prevQuestions, ...newQuestions]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error generating questions:", error);
      // For repeat sentence section, don't show error as we're using local audio
      if (nextSection !== 'repeatSentence') {
        Swal.fire({
          title: 'Error',
          text: 'Failed to generate questions for next section. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
      return nextSection === 'repeatSentence'; // Return true for repeat sentence to continue with local audio
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleReadAloudComplete = async () => {
    const success = await generateQuestionsForNextSection('repeatSentence');
    if (success) {
      setSection('repeatSentence');
      setCurrentQuestion(QUESTION_COUNTS.readAloud + 1);
    }
  };

  const handleRepeatSentenceComplete = async () => {
    const success = await generateQuestionsForNextSection('describeImage');
    if (success) {
      setSection('describeImage');
      setCurrentQuestion(QUESTION_COUNTS.readAloud + QUESTION_COUNTS.repeatSentence + 1);
    }
  };

  const handleDescribeImageComplete = async () => {
    const success = await generateQuestionsForNextSection('retellLecture');
    if (success) {
      setSection('retellLecture');
      setCurrentQuestion(QUESTION_COUNTS.readAloud + QUESTION_COUNTS.repeatSentence + QUESTION_COUNTS.describeImage + 1);
    }
  };

  const handleRetellLectureComplete = async () => {
    setIsGeneratingQuestions(true);
    try {
        const success = await generateQuestionsForNextSection('shortAnswer');
        if (success) {
            setSection('shortAnswer');
            setCurrentQuestion(QUESTION_COUNTS.readAloud + QUESTION_COUNTS.repeatSentence + QUESTION_COUNTS.describeImage + QUESTION_COUNTS.retellLecture + 1);
        }
    } catch (error) {
        console.error("Error in handleRetellLectureComplete:", error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to generate Short Answer questions. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
  };

  const handleShortAnswerComplete = async () => {
    setIsGeneratingQuestions(true);
    try {
        // Generate writing questions before completing
        const mockTestId = questions[0]?.mockTestId;
        if (!mockTestId) {
            throw new Error('Mock test ID not found');
        }

        const response = await startTest({
            actionType: 'generate_all_questions',
            mockTestId: mockTestId
        }).unwrap();

        if (response?.result?.questions) {
            // Pass the writing questions to parent
            if (onQuestionsGenerated) {
                onQuestionsGenerated(response.result.questions);
            }
        }
        onNext();
    } catch (error) {
        console.error("Error generating writing questions:", error);
        Swal.fire({
            title: 'Error',
            text: 'Failed to generate writing questions. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    } finally {
        setIsGeneratingQuestions(false);
    }
};

  const updateReadAloudProgress = (current, total) => {
    setCurrentQuestion(current);
  };

  const updateRepeatSentenceProgress = (current, total) => {
    setCurrentQuestion(QUESTION_COUNTS.readAloud + current);
  };

  const updateDescribeImageProgress = (current, total) => {
    setCurrentQuestion(QUESTION_COUNTS.readAloud + QUESTION_COUNTS.repeatSentence + current);
  };

  const updateRetellLectureProgress = (current, total) => {
    setCurrentQuestion(QUESTION_COUNTS.readAloud + QUESTION_COUNTS.repeatSentence + QUESTION_COUNTS.describeImage + current);
  };

  const updateShortAnswerProgress = (current, total) => {
    setCurrentQuestion(QUESTION_COUNTS.readAloud + QUESTION_COUNTS.repeatSentence + QUESTION_COUNTS.describeImage + QUESTION_COUNTS.retellLecture + current);
  };

  if (isGeneratingQuestions) {
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
        <h2>Generating {section} questions...</h2>
        <p>Please wait</p>
      </div>
    );
  }

  return (
    <>
      {section === 'readAloud' && (
        <ReadAloud 
          onNext={handleReadAloudComplete} 
          updateProgress={updateReadAloudProgress}
          questions={readAloudQuestions}
          isGeneratingQuestions={isGeneratingQuestions}
        />
      )}
      {section === 'repeatSentence' && (
        <RepeatSentence 
          onNext={handleRepeatSentenceComplete} 
          updateProgress={updateRepeatSentenceProgress}
          questions={repeatSentenceQuestions}
          isGeneratingQuestions={isGeneratingQuestions}
        />
      )}
      {section === 'describeImage' && describeImageQuestions.length > 0 && (
        <DescribeImage 
          onNext={handleDescribeImageComplete} 
          updateProgress={updateDescribeImageProgress}
          questions={describeImageQuestions}
          isGeneratingQuestions={isGeneratingQuestions}
        />
      )}
      {section === 'retellLecture' && retellLectureQuestions.length > 0 && (
        <RetellLecture 
          onNext={handleRetellLectureComplete} 
          updateProgress={updateRetellLectureProgress}
          questions={retellLectureQuestions}
          isGeneratingQuestions={isGeneratingQuestions}
        />
      )}
      {section === 'shortAnswer' && (
        <ShortAnswer 
          onNext={handleShortAnswerComplete} 
          updateProgress={updateShortAnswerProgress}
          questions={shortAnswerQuestions}
          isGeneratingQuestions={isGeneratingQuestions}
        />
      )}
    </>
  )
}

export default SpeakingComponent