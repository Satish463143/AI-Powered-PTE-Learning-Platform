const fullMockTestModel = require("./fullMockTest.model");
const generateAiResponse = require("../../utils/ai.service");
const promptTemplates = require("../../utils/ptePromptTemplates");

// Test progression configuration
const TEST_PROGRESSION = {
    sections: ['Speaking','Writing', 'Reading', 'Listening', ],
    questionTypes: {
        'Speaking': ['readAloud', 'repeatSentence', 'describeImage', 'retellLecture', 'answerShortQuestion'],
        'Writing': ['summarizeWrittenText', 'writeEssay'],
        'Reading': [ 'fillInTheBlanks_reading','multipleChoiceMultiple_reading','reorderParagraph','reading_fillInTheBlanks', 'multipleChoiceSingle_reading', ],
        'Listening': ['summarizeSpokenText','multipleChoiceMultiple_listening','fillInTheBlanks_listening','multipleChoiceSingle_listening','highlightIncorrectWords','writeFromDictation']        
    },
    questionsPerType: {
        //speaking
        'readAloud': 7,
        'repeatSentence': 11,
        'describeImage': 3,
        'retellLecture': 1,
        'answerShortQuestion': 6,
        //writing
        'summarizeWrittenText': 2,
        'writeEssay': 2, 
        //reading
        'fillInTheBlanks_reading': 5,
        'multipleChoiceMultiple_reading': 2,
        'reorderParagraph': 2,        
        'reading_fillInTheBlanks': 5,
        'multipleChoiceSingle_reading': 2,
        //listening
        'summarizeSpokenText': 2,
        'multipleChoiceMultiple_listening': 1,
        'fillInTheBlanks_listening': 3, 
        'multipleChoiceSingle_listening': 4,
        'highlightIncorrectWords': 3,
        'writeFromDictation': 4,              
    }
};

// Helper: clean AI markdown-wrapped JSON
function cleanJsonBlock(text) {
    if (!text) return '';
    
    console.log('Cleaning text:', text);
    
    // First try to find JSON block in markdown
    const jsonBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonBlockMatch) {
        console.log('Found JSON in markdown block');
        return jsonBlockMatch[1].trim();
    }

    // If no markdown block found, try to find raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        console.log('Found raw JSON object');
        return jsonMatch[0].trim();
    }

    // If no JSON object found, return cleaned text
    console.log('No JSON found, cleaning markdown');
    return text.replace(/```json|```/g, '').trim();
}
  
// Helper: shuffle array
function shuffleArray(array) {
    return array
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
}

