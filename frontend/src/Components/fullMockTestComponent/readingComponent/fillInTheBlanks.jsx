import React, { useState, useEffect } from 'react'
import Select from 'react-select';
import Swal from 'sweetalert2';

// Dummy data
const dummyData = {
    paragraph: "The {{blank1}} fox jumps over the {{blank2}} dog.",
    blanks: {
      blank1: ["quick", "slow", "lazy", "angry"],
      blank2: ["brown", "black", "white", "red"]
    }
  };

const Question = ({ data }) => {
  const [answers, setAnswers] = useState({});
  
  const handleChange = (blankKey, selectedOption) => {
    setAnswers(prev => ({ ...prev, [blankKey]: selectedOption.value }));
  };

  const renderParagraph = () => {
    
    // Force use of dummy data for testing
    const activeData = data ? data : dummyData; // Always use dummy data for now
    
    if (!activeData || !activeData.paragraph) {
      return <div>Loading question data...</div>;
    }

    // Create segments array with text and blanks alternating
    const segments = [];
    const parts = activeData.paragraph.split(/(\{\{blank\d+\}\})/);
    
    
    parts.forEach((part, index) => {
      const blankMatch = part.match(/\{\{(blank\d+)\}\}/);
      if (blankMatch) {
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
  
  return (
    <div>
      <h2 className='font-bold'>
        There are some words missing in the following text. Please select the correct word in the drop-down box.
      </h2>
      <div style={{margin:'40px 0'}}>
        {renderParagraph()}
      </div> 
    </div>
  );
};

  
const FillInTheBlanks = ({ onNext, updateProgress }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const totalQuestions = 5;
    
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

export default FillInTheBlanks