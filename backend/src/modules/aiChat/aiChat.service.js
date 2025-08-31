const ChatMessage = require('../aiChat/aiChat.model');
const generateAiResponse = require('../../utils/ai.service');
const { MAX_HISTORY } = require('../../config/constant.config');
const ptePromptTemplates = require('../../utils/ptePromptTemplates');

class ChatService {
  // Helper function to detect practice requests
  detectPracticeRequest(message) {
    // Convert message to lowercase for easier matching
    const msg = message.toLowerCase();
    
    // Define patterns for different sections
    const sections = {
      reading: [
        { type: 'Reading & Writing：Fill in the blanks', patterns: ['reading and writing fill', 'fill in the blanks reading'] },
        { type: 'Multiple Choice (Multiple)', patterns: ['multiple choice multiple reading', 'mcq multiple reading'] },
        { type: 'Re-order Paragraphs', patterns: ['reorder', 'reorder paragraph', 're-order'] },
        { type: 'Reading：Fill in the Blanks', patterns: ['reading fill in', 'fill in blanks reading only'] },
        { type: 'Multiple Choice (Single)', patterns: ['multiple choice single reading', 'mcq single reading'] }
      ],
      writing: [
        { type: 'Summarize Written Text', patterns: ['summarize written', 'summarize text'] },
        { type: 'Write Essay', patterns: ['write essay', 'essay writing'] }
      ],
      speaking: [
        { type: 'Read Aloud', patterns: ['read aloud'] },
        { type: 'Repeat Sentence', patterns: ['repeat sentence'] },
        { type: 'Describe Image', patterns: ['describe image'] },
        { type: 'Respond to a situation', patterns: ['respond to situation', 'situation response'] },
        { type: 'Answer Short Question', patterns: ['short question', 'answer short'] }
      ],
      listening: [
        { type: 'Summarize Spoken Text', patterns: ['summarize spoken', 'spoken text summary'] },
        { type: 'Multiple Choice, Choose Multiple Answers', patterns: ['multiple choice listening multiple', 'mcq multiple listening'] },
        { type: 'Fill in the Blanks', patterns: ['fill blanks listening', 'listening fill'] },
        { type: 'Highlight Incorrect Words', patterns: ['highlight incorrect', 'incorrect words'] },
        { type: 'Multiple Choice, Choose Single Answer', patterns: ['multiple choice listening single', 'mcq single listening'] },
        { type: 'Select Missing Word', patterns: ['select missing', 'missing word'] },
        { type: 'Write from Dictation', patterns: ['write from dictation', 'dictation'] }
      ]
    };

    // Check if message contains practice intent
    const practiceIntents = ['can you give me', 'i want to solve', 'i want to practice', 'give me a question', 'create a question', 'solve', 'practice'];
    const hasPracticeIntent = practiceIntents.some(intent => msg.includes(intent));

    // First try to find a direct question type match
    for (const [section, questionTypes] of Object.entries(sections)) {
      for (const { type, patterns } of questionTypes) {
        if (patterns.some(pattern => msg.includes(pattern))) {
          // If we found a question type match, check if section is explicitly mentioned
          const sectionMentioned = msg.includes(section.toLowerCase());
          
          // If section is mentioned or there's a practice intent, return the match
          if (sectionMentioned || hasPracticeIntent) {
            return {
              isPracticeRequest: true,
              section: section.charAt(0).toUpperCase() + section.slice(1),
              questionType: type
            };
          }
        }
      }
    }

    // If no match found with the above logic, check if both section and practice intent exist
    if (hasPracticeIntent) {
      for (const [section, questionTypes] of Object.entries(sections)) {
        if (msg.includes(section.toLowerCase())) {
          // Return the first question type for that section as default
          return {
            isPracticeRequest: true,
            section: section.charAt(0).toUpperCase() + section.slice(1),
            questionType: questionTypes[0].type
          };
        }
      }
    }

    return null;
  }

  async saveConversation(userId, message, response, type = 'general') {
    const chatDoc = new ChatMessage({ userId, message, response, type });
    return await chatDoc.save();
  }

  async getRecentHistory(userId) {
    return await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY);
  }

  async chatWithAi(userId, message, type = 'general') {
    try {
      // First check if this is a practice request
      const practiceRequest = this.detectPracticeRequest(message);
      if (practiceRequest) {
        return {
          aiResponse: practiceRequest,
          history: [] // You can implement chat history if needed
        };
      }

      // If not a practice request, proceed with normal chat using Gemini
      // 1. Get recent conversation pairs for AI context
      const recentConversations = await this.getRecentHistory(userId);

      // 2. Prepare messages array for AI
      const messages = [
        {
          role: 'system',
          content: `You are a bilingual AI assistant that responds in both Nepali and English.
          
          ${ptePromptTemplates.friendlyNepaliTone}
          
          ${ptePromptTemplates.getChatResponseFormat()}
          
          Always format your response in this order:
          <div class="response-structure">
            <h3>🗣️ Bilingual Response</h3>
            <div class="nepali-english-mix">
              [Your Nepali-English mixed response with proper HTML formatting]
            </div>
            
            <h3>🌐 English Translation</h3>
            <div class="english-only">
              [Full English translation with the same HTML formatting]
            </div>
          </div>
          `
        }
      ];

      messages.push(
        ...recentConversations
          .filter(pair => pair.message && pair.message.trim() && pair.response && pair.response.trim())
          .flatMap(pair => [
            { role: 'user', content: pair.message.trim() },
            { role: 'assistant', content: pair.response.trim() }
          ])
      );
      
      messages.push({ role: 'user', content: message.trim() });

      // 3. Generate AI response using existing Gemini setup
      const aiResponse = await generateAiResponse(messages);

      // 4. Save the conversation pair
      const savedConversation = await this.saveConversation(userId, message, aiResponse, type);

      // 5. Build updated history
      const updatedHistory = [...recentConversations, {
        _id: savedConversation._id,
        userId: savedConversation.userId,
        message: savedConversation.message,
        response: savedConversation.response,
        type: savedConversation.type,
        createdAt: savedConversation.createdAt
      }].slice(-MAX_HISTORY);

      return { aiResponse, history: updatedHistory };
    } catch (error) {
      console.error('Error in chatWithAi:', error);
      throw error;
    }
  }
}

module.exports = new ChatService();