class FullMockTestService {
    handleFullMockTest = async(userId, actionType, question, userAnswer, mockTestId) => {
        try {
            let mockTest;
            
            // For all actions except initial creation, mockTestId should exist
            if (mockTestId) {
                mockTest = await fullMockTestModel.findById(mockTestId);
                if (!mockTest) {
                    throw new Error('Mock test not found with provided ID');
                }
            } else if (actionType !== 'next') {
                // If no mockTestId and not initial 'next', that's an error
                throw new Error('mockTestId is required for this action');
            }

            switch (actionType) {
                case 'next':
                    // Only create new test if this is the first 'next' action and no mockTestId
                    if (!mockTestId) {
                        mockTest = new fullMockTestModel({
                            userId,
                            sections: [],
                            overallScore: 0,
                            status: 'in_progress',
                            attemptStartedAt: new Date()
                        });
                        mockTest = await mockTest.save();
                    }
                    
                    // Save previous question/answer if provided
                    if (question && userAnswer) {
                        const { section, questionType } = this.extractQuestionMetadata(question);
                        await this.saveQuestionAnswer({
                            mockTestId: mockTest._id,
                            section,
                            question,
                            userAnswer,
                            questionType
                        });
                    }
                    
                    // Determine next question details
                    const nextQuestionInfo = await this.getNextQuestionInfo(mockTest._id);
                    
                    if (nextQuestionInfo.isTestComplete) {
                        return {
                            message: 'Test completed successfully',
                            mockTestId: mockTest._id,
                            isTestComplete: true,
                            status: 'completed'
                        };
                    }                    
                    return {
                        message: 'Previous answer saved successfully',
                        mockTestId: mockTest._id,
                        nextSection: nextQuestionInfo.section,
                        nextQuestionType: nextQuestionInfo.questionType,
                        questionNumber: nextQuestionInfo.questionNumber,
                        totalQuestions: nextQuestionInfo.totalQuestions,
                        sectionProgress: nextQuestionInfo.sectionProgress
                    };
                    
                case 'submit':
                    // Submit final answer and complete test
                    return await this.submitAnswer({
                        userId,
                        userAnswer,
                        question,
                        mockTestId: mockTest._id
                    });

                case 'generate_all_questions':
                    if (!mockTest) {
                        throw new Error('Mock test not found');
                    }

                    // Get current progress to know what questions we need
                    const allQuestionInfo = await this.getNextQuestionInfo(mockTest._id);
                    if (allQuestionInfo.isTestComplete) {
                        throw new Error('Test is already complete');
                    }

                    // Get the current section and question type
                    const currentSection = allQuestionInfo.section;
                    const currentQuestionType = allQuestionInfo.questionType;

                    // Generate all questions for the current type
                    const questions = [];
                    const requiredCount = TEST_PROGRESSION.questionsPerType[currentQuestionType];
                    
                    for (let i = 0; i < requiredCount; i++) {
                        const generatedQuestion = await this.generateQuestion(
                            currentSection,
                            currentQuestionType,
                            userId,
                            mockTest._id
                        );

                        // Add section and type to the question object
                        const questionWithMetadata = {
                            ...generatedQuestion.question,
                            section: currentSection,
                            questionType: currentQuestionType
                        };

                        // Save the question
                        await this.saveQuestionAnswer({
                            mockTestId: mockTest._id,
                            section: currentSection,
                            question: questionWithMetadata,
                            userAnswer: null,
                            questionType: currentQuestionType
                        });

                        questions.push(questionWithMetadata);
                    }

                    return {
                        message: `All ${currentQuestionType} questions generated successfully`,
                        mockTestId: mockTest._id,
                        questions: questions,
                        currentSection,
                        currentQuestionType,
                        questionCount: questions.length,
                        totalQuestionsForType: requiredCount
                    };
                          
                default:
                    throw new Error('Invalid action type');
            }
        } catch(exception) {
            console.log(exception);
            throw exception;
        }
    }

    extractQuestionMetadata = (question) => {
        const normalize = str => str?.trim();
        
        // If question is a string, try to parse it
        let questionObj = question;
        if (typeof question === 'string') {
            try {
                questionObj = JSON.parse(question);
            } catch (error) {
                throw new Error(`Invalid question data: ${error.message}`);
            }
        }
    
        const section = normalize(questionObj.section || questionObj.sectionType);
        const questionType = normalize(questionObj.questionType || questionObj.type);
    
        if (!section || !questionType) {
            throw new Error(`Missing section or questionType in question metadata: ${JSON.stringify(questionObj)}`);
        }
    
        return { section, questionType };
    };
    
