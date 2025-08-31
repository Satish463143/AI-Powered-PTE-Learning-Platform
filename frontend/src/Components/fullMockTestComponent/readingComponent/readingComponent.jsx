import React, { useState, useEffect } from 'react'
import FillInTheBlanks from './fillInTheBlanks';
import MultipleChoiceMultiple from './multipleChoiceMultiple';
import ReOrder from './reOrder';
import FillInTheBlanksReading from './fillInTheBlanksReading';
import MultipleChoiceSingle from './multipleChoiceSingle';

const readingComponent = ({ onNext, updateProgress }) => {
    const [section, setSection] = useState('fillInTheBlanks');
    const [currentQuestion, setCurrentQuestion] = useState(1);

    const fillInTheBlanksQuestions = 5;
    const multipleChoiceMultipleQuestions = 2;
    const reOrderQuestions = 2;
    const fillInTheBlanksReading = 5;
    const multipleChoiceSingleQuestions = 2;
    const totalQuestions = fillInTheBlanksQuestions + multipleChoiceMultipleQuestions + reOrderQuestions + fillInTheBlanksReading + multipleChoiceSingleQuestions;

    useEffect(() => {
        // Update the overall progress whenever the current question changes
        if (updateProgress) {
          updateProgress(currentQuestion, totalQuestions);
        }
    }, [currentQuestion, updateProgress, totalQuestions]);
    
    const handleFillInTheBlanksComplete = () => {
        setSection('multipleChoiceMultiple');
    };

    const handleMultipleChoiceMultipleComplete = () => {
        setSection('reOrder');
    };

    const handleReOrderComplete = () => {
        setSection('fillInTheBlanksReading');
    };

    const handleFillInTheBlanksReadingComplete = () => {
        setSection('multipleChoiceSingle');
    };


    const updateReadAloudProgress = (current, total) => {
        setCurrentQuestion(current);
    };

    const updateMultipleChoiceMultipleProgress = (current, total) => {
        setCurrentQuestion(fillInTheBlanksQuestions + current);
    };

    const updateReOrderProgress = (current, total) => {
        setCurrentQuestion(fillInTheBlanksQuestions + multipleChoiceMultipleQuestions + current);
    };

    const updateFillInTheBlanksReadingProgress = (current, total) => {
        setCurrentQuestion(fillInTheBlanksQuestions + multipleChoiceMultipleQuestions + reOrderQuestions + current);
    };

    const updateMultipleChoiceSingleProgress = (current, total) => {
        setCurrentQuestion(fillInTheBlanksQuestions + multipleChoiceMultipleQuestions + reOrderQuestions + fillInTheBlanksReading + current);
    };




    return (
        <>
        {section === 'fillInTheBlanks' && (
            <FillInTheBlanks 
            onNext={handleFillInTheBlanksComplete} 
            updateProgress={updateReadAloudProgress} 
            />
        )}
        {section === 'multipleChoiceMultiple' && (
            <MultipleChoiceMultiple 
            onNext={handleMultipleChoiceMultipleComplete} 
            updateProgress={updateMultipleChoiceMultipleProgress} 
            />
        )}
        {section === 'reOrder' && (
            <ReOrder 
            onNext={handleReOrderComplete} 
            updateProgress={updateReOrderProgress} 
            />
        )}
        {section === 'fillInTheBlanksReading' && (
            <FillInTheBlanksReading 
            onNext={handleFillInTheBlanksReadingComplete} 
            updateProgress={updateFillInTheBlanksReadingProgress} 
            />
        )}
        {section === 'multipleChoiceSingle' && (
            <MultipleChoiceSingle 
            onNext={onNext} 
            updateProgress={updateMultipleChoiceSingleProgress} 
            />
        )}
        </>
    )
}

export default readingComponent