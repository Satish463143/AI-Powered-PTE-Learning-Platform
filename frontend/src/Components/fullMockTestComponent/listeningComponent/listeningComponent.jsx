import React, { useState, useEffect } from 'react'
import MultipleChoiceMultiple from './multipleChoiceMultiple'
import FillInTheBlanks from './fillInTheBlanks'
import MultipleChoiceSingle from './multipleChoiceSingle'
import HighlightWord from './highlightWord'
import WriteFromDictation from './writeFromDictation'

const ListeningComponent = ({ onNext, updateProgress }) => {
  const [section, setSection] = useState('multipleChoiceMultiple');
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const multipleChoiceMultipleQuestions = 1;
  const fillInTheBlanksQuestions = 3;
  const multipleChoiceSingleQuestions = 4;
  const highlightWordQuestions = 3;
  const writeFromDictationQuestions = 4;
  const totalQuestions = multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + highlightWordQuestions + writeFromDictationQuestions;

  useEffect(() => {
    // Update the overall progress whenever the current question changes
    if (updateProgress) {
      updateProgress(currentQuestion, totalQuestions);
    }
  }, [currentQuestion, updateProgress, totalQuestions]);

  const handlemultipleChoiceMultipleComplete = () => {
    setSection('fillInTheBlanks');
  };

  const handleFillInTheBlanksComplete = () => {
    setSection('multipleChoiceSingle');
  };

  const handleMultipleChoiceSingleComplete = () => {
    setSection('highlightWord');
  };

  const handleHighlightWordComplete = () => {
    setSection('writeFromDictation');
  };


  const updateWritingEssayProgress = (current, total) => {
    setCurrentQuestion(current);
  };

  const updateFillInTheBlanksProgress = (current, total) => {
    setCurrentQuestion(multipleChoiceMultipleQuestions + current);
  };

  const updateMultipleChoiceSingleProgress = (current, total) => {
    setCurrentQuestion(multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + current);
  };

  const updateHighlightWordProgress = (current, total) => {
    setCurrentQuestion(multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions  + current);
  };

  const updateWriteFromDictationProgress = (current, total) => {
    setCurrentQuestion(multipleChoiceMultipleQuestions + fillInTheBlanksQuestions + multipleChoiceSingleQuestions + highlightWordQuestions + current);
  };


  return (
    <div>
      {section === 'multipleChoiceMultiple' && (
        <MultipleChoiceMultiple onNext={handlemultipleChoiceMultipleComplete} updateProgress={updateWritingEssayProgress} />
      )}
      {section === 'fillInTheBlanks' && (
        <FillInTheBlanks onNext={handleFillInTheBlanksComplete} updateProgress={updateFillInTheBlanksProgress} />
      )}
      {section === 'multipleChoiceSingle' && (
        <MultipleChoiceSingle onNext={handleMultipleChoiceSingleComplete} updateProgress={updateMultipleChoiceSingleProgress} />
      )}
      {section === 'highlightWord' && (
        <HighlightWord onNext={handleHighlightWordComplete} updateProgress={updateHighlightWordProgress} />
      )}
      {section === 'writeFromDictation' && (
        <WriteFromDictation onNext={onNext} updateProgress={updateWriteFromDictationProgress} />
      )}
    </div>
  )
}

export default ListeningComponent