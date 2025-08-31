import React, { useState, useEffect } from 'react'
import MultipleChoiceSingle from './multipleChoiceSingle';
import RetellLecture from './retellLecture';
import AnswerShortQuestion from './answerShortQuestion';
import SummarizeSpokenText from './summarizeSpokenText';
import MultipleChoiceMultiple from './multipleChoiceMultiple';
import FillInTheBlanks from './fillInTheBlanks';
import HighlightCorrectSummary from './correctSummary';
import HighlightIncorrectWords from './highlightIncorrectWord';
import WriteFromDictation from './writeFromDictation';
import RepeatSentence from './repeatSentence';



const ListeningMocktest = ({onNext, updateProgress}) => {
  const [section, setSection] = useState('repeatSentence')
  const [currentQuestion, setCurrentQuestion] = useState(1);


  const repeatSentenceQuestions = 11
  const retellLectureQuestion = 1
  const answerShortQuestionQuestions = 6
  const summarizeSpokenTextQuestions = 1
  const multipleChoiceMultipleQuestions = 1
  const fillInTheBlanksQuestions = 3
  const multipleChoiceSingleQuestions = 1
  const highlightCorrectSummaryQuestions = 3
  const highlightIncorrectWordsQuestions = 3
  const writeFromDictationQuestions = 4
  
  const totalQuestions = repeatSentenceQuestions + retellLectureQuestion + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + highlightCorrectSummaryQuestions + highlightIncorrectWordsQuestions + writeFromDictationQuestions + answerShortQuestionQuestions
  
  useEffect(() => {
    if (updateProgress) {
      updateProgress(currentQuestion, totalQuestions);
        }
    }, [currentQuestion, updateProgress, totalQuestions]);

    const handleReadAloudComplete = () => {
      setSection('retellLecture');
  }
  const handleRetellLectureComplete = () => {
    setSection('answerShortQuestion');
  }
  const handleAnswerShortQuestionComplete = () => {
    setSection('summarizeSpokenText');
  }
  const handleSummarizeSpokenTextComplete = () => {
    setSection('multipleChoiceMultiple');
  }
  const handleMultipleChoiceMultipleComplete = () => {
    setSection('fillInTheBlanks');
  }
  const handleFillInTheBlanksComplete = () => {
    setSection('multipleChoiceSingle');
  }
  const handleMultipleChoiceSingleComplete = () => {
    setSection('highlightCorrectSummary');
  }
  const handleHighlightCorrectSummaryComplete = () => {
    setSection('highlightIncorrectWords');
  }
  const handleHighlightIncorrectWordsComplete = () => {
    setSection('writeFromDictation');
  }

  const updateSetUpProgress = (current, total) => {
    setCurrentQuestion(current);
  }

  const updateReadAloudProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + current);
  }
  const updateRetellLectureProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + current);
  }
  const updateAnswerShortQuestionProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + current);
  } 
  const updateSummarizeSpokenTextProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + current);
  }
  const updateMultipleChoiceMultipleProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + current);
  }
  const updateFillInTheBlanksProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + current);
  }
  const updateMultipleChoiceSingleProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + current);
  }
  const updateHighlightCorrectSummaryProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + highlightCorrectSummaryQuestions + current);
  }
  const updateHighlightIncorrectWordsProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + highlightCorrectSummaryQuestions + highlightIncorrectWordsQuestions + current);
  }
  const updateWriteFromDictationProgress = (current, total) => {
    setCurrentQuestion(repeatSentenceQuestions + retellLectureQuestion + answerShortQuestionQuestions + summarizeSpokenTextQuestions + multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + highlightCorrectSummaryQuestions + highlightIncorrectWordsQuestions + writeFromDictationQuestions + current);
  }
  
  
  
  
  return (
    <>
      {
        section === 'repeatSentence' && (
          <RepeatSentence onNext={handleReadAloudComplete} updateProgress={updateSetUpProgress} />
        )
      }
      {
        section === 'retellLecture' && (
          <RetellLecture onNext={handleRetellLectureComplete} updateProgress={ updateReadAloudProgress} />
        )
      }
      {
        section === 'answerShortQuestion' && (
          <AnswerShortQuestion onNext={handleAnswerShortQuestionComplete} updateProgress={updateRetellLectureProgress} />
        )
      }
      {
        section === 'summarizeSpokenText' && (
          <SummarizeSpokenText onNext={handleSummarizeSpokenTextComplete} updateProgress={updateAnswerShortQuestionProgress} />
        )
      }
      {
        section === 'multipleChoiceMultiple' && (
          <MultipleChoiceMultiple onNext={handleMultipleChoiceMultipleComplete} updateProgress={updateSummarizeSpokenTextProgress} />
        )
      }
      {
        section === 'fillInTheBlanks' && (
          <FillInTheBlanks onNext={handleFillInTheBlanksComplete} updateProgress={updateMultipleChoiceMultipleProgress} />
        )
      }
      {
        section === 'multipleChoiceSingle' && (
          <MultipleChoiceSingle onNext={handleMultipleChoiceSingleComplete} updateProgress={updateFillInTheBlanksProgress} />
        )
      }
      {
        section === 'highlightCorrectSummary' && (
          <HighlightCorrectSummary onNext={handleHighlightCorrectSummaryComplete} updateProgress={updateMultipleChoiceSingleProgress} />
        )
      }
      {
        section === 'highlightIncorrectWords' && (
          <HighlightIncorrectWords onNext={handleHighlightIncorrectWordsComplete} updateProgress={updateMultipleChoiceSingleProgress} />
        )
      }
      {
        section === 'writeFromDictation' && (
          <WriteFromDictation onNext={onNext} updateProgress={updateHighlightIncorrectWordsProgress} />
        )
      }

    </>
  )
}

export default ListeningMocktest