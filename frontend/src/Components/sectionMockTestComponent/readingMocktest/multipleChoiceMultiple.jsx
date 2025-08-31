import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

// Dummy data for demonstration
const dummyData = {
    paragraph: "The capital of France is Paris. The capital of Germany is Berlin. The capital of Spain is Madrid. The capital of Italy is Rome.",
    question: "What are the capitals of the countries mentioned in the text?",
    answers: ["Paris", "London", "Berlin", "Madrid"]
  };

const Question = ({ data }) => {
    const [selectedAnswers, setSelectedAnswers] = useState([]);

    const questionData = data ? data : dummyData;
  
    const handleCheckboxChange = (answer) => {
        setSelectedAnswers(prev =>
          prev.includes(answer)
            ? prev.filter(item => item !== answer)
            : [...prev, answer]
        );
      };
    
    return (
      <div>
        <h2 className='font-bold'>
            Read the text and answer the question by selecting all the correct responses. More than one response is correct.
        </h2>
        <div className={`multiple_choice`} style={{margin:'30px 0'}}>
            <p style={{margin:'10px 0'}}>{questionData.paragraph}</p>
            <p style={{margin:'40px 0 0 0'}}>{questionData.question}</p>
            
            {questionData.answers?.map((answer, idx) => (
                <div style={{marginTop:'10px '}}>
                    <label 
                        key={idx} 
                        className={`block mb-2 p-2 rounded ${selectedAnswers.includes(answer) ? 'bg-blue-100' : ''}`}
                    >
                    <input
                        type="checkbox"
                        value={answer}
                        checked={selectedAnswers.includes(answer)}
                        onChange={() => handleCheckboxChange(answer)}
                    />
                    <span style={{marginLeft:'10px'}}>{answer}</span>
                    </label>
                </div>
            ))}
        </div> 
      </div>
    );
  };

const MultipleChoiceMultiple = ({ onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const totalQuestions = 2;
    
    useEffect(() => {
        if (updateProgress) {
            updateProgress(questionIndex + 1, totalQuestions);
        }
    }, [questionIndex, totalQuestions, updateProgress]);

    const handleNextQuestion = () => {      
      if (questionIndex < totalQuestions - 1) {
          setQuestionIndex((prev) => prev + 1);
      } else {
          onNext();
      }
  };

    const handleNextButtonClick = () => {
      Swal.fire({
          title: "Are you sure?",
          text: "Do you want to proceed to the next question?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
      }).then((result) => {
          if (result.isConfirmed) {
              handleNextQuestion();
          }
      });
  };
  return (
    <>
        <div className="speaking-wrapper container">
            <div className="mock-question-container">
                <div className="question">
                    <Question 
                        key={`question-${questionIndex}`}
                        number={questionIndex + 1}
                        data={null} 
                    />
                </div>
            </div>
            
        </div>
        <div className='next_button'>
            <button onClick={handleNextButtonClick} className='primary-btn'>
                Next
            </button>
        </div>
    </>
  )
}

export default MultipleChoiceMultiple