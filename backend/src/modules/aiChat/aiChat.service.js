const generateAiResponse = require('../../utilities/ai.service');

class AiChatService {
  async generateChatResponse(message, userId, type) {
    return await generateAiResponse(message, type);
  }
}

module.exports = new AiChatService();
