const practiceXpModel = require('./practiceXp.model');
const { PracticeScore, practiceScoreEmitter } = require('../practiceQuestion/practiceQuestion.model');
const { calculateXP } = require('../../utils/xp.algorithm');
const { getLevelUpThreshold } = require('../../utils/xpThreshold');
const mongoose = require('mongoose');

class practiceXpService {
    constructor() {
        practiceScoreEmitter.on('practiceScoreUpdated', async ({ userId, section }) => {
          try {
            await this.calculateXp(userId, section);
          } catch (error) {
            console.error('Error calculating XP from event:', error);
          }
        });
    }

    async calculateXp(userId, section) {
        try {
          const userObjectId = new mongoose.Types.ObjectId(userId);
          const normalizedSection = section.charAt(0).toUpperCase() + section.slice(1).toLowerCase();
          const isOverall = normalizedSection.toLowerCase() === 'overall';
    
          // Use findOneAndUpdate to atomically create if not exists
          let userXp = await practiceXpModel.findOneAndUpdate(
            { userId: userObjectId },
            {
              $setOnInsert: {
                userId: userObjectId,
                sectionXP: [
                  { section: 'Reading', level: 1, progress: 0 },
                  { section: 'Writing', level: 1, progress: 0 },
                  { section: 'Listening', level: 1, progress: 0 },
                  { section: 'Speaking', level: 1, progress: 0 }
                ],
                overall: { level: 1, progress: 0 }
              }
            },
            { upsert: true, new: true }
          );
    
          // Fetch and process scores in a single aggregation pipeline
          const scoreAggregation = await PracticeScore.aggregate([
            {
              $match: {
                userId: userObjectId,
                xpProcessed: { $ne: true },
                ...(isOverall ? {} : { section: new RegExp(`^${section}$`, 'i') })
              }
            },
            {
              $group: {
                _id: {
                  section: '$section',
                  questionType: '$questionType'
                },
                scores: {
                  $push: {
                    score: { $ifNull: [{ $toDouble: '$score' }, 0] },
                    attemptDuration: '$attemptDuration',
                    createdAt: '$createdAt'
                  }
                },
                avgScore: { $avg: { $ifNull: [{ $toDouble: '$score' }, 0] } },
                count: { $sum: 1 }
              }
            },
            {
              $group: {
                _id: '$_id.section',
                questionTypes: {
                  $push: {
                    type: '$_id.questionType',
                    scores: '$scores',
                    avgScore: '$avgScore'
                  }
                },
                sectionAvg: { $avg: '$avgScore' }
              }
            }
          ]);

          if (!scoreAggregation.length) {
            const baseResponse = {
              section: normalizedSection,
              overall: userXp.overall,
              newScoresProcessed: 0
            };

            if (isOverall) {
              return {
                ...baseResponse,
                level: userXp.overall.level,
                progress: userXp.overall.progress,
                sectionXP: userXp.sectionXP
              };
            }

            const sectionData = userXp.sectionXP.find(s => 
              s.section.toLowerCase() === normalizedSection.toLowerCase()
            );
            return {
              ...baseResponse,
              level: sectionData?.level || 1,
              progress: sectionData?.progress || 0
            };
          }

          // Process XP updates
          const sectionUpdates = new Map();
          let totalLevel = 0;
          let totalProgress = 0;

          for (const sectionData of scoreAggregation) {
            const section = sectionData._id;
            const sectionXP = userXp.sectionXP.find(s => 
              s.section.toLowerCase() === section.toLowerCase()
            );

            if (sectionXP) {
              const earnedXP = Math.max(0, calculateXP(sectionData.sectionAvg, sectionXP.level));
              let newProgress = Math.max(0, Number(sectionXP.progress) || 0) + earnedXP;
              let newLevel = sectionXP.level;

              // Level up calculation
              while (newProgress >= getLevelUpThreshold(newLevel)) {
                newProgress -= getLevelUpThreshold(newLevel);
                newLevel++;
              }

              sectionUpdates.set(section.toLowerCase(), {
                level: newLevel,
                progress: newProgress
              });

              totalLevel += newLevel;
              totalProgress += newProgress;
            }
          }

          // Update all sections in a single operation
          const updateOps = [];
          userXp.sectionXP.forEach(section => {
            const update = sectionUpdates.get(section.section.toLowerCase());
            if (update) {
              section.level = update.level;
              section.progress = update.progress;
            }
            updateOps.push(section);
          });

          // Calculate new overall stats
          const newOverall = {
            level: Math.max(1, Math.floor(totalLevel / 4)),
            progress: Math.max(0, Math.floor(totalProgress / 4))
          };

          // Update database in a single operation
          userXp = await practiceXpModel.findOneAndUpdate(
            { userId: userObjectId },
            { 
              $set: {
                sectionXP: updateOps,
                overall: newOverall
              }
            },
            { new: true }
          );

          // Mark scores as processed
          await PracticeScore.updateMany(
            {
              userId: userObjectId,
              xpProcessed: { $ne: true },
              ...(isOverall ? {} : { section: new RegExp(`^${section}$`, 'i') })
            },
            { $set: { xpProcessed: true } }
          );

          // Prepare response
          const response = {
            section: normalizedSection,
            overall: newOverall,
            newScoresProcessed: scoreAggregation.reduce((sum, s) => sum + s.questionTypes.reduce((sum, qt) => sum + qt.scores.length, 0), 0)
          };

          if (isOverall) {
            return {
              ...response,
              level: newOverall.level,
              progress: newOverall.progress,
              sectionXP: updateOps,
              scoresBySection: Object.fromEntries(
                scoreAggregation.map(s => [
                  s._id,
                  Object.fromEntries(s.questionTypes.map(qt => [qt.type, qt.scores]))
                ])
              ),
              sectionAverages: Object.fromEntries(
                scoreAggregation.map(s => [s._id.toLowerCase(), s.sectionAvg])
              )
            };
          }

          const sectionData = userXp.sectionXP.find(s => 
            s.section.toLowerCase() === normalizedSection.toLowerCase()
          );
          return {
            ...response,
            level: sectionData.level,
            progress: sectionData.progress,
            scoresBySection: Object.fromEntries(
              scoreAggregation[0]?.questionTypes.map(qt => [qt.type, qt.scores]) || []
            ),
            averageScore: scoreAggregation[0]?.sectionAvg || 0
          };

        } catch (error) {
          console.error('Error in calculateXp service:', error);
          throw error;
        }
    }

