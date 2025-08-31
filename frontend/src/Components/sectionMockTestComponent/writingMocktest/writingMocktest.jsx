import React, { useState, useEffect } from 'react'
import SummarizeWrittenTest from './summarizeWrittenText'
import WriteEssay from './writeEssay'
import FillInTheBlanksReadingAndWriting from './fillInTheBlanks(Reading&Writing)'
import SummarizeSpokenTest from './summarizeSpokenTest'
import WriteFromDictation from './writeFromDictation'
import FillInTheBlanks from './fillInTheBlanks'


const WritingMocktest = ({ onNext, updateProgress }) => {
  const [section, setSection] = useState('summarizeWrittenText')
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const summarizeWrittenTextQuestions = 1;
  const writeEssayQuestions = 2;
  const fillInTheBlanksReadingAndWritingQuestions = 5;
  const summarizeSpokenTestQuestions = 1;
  const writeFromDictationQuestions = 4;
  const fillInTheBlanksQuestions = 3;
  const totalQuestions = summarizeWrittenTextQuestions + writeEssayQuestions + fillInTheBlanksReadingAndWritingQuestions + summarizeSpokenTestQuestions + writeFromDictationQuestions + fillInTheBlanksQuestions;

  useEffect(() => {
    // Update the overall progress whenever the current question changes
    if (updateProgress) {
      updateProgress(currentQuestion, totalQuestions);
        }
    }, [currentQuestion, updateProgress, totalQuestions]);

    const handleSummarizeWrittenTextComplete = () => {
      setSection('writeEssay');
    }
    const handleWriteEssayComplete = () => {
      setSection('fillInTheBlanksReadingAndWriting');
    }
    const handleFillInTheBlanksReadingAndWritingComplete = () => {
      setSection('summarizeSpokenTest');
    }
    const handleSummarizeSpokenTestComplete = () => {
      setSection('writeFromDictation');
    }
    const handleWriteFromDictationComplete = () => {
      setSection('fillInTheBlanks');
    }

    const updateSetUpProgress = (current, total) => {
      setCurrentQuestion(current);
    };

    const updateSummarizeWrittenTextProgress = (current, total) => {
      setCurrentQuestion(summarizeWrittenTextQuestions + current);
    };
    const updateWriteEssayProgress = (current, total) => {
      setCurrentQuestion(summarizeWrittenTextQuestions + writeEssayQuestions + current);
    };
    const updateFillInTheBlanksReadingAndWritingProgress = (current, total) => {
      setCurrentQuestion(summarizeWrittenTextQuestions + writeEssayQuestions + fillInTheBlanksReadingAndWritingQuestions + current);
    };
    const updateSummarizeSpokenTestProgress = (current, total) => {
      setCurrentQuestion(summarizeWrittenTextQuestions + writeEssayQuestions + fillInTheBlanksReadingAndWritingQuestions + summarizeSpokenTestQuestions + current);
    };
    const updateWriteFromDictationProgress = (current, total) => {
      setCurrentQuestion(summarizeWrittenTextQuestions + writeEssayQuestions + fillInTheBlanksReadingAndWritingQuestions + summarizeSpokenTestQuestions + writeFromDictationQuestions + current);
    };
     
  return (
    <>
      {section === 'summarizeWrittenText' && (
        <SummarizeWrittenTest 
        onNext={handleSummarizeWrittenTextComplete} 
        updateProgress={updateSetUpProgress} 
        />
      )}
      {section === 'writeEssay' && (
        <WriteEssay 
        onNext={handleWriteEssayComplete} 
        updateProgress={updateSummarizeWrittenTextProgress} 
        />
      )}
      {section === 'fillInTheBlanksReadingAndWriting' && (
        <FillInTheBlanksReadingAndWriting 
        onNext={handleFillInTheBlanksReadingAndWritingComplete} 
        updateProgress={updateWriteEssayProgress} 
        />
      )}
      {section === 'summarizeSpokenTest' && (
        <SummarizeSpokenTest 
        onNext={handleSummarizeSpokenTestComplete} 
        updateProgress={updateFillInTheBlanksReadingAndWritingProgress} 
        />
      )}
      {section === 'writeFromDictation' && (
        <WriteFromDictation 
        onNext={handleWriteFromDictationComplete} 
        updateProgress={updateSummarizeSpokenTestProgress} 
        />
      )}
      {section === 'fillInTheBlanks' && (
        <FillInTheBlanks 
        onNext={onNext} 
        updateProgress={updateWriteFromDictationProgress} 
        />
      )}
    </>
  )
}

export default WritingMocktest