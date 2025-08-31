import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useStartMockTestMutation } from '../../../api/mockTest.api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Import question type components
import ReadAloud from './ReadAloud';
import RepeatSentence from './RepeatSentence';
import DescribeImage from './DescribeImage';
import RetellLecture from './RetellLecture';
import AnswerShortQuestion from './AnswerShortQuestion';

const SpeakingMocktest = memo(({
  updateProgress,
  mockTestId,
  mockTestType,
  currentQuestionType
}) => {
  const navigate = useNavigate();
  const [startTest] = useStartMockTestMutation();
  
  // Consolidate related state to reduce re-renders
  const [state, setState] = useState({
    questionData: null,
    loading: true,
    currentQuestionId: null,
    error: null
  });

  // Memoize API call parameters
  const apiParams = useMemo(() => ({
    actionType: 'generate_question',
    mockTestId,
    mockTestType,
    question: {
      section: 'Speaking',
      questionType: currentQuestionType,
      sectionType: 'Speaking'
    }
  }), [mockTestId, mockTestType, currentQuestionType]);

  const fetchQuestion = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await startTest(apiParams).unwrap();

      if (!response?.result?.question) {
        throw new Error('No question data received');
      }

      // For Read Aloud questions, ensure we have the paragraph
      if (currentQuestionType === 'RA' && !response.result.question.paragraph && !response.result.question.text) {
        throw new Error('Invalid Read Aloud question format');
      }

      setState(prev => ({
        ...prev,
        questionData: response.result,
        loading: false,
        currentQuestionId: response.result.id || null,
        error: null
      }));

    } catch (error) {
      console.error('Error fetching question:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));

      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to fetch question',
        icon: 'error'
      });
    }
  }, [startTest, apiParams, currentQuestionType]);

  // Fetch question on mount or when question type changes
  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleSubmit = useCallback(async (answer) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Format the question data according to the backend schema
      const formattedQuestion = {
        id: state.currentQuestionId,
        section: 'Speaking',
        sectionType: 'Speaking',
        questionType: currentQuestionType,
        type: currentQuestionType,
        ...state.questionData?.question
      };

      const response = await startTest({
        actionType: 'next',
        mockTestId,
        mockTestType,
        question: formattedQuestion,
        userAnswer: {
          audioBlob: answer.audioBlob,
          type: currentQuestionType
        }
      }).unwrap();

      if (response.message?.toLowerCase().includes('completed')) {
        navigate('/progress');
        return;
      }

      setState(prev => ({
        ...prev,
        questionData: response.result,
        loading: false,
        currentQuestionId: response.result.id || null
      }));

    } catch (error) {
      console.error('Error submitting answer:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));

      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to submit answer',
        icon: 'error'
      });
    }
  }, [startTest, mockTestId, mockTestType, currentQuestionType, state.currentQuestionId, state.questionData, navigate]);

  // Memoize component props to prevent unnecessary re-renders
  const componentProps = useMemo(() => ({
    data: state.questionData,
    onSubmit: handleSubmit,
    isLoading: state.loading
  }), [state.questionData, handleSubmit, state.loading]);

  const renderQuestion = useCallback(() => {
    if (state.error) {
      return <div className="error">{state.error}</div>;
    }

    switch (currentQuestionType) {
      case 'RA':
        return <ReadAloud {...componentProps} />;
      case 'RS':
        return <RepeatSentence {...componentProps} />;
      case 'DI':
        return <DescribeImage {...componentProps} />;
      case 'RL':
        return <RetellLecture {...componentProps} />;
      case 'ASQ':
        return <AnswerShortQuestion {...componentProps} />;
      default:
        return <div>Unknown question type: {currentQuestionType}</div>;
    }
  }, [currentQuestionType, componentProps]);

  if (state.loading && !state.questionData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="speaking-mocktest">
      {renderQuestion()}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  if (prevProps.currentQuestionType !== nextProps.currentQuestionType) return false;
  if (prevProps.mockTestId !== nextProps.mockTestId) return false;
  if (prevProps.mockTestType !== nextProps.mockTestType) return false;
  return true;
});

SpeakingMocktest.displayName = 'SpeakingMocktest';

export default SpeakingMocktest; 