    async getPracticeXp(userId) {
        try {
            const userObjectId = new mongoose.Types.ObjectId(userId);
            
            // Use Promise.all to run queries in parallel
            const [userXp, practiceScores] = await Promise.all([
                practiceXpModel.findOneAndUpdate(
                    { userId: userObjectId },
                    {
                        $setOnInsert: {
                            userId: userObjectId,
                            sectionXP: [
                                { section: 'Reading', level: 1, progress: 0 },
                                { section: 'Writing', level: 1, progress: 0 },
                                { section: 'Listening', level: 1, progress: 0 },
                                { section: 'Speaking', level: 1, progress: 0 }
                            ],
                            overall: { level: 1, progress: 0 }
                        }
                    },
                    { upsert: true, new: true }
                ),
                PracticeScore.aggregate([
                    { 
                        $match: { userId: userObjectId }
                    },
                    {
                        $group: {
                            _id: { 
                                section: '$section',
                                questionType: '$questionType'
                            },
                            averageScore: { $avg: { $ifNull: [{ $toDouble: '$score' }, 0] } },
                            totalAttempts: { $sum: 1 },
                            lastAttempt: { $max: '$createdAt' }
                        }
                    },
                    { 
                        $sort: { 
                            '_id.section': 1,
                            '_id.questionType': 1
                        }
                    }
                ])
            ]);

            return {
                ...userXp.toObject(),
                practiceStats: practiceScores
            };
        } catch (error) {
            console.error('Error in getPracticeXp service:', error);
            throw error;
        }
    }
}

module.exports = new practiceXpService();