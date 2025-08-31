const LiveCallAnalysis = require('./callFeature.model');

class CallFeatureService {
    async manageCall(userId, actionType, scores = null, chat = '', hasChat = false) {
        try {
          console.log('🔄 Managing call:', { userId, actionType });
    
          let analysis = await LiveCallAnalysis.findOne({ userId });
          console.log('📊 Current analysis state:', {
            exists: !!analysis,
            hasHistory: analysis?.callHistory?.length || 0,
          });
    
          if (actionType === 'start') {
            console.log('🎬 Starting new call session');
            if (!analysis) {
              console.log('📝 Creating new analysis for user');
              analysis = new LiveCallAnalysis({ userId });
            }
    
            // Reset current (live) scores for a new session
            analysis.currentSessionScores = {
              pronunciationScore: 0,
              oralFluencyScore: 0,
              vocabularyScore: 0,
              contentScore: 0,
            };
            console.log('✅ Session scores reset');
          } else if (actionType === 'end') {
            if (!analysis) {
              console.error('❌ No active call session found for user:', userId);
              const err = new Error('No active call session found');
              err.status = 400;
              throw err;
            }
    
            // Coerce/Clamp defensively (controller already validated)
            console.log('🔢 Validating scores...');
            const validatedScores = {
              pronunciationScore: Math.min(100, Math.max(0, Number(scores?.pronunciationScore) || 0)),
              oralFluencyScore:   Math.min(100, Math.max(0, Number(scores?.oralFluencyScore)   || 0)),
              vocabularyScore:    Math.min(100, Math.max(0, Number(scores?.vocabularyScore)    || 0)),
              contentScore:       Math.min(100, Math.max(0, Number(scores?.contentScore)       || 0)),
            };
            console.log('✅ Validated scores:', validatedScores);
    
            // Create session record
            console.log('📝 Creating new session record');
            const newSession = {
              scores: validatedScores,
              chat: chat || '',
              hasChat: Boolean(hasChat),
              createdAt: new Date(),
            };
    
            // Append to history
            if (!analysis.callHistory) {
              console.log('📋 Initializing call history');
              analysis.callHistory = [];
            }
            analysis.callHistory.push(newSession);
            console.log('✅ Session added to history');
    
            // XP calc: integer buckets of 10
            const avgScore =
              (validatedScores.pronunciationScore +
               validatedScores.oralFluencyScore +
               validatedScores.vocabularyScore +
               validatedScores.contentScore) / 4;
    
            const xpGain = Math.max(0, Math.floor(avgScore / 10));
            console.log('⭐ XP calculation:', { avgScore, xpGain });
    
            analysis.xp = (analysis.xp || 0) + xpGain;
            if (analysis.xp >= 10) {
              analysis.progress = (analysis.progress || 0) + 1;
              analysis.xp -= 10;
              console.log('🎉 Level up! New progress:', analysis.progress);
            }
    
            // Update current session scores to the final
            analysis.currentSessionScores = validatedScores;
            console.log('✅ Current session scores updated');
          } else {
            const err = new Error('Unknown actionType');
            err.status = 400;
            throw err;
          }
    
          console.log('💾 Saving analysis...');
          const savedAnalysis = await analysis.save();
          console.log('✅ Analysis saved successfully');
    
          return savedAnalysis;
        } catch (error) {
          console.error('❌ Error managing call:', error);
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
          throw error;
        }
    }

    async getCallHistory(userId) {
        try {
            console.log('📋 Fetching call history for user:', userId);
            const analysis = await LiveCallAnalysis.findOne({ userId });
            if (!analysis) {
                console.log('ℹ️ No history found, returning default structure');
                return {
                    callHistory: [],
                    averageScores: {
                        pronunciationScore: 0,
                        oralFluencyScore: 0,
                        vocabularyScore: 0,
                        contentScore: 0
                    },
                    xp: 0,
                    progress: 0
                };
            }
            console.log('✅ History retrieved:', {
                historyCount: analysis.callHistory.length,
                xp: analysis.xp,
                progress: analysis.progress
            });
            return analysis;
        } catch (error) {
            console.error('❌ Error fetching call history:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

module.exports = new CallFeatureService();
