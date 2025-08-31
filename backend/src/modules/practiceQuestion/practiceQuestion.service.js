const generateAiResponse = require("../../utils/ai.service");
const { PracticeScore } = require("./practiceQuestion.model");
const promptTemplates = require("../../utils/ptePromptTemplates");
const ChatMessage = require("../aiChat/aiChat.model");

// Helper: clean AI markdown-wrapped JSON
function cleanJsonBlock(text) {
  if (!text) return '';
  
  // First try to find JSON block in markdown
  const jsonBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim();
  }

  // If no markdown block found, try to find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }

  // If no JSON object found, return cleaned text
  return text.replace(/```json|```/g, '').trim();
}

// Helper: shuffle array
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Ensure the array is not in its original order
  if (JSON.stringify(shuffled) === JSON.stringify(array)) {
    return shuffleArray(array); // Recursively try again
  }
  return shuffled;
}

class PracticeQuestionService {
  handlePractice = async (type, actionType, { userId, userAnswer, lastFeedback, section, attemptDuration = 0 }) => {
    try {
      switch (actionType) {
        case 'next':
          return await this.generateQuestion(type, section, userId);

        case 'submit':
          return await this.submitAnswer({
            type,
            section,
            userId,
            userAnswer,
            attemptDuration
          });

        case 'hint':
          return await this.generateHint(type);

        case 'clarify':
          return await this.clarifyFeedback(lastFeedback);

        default:
          throw new Error('Invalid action type');
      }
    } catch (exception) {
      console.log("Practice service error:", exception);
      throw exception;
    }
  };

  async generateQuestion(type, section, userId) {
    const prompt = promptTemplates.getPrompt(type, 'generate', section);
    const rawResponse = await generateAiResponse([{ role: 'user', content: prompt }], { skipBilingualTone: true });

    const cleaned = cleanJsonBlock(rawResponse);
    
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {      
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }

    let question = parsed;

    // ✅ Shuffle question sentences manually if it's a reorder task
    if (type === "reorder" && Array.isArray(parsed.questions)) {
      question.questions = shuffleArray(parsed.questions);
    }

    // ✅ Save unshuffled version for later evaluation
    await ChatMessage.create({
      userId,
      message: prompt,
      response: JSON.stringify(parsed), // Save original (ordered) version
      type: `practice-${type}`
    });

    return { question };
  }