    // Get next question information based on current progress
    getNextQuestionInfo = async (mockTestId) => {
        try {
            const mockTest = await fullMockTestModel.findById(mockTestId);
            if (!mockTest) {
                throw new Error('Mock test not found');
            }

            // Calculate current progress
            let totalQuestionsAnswered = 0;
            const sectionProgress = {};

            // Initialize sectionProgress with 0 for all question types
            TEST_PROGRESSION.sections.forEach(sectionName => {
                sectionProgress[sectionName] = {};
                TEST_PROGRESSION.questionTypes[sectionName].forEach(questionType => {
                    sectionProgress[sectionName][questionType] = 0;
                });
            });

            // Count questions answered in each section/type
            mockTest.sections.forEach(section => {
                section.questionTypes.forEach(questionType => {
                    const questionsCount = questionType.questions.length;
                    sectionProgress[section.name][questionType.type] = questionsCount;
                    totalQuestionsAnswered += questionsCount;
                });
            });

            // Find next section and question type
            for (const sectionName of TEST_PROGRESSION.sections) {
                const questionTypes = TEST_PROGRESSION.questionTypes[sectionName];
                
                for (const questionType of questionTypes) {
                    const currentCount = sectionProgress[sectionName]?.[questionType] || 0;
                    const requiredCount = TEST_PROGRESSION.questionsPerType[questionType];
                    
                    if (currentCount < requiredCount) {
                        // Calculate total questions for progress tracking
                        const totalQuestions = Object.values(TEST_PROGRESSION.questionsPerType)
                            .reduce((sum, count) => sum + count, 0);
                        
                        return {
                            section: sectionName,
                            questionType: questionType,
                            questionNumber: currentCount + 1,
                            totalQuestions: requiredCount,
                            sectionProgress: sectionProgress,
                            isTestComplete: false,
                            overallProgress: {
                                answered: totalQuestionsAnswered,
                                total: totalQuestions
                            }
                        };
                    }
                }
            }

            // If we reach here, test is complete
            return {
                isTestComplete: true,
                sectionProgress: sectionProgress
            };

        } catch (exception) {
            console.log(exception);
            throw exception;
        }
    }

    // Create new mock test
    createNewMockTest = async (userId) => {
        try {
            const newMockTest = new fullMockTestModel({
                userId,
                sections: [],
                overallScore: 0,
                status: 'in_progress',
                attemptStartedAt: new Date()
            });

            const savedTest = await newMockTest.save();
            return savedTest._id;
        } catch (exception) {
            console.log(exception);
            throw exception;
        }
    }

    // Find or create mock test
    findOrCreateMockTest = async (userId, mockTestId) => {
        try {
            if (mockTestId) {
                const existingTest = await fullMockTestModel.findById(mockTestId);
                if (!existingTest) {
                    throw new Error('Mock test not found with provided ID');
                }
                return existingTest;
            }

            // Only create new mock test if no mockTestId was provided
            const newMockTest = new fullMockTestModel({
                userId,
                sections: [],
                overallScore: 0,
                status: 'in_progress',
                attemptStartedAt: new Date()
            });

            return await newMockTest.save();
        } catch (exception) {
            console.log(exception);
            throw exception;
        }
    }

    // Save question and answer to appropriate section
    saveQuestionAnswer = async ({ mockTestId, section, question, userAnswer, questionType }) => {
        try {
            const mockTest = await fullMockTestModel.findById(mockTestId);
            if (!mockTest) {
                throw new Error('Mock test not found');
            }
    
            // Normalize section and type
            const finalSection = section.trim();
            const finalQuestionType = questionType.trim();
    
            // Debug invalid mapping
            if (!TEST_PROGRESSION.questionTypes[finalSection]?.includes(finalQuestionType)) {
                console.warn(`[WARNING] Invalid section/type combo: ${finalSection} → ${finalQuestionType}`);
            }
    
            // Find or create the section
            let sectionIndex = mockTest.sections.findIndex(s => s.name === finalSection);
            if (sectionIndex === -1) {
                mockTest.sections.push({
                    name: finalSection,
                    questionTypes: [],
                    score: 0
                });
                sectionIndex = mockTest.sections.length - 1;
            }
    
            // Find or create the question type entry
            let questionTypeIndex = mockTest.sections[sectionIndex].questionTypes
                .findIndex(qt => qt.type === finalQuestionType);
    
            if (questionTypeIndex === -1) {
                // Create a new question type entry with the correct structure
                const newQuestionType = {
                    type: finalQuestionType,
                    questions: [],
                    answers: []
                };
                mockTest.sections[sectionIndex].questionTypes.push(newQuestionType);
                questionTypeIndex = mockTest.sections[sectionIndex].questionTypes.length - 1;
            }
    
            // Add the question and answer to their respective arrays
            const currentQuestionType = mockTest.sections[sectionIndex].questionTypes[questionTypeIndex];
            currentQuestionType.questions.push(question);
            currentQuestionType.answers.push(userAnswer || null);
    
            // Save the updated mock test
            await mockTest.save();
            return mockTest;
    
        } catch (exception) {
            console.log('[ERROR] saveQuestionAnswer:', exception);
            throw exception;
        }
    };
    


