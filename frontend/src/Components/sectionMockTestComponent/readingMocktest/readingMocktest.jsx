import React, { useState, useEffect } from 'react'
import ReadAloud from './readAloud'
import SummarizeWrittenText from './summarizeWrittenText'
import FillInTheBlanksReadingWriting from './FillInTheBlanks(Reading&Writing)'
import MultipleChoiceMultiple from './multipleChoiceMultiple'
import ReOrderParagraphs from './reorderParagraph'
import FillInTheBlanksReading from './FillInTheBlanks(Reading)'
import HighlightCorrectSummary from './highlightCorrectSummary'
import MultipleChoiceSingle from './multipleChoiceSingle'
import HighlightIncorrectWords from './highlightIncorrectWord'
  

const ReadingMocktest = ({ onNext, updateProgress }) => {
  const [section, setSection] = useState('readAloud')
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const readAloudQuestions = 7
  const summarizeWrittenTextQuestions = 2
  const fillInTheBlanksReadingWritingQuestions = 5
  const multipleChoiceMultipleQuestions = 2
  const reOrderParagraphsQuestions = 2
  const fillInTheBlanksReadingQuestions = 5
  const highlightCorrectSummaryQuestions = 2
  const multipleChoiceSingleQuestions = 1
  const highlightIncorrectWordsQuestions = 3
  const totalQuestions = readAloudQuestions + summarizeWrittenTextQuestions + highlightIncorrectWordsQuestions + multipleChoiceSingleQuestions + multipleChoiceMultipleQuestions + reOrderParagraphsQuestions + fillInTheBlanksReadingQuestions + highlightCorrectSummaryQuestions + fillInTheBlanksReadingWritingQuestions

  useEffect(() => {
    if (updateProgress) {
      updateProgress(currentQuestion, totalQuestions);
        }
    }, [currentQuestion, updateProgress, totalQuestions]);

    const handleReadAloudComplete = () => {
      setSection('summarizeWrittenText');
  }

  const handleSummarizeWrittenTextComplete = () => {
    setSection('fillInTheBlanksReadingWriting');
  }

  const handleFillInTheBlanksReadingWritingComplete = () => {
    setSection('multipleChoiceMultiple');
  }

  const handleMultipleChoiceMultipleComplete = () => {
    setSection('reOrderParagraphs');
  }

  const handleReOrderParagraphsComplete = () => {
    setSection('fillInTheBlanksReading');
  }

  const handleFillInTheBlanksReadingComplete = () => {
    setSection('highlightCorrectSummary');
  }

  const handleHighlightCorrectSummaryComplete = () => {
    setSection('multipleChoiceSingle');
  }

  const handleMultipleChoiceSingleComplete = () => {
    setSection('highlightIncorrectWords');
  }

  const updateSetUpProgress = (current, total) => {
    setCurrentQuestion(current);
  }

  const updateReadAloudProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + current);
  }
  const updateSummarizeWrittenTextProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + current);
  }
  const updateFillInTheBlanksReadingWritingProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + fillInTheBlanksReadingWritingQuestions + current);
  }
  const updateMultipleChoiceMultipleProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + fillInTheBlanksReadingWritingQuestions + multipleChoiceMultipleQuestions + current);
  }
  const updateReOrderParagraphsProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + fillInTheBlanksReadingWritingQuestions + multipleChoiceMultipleQuestions + reOrderParagraphsQuestions + current);
  }
  const updateFillInTheBlanksReadingProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + fillInTheBlanksReadingWritingQuestions + multipleChoiceMultipleQuestions + reOrderParagraphsQuestions + fillInTheBlanksReadingQuestions + current);
  }
  const updateHighlightCorrectSummaryProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + fillInTheBlanksReadingWritingQuestions + multipleChoiceMultipleQuestions + reOrderParagraphsQuestions + fillInTheBlanksReadingQuestions + highlightCorrectSummaryQuestions + current);
  }
  const updateMultipleChoiceSingleProgress = (current, total) => {
    setCurrentQuestion(readAloudQuestions + summarizeWrittenTextQuestions + fillInTheBlanksReadingWritingQuestions + multipleChoiceMultipleQuestions + reOrderParagraphsQuestions + fillInTheBlanksReadingQuestions + highlightCorrectSummaryQuestions + multipleChoiceSingleQuestions + current);
  }
  return (
    <>
      {section === 'readAloud' && (
        <ReadAloud onNext={handleReadAloudComplete} updateProgress={updateSetUpProgress} />
      )}
      {section === 'summarizeWrittenText' && (
        <SummarizeWrittenText onNext={handleSummarizeWrittenTextComplete} updateProgress={ updateReadAloudProgress} />
      )}
      {section === 'fillInTheBlanksReadingWriting' && (
        <FillInTheBlanksReadingWriting onNext={handleFillInTheBlanksReadingWritingComplete} updateProgress={updateSummarizeWrittenTextProgress} />
      )}
      {section === 'multipleChoiceMultiple' && (
        <MultipleChoiceMultiple onNext={handleMultipleChoiceMultipleComplete} updateProgress={updateFillInTheBlanksReadingWritingProgress} />
      )}
      {section === 'reOrderParagraphs' && (
        <ReOrderParagraphs onNext={handleReOrderParagraphsComplete} updateProgress={updateMultipleChoiceMultipleProgress} />
      )}
      {section === 'fillInTheBlanksReading' && (
        <FillInTheBlanksReading onNext={handleFillInTheBlanksReadingComplete} updateProgress={updateReOrderParagraphsProgress} />
      )}
      {section === 'highlightCorrectSummary' && (
        <HighlightCorrectSummary onNext={handleHighlightCorrectSummaryComplete} updateProgress={updateFillInTheBlanksReadingProgress} />
      )}
      {section === 'multipleChoiceSingle' && (
        <MultipleChoiceSingle onNext={handleMultipleChoiceSingleComplete} updateProgress={updateHighlightCorrectSummaryProgress} />
      )}
      {section === 'highlightIncorrectWords' && (
        <HighlightIncorrectWords onNext={onNext} updateProgress={updateMultipleChoiceSingleProgress} />
      )}

    </>
  )
}

export default ReadingMocktest