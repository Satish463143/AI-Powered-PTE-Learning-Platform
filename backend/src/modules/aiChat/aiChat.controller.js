const aiService = require('./aiChat.service') ;

class AiChatController {
     handleChat = async (req, res,next) => {
        try {
            const { userId, message, type } = req.body;
            const response = await aiService.generateChatResponse(message, userId, type);
            res.json({ 
                result: response,
                message: "Chat response generated successfully",
                meta:null
             });
        } catch (exception) {
            console.log(exception);
            next(error);
        }
      };
}




module.exports = new AiChatController();
