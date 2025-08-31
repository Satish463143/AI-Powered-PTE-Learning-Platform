import React, { useEffect, useState } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import { setQuestionContent } from '../../../reducer/questionContentReducer';
import { setQuestionAudio, setCurrentQuestion } from '../../../reducer/questionAudioReducer';
import { highlight_incorrect_words } from '../../../reducer/listenerReducer';
import SoundPlayer from './soundPlayer';

const HighlightIncorrectWords = ({ data, onSubmit: parentSubmit, onNext: parentNext, showTimer = true, questionId }) => {
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const questionContents = useSelector(state => state.questionContent.questionContents);
  const audioMap = useSelector(state => state.questionAudio.audioMap);

  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];

  const [selectedWords, setSelectedWords] = useState({});

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const getRandomQuestion = () => {
    const shuffledQuestions = shuffleArray(highlight_incorrect_words);
    return shuffledQuestions[0];
  };

  useEffect(() => {
    if (questionId) {
      dispatch(setCurrentQuestion(questionId));
    }
  }, [questionId, dispatch]);

  // ✅ Store paragraph, audio and correct answers (incorrect words to be clicked)
  useEffect(() => {
    if (questionId && !questionContents[questionId]) {
      const questionData = getRandomQuestion();

      dispatch(setQuestionContent(questionId, {
        audioUrl: questionData.audio,
        type: 'highlightIncorrectWords',
        paragraph: questionData.paragraph,
        correct_answers: questionData.correct_answer  // ✅ bound here
      }));

      dispatch(setQuestionAudio({ questionId, audioUrl: questionData.audio }));
    }
  }, [questionId,data, questionContents, dispatch]);

  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 10 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const toggleWordSelection = (word, index) => {
    if (isSubmitted) return;

    setSelectedWords(prev => {
      const newSelection = { ...prev };
      const key = `${word}-${index}`;
      if (newSelection[key]) {
        delete newSelection[key];
      } else {
        newSelection[key] = word;
      }
      return newSelection;
    });
  };

  const renderParagraph = () => {
    const content = questionContents[questionId];
    if (!content) return null;

    const words = content.paragraph.split(/\s+/);
    const segments = [];

    words.forEach((word, index) => {
      const key = `${word}-${index}`;
      const isSelected = !!selectedWords[key];

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

      if (index < words.length - 1) {
        segments.push(<span key={`space-${index}`}> </span>);
      }
    });

    return segments;
  };

  const handleSubmit = () => {
    if (parentSubmit && questionId) {
      const selectedWordsArray = Object.values(selectedWords);
      const originalQuestion = {
        ...questionContents[questionId],
        type: 'highlightIncorrectWords',
        section: 'listening'
      };
      parentSubmit({
        answer: selectedWordsArray,  // Changed from selectedWords to answer
        originalQuestion
      });
    }
  };

  return (
    <div className={`summerize_text ${isSubmitted && 'disabled_section'}`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{ margin: '30px 0' }}>
        <p>
          You will hear a recording. Below is a transcription of the recording.
          Some words in the transcription differ from what the speaker said.
          Please click on the words that are different.
        </p>
        <SoundPlayer audioFile={audioMap[questionId]} />
        <div className="highlight-incorrect-words-paragraph" style={{ lineHeight: '2', marginTop: '20px' }}>
          {renderParagraph()}
        </div>
      </div>
      <AnswersButton onSubmit={handleSubmit} onNext={parentNext} questionId={questionId} />
    </div>
  );
};

export default HighlightIncorrectWords;
