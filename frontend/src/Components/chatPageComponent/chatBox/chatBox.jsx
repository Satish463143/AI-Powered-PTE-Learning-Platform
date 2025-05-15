import React, { useState, useCallback, useEffect, useRef } from 'react'
import Select from 'react-select'
import './chatBox.css'
import componentMap from '../../sections/allQuestionMap';
import { useSelector, useDispatch } from 'react-redux';
import { submit, nextQuestion } from '../../../reducer/chatReducer';
import ReButton from '../../../Common/reButton/reButton';

const chatBox = ({showChatWithAi, messages, setMessages, isSoundOn}) => {
    const dispatch = useDispatch();
    const [inputValue, setInputValue] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const messagesEndRef = useRef(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedContent, setSelectedContent] = useState(null);
    const [questionComponents, setQuestionComponents] = useState([]);
    const [activeQuestionId, setActiveQuestionId] = useState(null); // Track the active question
    const hintUsed = useSelector(state => state.chat.hintUsed);
    const isRunning = useSelector(state => state.chat.isRunning);
    const submittedQuestions = useSelector(state => state.chat.submittedQuestions);

    useEffect(() => {
        if(hintUsed && activeQuestionId && !submittedQuestions[activeQuestionId]){   
            // Only show hint if the question has not been submitted
            const activeQuestion = questionComponents.find(comp => comp.id === activeQuestionId);
            let hintMessage = `Here is the hint for the question: [AI will provide a helpful hint here]`;
            
            if (activeQuestion) {
                hintMessage = `Here is the hint for the ${activeQuestion.section} - ${activeQuestion.questionType} question: [AI will provide a helpful hint here]`;
            }
            
            simulateAiResponse(hintMessage);
        }
    }, [hintUsed, activeQuestionId, questionComponents, submittedQuestions])

    //question renderer
    const QuestionRenderer = ({ type, data, isActive = true, questionId }) => {
        const Component = componentMap[type]
        const isActiveQuestion = activeQuestionId === questionId || isActive;
        
        return (
            <>
                {Component ? <Component 
                    data={data} 
                    onSubmit={handleSubmit}
                    onNext={handleNext}
                    showTimer={isActiveQuestion} // Only show timer for active question
                    questionId={questionId}
                /> : <div>Unknown question type</div>}
            </>
        )
    }

    //styles for select options 
    const customStyles = {
        control: (provided) => ({
          ...provided,
          backgroundColor: 'var(--light_blue)',
          borderRadius: '30px',
          borderColor: '#ccc',
          padding: '5px',
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#999'
          }
        }),        
        option: (provided, state) => ({
          ...provided,
          backgroundColor: state.isFocused ? 'var(--light_blue)' : '#fff',
          color: '#333',
          padding: 10,
          cursor: 'pointer',
          borderRadius: '6px'
        }),
      }
    const sections = [
        { value: 'Reading', label: 'Reading' },
        { value: 'Writing', label: 'Writing' },
        { value: 'Listening', label: 'Listening' },
        { value: 'Speaking', label: 'Speaking' }
      ]
    
    const getContentOptions = () => {
        switch (selectedSection) {
          case 'Reading':
            return [
                { value: 'Reading & Writing：Fill in the blanks', label: 'Reading & Writing：Fill in the blanks' },
                { value: 'Multiple Choice (Multiple)', label: 'Multiple Choice (Multiple)' },
                { value: 'Re-order Paragraphs', label: 'Re-order Paragraphs' },
                { value: 'Reading：Fill in the Blanks', label: 'Reading：Fill in the Blanks' },
                { value: 'Multiple Choice (Single)', label: 'Multiple Choice (Single)' }
            ];
          case 'Writing':
            return [
                { value: 'Summarize Written Text', label: 'Summarize Written Text' },
                { value: 'Write Essay', label: 'Write Essay' }
            ];
          case 'Speaking':
            return [
                { value: 'Read Aloud', label: 'Read Aloud' },
                { value: 'Repeat Sentence', label: 'Repeat Sentence' },
                { value: 'Describe Image', label: 'Describe Image' },
                { value: 'Respond to a situation', label: 'Respond to a situation' },
                { value: 'Answer Short Question', label: 'Answer Short Question' }
            ];
          case 'Listening':
            return [
                { value: 'Summarize Spoken Text', label: 'Summarize Spoken Text' },
                { value: 'Multiple Choice, Choose Multiple Answers', label: 'Multiple Choice, Choose Multiple Answers' },
                { value: 'Fill in the Blanks', label: 'Fill in the Blanks' },
                { value: 'Highlight Incorrect Words', label: 'Highlight Incorrect Words' },
                { value: 'Multiple Choice, Choose Single Answer', label: 'Multiple Choice, Choose Single Answer' },
                { value: 'Select Missing Word', label: 'Select Missing Word' },
                { value: 'Write from Dictation', label: 'Write from Dictation' }
            ];
          default:
            return [
                {  label: 'Please select a section to see the question types' }
            ];
        }
      };

    const handleSectionChange = (selectedOption) => {
    const newSection = selectedOption ? selectedOption.value : null;
    setSelectedSection(newSection);
    setSelectedContent(null);
    // Don't clear question components when changing section
    
    // Send section selection to chat
    if (newSection) {
        const message = `Selected section: ${newSection}`;
        setMessages(prev => [...prev, { type: 'user', text: message }]);
        
        // Simulate AI response
        simulateAiResponse(`I'll help you with ${newSection} section. Please select a specific question type.`);
    }
    };
    
    //handle the question change (Next Question)
    const handleContentChange = (selectedOption) => {
        const newContent = selectedOption ? selectedOption.value : null;
        setSelectedContent(newContent);
        
        // Send content selection to chat
        if (newContent && selectedSection) {
            const message = `Selected question type: ${newContent}`;
            setMessages(prev => [...prev, { type: 'user', text: message }]);
            
            // Generate new question data based on selected type
            const questionData = generateSampleQuestionData(selectedSection, newContent);
            
            // Map the selected content to the correct component key in componentMap
            const componentKey = getComponentKey(selectedSection, newContent);
            
            // Create a message ID to link the AI response with question component
            const messageId = Date.now();
            
            // Add new question component to array
            const newQuestionComponent = {
                id: messageId,
                type: componentKey,
                data: questionData,
                section: selectedSection,
                questionType: newContent,
                isActive: true
            };
            
            setQuestionComponents(prev => [...prev, newQuestionComponent]);
            
            // Set this question as the active one
            setActiveQuestionId(messageId);
            
            // Simulate AI response with new question
            simulateAiResponse(
                `Here's a new practice question for ${selectedSection} - ${newContent}:`, 
                messageId
            );
            
        }
    };

    
    // Helper function to map selected question type to component key
    const getComponentKey = (section, questionType) => {
        // Map from the selected options to the actual component keys in allQuestionMap.js
        const mappings = {
            'Reading': {
                'Reading & Writing：Fill in the blanks': 'fillInTheBlanks_reading',
                'Multiple Choice (Multiple)': 'multipleChoiceMultiple_reading',
                'Re-order Paragraphs': 'reorderParagraph',
                'Reading：Fill in the Blanks': 'reading_fillInTheBlanks',
                'Multiple Choice (Single)': 'multipleChoiceSingle_reading'
            },
            'Writing': {
                'Summarize Written Text': 'summarizeWrittenText',
                'Write Essay': 'writeEssay'
            },
            'Speaking': {
                'Read Aloud': 'readAloud',
                'Repeat Sentence': 'repeatSentence',
                'Describe Image': 'describeImage',
                'Respond to a situation': 'respondToASituation',
                'Answer Short Question': 'answerShortQuestion'
            },
            'Listening': {
                'Summarize Spoken Text': 'summarizeSpokenText',
                'Multiple Choice, Choose Multiple Answers': 'multipleChoiceMultiple_listening',
                'Fill in the Blanks': 'fillInTheBlanks_listenng',
                'Highlight Incorrect Words': 'highlightIncorrectWords',
                'Multiple Choice, Choose Single Answer': 'multipleChoiceSingle_listenong',
                'Select Missing Word': 'selectMissingWord',
                'Write from Dictation': 'writeFromDictation'
            }
        };
        
        return mappings[section] && mappings[section][questionType] 
            ? mappings[section][questionType] 
            : questionType; // Fallback to the original type if mapping not found
    };
    
    // Helper function to generate sample question data based on question type
    const generateSampleQuestionData = (section, questionType) => {
        // Generate a unique ID based on timestamp
        const id = Date.now();
        
        // Sample questions for different types
        const sampleQuestions = {
            'Reading': {
                'Reading & Writing：Fill in the blanks': `Sample reading and writing fill in the blanks question ${id}`,
                'Multiple Choice (Multiple)': `Sample multiple choice multiple question ${id}`,
                'Re-order Paragraphs': `Sample re-order paragraphs question ${id}`,
                'Reading：Fill in the Blanks': `Sample reading fill in the blanks question ${id}`,
                'Multiple Choice (Single)': `Sample multiple choice single question ${id}`
            },
            'Writing': {
                'Summarize Written Text': `Sample summarize written text question ${id}`,
                'Write Essay': `Sample essay question ${id}`
            },
            'Speaking': {
                'Read Aloud': `Sample read aloud question ${id}`,
                'Repeat Sentence': `Sample repeat sentence question ${id}`,
                'Describe Image': `Sample describe image question ${id}`,
                'Respond to a situation': `Sample respond to situation question ${id}`,
                'Answer Short Question': `Sample short question ${id}`
            },
            'Listening': {
                'Summarize Spoken Text': `Sample summarize spoken text question ${id}`,
                'Multiple Choice, Choose Multiple Answers': `Sample multiple choice multiple listening question ${id}`,
                'Fill in the Blanks': `Sample fill in the blanks listening question ${id}`,
                'Highlight Incorrect Words': `Sample highlight incorrect words question ${id}`,
                'Multiple Choice, Choose Single Answer': `Sample multiple choice single listening question ${id}`,
                'Select Missing Word': `Sample select missing word question ${id}`,
                'Write from Dictation': `Sample write from dictation question ${id}`
            }
        };

        return {
            id: id,
            question: sampleQuestions[section]?.[questionType] || `This is a sample ${questionType} question from the ${section} section.`,
            // Add other properties based on question type requirements
        };
    };

    // Helper function to simulate AI response
    const simulateAiResponse = (responseText, messageId = null, relatedQuestionId = null, isSubmissionResponse = false) => {
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                type: 'ai', 
                text: responseText,
                messageId: messageId, // Add messageId to link with question component
                relatedQuestionId: relatedQuestionId, // Add related question ID for buttons
                isSubmissionResponse: isSubmissionResponse // Flag to indicate if this is a response to a submission
            }]);
            if (isSoundOn && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(responseText);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            }
        }, 500);
    };

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            setRecognition(recognition);
        } else {
            console.warn('Speech recognition not supported in this browser');
        }
    }, []);

    //scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
    
    // Execute scrollToBottom when messages change
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom]);

    // Handle mic click
    const handleMicClick = () => {
        if (recognition) {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
                setIsListening(true);
            }
        }
    };

    // Handle input submit
    const handleInputSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
            setInputValue('');
            
            // Generate AI response based on context if available
            let aiResponse = 'This is a sample AI response.';
            simulateAiResponse(aiResponse);
        }
    };

    // Handle submit action
    const handleSubmit = () => {
        if (isRunning) {
            // Get the active question component
            const activeQuestion = questionComponents.find(comp => comp.id === activeQuestionId);
            
            if (!activeQuestion) return;
            
            // Dispatch submit with the active question ID
            dispatch(submit(activeQuestionId));
            
            // Only generate feedback if question wasn't already submitted
            if (!submittedQuestions[activeQuestionId]) {
                // Generate a more detailed feedback message based on question type
                let feedbackMessage = `Your answer for ${activeQuestion.section} - ${activeQuestion.questionType} has been submitted!`;
                // Add submission message to chat with flag to indicate it's a submission response
                simulateAiResponse(feedbackMessage, null, activeQuestionId, true);
            }
                
            // Update the question component to show it as submitted
            setQuestionComponents(prev => prev.map(comp => {
                if (comp.id === activeQuestionId) {
                    return { ...comp, submitted: true };
                }
                return comp;
            }));
        }
    };

    // Handle next question action
    const handleNext = () => {
        // Stop the current timer and reset state
        dispatch(nextQuestion());
        
        if (selectedSection && selectedContent) {
            // Generate new question data
            const questionData = generateSampleQuestionData(selectedSection, selectedContent);
            const componentKey = getComponentKey(selectedSection, selectedContent);
            const messageId = Date.now();
            
            // Create new component for the question
            const newQuestionComponent = {
                id: messageId,
                type: componentKey,
                data: questionData,
                section: selectedSection,
                questionType: selectedContent,
                isActive: true
            };
            
            // First mark all existing questions as inactive
            const updatedQuestionComponents = questionComponents.map(comp => ({
                ...comp,
                isActive: false
            }));
            
            // Add the new question component and set it as active
            setQuestionComponents([...updatedQuestionComponents, newQuestionComponent]);
            setActiveQuestionId(messageId);
            
            // Send the message for the new question
            simulateAiResponse(
                `Here's a new practice question for ${selectedSection} - ${selectedContent}:`, 
                messageId
            );
            
            // The timer will be set by the respective question component when it mounts
            // This is more reliable and prevents timer resets when using hints
        }
    };

    // Add function to handle clarify answer request
    const handleClearifyAnswer = (questionId) => {
        if (!questionId) return;
        // Get the related question component
        const question = questionComponents.find(comp => comp.id === questionId);
        let clarificationMessage = `Here's a clearer explanation for the ${question.section} - ${question.questionType} question:`;
            
        simulateAiResponse(clarificationMessage);        
    };

    // Combine messages and components for display
    const renderChatContent = () => {
        let contentItems = [];
        
        // Process all messages
        messages.forEach((message, index) => {
            // Add the message
            contentItems.push(
                <div key={`msg-${index}`} className={`message ${message.type}`}>
                    {message.text}
                </div>
            );
            
            // If this is an AI response to a submission, add the ReButton after it
            if (message.type === 'ai' && message.isSubmissionResponse) {
                contentItems.push(
                    <div key={`rebutton-${index}`} className="message-buttons">
                        <ReButton 
                            onNext={handleNext}
                            clearifyAnswer={() => handleClearifyAnswer(message.relatedQuestionId)}
                        />
                    </div>
                );
            }
            
            // If this is an AI message with messageId, find and add the corresponding question component
            if (message.type === 'ai' && message.messageId) {
                const relatedComponent = questionComponents.find(comp => comp.id === message.messageId);
                if (relatedComponent) {
                    // Determine if this is the active question
                    const isActiveQuestion = relatedComponent.id === activeQuestionId || 
                        // If this is the only question or the first question and no active question is set, treat it as active
                        (questionComponents.length === 1 || (questionComponents.length > 0 && activeQuestionId === null));
                    
                    contentItems.push(
                        <div key={`comp-${relatedComponent.id}`} 
                            className={`question-container ${isActiveQuestion ? 'active-question' : 'inactive-question'} 
                                      ${relatedComponent.submitted ? 'submitted-question' : ''}`}
                        >
                            <div className="question-header">
                                {relatedComponent.section} - {relatedComponent.questionType}
                                {!isActiveQuestion && !relatedComponent.submitted && <span className="inactive-label">(Previous Question)</span>}
                                {relatedComponent.submitted && <span className="submitted-label">(Submitted)</span>}
                            </div>
                            <QuestionRenderer 
                                type={relatedComponent.type} 
                                data={relatedComponent.data}
                                isActive={isActiveQuestion} 
                                questionId={relatedComponent.id}
                            />
                        </div>
                    );
                }
            }
        });
      
        return contentItems;
    };

    return (
        <div>
            <div className={`chat_div ${!showChatWithAi ? 'visible' : ''} ${isRunning ? 'timer-running' : ''}`}>
                
                <div className="chat_messages">
                    {renderChatContent()}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat_input chat_div_input">
                    <form onSubmit={handleInputSubmit} className="input_container">
                        <input 
                            type="text" 
                            placeholder={isRunning ? 'पहिला प्रश्नन मिलाउनुहोस् अनि मात्र chat गर्नुहोस्' : ` आफ्नो प्रश्न लेख्नुहोस्`} 
                            style={{height:'40px'}}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isRunning}
                        />
                        <span 
                            className={`chat_mic ${isRunning ? 'disabled-mic' : ''}`}
                            onClick={isRunning ? null : handleMicClick} 
                            style={{right:'35px',  transform:'translateY(-30%)',  }}
                        >
                            <svg 
                                className="bi bi-mic" 
                                fill={isListening ? "red" : (isRunning ? "#ccc" : "currentColor")} 
                                height="36" 
                                viewBox="0 0 16 26" 
                                width="36" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                                <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                            </svg>
                        </span>
                        <button type="submit" className="send-button" disabled={isRunning}>
                            <svg style={{enableBackground:'new 0 0 24 24', opacity: isRunning ? 0.5 : 1}} height='30px' width='30px' version="1.1" viewBox="0 0 24 24" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"><g id="info"/><g id="icons"><path d="M21.5,11.1l-17.9-9C2.7,1.7,1.7,2.5,2.1,3.4l2.5,6.7L16,12L4.6,13.9l-2.5,6.7c-0.3,0.9,0.6,1.7,1.5,1.2l17.9-9   C22.2,12.5,22.2,11.5,21.5,11.1z" id="send"/></g></svg>
                        </button>
                    </form>
                </div>

                <div className="select_section">
                    <div className="sections">
                        <Select 
                            options={sections} 
                            onChange={handleSectionChange} 
                            placeholder="Select section" 
                            menuPlacement="top" 
                            styles={customStyles}
                            isClearable={true}
                            isDisabled={isRunning}
                        />
                    </div>
                    <div className="section_content">
                        <Select 
                            options={getContentOptions()} 
                            onChange={handleContentChange} 
                            placeholder="Select question type" 
                            menuPlacement="top" 
                            styles={customStyles}
                            isClearable={true}
                            isDisabled={isRunning}
                        />                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default chatBox