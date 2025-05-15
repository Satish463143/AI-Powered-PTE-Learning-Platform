import React, { useEffect, useState } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import '../sectionCss/sectionCss.css';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setAudio } from '../../../reducer/audioReducer';
import defaultAudio from '../../../assets/audio/audio.mp3';
import SoundPlayer from './soundPlayer';

const highlightIncorrectWords = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];
  const [selectedWords, setSelectedWords] = useState({});
  const [audioSource, setAudioSource] = useState(defaultAudio);

  // Dummy data for demonstration
  const dummyData = {
    paragraph: "The free phone is the Samsung U740 handheld device, which has MP3, text-message and instant-message."
  };

  // Use provided data or fallback to dummy data
  const activeData = data && data.paragraph ? data : dummyData;
  
  // Initialize timer
  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  // Toggle word selection
  const toggleWordSelection = (word, index) => {
    if (isSubmitted) return;
    
    setSelectedWords(prev => {
      const newSelection = { ...prev };
      if (newSelection[`${word}-${index}`]) {
        delete newSelection[`${word}-${index}`];
      } else {
        newSelection[`${word}-${index}`] = word;
      }
      return newSelection;
    });
  };

  // Render paragraph with selectable words
  const renderParagraph = () => {
    const segments = [];
    
    // Split paragraph into words
    const words = activeData.paragraph.split(/\s+/);
    
    words.forEach((word, index) => {
      if (word.trim()) {
        const isSelected = !!selectedWords[`${word}-${index}`];
        segments.push(
          <span
            key={`word-${index}`}
            onClick={() => toggleWordSelection(word, index)}
            className={`word-item ${isSelected ? 'selected-word' : ''}`}
            style={{
              cursor: isSubmitted ? 'default' : 'pointer',
              padding: '2px 0px',
              margin: '0 2px',
              display: 'inline-block',
              backgroundColor: isSelected ? '#ffcccc' : 'transparent',
              borderRadius: '3px',
              transition: 'background-color 0.2s'
            }}
          >
            {word}
          </span>
        );
        
        // Add space after word (except for the last word)
        if (index < words.length - 1) {
          segments.push(<span key={`space-${index}`}> </span>);
        }
      }
    });
    
    return segments;
  };

  // Set up audio source
  useEffect(() => {
    try {
      let audioToUse = defaultAudio;
      
      if (data) {
        if (typeof data === 'string') {
          audioToUse = data;
        } else if (data.audio) {
          audioToUse = data.audio;
        } else if (data.audioUrl) {
          audioToUse = data.audioUrl;
        }
      }
      
      setAudioSource(audioToUse);
      dispatch(setAudio(audioToUse));
    } catch (error) {
      console.error("Error setting audio:", error);
    }
  }, [data, dispatch]);
  
  const handleSubmit = () => {
    if (parentSubmit) {
      // Extract just the words (not the indices) from selectedWords
      const selectedWordsArray = Object.values(selectedWords);
      parentSubmit(selectedWordsArray);
    }
  };
  
  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
      <p>You will hear a recording. Below is a transcription of the recording. Some words in the transcription differ from what the speaker said. Please click on the words that are different.</p>
       
        <SoundPlayer audioFile={audioSource} />
         <div className="highlight-incorrect-words-paragraph" style={{lineHeight: '2', marginTop: '20px'}}>
          {renderParagraph()}
        </div>        
      </div>   
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  )
}

export default highlightIncorrectWords;