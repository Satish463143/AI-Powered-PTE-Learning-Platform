const generateAiResponse = require('../../utilities/ai.service');

class AiChatService {
    generateChatResponse = async (message, userId, type) => {
        // Use the generateResponse function from ai.service.js
        return await generateAiResponse(message, type);
      };
}
 
module.exports = new AiChatService();
  