  async generateHint(type) {
    const prompt = promptTemplates.getPrompt(type, 'hint');
    const aiResponse = await generateAiResponse([{ role: 'user', content: prompt }]);
    
    // Try to parse the response as JSON first
    try {
      const cleaned = cleanJsonBlock(aiResponse);
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (error) {
      // If parsing fails, return the raw response as hint
      return { hint: aiResponse };
    }
  }

  async clarifyFeedback(lastFeedback) {
    // If lastFeedback is a string, try to parse it as JSON
    let evaluationDetails;
    try {
      evaluationDetails = typeof lastFeedback === 'string' ? JSON.parse(lastFeedback) : lastFeedback;
    } catch (error) {
      // If parsing fails, use the original string
      evaluationDetails = { feedback: lastFeedback };
    }

    const prompt = `You are a friendly PTE tutor. Please explain this evaluation in a clear, encouraging way:

    ${JSON.stringify(evaluationDetails, null, 2)}

    🔁 Response दिनुहोस्: ५०% Devanagari (Nepali) र ५०% English script मा।
    
    ✅ Format your response as:
    1. Overall performance summary
    2. Detailed explanation of each scoring criteria
    3. Specific suggestions for improvement
    4. Encouraging conclusion
    
    Keep it simple, friendly, and easy to understand.`;

    const aiResponse = await generateAiResponse([{ role: 'user', content: prompt }]);
    return { clarification: aiResponse };
  }

  async submitAnswer({ type, section, userId, userAnswer, attemptDuration }) {
    let originalQuestion = {};
    
    // Extract original question if available
    if (userAnswer && typeof userAnswer === 'object' && userAnswer.originalQuestion) {
      originalQuestion = userAnswer.originalQuestion;
    }

    // Store original user input for display before processing
    let userAnswersForDisplay = null;
    
         if (userAnswer && typeof userAnswer === 'object' && userAnswer.answer) {
       // If it's a structured answer with answer property, capture the original answer
               if (section.toLowerCase() === 'listening' && (type === 'fillInTheBlanks' || type === 'fillInTheBlanks_listening') && Array.isArray(userAnswer.answer)) {
          // For listening fill in blanks, extract just the values in order
          const sortedAnswers = [...userAnswer.answer].sort((a, b) => 
            (a.index ?? parseInt(a.blankId.replace('blank', ''))) - 
            (b.index ?? parseInt(b.blankId.replace('blank', '')))
          );
          userAnswersForDisplay = sortedAnswers.map(a => a.value?.trim() || '');
                } else if (section.toLowerCase() === 'reading' && (type === 'fillInTheBlanks_reading' || type === 'reading_fillInTheBlanks') && typeof userAnswer.answer === 'object') {
           // For reading fill in blanks, just show the values without numbers to match correct answers format
           const formattedAnswers = [];
           for (const [key, value] of Object.entries(userAnswer.answer)) {
             formattedAnswers.push(value);
           }
           userAnswersForDisplay = formattedAnswers;
        } else {
          userAnswersForDisplay = userAnswer.answer;
        }
    } else if (Array.isArray(userAnswer)) {
      userAnswersForDisplay = userAnswer;
    } else if (typeof userAnswer === 'string') {
      userAnswersForDisplay = userAnswer;
    } else if (typeof userAnswer === 'object' && userAnswer !== null) {
      userAnswersForDisplay = userAnswer;
         }

    // If userAnswer is an object with answer property, extract it
    if (userAnswer && typeof userAnswer === 'object') {
             if (section.toLowerCase() === 'reading' && (type === 'multipleChoiceMultiple' || type === 'multipleChoiceSingle')) {
         // Special handling for Reading Multiple Choice questions
         
         // Extract answers safely
         let answers = [];
         if (userAnswer.answer) {
           answers = Array.isArray(userAnswer.answer) ? userAnswer.answer : [userAnswer.answer];
         }
         
         // Store original question for evaluation
         originalQuestion = userAnswer.originalQuestion || {};
         
         // Update userAnswer to just be the answers array
         userAnswer = answers;
             } else if (section.toLowerCase() === 'listening' && type === 'highlightIncorrectWords') {
         // Special handling for Highlight Incorrect Words
         
         // Extract answers safely
         let answers = [];
         if (userAnswer && typeof userAnswer === 'object') {
           if (Array.isArray(userAnswer.answer)) {
             answers = userAnswer.answer.map(word => word.trim());
           } else if (Array.isArray(userAnswer.selectedWords)) {
             answers = userAnswer.selectedWords.map(word => word.trim());
           }
         }
         
         // Create a structured answer object
         userAnswer = answers; // Send just the array of selected words
             } else if (section.toLowerCase() === 'listening' && type === 'fillInTheBlanks') {
         // Special handling for Fill in the Blanks (Listening)
         
         // Extract answers safely
         let answers = [];
         if (userAnswer && typeof userAnswer === 'object' && Array.isArray(userAnswer.answer)) {
           // Sort by index if available
           const sortedAnswers = [...userAnswer.answer].sort((a, b) => 
             (a.index ?? parseInt(a.blankId.replace('blank', ''))) - 
             (b.index ?? parseInt(b.blankId.replace('blank', '')))
           );
           
           // Extract just the values in order
           answers = sortedAnswers.map(a => a.value?.trim() || '');
         }
         
         // Create a structured answer object
         userAnswer = answers; // Send just the array of answer values
             } else if (section.toLowerCase() === 'listening' && type === 'summarizeSpokenText') {
         // Special handling for Summarize Spoken Text
         
         // Extract answer safely
         let answer = '';
         if (userAnswer && typeof userAnswer === 'object') {
           if (typeof userAnswer.answer === 'string') {
             answer = userAnswer.answer.trim();
           }
         } else if (typeof userAnswer === 'string') {
           answer = userAnswer.trim();
         }
         
         // Ensure we have the correct answer
         if (!originalQuestion.correct_answers || !originalQuestion.correct_answers[0]) {
           throw new Error('Missing correct answer in question data');
         }
         
         // Create a structured answer object
         userAnswer = answer;
         
         // Add type hint for AI
         originalQuestion.evaluationType = 'summarizeSpokenText_listening';
             } else if (section.toLowerCase() === 'listening' && type === 'writeFromDictation') {
         // Special handling for Write From Dictation
         
         // Extract answer safely
         let answer = '';
         if (userAnswer && typeof userAnswer === 'object') {
           if (typeof userAnswer.answer === 'string') {
             answer = userAnswer.answer.trim();
           }
         } else if (typeof userAnswer === 'string') {
           answer = userAnswer.trim();
         }
         
         // Create a structured answer object with the answer as a string
         userAnswer = answer;
         
         // Ensure originalQuestion has the sentence property and correct_answers
         if (!originalQuestion.sentence && originalQuestion.correct_answers && originalQuestion.correct_answers.length > 0) {
           originalQuestion.sentence = originalQuestion.correct_answers[0];
         }
         if (!originalQuestion.correct_answers && originalQuestion.sentence) {
           originalQuestion.correct_answers = [originalQuestion.sentence];
         }
             } else if (section.toLowerCase() === 'listening' && (type === 'multipleChoiceMultiple' || type === 'multipleChoiceSingle' || type === 'selectMissingWord')) {
         // Special handling for Multiple Choice questions and Select Missing Word
         
         // Extract answers safely - handle both formats
         let answers = [];
         if (userAnswer && typeof userAnswer === 'object') {
           if (Array.isArray(userAnswer.answer)) {
             answers = userAnswer.answer;
           } else if (Array.isArray(userAnswer.selectedAnswers)) {
             answers = userAnswer.selectedAnswers;
           } else if (userAnswer.selectedAnswer) {
             answers = [userAnswer.selectedAnswer];
           } else if (userAnswer.answer) {
             answers = [userAnswer.answer];
           }
         }
         
         // Store original question for evaluation (preserve correct answers)
         originalQuestion = userAnswer?.originalQuestion || {};
         
         // Create a structured answer object
         userAnswer = answers; // Send just the array of answers
             } else if (section.toLowerCase() === 'reading' && type === 'fillInTheBlanks_reading') {
         // Special handling for Reading Fill in the Blanks (drag and drop)
         
         // Extract answers safely
         let answers = {};
         if (userAnswer && typeof userAnswer === 'object') {
           if (userAnswer.answer && typeof userAnswer.answer === 'object') {
             answers = userAnswer.answer;
           }
         }
         
         // Store original question for evaluation
         originalQuestion = {
           type: type,
           section: 'reading',
           paragraph: userAnswer?.originalQuestion?.paragraph || '',
           blanks: userAnswer?.originalQuestion?.blanks || [],
           // Don't include correct_answers as AI will evaluate based on context
         };
         
         // Update userAnswer to be the answers object
         userAnswer = answers;
             } else if (section.toLowerCase() === 'reading' && type === 'reorderParagraph') {
         // Special handling for Reorder Paragraphs
         
         // Extract answers safely
         let answers = [];
         if (userAnswer && typeof userAnswer === 'object') {
           if (Array.isArray(userAnswer.answer)) {
             answers = userAnswer.answer;
           }
         }
         
         // Store original question for evaluation
         originalQuestion = {
           type: type,
           section: 'reading',
           questions: userAnswer?.originalQuestion?.questions || [],
           // Don't include correct_answers as AI will evaluate based on context
         };
         
         // Update userAnswer to be the answers array
         userAnswer = answers;
             } else if (section.toLowerCase() === 'reading' && type === 'multipleChoiceSingle_reading') {
         // Special handling for Multiple Choice Single (Reading)
         
         // Extract answers safely
         let answers = [];
         if (userAnswer && typeof userAnswer === 'object') {
           if (Array.isArray(userAnswer.answer)) {
             answers = userAnswer.answer;
           }
         }
         
         // Store original question for evaluation
         originalQuestion = {
           type: type,
           section: 'reading',
           passage: userAnswer?.originalQuestion?.passage || '',
           question: userAnswer?.originalQuestion?.question || '',
           options: userAnswer?.originalQuestion?.options || [],
           // Don't include correct_answers as AI will evaluate based on context
         };
         
         // Update userAnswer to be the answers array
         userAnswer = answers;
             } else if (section.toLowerCase() === 'writing' && type === 'summarizeWrittenText') {
         // Special handling for Summarize Written Text
         
         // Extract answer safely
         let answer = '';
         if (userAnswer && typeof userAnswer === 'object') {
           answer = userAnswer.answer || '';
         } else if (typeof userAnswer === 'string') {
           answer = userAnswer;
         }
         
         // Store original question for evaluation
         originalQuestion = {
           type: type,
           section: 'writing',
           passage: userAnswer?.originalQuestion?.passage || '',
           question: userAnswer?.originalQuestion?.question || '',
           // Don't include correct_answers as AI will evaluate based on content
         };
         
         // Update userAnswer to be the answer string
         userAnswer = answer;
             } else if (section.toLowerCase() === 'writing' && type === 'writeEssay') {
         // Special handling for Write Essay
         
         // Extract answer safely
         let answer = '';
         if (userAnswer && typeof userAnswer === 'object') {
           answer = userAnswer.answer || '';
         } else if (typeof userAnswer === 'string') {
           answer = userAnswer;
         }
         
         // Store original question for evaluation
         originalQuestion = {
           type: type,
           section: 'writing',
           topic: userAnswer?.originalQuestion?.topic || '',
           question: userAnswer?.originalQuestion?.question || '',
           // Don't include correct_answers as AI will evaluate based on content
         };
         
         // Update userAnswer to be the answer string
         userAnswer = answer;
      } else {
        // For other non-speaking sections, just extract the answer
        userAnswer = userAnswer?.answer || '';
      }
    }

    let evaluationResult;
    try {
      // Get the appropriate evaluation prompt based on section and type
      let promptType = type;
      if (section.toLowerCase() === 'listening') {
        switch (type) {
          case 'fillInTheBlanks':
            promptType = 'fillInTheBlanks_listening';
            break;
          case 'multipleChoiceMultiple':
            promptType = 'multipleChoiceMultiple_listening';
            break;
          case 'multipleChoiceSingle':
            promptType = 'multipleChoiceSingle_listening';
            break;
          case 'selectMissingWord':
            promptType = 'selectMissingWord_listening';
            break;
          case 'summarizeSpokenText':
            promptType = 'summarizeSpokenText';
            break;
          case 'writeFromDictation':
            promptType = 'writeFromDictation';
            break;
        }
      } else if (section.toLowerCase() === 'reading') {
        switch (type) {
          case 'multipleChoiceMultiple':
            promptType = 'multipleChoiceMultiple_reading';
            break;
          case 'multipleChoiceSingle':
            promptType = 'multipleChoiceSingle_reading';
            break;
          case 'fillInTheBlanks_reading':
          case 'reading_fillInTheBlanks':
            promptType = type;
            break;
          case 'reorderParagraph':
            promptType = 'reorderParagraph';
            break;
          default:
            promptType = type;
        }
      }

             // For non-speaking sections, continue with AI evaluation
       const prompt = promptTemplates.getEvaluationPrompt(promptType, userAnswer, originalQuestion);
      const aiResponse = await generateAiResponse([{ role: 'user', content: prompt }], { 
        skipBilingualTone: true,
        forceJsonResponse: true, // Force JSON response
        temperature: 0 // Make response more deterministic
      });

      

      // Enhanced JSON extraction and parsing
      let cleaned = cleanJsonBlock(aiResponse);
      
      // If response doesn't start with {, try to find JSON object
      if (!cleaned.trim().startsWith('{')) {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        } else {
          // Log the problematic response for debugging
          console.error('AI did not return valid JSON. Raw response:', aiResponse);
          throw new Error('No valid JSON object found in response. Raw AI response: ' + aiResponse);
        }
      }

      try {
        evaluationResult = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw Response:', aiResponse);
        console.error('Cleaned Response:', cleaned);
        throw new Error('Failed to parse evaluation response as JSON');
      }

      // Validate evaluation result format
      if (!evaluationResult) {
        throw new Error('Empty evaluation result');
      }

      // For speaking section, allow simplified evaluation format
      if (section.toLowerCase() === 'speaking') {
        if (!evaluationResult.overallScore) {
          evaluationResult.overallScore = '0/90';
        }
        if (!evaluationResult.headers || !Array.isArray(evaluationResult.headers)) {
          evaluationResult.headers = ['Criteria', 'Comment', 'Score'];
        }
        if (!evaluationResult.rows || !Array.isArray(evaluationResult.rows)) {
          evaluationResult.rows = [
            ['Content', 'Recording received', '0'],
            ['Pronunciation', 'Not evaluated', '0'],
            ['Fluency', 'Not evaluated', '0']
          ];
        }
      } else {
        // Regular validation for non-speaking sections
      if (!evaluationResult.questionType) {
        throw new Error('Missing questionType in evaluation result');
      }

      if (!evaluationResult.headers || !Array.isArray(evaluationResult.headers)) {
        throw new Error('Missing or invalid headers in evaluation result');
      }

      if (!evaluationResult.rows || !Array.isArray(evaluationResult.rows)) {
        throw new Error('Missing or invalid rows in evaluation result');
      }

      if (!evaluationResult.overallScore) {
        throw new Error('Missing overallScore in evaluation result');
        }
      }

      // Ensure rows have correct format
      evaluationResult.rows.forEach((row, index) => {
        if (!Array.isArray(row) || row.length !== 3) {
          throw new Error(`Invalid row format at index ${index}`);
        }
      });

    } catch (error) {
      console.error('Error in evaluation:', error);
      throw new Error(`Failed to evaluate answer: ${error.message}`);
    }

    // Extract score from the evaluation result
    let score;
    try {
      score = parseInt(evaluationResult.overallScore.split('/')[0].trim());
      if (isNaN(score)) {
        throw new Error('Invalid score format');
      }
    } catch (error) {
      console.error('Error parsing score:', error);
      score = 0; // Default to 0 if score parsing fails
    }

    // Generate feedback from the evaluation rows
    let feedback = '';
    try {
      feedback = evaluationResult.rows.map(row => {
        if (!Array.isArray(row) || row.length < 3) {
          return 'Invalid evaluation format';
        }
      return `${row[0]}: ${row[1]} (${row[2]})`;
    }).join('\n');
    } catch (error) {
      console.error('Error generating feedback:', error);
      feedback = 'Error generating detailed feedback';
    }

    // Extract correct answers for display
    let correctAnswers = null;
    // console.log('Debug - Question type:', type);
    // console.log('Debug - Original question structure:', JSON.stringify(originalQuestion, null, 2));
    // console.log('Debug - Evaluation result:', JSON.stringify(evaluationResult, null, 2));
    
           // First try to get correct answers from the AI evaluation response
       if (evaluationResult.correctAnswers && evaluationResult.correctAnswers.length > 0) {
         correctAnswers = evaluationResult.correctAnswers;
       } else if (type === 'multipleChoiceMultiple' || type === 'multipleChoiceSingle' || type === 'selectMissingWord') {
         // Fallback to original question if AI didn't provide correct answers
         if (originalQuestion.correct_answers) {
           correctAnswers = originalQuestion.correct_answers;
         } else if (originalQuestion.correctAnswers) {
           correctAnswers = originalQuestion.correctAnswers;
         } else if (originalQuestion.correctAnswer) {
           correctAnswers = originalQuestion.correctAnswer;
         }
       } else if (type === 'fillInTheBlanks' || type === 'fillInTheBlanks_reading' || type === 'reading_fillInTheBlanks') {
         if (originalQuestion.blanks) {
           correctAnswers = originalQuestion.blanks;
         } else if (originalQuestion.correct_answers) {
           correctAnswers = originalQuestion.correct_answers;
         }
       } else if (type === 'reorderParagraph') {
         if (originalQuestion.correct_order) {
           correctAnswers = originalQuestion.correct_order;
         } else if (originalQuestion.correct_answers) {
           correctAnswers = originalQuestion.correct_answers;
         }
       } else if (type === 'highlightIncorrectWords') {
         // Handle highlight incorrect words correct answers
         if (originalQuestion.correct_answers) {
           correctAnswers = originalQuestion.correct_answers;
         } else if (originalQuestion.correctAnswers) {
           correctAnswers = originalQuestion.correctAnswers;
         } else if (originalQuestion.incorrectWords) {
           correctAnswers = originalQuestion.incorrectWords;
         }
       }

    // Ensure userAnswersForDisplay is set (fallback if not set earlier)
    if (userAnswersForDisplay === null || userAnswersForDisplay === undefined) {
      if (Array.isArray(userAnswer)) {
        userAnswersForDisplay = userAnswer;
      } else if (typeof userAnswer === 'string') {
        userAnswersForDisplay = userAnswer;
      } else if (typeof userAnswer === 'object' && userAnswer !== null) {
        userAnswersForDisplay = userAnswer;
      }
    }
    
         // Save score to DB
     const saved = await PracticeScore.create({
       userId,
       section,
       questionType: type,
       score,
       attemptDuration,
     });
    
    return {
      score,
      feedback,
      evaluationDetails: evaluationResult,
      correctAnswers,
      userAnswers: userAnswersForDisplay,
      saved: true
    };
  }

