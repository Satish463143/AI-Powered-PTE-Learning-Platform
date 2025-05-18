const aiService = require('./aiChat.service') ;

class AiChatController {
     handleChat = async (req, res,next) => {
        try {
            const { userId=null, message, type } = req.body;
            const response = await aiService.generateChatResponse(message, userId, type);
            
            if (response === null) {
                return res.status(500).json({
                    result: null,
                    message: "Failed to generate response. Please check server logs.",
                    meta: null
                });
            }
            
            res.json({ 
                result: response,
                message: "Chat response generated successfully",
                meta:null
             });
        } catch (exception) {
            console.log(exception);
            next(exception);
        }
      };
}




module.exports = new AiChatController();
