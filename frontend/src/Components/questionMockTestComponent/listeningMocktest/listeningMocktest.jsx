import React, { useState, useEffect } from 'react';
import { useStartMockTestMutation } from '../../../api/mockTest.api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ListeningMocktest = ({
  updateProgress,
  mockTestId,
  mockTestType,
  currentQuestionType
}) => {
  const navigate = useNavigate();
  const [startTest] = useStartMockTestMutation();
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [answer, setAnswer] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = React.useRef(null);

  // Cleanup function for audio resources
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  useEffect(() => {
    if (currentQuestionType) {
      fetchQuestion();
    }
    return cleanupAudio;
  }, [currentQuestionType]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      cleanupAudio(); // Cleanup previous audio

      const response = await startTest({
        actionType: 'generate_question',
        mockTestId,
        mockTestType,
        question: {
          section: 'Listening',
          questionType: currentQuestionType,
          sectionType: 'Listening'
        }
      }).unwrap();

      if (!response?.result?.question) {
        throw new Error('No question data received');
      }

      setQuestionData(response.result.question);
      setCurrentQuestionId(response.result.question.id);
      setAnswer('');
      setAudioEnded(false);

      // Handle audio URL
      if (response.result.question.audioUrl) {
        try {
          const response = await fetch(response.result.question.audioUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        } catch (error) {
          console.error('Error loading audio:', error);
          throw new Error('Failed to load audio file');
        }
      }
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
          section: 'Listening',
          questionType: currentQuestionType,
          sectionType: 'Listening'
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
          cleanupAudio(); // Cleanup audio before navigation
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

  const handleAudioPlay = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to play audio. Please try again.',
          icon: 'error'
        });
      });
      setAudioPlaying(true);
    }
  };

  const handleAudioEnd = () => {
    setAudioPlaying(false);
    setAudioEnded(true);
  };

  const renderQuestionContent = () => {
    if (!questionData) return null;

    return (
      <div className="question-content">
        <div className="audio-section">
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={handleAudioEnd}
              onError={(e) => {
                console.error('Audio error:', e);
                Swal.fire({
                  title: 'Error',
                  text: 'Failed to load audio. Please try again.',
                  icon: 'error'
                });
              }}
              controls={false}
            />
          )}
          <button
            onClick={handleAudioPlay}
            disabled={audioPlaying || audioEnded || !audioUrl}
            className="play-button"
          >
            {!audioUrl ? 'Loading Audio...' : 
             audioPlaying ? 'Playing...' : 
             audioEnded ? 'Audio Ended' : 
             'Play Audio'}
          </button>
        </div>

        {audioEnded && (
          <div className="answer-section">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="answer-input"
              rows={6}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="listening-mocktest">
      <div className="question-container">
        <h2>{currentQuestionType}</h2>
        {renderQuestionContent()}
        {audioEnded && (
          <button
            onClick={handleSubmit}
            className="submit-button"
            disabled={loading}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default ListeningMocktest; 