const callFeatureService = require("./callFeature.service");
const geminiService = require("../../utils/gemini.service");

class CallFeatureController {
    startCall = async (req, res, next) => {
        try {
          console.log('📞 Starting call request received');
    
          const userId = req?.authUser?._id;
          if (!userId) {
            const err = new Error('Unauthorized');
            err.status = 401;
            throw err;
          }
          console.log('👤 User ID:', userId);
    
          console.log('🔑 Generating Gemini token...');
          const tokenResult = await geminiService.generateEphemeralToken();
          if (!tokenResult.success) {
            const err = new Error(`Token generation failed: ${tokenResult.error}`);
            err.status = 502;
            throw err;
          }
          console.log('✅ Token generated successfully');
    
          console.log('💾 Creating call session...');
          const result = await callFeatureService.manageCall(userId, 'start');
          console.log('✅ Call session created');
    
          res.json({
            result,
            token: tokenResult.token, // send the secret/bearer to the client
            message: "Call started successfully",
            status: 200,
          });
        } catch (exception) {
          console.error('❌ Error in startCall:', exception);
          next(exception);
        }
    };
    endCall = async (req, res, next) => {
        try {
          console.log('📞 End call request received');
    
          const userId = req?.authUser?._id;
          if (!userId) {
            const err = new Error('Unauthorized');
            err.status = 401;
            throw err;
          }
          console.log('👤 User ID:', userId);
    
          const { scores, chat, hasChat } = req.body || {};
          console.log('📊 Received scores:', scores);
          console.log('💬 Chat data:', { hasChat, chatLength: chat?.length || 0 });
    
          if (!scores || typeof scores !== 'object') {
            const err = new Error('Invalid scores object');
            err.status = 400;
            throw err;
          }
    
          const required = ['pronunciationScore', 'oralFluencyScore', 'vocabularyScore', 'contentScore'];
          for (const k of required) {
            const v = Number(scores[k]);
            if (Number.isNaN(v) || v < 0 || v > 100) {
              const err = new Error(`Invalid ${k}: must be a number between 0 and 100`);
              err.status = 400;
              throw err;
            }
          }
    
          const result = await callFeatureService.manageCall(userId, 'end', scores, chat, hasChat);
          console.log('✅ Call ended successfully');
    
          res.json({ result, message: "Call ended and saved successfully" });
        } catch (exception) {
          console.error('❌ Error in endCall:', exception);
          next(exception);
        }
    };

    getCallHistory = async (req, res, next) => {
        try {
            const userId = req.authUser._id;
            const response = await callFeatureService.getCallHistory(userId);
            res.json({ 
                result: response, 
                message: "Call history fetched successfully" 
            });
        }
        catch(exception) {
            console.error('❌ Error in getCallHistory:', exception);
            next(exception);
        }
    }
}

module.exports = new CallFeatureController();