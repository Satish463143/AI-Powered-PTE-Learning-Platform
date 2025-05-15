import React from 'react'
import { useDispatch } from 'react-redux';
import { nextQuestion } from '../../reducer/chatReducer';
import '../answersButton/answersButton.css';

const ReButton = ({onNext, clearifyAnswer}) => {
    const dispatch = useDispatch();
    const handleNext = () => {
        dispatch(nextQuestion());
        if (onNext) {
            onNext();
        }
    };
    const handleClearifyAnswer = () => {
        clearifyAnswer();
    };

  return (
    <div  className='answers_button'> 
        <button 
                className='answers_button_button'
                style={{background:'linear-gradient(to right, var(--orange), var(--purple))'}}
                onClick={handleClearifyAnswer}
            >
            मैले अझै बुझिनँ
        </button>
        <button 
                className='answers_button_button' 
                style={{background:'linear-gradient(to right, var(--purple), var(--blue))'}}
                onClick={handleNext}
            >
            अर्को प्रश्न
        </button>  
    </div>
  )
}

export default ReButton