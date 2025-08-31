import React, { useState, useEffect } from 'react';
import { useStartMockTestMutation } from '../../../api/mockTest.api';
import Swal from 'sweetalert2';

const ReadingMocktest = ({ 
  updateProgress, 
  mockTestId, 
  mockTestType, 
  currentQuestionType 
}) => {
  const [startTest] = useStartMockTestMutation();
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (currentQuestionType) {
      fetchQuestion();
    }
  }, [currentQuestionType]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const response = await startTest({
        actionType: 'generate_question',
        mockTestId,
        mockTestType,
        question: {
          section: 'Reading',
          questionType: currentQuestionType,
          sectionType: 'Reading'
        }
      }).unwrap();

      if (!response?.result?.question) {
        throw new Error('No question data received');
      }

      setQuestionData(response.result.question);
      setCurrentQuestionId(response.result.question.id);
      setAnswer('');
    } catch (error) {
      console.error('Error fetching question:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to load question. Please try again.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await startTest({
        actionType: 'next',
        mockTestId,
        mockTestType,
        question: {
          id: currentQuestionId,
          section: 'Reading',
          questionType: currentQuestionType,
          sectionType: 'Reading'
        },
        userAnswer: answer
      }).unwrap();

      // Check if response has a message indicating success
      if (response?.message?.toLowerCase().includes('success') || 
          response?.message?.toLowerCase().includes('completed successfully')) {
        await Swal.fire({
          title: 'Success',
          text: 'Answer submitted successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // Update progress if available
        if (response.result?.progress) {
          updateProgress(response.result.progress.current, response.result.progress.total);
        }

        // Check if test is complete
        if (response.result?.isTestComplete) {
          await Swal.fire({
            title: 'Section Complete',
            text: 'You have completed all questions in this section',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          navigate('/mockTest');
          return;
        }

        // Fetch next question
        await fetchQuestion();
      } else {
        throw new Error(response?.message || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'Failed to submit answer. Please try again.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionContent = () => {
    if (!questionData) return null;

    switch (currentQuestionType) {
      case 'read-aloud':
        return (
          <div className="question-content">
            <div className="question-text">{questionData.text}</div>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="answer-input"
            />
          </div>
        );

      case 'fill-in-blanks-reading':
        return (
          <div className="question-content">
            <div className="question-text">{questionData.text}</div>
            <div className="blanks-container">
              {questionData.blanks.map((blank, index) => (
                <input
                  key={index}
                  type="text"
                  value={answer[index] || ''}
                  onChange={(e) => {
                    const newAnswer = [...answer];
                    newAnswer[index] = e.target.value;
                    setAnswer(newAnswer);
                  }}
                  placeholder="Fill in the blank"
                  className="blank-input"
                />
              ))}
            </div>
          </div>
        );

      // Add other reading question types here...

      default:
        return <div>Question type not supported</div>;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="reading-mocktest">
      <div className="question-container">
        <h2>{currentQuestionType}</h2>
        {renderQuestionContent()}
        <button 
          onClick={handleSubmit}
          className="submit-button"
          disabled={loading}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default ReadingMocktest; 