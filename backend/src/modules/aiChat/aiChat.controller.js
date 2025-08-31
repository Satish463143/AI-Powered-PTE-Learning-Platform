const ChatService = require('./aiChat.service');

class ChatController {
    handleChat =async(req, res, next)=> {
    try {
      // userId is either from authenticated user or persistent anonymous cookie session
      const userId = req.userId;
      const { message, type } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'message is required' });
      }

      const { aiResponse, history } = await ChatService.chatWithAi(userId, message, type);

      res.json({
        result: aiResponse,
        history,
        message: 'Chat response generated successfully',
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = new ChatController();
