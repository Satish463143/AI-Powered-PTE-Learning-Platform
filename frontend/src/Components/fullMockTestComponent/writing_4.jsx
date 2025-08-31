import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { useStartMockTestMutation } from '../../api/mockTest.api';


const dummyData = {
  "question" : " Write essay 2 :Should parents be held legally responsible for the actions of their children? Support your opinion from your study, observations or experiences."
}


const Q1 = ({data}) => {
  const [wordCount, setWordCount] = useState(0);
  const [textValue, setTextValue] = useState('');
  const [localClipboard, setLocalClipboard] = useState('');
  const textareaRef = useRef(null);
  
  const countWords = (text) => {
    const trimmedText = text.trim();
    return trimmedText ? trimmedText.split(/\s+/).length : 0;
  };
  
  const handleInput = (e) => {
    const newValue = e.target.value;
    setTextValue(newValue);
    setWordCount(countWords(newValue));
  };

  const handleKeyDown = (e) => {
    // Prevent copy, cut, paste keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault(); // Prevent Ctrl+C
        return false;
      }
      if (e.key === 'x' || e.key === 'X') {
        e.preventDefault(); // Prevent Ctrl+X
        return false;
      }
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault(); // Prevent Ctrl+V
        return false;
      }
    }
  };

  const handleCopy = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textValue.substring(start, end);
      
      if (selectedText) {
        setLocalClipboard(selectedText);
        // Optional: Show feedback to user
        console.log('Text copied to local clipboard:', selectedText);
      }
    }
  };

  const handleCut = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textValue.substring(start, end);
      
      if (selectedText) {
        setLocalClipboard(selectedText);
        // Remove selected text from textarea
        const newValue = textValue.substring(0, start) + textValue.substring(end);
        setTextValue(newValue);
        setWordCount(countWords(newValue));
        
        // Restore cursor position
        setTimeout(() => {
          textarea.setSelectionRange(start, start);
          textarea.focus();
        }, 0);
        
        console.log('Text cut to local clipboard:', selectedText);
      }
    }
  };

  const handlePaste = () => {
    const textarea = textareaRef.current;
    if (textarea && localClipboard) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert clipboard content at cursor position
      const newValue = textValue.substring(0, start) + localClipboard + textValue.substring(end);
      setTextValue(newValue);
      setWordCount(countWords(newValue));
      
      // Set cursor position after pasted text
      const newCursorPos = start + localClipboard.length;
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
      
      console.log('Text pasted from local clipboard:', localClipboard);
    }
  };

  return (
    <div className='mock_writing_container'>
      <h2 className='font-bold'>
        You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be judged on how well you develop a position, organize your ideas, present supporting details, and control the elements of standard written English. You should write 200-300 words.
      </h2>
      <p style={{margin:'20px 0'}}>{data?.passage || dummyData.question}</p>
      <textarea 
        ref={textareaRef}
        rows='15' 
        name="Summarize text" 
        value={textValue}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      /> 
      <div className="textArea_button">
        <button onClick={handleCut}>Cut</button> 
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handlePaste}>Paste</button>
      </div> 
      <p style={{marginTop:'20px'}}>Total Word Count : <span>{wordCount}</span></p>
    </div>
  );
};

const Writing_4 = ({ onNext, updateProgress, questions, onQuestionsGenerated }) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [startTest] = useStartMockTestMutation();
    const [localQuestions, setLocalQuestions] = useState(questions || []);

    useEffect(() => {
        if (questions) {
            setLocalQuestions(questions);
        }
    }, [questions]);

    useEffect(() => {
        const generateQuestions = async () => {
            if (!localQuestions || localQuestions.length === 0) {
                setIsGeneratingQuestions(true);
                try {
                    const mockTestId = window.location.search.split('id=')[1];
                    if (!mockTestId) {
                        throw new Error('Mock test ID not found');
                    }

                    const response = await startTest({
                        actionType: 'generate_all_questions',
                        mockTestId: mockTestId
                    }).unwrap();

                    if (response?.result?.questions) {
                        const newQuestions = response.result.questions;
                        setLocalQuestions(newQuestions);
                        if (onQuestionsGenerated) {
                            onQuestionsGenerated(newQuestions);
                        }
                    } else {
                        throw new Error('No questions generated');
                    }
                } catch (error) {
                    console.error("Error generating questions:", error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Failed to generate questions. Please try again.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                } finally {
                    setIsGeneratingQuestions(false);
                }
            }
        };

        generateQuestions();
    }, [localQuestions, onQuestionsGenerated, startTest]);

    const questionComponents = localQuestions?.length > 0 
      ? localQuestions.map((question, idx) => <Q1 key={idx} data={question} />)
      : [<Q1 key="q1" />];
    const totalQuestions = questionComponents.length;
    
    // Update parent component with question progress
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

    if (isGeneratingQuestions) {
        return (
            <div className="loading-container" style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div className="spinner"></div>
                <h2>Generating essay questions...</h2>
                <p>Please wait</p>
            </div>
        );
    }

    return (
        <>
            <div className="speaking-wrapper container">
                <div className="mock-question-container">
                    <div className="question">{questionComponents[questionIndex]}</div>
                </div> 
            </div>
            <div className='next_button'>
                <button onClick={handleNextButtonClick} className='primary-btn'>
                    Next
                </button>
            </div>
        </>
    );
};

export default Writing_4;


