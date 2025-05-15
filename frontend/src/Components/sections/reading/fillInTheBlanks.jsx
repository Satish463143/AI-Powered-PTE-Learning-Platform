import React, { useState, useEffect } from 'react';
import Timer from '../../../Common/timer/timer';
import AnswersButton from '../../../Common/answersButton/answersButton';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer } from '../../../reducer/chatReducer';
import Select from 'react-select';

// Dummy data
const dummyData = {
  paragraph: "The {{blank1}} fox jumps over the {{blank2}} dog.",
  blanks: {
    blank1: ["quick", "slow", "lazy", "angry"],
    blank2: ["brown", "black", "white", "red"]
  }
};


const FillInTheBlanks = ({data = dummyData,  onSubmit: parentSubmit,  onNext: parentNext,  showTimer = true,  questionId}) => {
  const [answers, setAnswers] = useState({});
  const dispatch = useDispatch();
  const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
  const initializedTimers = useSelector(state => state.chat.initializedTimers);
  const isSubmitted = questionId && submittedQuestions[questionId];
  const isTimerInitialized = questionId && initializedTimers[questionId];


  useEffect(() => {
    if (showTimer && !isSubmitted && !isTimerInitialized) {
      dispatch(setTimer({ duration: 3 * 60, questionId }));
    }
  }, [dispatch, showTimer, questionId, isSubmitted, isTimerInitialized]);

  const handleChange = (blankKey, selectedOption) => {
    setAnswers(prev => ({ ...prev, [blankKey]: selectedOption.value }));
  };

  const renderParagraph = () => {
    
    // Force use of dummy data for testing
    const activeData = dummyData; // Always use dummy data for now
    
    if (!activeData || !activeData.paragraph) {
      return <div>Loading question data...</div>;
    }

    // Create segments array with text and blanks alternating
    const segments = [];
    const parts = activeData.paragraph.split(/(\{\{blank\d+\}\})/);
    
    
    parts.forEach((part, index) => {
      const blankMatch = part.match(/\{\{(blank\d+)\}\}/);
      if (blankMatch) {
        // This is a blank placeholder
        const blankKey = blankMatch[1];
        if (activeData.blanks && activeData.blanks[blankKey]) {
          const options = activeData.blanks[blankKey].map(opt => ({ label: opt, value: opt }));
          segments.push(
            <span key={`blank-${index}`} className="mx-1 inline-block w-40">
              <Select
                options={options}
                onChange={selected => handleChange(blankKey, selected)}
                value={
                  answers[blankKey] ? { label: answers[blankKey], value: answers[blankKey] } : null
                }
                isDisabled={isSubmitted}
                placeholder="Select"
              />
            </span>
          );
        } else {
          segments.push(<span key={`missing-${index}`}>{part}</span>);
        }
      } else if (part.trim()) {
        // This is regular text
        segments.push(<span key={`text-${index}`}>{part}</span>);
      }
    });
    
    return segments.length > 0 ? segments : <div>No segments rendered. Fallback to raw text: {activeData.paragraph}</div>;
  };

  const handleSubmit = () => {
    if (parentSubmit) {
      parentSubmit();
    }
  };

  const handleNext = () => {
    if (parentNext) {
      parentNext();
    }
  };

  return (
    <div className={`space-y-4 ${isSubmitted && 'disabled_section' }`}>
      {showTimer && !isSubmitted && <Timer />}
      <div style={{margin:'30px 0'}}>
        {renderParagraph()}
      </div>
      <AnswersButton onSubmit={handleSubmit} onNext={handleNext} questionId={questionId} />
    </div>
  );
};

export default FillInTheBlanks;
