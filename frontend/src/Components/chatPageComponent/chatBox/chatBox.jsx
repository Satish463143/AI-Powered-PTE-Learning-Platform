import React, { useState, useCallback, useEffect, useRef } from 'react'
import Select from 'react-select'
import './chatBox.css'
import componentMap from '../../sections/allQuestionMap';
import { useSelector, useDispatch } from 'react-redux';
import { submit, nextQuestion } from '../../../reducer/chatReducer';
import ReButton from '../../../Common/reButton/reButton';
import ResultTable from '../../../Common/resultTable/resultTable';
import { useGetChatMutation } from '../../../api/chat.api';
import { useStartPracticeMutation } from '../../../api/practiceQuestion.api';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

// Helper function to safely render HTML
const createMarkup = (html) => {
    return { __html: html };
};

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
    const [suggestions, setSuggestions] = useState([
        // 'Can you suggest topics for us to discuss?',
        // 'What are some ways I can use this assistant effectively?',
        // 'What can you help me with today?'
    ]);
    const [getChat, {isLoading: isChatLoading}] = useGetChatMutation();
    const suggestionTimeoutRef = useRef(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasInitialLoadOccurred, setHasInitialLoadOccurred] = useState(false);
    const [getPracticeQuestion, {isLoading: isPracticeQuestionLoading}] = useStartPracticeMutation();
    

    //use effect for hint
    useEffect(() => {
        if(hintUsed && activeQuestionId && !submittedQuestions[activeQuestionId]){   
            // Only show hint if the question has not been submitted
            const activeQuestion = questionComponents.find(comp => comp.id === activeQuestionId);

            const getHint = async () => {
                try {
                    const submitData = {
                        type: activeQuestion.type,
                        payload: {
                            actionType: "hint",
                            section: activeQuestion.section.toLowerCase()
                        }
                    };
                    const response = await getPracticeQuestion(submitData);
                    if (response.data && response.data.result) {
                        // Extract the hint text from the response
                        const hintText = response.data.result.hint || response.data.result;
                        simulateAiResponse(typeof hintText === 'string' ? hintText : 'Here is a hint to help you.');
                    }
                } catch(error) {
                    console.log('Error getting hint:', error);
                    simulateAiResponse("Sorry, I couldn't generate a hint at this moment. Please try again.");
                }
            };

            getHint();
        }
    }, [hintUsed, activeQuestionId, questionComponents, submittedQuestions])

    //question renderer
    const QuestionRenderer = ({ type, data, isActive = true, questionId }) => {
        const Component = componentMap[type]
        const isActiveQuestion = activeQuestionId === questionId || isActive;
        
        // Find the result data for this question from messages
        const resultMessage = messages.find(msg => 
            msg.relatedQuestionId === questionId && msg.resultData
        );
        const resultData = resultMessage?.resultData;
        
        return (
            <>
                {Component ? <Component 
                    data={data} 
                    onSubmit={handleSubmit}
                    onNext={handleNext}
                    showTimer={isActiveQuestion} // Only show timer for active question
                    questionId={questionId}
                    resultData={resultData}
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

    const handleSectionChange = async(selectedOption) => {
    const newSection = selectedOption ? selectedOption.value : null;
    setSelectedSection(newSection);
    setSelectedContent(null);
    };
    
    //handle the question change (Next Question)
    const handleContentChange = async(selectedOption) => {
        const newContent = selectedOption ? selectedOption.value : null;
        setSelectedContent(newContent);
        
        // Send content selection to chat
        if (newContent && selectedSection) {
            const message = `Section Type: ${selectedSection}, Selected question type: ${newContent}`;
            setMessages(prev => [...prev, { type: 'user', text: message }]);
            
            try {
                // Map the selected content to the correct component key in componentMap first
                const componentKey = getComponentKey(selectedSection, newContent);
                
                // Make API call to get the question
                const submitData = {
                    type: componentKey,
                    payload: {
                        actionType: "next",
                        section: selectedSection.toLowerCase()
                    }
                };

                const response = await getPracticeQuestion(submitData);
                console.log('API Response Data Structure:', response);
                
                // Create a message ID to link the AI response with question component
                const messageId = Date.now();
                
                // Add new question component to array with actual API response data
                const newQuestionComponent = {
                    id: messageId,
                    type: componentKey,
                    data: response.data,
                    section: selectedSection,
                    questionType: newContent,
                    isActive: true
                };
                
                setQuestionComponents(prev => [...prev, newQuestionComponent]);
                
                // Set this question as the active one
                setActiveQuestionId(messageId);
                
                simulateAiResponse(
                    `Here's a new practice question for ${selectedSection} - ${newContent}:`, 
                    messageId
                );
            } catch (error) {
                console.error('Error getting question:', error);
                simulateAiResponse("Sorry, there was an error getting the question. Please try again.");
            }
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
                'Fill in the Blanks': 'fillInTheBlanks_listening',
                'Highlight Incorrect Words': 'highlightIncorrectWords',
                'Multiple Choice, Choose Single Answer': 'multipleChoiceSingle_listening', // Fixed typo from 'listenong' to 'listening'
                'Select Missing Word': 'selectMissingWord',
                'Write from Dictation': 'writeFromDictation'
            }
        };
        
        return mappings[section] && mappings[section][questionType] 
            ? mappings[section][questionType] 
            : questionType; // Fallback to the original type if mapping not found
    };
    

    // Helper function to simulate AI response
    const simulateAiResponse = (responseText, messageId = null, relatedQuestionId = null, isSubmissionResponse = false, resultData = null) => {
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                type: 'ai', 
                text: responseText,
                messageId: messageId, // Add messageId to link with question component
                relatedQuestionId: relatedQuestionId, // Add related question ID for buttons
                isSubmissionResponse: isSubmissionResponse, // Flag to indicate if this is a response to a submission
                resultData: resultData // Add result data for displaying in ResultTable
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

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (messages.length > 0) {
            const chatMessages = document.querySelector('.chat_messages');
            if (chatMessages) {
                // Always scroll to bottom when new messages are added
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    }, [messages]);

    // Handle initial load suggestions
    useEffect(() => {
        // Only show suggestions if initial load hasn't occurred yet
        if (!hasInitialLoadOccurred && !isRunning) {
            // Set a timeout for initial suggestions
            const initialTimeout = setTimeout(() => {
                setShowSuggestions(true);
                setHasInitialLoadOccurred(true);
            }, 5000);

            return () => clearTimeout(initialTimeout);
        }
    }, [hasInitialLoadOccurred, isRunning]);

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

    // Add new function to handle practice question from chat
    const handlePracticeFromChat = async (section, questionType) => {
        // Map the section and question type to match the format expected by the practice API
        const componentKey = getComponentKey(section, questionType);
        const messageId = Date.now();

        try {
            const submitData = {
                type: componentKey,
                payload: {
                    actionType: "next",
                    section: section.toLowerCase(),
                }
            };

            const response = await getPracticeQuestion(submitData);
            
            if (response.data && response.data.result) {
                // Create new question component
                const newQuestionComponent = {
                    id: messageId,
                    type: componentKey,
                    data: response.data,
                    section: section,
                    questionType: questionType,
                    isActive: true
                };
                
                // Mark all existing questions as inactive
                const updatedQuestionComponents = questionComponents.map(comp => ({
                    ...comp,
                    isActive: false
                }));
                
                // Add the new question component and set it as active
                setQuestionComponents([...updatedQuestionComponents, newQuestionComponent]);
                setActiveQuestionId(messageId);
                
                // Update the select dropdowns to match the current question
                setSelectedSection(section);
                setSelectedContent(questionType);
                
                // Send message for the new question
                simulateAiResponse(
                    `Here's your ${section} - ${questionType} question:`, 
                    messageId
                );
            }
        } catch(error) {
            console.error('Error getting question from chat:', error);
            simulateAiResponse("Sorry, there was an error generating the question. Please try again.");
        }
    };

    // Modify handleInputSubmit to handle practice requests
    const handleInputSubmit = async(e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
            setInputValue('');            
            try {
                const chatData = {
                    message: inputValue,
                    type: "question"
                };
                const response = await getChat(chatData);
                
                // Check if the response indicates a practice request
                if (response?.data?.result?.isPracticeRequest) {
                    const { section, questionType } = response.data.result;
                    await handlePracticeFromChat(section, questionType);
                } else {
                    simulateAiResponse(response?.data?.result);
                }
            } catch(error) {
                console.log(error);
                simulateAiResponse("Sorry, I encountered an error. Please try again.");
            }
        }
    };

    // Handle submit action
    const handleSubmit = async(answer) => {
        console.log('User answer:', answer);
        if (isRunning) {
            const activeQuestion = questionComponents.find(comp => comp.id === activeQuestionId);
            
            if (!activeQuestion) return;
            
            dispatch(submit(activeQuestionId));
            
            if (!submittedQuestions[activeQuestionId]) {
                try {
                    const userId = getCookie('userId');
                    
                    const submitData = {
                        type: activeQuestion.type,
                        payload: {
                            actionType: "submit",
                            section: activeQuestion.section.toLowerCase(),
                            userId: userId, // This will be handled by authOrAnonymous middleware if null
                            userAnswer: answer,
                            attemptDuration: 45
                        }
                    };
                    let response = await getPracticeQuestion(submitData);
                    console.log('response',response);
                    
                    if (response.data && response.data.result) {
                        const overallScore = response.data.result.evaluationDetails.overallScore;
                        let feedbackMessage = `Your answer for ${activeQuestion.section} - ${activeQuestion.questionType} has been submitted! Here is your score:${overallScore}`;
                        
                        // Construct result data from the actual response
                        const resultData = {
                            questionType: response.data.result.evaluationDetails.questionType,
                            headers: response.data.result.evaluationDetails.headers,
                            rows: response.data.result.evaluationDetails.rows,
                            overallScore: response.data.result.evaluationDetails.overallScore,
                            correctAnswers: response.data.result.correctAnswers,
                            userAnswers: response.data.result.userAnswers
                        };
                        
                        simulateAiResponse(feedbackMessage, null, activeQuestionId, true, resultData);
                        
                        // Update the question component to show it as submitted
                        setQuestionComponents(prev => prev.map(comp => {
                            if (comp.id === activeQuestionId) {
                                return { ...comp, submitted: true };
                            }
                            return comp;
                        }));
                        

                    }
                } catch(error) {
                    console.log('Error submitting answer:', error);
                    simulateAiResponse("Sorry, there was an error submitting your answer. Please try again.");
                }
            }
        }
    };

    // Handle next question action for practice question
    const handleNext = async() => {
        // Stop the current timer and reset state
        dispatch(nextQuestion());
        
        // Get section and content from the active question if state is lost
        let sectionToUse = selectedSection;
        let contentToUse = selectedContent;
        
        if (!sectionToUse || !contentToUse) {
            const activeQuestion = questionComponents.find(comp => comp.id === activeQuestionId);
            if (activeQuestion) {
                sectionToUse = activeQuestion.section;
                contentToUse = activeQuestion.questionType;
            }
        }
        
        if (sectionToUse && contentToUse) {
            const messageId = Date.now();

            // Check if this is a listening question - if so, use static data instead of API
            if (sectionToUse.toLowerCase() === 'listening') {
                // For listening questions, create a new component with static data
                const componentKey = getComponentKey(sectionToUse, contentToUse);
                
                const newQuestionComponent = {
                    id: messageId,
                    type: componentKey,
                    data: {}, // Empty data - component will use static data from reducer
                    section: sectionToUse,
                    questionType: contentToUse,
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
                
                // Send message for the new question
                simulateAiResponse(
                    `Here's your next ${sectionToUse} - ${contentToUse} question:`, 
                    messageId
                );
            } else {
                // For non-listening questions, use the API
                try {
                    // Get the component key first
                    const componentKey = getComponentKey(sectionToUse, contentToUse);
                    
                    // Make API call to get next question
                    const submitData = {
                        type: componentKey, // This is the question type for the API endpoint
                        payload: {
                            actionType: "next",
                            section: sectionToUse.toLowerCase(),
                        }
                    };

                    const response = await getPracticeQuestion(submitData);
                    if (response.data && response.data.result) {
                        // Create new component for the question using the API response data
                        const newQuestionComponent = {
                            id: messageId,
                            type: componentKey,
                            data: response.data, // Fix: Use response.data instead of response
                            section: sectionToUse,
                            questionType: contentToUse,
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
                        
                        // Send message for the new question
                        simulateAiResponse(
                            `Here's your next ${sectionToUse} - ${contentToUse} question:`, 
                            messageId
                        );

                    }
                } catch(error) {
                    console.error('Error getting next question:', error);
                    simulateAiResponse("Sorry, there was an error getting the next question. Please try again.");
                }
            }
        }
    };

    // Add function to handle clarify answer request
    const handleClearifyAnswer = async(questionId) => {
        if (!questionId) return;
        const question = questionComponents.find(comp => comp.id === questionId);
        try {
            const submitData = {
                type: question.type,
                payload: {
                    actionType: "clarify",
                    lastFeedback: ""
                }
            };
            const response = await getPracticeQuestion(submitData);
            if (response.data && response.data.result) {
                const clarification = typeof response.data.result === 'string'
                    ? response.data.result
                    : response.data.result.clarification || 'Here is a clarification of your feedback.';
                simulateAiResponse(clarification);
            }
        } catch(error) {
            console.log('Error getting clarification:', error);
            simulateAiResponse("Sorry, I couldn't clarify the feedback at this moment. Please try again.");
        }
    };

    // Combine messages and components for display
    const renderChatContent = () => {
        let contentItems = [];
        
        // Process all messages
        messages.forEach((message, index) => {
            // Check if this is a reading or writing section question
            const isReadingOrWritingSection = message.relatedQuestionId && 
                (questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'reading_fillInTheBlanks' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'fillInTheBlanks_reading' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'multipleChoiceSingle_reading' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'multipleChoiceMultiple_reading' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'reorderParagraph' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'summarizeWrittenText' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'writeEssay' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'fillInTheBlanksReadingWriting');
            
            // Check if this is a listening section question
            const isListeningSection = message.relatedQuestionId && 
                (questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'summarizeSpokenText' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'multipleChoiceMultiple_listening' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'fillInTheBlanks_listening' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'highlightIncorrectWords' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'multipleChoiceSingle_listening' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'selectMissingWord' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.type === 'writeFromDictation');
            
            // Check if this is a reading, writing, or listening section submission response
            const isReadingOrWritingOrListeningSubmission = message.type === 'ai' && message.isSubmissionResponse && message.relatedQuestionId &&
                (questionComponents.find(comp => comp.id === message.relatedQuestionId)?.section?.toLowerCase() === 'reading' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.section?.toLowerCase() === 'writing' ||
                 questionComponents.find(comp => comp.id === message.relatedQuestionId)?.section?.toLowerCase() === 'listening');
            
            // Add the message (but skip submission responses for reading/writing/listening)
            if (!isReadingOrWritingOrListeningSubmission) {
                contentItems.push(
                    <div key={`msg-${index}`} className={`message ${message.type}`}>
                        <div dangerouslySetInnerHTML={createMarkup(message.text)} />
                        {message.resultData && message.resultData.headers && message.resultData.rows && !isReadingOrWritingSection && !isListeningSection && (
                            <ResultTable data={message.resultData} />
                        )}
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

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        setShowSuggestions(false);
        // Clear any existing timeout
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }
    };

    // Handle input change with suggestions
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        
        // Clear any existing timeout
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }
        
        // Hide suggestions immediately when typing
        setShowSuggestions(false);
        
        // Only set new timeout if input is empty and initial load has occurred
        if (value.length === 0 && hasInitialLoadOccurred) {
            suggestionTimeoutRef.current = setTimeout(() => {
                setShowSuggestions(true);
            }, 5000);
        }
    };

    return (
        <div>
            <div className={`chat_div ${!showChatWithAi ? 'visible' : ''}`}>
                
                <div className="chat_messages">
                    {renderChatContent()}
                    <div ref={messagesEndRef} />
                    {isChatLoading || isPracticeQuestionLoading && <p className='loading_text'>Generating</p>}
                    {/* {isPracticeQuestionLoading && <p className='loading_text'>AI is generating the question</p>} */}
                    
                    
                </div>

                <div className=" chat_div_input">
                    {showSuggestions && !isRunning && inputValue.length === 0 && (
                        <div className="suggestions">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="suggestion-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleInputSubmit} className="input_container">
                        <div className="chat_input_wrapper">
                            <input 
                                type="text" 
                                placeholder={isRunning ? 'पहिला प्रश्नन मिलाउनुहोस् अनि मात्र chat गर्नुहोस्' : 'आफ्नो प्रश्न लेख्नुहोस्'} 
                                style={{ height: '40px' }}
                                value={inputValue}
                                onChange={handleInputChange}
                                disabled={isRunning}
                            />

                            <span 
                                className={`chat_mic ${isRunning ? 'disabled-mic' : ''}`}
                                onClick={isRunning ? null : handleMicClick}
                            >
                                <svg 
                                className="bi bi-mic" 
                                fill={isListening ? "red" : (isRunning ? "#ccc" : "currentColor")} 
                                height="24" 
                                viewBox="0 0 16 26" 
                                width="24" 
                                xmlns="http://www.w3.org/2000/svg"
                                >
                                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                                <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
                                </svg>
                            </span>

                            <button type="submit" className="send-button" disabled={isRunning}>
                                <svg className="send-icon" viewBox="0 0 24 24">
                                <path d="M21.5,11.1l-17.9-9C2.7,1.7,1.7,2.5,2.1,3.4l2.5,6.7L16,12L4.6,13.9l-2.5,6.7c-0.3,0.9,0.6,1.7,1.5,1.2l17.9-9C22.2,12.5,22.2,11.5,21.5,11.1z"/>
                                </svg>
                            </button>
                        </div>
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