    // Generate question using existing prompt templates (optional - frontend can also do this)
    generateQuestion = async (section, questionType, userId, mockTestId, retryCount = 0) => {
        try {
            // Get prompt from existing templates
            const prompt = promptTemplates.getPrompt(questionType, 'generate');
            
            if (!prompt) {
                throw new Error(`No prompt template found for question type: ${questionType}`);
            }

            // Generate AI question
            const rawResponse = await generateAiResponse([
                { role: 'user', content: prompt }
            ], { skipBilingualTone: true });

            const cleaned = cleanJsonBlock(rawResponse);
            
            let parsed;
            try {
                parsed = JSON.parse(cleaned);
            } catch (error) {
                // If we haven't exceeded max retries, try again
                if (retryCount < 3) {
                    console.log(`Retry ${retryCount + 1} for ${questionType} due to parsing error`);
                    return await this.generateQuestion(section, questionType, userId, mockTestId, retryCount + 1);
                }
                // If we've exceeded retries, throw a more descriptive error
                throw new Error(`Failed to generate valid question after ${retryCount} retries for ${questionType}`);
            }

            // Validate the parsed response has required fields
            if (!this.validateQuestionFormat(parsed, questionType)) {
                if (retryCount < 3) {
                    console.log(`Retry ${retryCount + 1} for ${questionType} due to invalid format`);
                    return await this.generateQuestion(section, questionType, userId, mockTestId, retryCount + 1);
                }
                throw new Error(`Generated question format invalid for ${questionType} after ${retryCount} retries`);
            }

            return {
                question: parsed,
                mockTestId: mockTestId,
                section,
                questionType
            };

        } catch (error) {
            console.error('Error in generateQuestion:', error.message);
            // If we haven't exceeded max retries, try again
            if (retryCount < 3) {
                console.log(`Retry ${retryCount + 1} for ${questionType} due to error: ${error.message}`);
                return await this.generateQuestion(section, questionType, userId, mockTestId, retryCount + 1);
            }
            throw error;
        }
    }

    validateQuestionFormat = (question, questionType) => {
        switch (questionType) {
            case 'readAloud':
                return typeof question.paragraph === 'string' && question.paragraph.length > 0;
            case 'repeatSentence':
                return typeof question.text === 'string' && question.text.length > 0;
            case 'describeImage':
                // Check for either imageUrl or image property
                const hasValidImage = (typeof question.imageUrl === 'string' && question.imageUrl.length > 0) ||
                                    (typeof question.image === 'string' && question.image.length > 0);
                const hasValidType = typeof question.imageType === 'string' && question.imageType.length > 0;
                const hasValidImagePrompt = typeof question.prompt === 'string' && question.prompt.length > 0;
                return hasValidImage && hasValidType && hasValidImagePrompt;
            case 'retellLecture':
                return typeof question.transcript === 'string' && question.transcript.length > 0;
            case 'summarizeSpokenText':
                return typeof question.transcript === 'string' && question.transcript.length > 0;
            case 'writeFromDictation':
                return typeof question.text === 'string' && question.text.length > 0;
            case 'answerShortQuestion':
                return typeof question.question === 'string' && question.question.length > 0;
            case 'summarizeWrittenText':
                return typeof question.passage === 'string' && question.passage.length > 0 &&
                       typeof question.question === 'string' && question.question.length > 0;
            case 'writeEssay':
                return typeof question.topic === 'string' && question.topic.length > 0 &&
                       typeof question.question === 'string' && question.question.length > 0;
            case 'reorderParagraph':
                return Array.isArray(question.questions) && question.questions.length > 0;
            case 'fillInTheBlanks_reading':
                return typeof question.paragraph === 'string' && question.paragraph.length > 0 &&
                       typeof question.blanks === 'object' && Object.keys(question.blanks).length > 0;
            case 'multipleChoiceMultiple_reading':
            case 'multipleChoiceSingle_reading':
                return typeof question.passage === 'string' && question.passage.length > 0 &&
                       typeof question.question === 'string' && question.question.length > 0 &&
                       Array.isArray(question.options) && question.options.length > 0;
            case 'reading_fillInTheBlanks':
                return typeof question.paragraph === 'string' && question.paragraph.length > 0 &&
                       Array.isArray(question.blanks) && question.blanks.length > 0;
            default:
                return true;
        }
    };

