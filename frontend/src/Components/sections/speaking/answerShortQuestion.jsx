import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import AudioSpeakingTime, { audioRecordingRef } from './audioSpeakingTime';

// Constants for timer durations
const PREPARE_TIME = 10; // seconds
const SPEAKING_TIME = 10; // seconds

// Import all audio files from the Answer Short Question folder
const answerShortQuestionAudios = import.meta.glob('../../../assets/audio/Speaking/answer_short_question/*.mp3', { eager: true });

// Helper function to get random audio
const getRandomAudio = () => {
  const audios = Object.values(answerShortQuestionAudios).map(module => module.default);
  const randomIndex = Math.floor(Math.random() * audios.length);
  return audios[randomIndex];
};

const AnswerShortQuestion = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

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
      const audioUrl = data?.audioUrl || getRandomAudio();
      
      // Store the content in redux
      dispatch(setQuestionContent(questionId, {
        audioUrl,
        type: 'answerShortQuestion',
        sentence: data?.sentence || "Please answer in short."
      }));
      
      // Set the question-specific audio
      dispatch(setQuestionAudio({ questionId, audioUrl }));
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
    if (!parentSubmit || !questionId || !audioMap[questionId]) {
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
      originalQuestion: questionContents[questionId]
    };
    
    try {
      parentSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  }

  return (
    <div className={isSubmitted ? 'disabled_section' : ''}>
      <p>You will hear a question. Please give a simple and short answer. Often just one or a few words is enough.</p>
      
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

export default AnswerShortQuestion;