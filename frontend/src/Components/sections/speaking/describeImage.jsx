import React, { useEffect, useState } from 'react'
import defaultImage from '../../../assets/image/pen.png'
import SpeakingTime from './speakingTime'
import SpeakingMic, { audioRecordingRef } from './speakingMic'
import AnswersButton from '../../../Common/answersButton/answersButton'
import { useDispatch, useSelector } from 'react-redux';
import { setPrepareTime, setStartTime, resetTimer } from '../../../reducer/speakingTimerReducer';
import { setTimer } from '../../../reducer/chatReducer';
import { setQuestionImage, setQuestionContent } from '../../../reducer/describeImageReducer';
import { describe_image } from '../../../reducer/listenerReducer';

// Constants for timer durations
const PREPARE_TIME = 25; // seconds
const SPEAKING_TIME = 40; // seconds

// Helper function to get random image data
const getRandomImageData = () => {
  const randomIndex = Math.floor(Math.random() * describe_image.length);
  return describe_image[randomIndex];
};

const describeImage = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionImages = useSelector(state => state.describeImage.questionImages);
  const questionContents = useSelector(state => state.describeImage.questionContents);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  // Initialize the content for this question if it doesn't exist
  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      if (!data?.image) {
        // Get random image data
        const imageData = getRandomImageData();
        
        // Store both image and content in redux
        dispatch(setQuestionImage(questionId, imageData.image));
        dispatch(setQuestionContent(questionId, {
          image: imageData.image,
          image_description: imageData.image_description,
          type: 'describeImage'
        }));
      } else {
        // If data is provided, store it in redux
        const imageData = describe_image.find(item => item.image.includes(data.image.split('/').pop()));
        dispatch(setQuestionContent(questionId, {
          image: data.image,
          image_description: imageData ? imageData.image_description : "Please describe the image in detail.",
          type: 'describeImage'
        }));
      }
    }
  }, [questionId, data, dispatch]);

  // Set timers on mount
  useEffect(() => {
    if (showTimer && !isSubmitted) {
      if (!isTimerInitialized && questionId) {
        dispatch(setTimer({ duration: 40, questionId })); 
      }
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
    if (!parentSubmit || !questionId) {
      console.error('Missing required data for submission');
      return;
    }

    if (!audioRecordingRef.blob) {
      alert('No recording found. Please record your answer before submitting.');
      return;
    }

    if (audioRecordingRef.blob.size < 1024) {
      alert('Recording is too short. Please try again.');
      return;
    }

    const audioData = {
      audioBlob: audioRecordingRef.blob,
      audioUrl: audioRecordingRef.url,
      questionId
    };

    const currentContent = questionContents[questionId];
    const submissionData = {
      answer: audioData,
      originalQuestion: {
        imageUrl: currentContent?.image || questionImages[questionId] || defaultImage,
        type: 'describeImage',
        image_description: currentContent?.image_description || "Please describe the image in detail."
      }
    };
    
    try {
      parentSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    }
  };

  // Use data from Redux state
  const currentContent = questionContents[questionId] || {};
  const displayImage = currentContent.image || data?.image || questionImages[questionId] || defaultImage;

  return (
    <div className={isSubmitted ? 'disabled_section' : ''}>
      <SpeakingTime isSubmitted={isSubmitted} showTimer={showTimer} />
      <p>Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You will have 40 seconds to give your response.</p>
      <div className='describe-image-image describe_image_grid' style={{margin:'20px 0',display:'flex',justifyContent:'center'}}>
        <img src={displayImage} alt='describeImage' width='450px' height='auto'/>
        <SpeakingMic 
          isSubmitted={isSubmitted} 
          showTimer={showTimer} 
          speakingTime={SPEAKING_TIME}
        />
      </div>
      
      <div className="read-aloud-answers-button">
        <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
      </div>            
    </div>
  );
};

export default describeImage;