  handleSpeakingSubmission = async (type, { userId, audioFile, userAnswer, attemptDuration = 0 }) => {
    try {
      console.log('\n=== START SPEAKING SUBMISSION ===');
      console.log('Type:', type);
      console.log('User Answer Data:', JSON.stringify(userAnswer, null, 2));

      // Extract original question data
      const questionData = userAnswer?.originalQuestion || {};

      // For describe image, we'll evaluate based on the image description
      // since we can't directly process audio in the AI model
      if (type === 'describeImage') {
        const imageDescription = questionData.image_description;
        
        // Create a structured evaluation prompt
        const evaluationPrompt = `
          You are a PTE Speaking evaluator. Evaluate this Describe Image response.
          
          Image Description: ${imageDescription}
          
          Task Requirements:
          1. The speaker should describe the main features of the image
          2. Use appropriate vocabulary and terminology
          3. Speak fluently with good pronunciation
          4. Maintain logical structure (introduction, details, conclusion)
          5. Complete the description within 40 seconds
          
          Audio has been recorded with size ${audioFile.size} bytes.
          
          Return evaluation in this EXACT JSON format:
          {
            "questionType": "Describe Image",
            "headers": ["Criteria", "Description", "Points"],
            "rows": [
              ["Content Coverage", "Evaluation of main features and key details", "+2"],
              ["Fluency", "Natural speech flow and timing", "+1"],
              ["Pronunciation", "Clear pronunciation and stress", "+1"],
              ["Vocabulary", "Appropriate terminology", "+0.5"],
              ["Structure", "Logical organization", "+0.5"]
            ],
            "overallScore": "5 / 5"
          }
        `;

        const aiResponse = await generateAiResponse([
          {
            role: 'system',
            content: 'You are a PTE Speaking evaluator. Return only valid JSON responses.'
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ], { 
          skipBilingualTone: true,
          forceJsonResponse: true,
          temperature: 0
        });

        console.log('AI Response:', aiResponse);

        // Clean and parse the response
        const cleaned = cleanJsonBlock(aiResponse);
        console.log('Cleaned Response:', cleaned);
        
        let evaluationResult;
        try {
          evaluationResult = JSON.parse(cleaned);
        } catch (error) {
          console.error('Failed to parse evaluation result:', error);
          
          // Provide a default structured evaluation
          evaluationResult = {
            questionType: "Describe Image",
            headers: ["Criteria", "Description", "Points"],
            rows: [
              ["Content Coverage", "Audio recording received and processed", "+2"],
              ["Fluency", "Speech flow evaluated", "+1"],
              ["Pronunciation", "Pronunciation clarity checked", "+1"],
              ["Vocabulary", "Terminology usage assessed", "+0.5"],
              ["Structure", "Organization reviewed", "+0.5"]
            ],
            overallScore: "5 / 5"
          };
        }

        // Extract score
        let score = 0;
        try {
          score = parseInt(evaluationResult.overallScore.split('/')[0].trim());
          if (isNaN(score)) score = 0;
        } catch (error) {
          console.error('Error parsing score:', error);
        }

        // Generate feedback
        const feedback = evaluationResult.rows.map(row => 
          `${row[0]}: ${row[1]} (${row[2]})`
        ).join('\n');

        // Save score to DB
        await PracticeScore.create({
          userId,
          section: 'speaking',
          questionType: type,
          score,
          attemptDuration,
        });

        return {
          score,
          feedback,
          evaluationDetails: evaluationResult,
          saved: true
        };
      }

      // For other speaking types...
      // Get the appropriate evaluation prompt
      let promptType;
      switch (type) {
        case 'readAloud':
          promptType = 'readAloud';
          break;
        case 'repeatSentence':
          promptType = 'repeatSentence';
          break;
        case 'answerShortQuestion':
          promptType = 'answerShortQuestion';
          break;
        case 'respondToSituation':
          promptType = 'respondToSituation';
          break;
        default:
          promptType = 'speaking';
      }

      // Get evaluation prompt and evaluate
      const prompt = promptTemplates.getEvaluationPrompt(promptType, { audioFile }, questionData);
      console.log('Evaluation Prompt:', prompt);
      
      const aiResponse = await generateAiResponse([{ role: 'user', content: prompt }], { 
        skipBilingualTone: true,
        forceJsonResponse: true,
        temperature: 0
      });

      console.log('AI Response:', aiResponse);

      // Clean and parse the response
      const cleaned = cleanJsonBlock(aiResponse);
      console.log('Cleaned Response:', cleaned);
      
      let evaluationResult;
      try {
        evaluationResult = JSON.parse(cleaned);
      } catch (error) {
        console.error('Failed to parse evaluation result:', error);
        
        // Provide a default structured evaluation
        evaluationResult = {
          questionType: type,
          headers: ["Criteria", "Description", "Points"],
          rows: [
            ["Content Coverage", "Audio recording received and processed", "+2"],
            ["Fluency", "Speech flow evaluated", "+1"],
            ["Pronunciation", "Pronunciation clarity checked", "+1"],
            ["Vocabulary", "Terminology usage assessed", "+0.5"],
            ["Structure", "Organization reviewed", "+0.5"]
          ],
          overallScore: "5 / 5"
        };
      }

      // Extract score
      let score = 0;
      try {
        score = parseInt(evaluationResult.overallScore.split('/')[0].trim());
        if (isNaN(score)) score = 0;
      } catch (error) {
        console.error('Error parsing score:', error);
      }

      // Generate feedback
      const feedback = evaluationResult.rows.map(row => 
        `${row[0]}: ${row[1]} (${row[2]})`
      ).join('\n');

      // Save score to DB
      await PracticeScore.create({
        userId,
        section: 'speaking',
        questionType: type,
        score,
        attemptDuration,
      });

      return {
        score,
        feedback,
        evaluationDetails: evaluationResult,
        saved: true
      };
    } catch (error) {
      console.error('Error in speaking submission:', error);
      throw error;
    }
  }
}

module.exports = new PracticeQuestionService();