import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import AudioSpeakingTime, { audioRecordingRef } from './audioSpeakingTime';
import { speaking_respond_to_a_situation } from '../../../reducer/listenerReducer';

// Constants for timer durations
const PREPARE_TIME = 20; // seconds
const SPEAKING_TIME = 40; // seconds

const RespondToASituation = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  // Function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get random question from the array
  const getRandomQuestion = () => {
    const shuffledQuestions = shuffleArray(speaking_respond_to_a_situation);
    return shuffledQuestions[0];
  };

  // Set current question when component mounts or questionId changes
  useEffect(() => {
    if (questionId) {
      dispatch(setCurrentQuestion(questionId));
    }
  }, [questionId, dispatch]);

  // Initialize the content for this question if it doesn't exist
  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      // If no existing content, get from data or generate new content
      const questionData = getRandomQuestion();
      
      // Store the content in redux
      dispatch(setQuestionContent(questionId, {
        audioUrl: questionData.audio,
        type: 'respondToASituation',
        title: questionData.situation,
        prompt: questionData.prompt,
        modalAnswer: questionData.modalAnswer
      }));
      
      // Set the question-specific audio
      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId, data, dispatch, questionContents]);

  // Set timers on mount
  useEffect(() => {
    if (showTimer && !isSubmitted) {
      // Initialize chat timer (needed for submit button to work)
      if (!isTimerInitialized && questionId) {
        dispatch(setTimer({ duration: 40, questionId })); 
      }

      // Set timers
      dispatch(setPrepareTime(PREPARE_TIME)); 
      dispatch(setStartTime(SPEAKING_TIME));
    } else {
      dispatch(resetTimer());
    }
    
    return () => {
      if (showTimer) {
        dispatch(resetTimer());
      }
    };
  }, [dispatch, isSubmitted, showTimer, questionId, isTimerInitialized]);

  const handleSubmit = () => {
    if (!parentSubmit || !questionId || !questionContents[questionId]) {
      console.error('Missing required data for submission');
      return;
    }

    // Validate audio recording
    if (!audioRecordingRef.blob) {
      alert('No recording found. Please record your answer before submitting.');
      return;
    }

    if (audioRecordingRef.blob.size < 1024) {
      alert('Recording is too short. Please try again.');
      return;
    }

    // Get the audio recording from the global reference
    const audioData = {
      audioBlob: audioRecordingRef.blob,
      audioUrl: audioRecordingRef.url,
      questionId
    };

    // Add the question audio data to the submission
    const submissionData = {
      answer: audioData,
      originalQuestion: {
        ...questionContents[questionId],
        type: 'respondToASituation'
      }
    };
    
    try {
      parentSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  }

  const activeContent = questionId && questionContents[questionId];

  return (
    <div className={isSubmitted ? 'disabled_section' : ''}>
      <p>Listen to and read a description of a situation. You will have 20 seconds to think about your answer. Then you will hear a beep. You will have 40 seconds to answer the question. Please answer as completely as you can.</p>
      
      {activeContent && (
        <>
          <h3 style={{marginBottom: '10px', fontWeight: 'bold'}}>{activeContent.title}</h3>
          <div style={{ margin: '20px 0' }} className='border-dotted border'>
            <p style={{padding:'10px'}}>{activeContent.prompt}</p>
          </div>
        </>
      )}

      <AudioSpeakingTime 
        isSubmitted={isSubmitted}
        showTimer={showTimer}
        speakingTime={SPEAKING_TIME}
        audioFile={audioMap[questionId]}
      />
      
      <div className="read-aloud-answers-button">
        <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
      </div>
    </div>
  )
}

export default RespondToASituation;