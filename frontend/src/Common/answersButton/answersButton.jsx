import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { submit, useHint, nextQuestion } from '../../reducer/chatReducer'; 
import './answersButton.css'

const AnswersButton = ({ onSubmit, onNext, questionId, disabled = false }) => {
    const dispatch = useDispatch();
    const hintUsed = useSelector(state => state.chat.hintUsed);
    const questionHints = useSelector(state => state.chat.questionHints);
    const submittedQuestions = useSelector(state => state.chat.submittedQuestions);
    const isRunning = useSelector(state => state.chat.isRunning);
    const timer = useSelector(state => state.chat.timer);
    const inputDisabled = useSelector(state => state.chat.inputDisabled);
    
    // Check if hint is used for this specific question
    const isHintUsedForQuestion = questionId && questionHints[questionId];
    
    // Check if this question has been submitted
    const isQuestionSubmitted = questionId && submittedQuestions[questionId];
    
    // Store previous hintUsed state to detect changes
    const prevHintUsedRef = useRef(hintUsed);
    
    // Debug log to check state
    useEffect(() => {
        // Update the ref for next render
        prevHintUsedRef.current = hintUsed;
    }, [hintUsed, isRunning, timer, inputDisabled, questionId, isHintUsedForQuestion, isQuestionSubmitted, onSubmit, onNext]);

    const handleHint = () => {
        if (disabled) return;
        if (!isHintUsedForQuestion && !isQuestionSubmitted) {
            dispatch(useHint(questionId));
        }
    };

    const handleSubmit = () => {
        if (disabled) return;
        if (!isQuestionSubmitted && isRunning) {
            dispatch(submit(questionId));
            if (onSubmit) {
                onSubmit();
            }
        }
    };

    const handleNext = () => {
        if (disabled) return;
        dispatch(nextQuestion());
        if (onNext) {
            onNext();
        }
    };


    return (
        <div className='answers_button'>
            {!isHintUsedForQuestion && !isQuestionSubmitted ? (
                <button 
                    className='answers_button_button' 
                    onClick={handleHint}
                    disabled={disabled || !questionId || !isRunning || isQuestionSubmitted}
                >
                    AI सँग Hint
                </button>
            ) : (
                <div className="hint-used-message">
                    {isQuestionSubmitted ? "Question submitted" : "Hint provided"}
                </div>
            )}
            <button 
                className='answers_button_button'
                style={{background:'linear-gradient(to right, var(--orange), var(--purple))'}}
                onClick={handleSubmit}
                disabled={disabled || !isRunning || isQuestionSubmitted}
            >
                {isQuestionSubmitted ? "Submitted" : "Submit"}
            </button> 
            <button 
                className='answers_button_button' 
                style={{background:'linear-gradient(to right, var(--purple), var(--blue))'}}
                onClick={handleNext}
                disabled={disabled}
            >
                Next
            </button>         
        </div>
    )
}

export default AnswersButton