    submitAnswer = async ({ userAnswer, question, mockTestId }) => {
        try {
            // Save the final answer if provided
            if (question && userAnswer && mockTestId) {
                const { section, questionType } = this.extractQuestionMetadata(question);
                await this.saveQuestionAnswer({
                    mockTestId,
                    section,
                    question,
                    userAnswer,
                    questionType
                });
            }

            // Update mock test status to completed
            const mockTest = await fullMockTestModel.findById(mockTestId);
            if (mockTest) {
                mockTest.status = 'completed';
                mockTest.submittedAt = new Date();
                await mockTest.save();
            }

            return {
                message: 'Test completed successfully',
                mockTestId: mockTestId,
                status: 'completed'
            };
        } catch (exception) {
            console.log(exception);
            throw exception;
        }
    }

    // Get user's mock tests (lightweight list view)
    getAllMockTest = async (filter) => {
        try {
            const count = await fullMockTestModel.countDocuments(filter);
            if(count === 0){
                return {
                    count: 0,
                    data: [],
                    message: "No mock test found"
                }
            }
            
            // Only select basic fields for listing
            const mockTests = await fullMockTestModel.find(filter)
                .select('_id status attemptStartedAt submittedAt')
                .populate('userId', 'userName email')
                .sort({ _id:"desc" });
                
            return {
                count,
                mockTests
            };
        } catch (exception) {
            console.log(exception);
            throw exception;
        }
    }

    // Get complete mock test details (detailed view)
    getMockTestById = async (mockTestId) => {
        try {
            const mockTest = await fullMockTestModel.findById(mockTestId)
                .populate('userId', 'userName email');
            if (!mockTest) {
                throw new Error('Mock test not found');
            }
            return mockTest;
        } catch (exception) {
            console.log(exception);
            throw exception;
        }
    }
    getUserMockTests = async (filter) => {
        try {
            const tests = await fullMockTestModel.find(filter)
                .select('overallScore, sections status')
                .populate('userId', 'userName email')
                .sort({ _id:"desc" });

            // Prepare the result array
            const results = tests.map(test => ({
                mockTestId: test._id,
                overallScore: test.overallScore,
                sectionCount: test.sections ? test.sections.length : 0,
                status: test.status,
            }));
          return {
            count: results.length,
            data: results,
          };
        } catch (exception) {
          console.log(exception);
          throw exception;
        }
      };
      saveAboutMe = async (userId, file) => {
        try {
            const mockTest = await fullMockTestModel.findOne({userId});
            if(!mockTest){
                throw new Error('Mock test not found');
            }
            mockTest.aboutMe = {
                audioUrl: file.cloudStoragePublicUrl,
                recordedAt: new Date()
            }
            await mockTest.save();
            return mockTest;
        } catch (exception) {
            console.log(exception);
            throw exception;
        }
      }
}

module.exports = new FullMockTestService();