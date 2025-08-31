import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'
import { useStartMockTestMutation } from '../../api/mockTest.api';
import { useLocation } from 'react-router-dom';

const StartTest = ({onNext}) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [startTest, {isLoading: isStartTestLoading}] = useStartMockTestMutation();
    const location = useLocation();

    // Extract mock test ID from URL
    const getMockTestId = () => {
        const searchParams = new URLSearchParams(location.search);
        const id = searchParams.get('id');
        if (!id) {
            throw new Error('Mock test ID not found in URL. Please start the test from the beginning.');
        }
        return id;
    };

    useEffect(() => {
        if(timeRemaining === 0){
            showTimeUpAlert();
            return;
        }
        
        const timer = setTimeout(() => {
            setTimeRemaining(timeRemaining - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [timeRemaining]);

    // Show time's up alert
    const showTimeUpAlert = () => {
        Swal.fire({
            title: "Time's Up",
            text: `Please click "Next" to go to next question`,
            icon: 'warning',
            confirmButtonText: 'Next',
            allowOutsideClick: false,
            allowEscapeKey: false
        }).then((result) => {
            if (result.isConfirmed) {
                onNext();
            }
        });
    };

    const steps = [
        <div>
            <h2>You are about to begin Part 1 of the test: Speaking and Writing</h2>
            <h2>Time Allowed : 54-67 minutes</h2>
            <h2>Remember : to put your headphones on before you start the test</h2>
        </div>
    ]

    const nextStep = async() => {
        if (stepIndex < steps.length - 1) {
            setStepIndex((prev) => prev + 1);
        } else {
            try {
                const mockTestId = getMockTestId();

                const response = await startTest({
                    actionType: 'generate_all_questions',
                    mockTestId: mockTestId
                }).unwrap();

                if (response?.result?.questions) {
                    const questionData = response.result.questions.map(question => ({
                        ...question,
                        mockTestId: mockTestId // Use the same ID from URL
                    }));
                    onNext(questionData);
                } else {
                    throw new Error('No question data in API response');
                }
            } catch (error) {
                console.error("Error details:", error);
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'Failed to start test. Please try again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    };

    return (
        <>
            <div className="speaking-wrapper container">
                <div className="mock-question-container">
                    <div className="question">
                        {steps[stepIndex]}
                    </div>
                </div>
            </div>
            <div className='next_button'>
                <button onClick={nextStep} className='primary-btn' disabled={isStartTestLoading}>
                    {isStartTestLoading ? 'Loading...' : 'Next'}
                </button>
            </div>
        </>
    );
}

export default StartTest