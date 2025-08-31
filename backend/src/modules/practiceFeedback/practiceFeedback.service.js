const { PracticeScore } = require('../practiceQuestion/practiceQuestion.model');
const PracticeFeedback = require('./practiceFeedback.model');
const generateAiResponse = require('../../utils/ai.service');
const { generateFeedbackPrompt, getPromptMessages, generateDefaultFeedback } = require('../../utils/feedbackPrompt');

class PracticeFeedbackService {
    async getScoresForSection(userId, section, timeRangeHours = 520) { 
        try {
            console.log('Getting scores for:', {
                userId,
                section,
                timeRangeHours
            });

            // Get scores based on provided time range
            const timeAgo = new Date();
            timeAgo.setHours(timeAgo.getHours() - timeRangeHours);

            // First try to get unprocessed scores
            const query = {
                userId,
                ...(section.toLowerCase() !== 'overall' && { section: section.toLowerCase() }),
                createdAt: { $gte: timeAgo }
            };

            console.log('Database query:', query);

            const scores = await PracticeScore.find(query)
                .sort({ createdAt: -1 })
                .lean();

            console.log('Found scores:', scores);

            // If no scores at all, return empty result
            if (scores.length === 0) {
                console.log('No scores found');
                return {};
            }

            // Group the scores
            const groupedScores = this.groupScores(scores);
            console.log('Grouped scores:', groupedScores);

            // If we have scores for the requested section, return them
            if (section.toLowerCase() === 'overall' || groupedScores[section.toLowerCase()]) {
                return groupedScores;
            }

            console.log('No scores found for specific section');
            // If no scores for specific section, return empty object to trigger default feedback
            return {};
        } catch (error) {
            console.error('Error getting scores:', error);
            throw error;
        }
    }

    // Helper method to group scores
    groupScores(scores) {
        console.log('Grouping scores:', scores);
        const grouped = scores.reduce((acc, score) => {
            const section = score.section.toLowerCase(); // Ensure lowercase
            const questionType = score.questionType;
            
            if (!acc[section]) {
                acc[section] = {};
            }
            if (!acc[section][questionType]) {
                acc[section][questionType] = [];
            }
            
            acc[section][questionType].push(score.score);
            return acc;
        }, {});
        console.log('Grouped result:', grouped);
        return grouped;
    }

    convertFeedbackToHtml(feedbackJson) {
        let html = '';
        
        // Process each section
        Object.entries(feedbackJson).forEach(([sectionKey, sectionData]) => {
            if (sectionKey === 'overallSummary') {
                html += `<div class="section-feedback">
                    <h2>${sectionData.title}</h2>
                    ${sectionData.feedback.map(point => `<p>${point}</p>`).join('')}
                </div>`;
            } else {
                html += `<div class="section-feedback">
                    <h2>${sectionData.title}</h2>`;
                
                // Process each question type in the section
                Object.entries(sectionData).forEach(([key, value]) => {
                    if (key !== 'title') {
                        html += `<div class="question-type">
                            <h3>${value.label}</h3>
                            <div class="feedback-points">
                                ${value.feedback.map(point => `<p>${point}</p>`).join('')}
                            </div>
                        </div>`;
                    }
                });
                
                html += '</div>';
            }
        });
        
        return html;
    }

    async generateFeedback(userId, section, timeRangeHours = 520) { // 5 days = 120 hours
        try {
            console.log('Generating feedback for user:', userId, 'section:', section);
            
            // First check if we have feedback from today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const existingFeedback = await PracticeFeedback.findOne({
                userId,
                createdAt: { $gte: startOfDay }
            });

            console.log('Existing feedback:', existingFeedback);

            // If we have existing feedback for today, check if it's valid
            if (existingFeedback) {
                if (section.toLowerCase() === 'overall') {
                    if (existingFeedback.overall?.feedbackText) {
                        console.log('Returning existing overall feedback');
                        return {
                            feedback: existingFeedback.overall.feedbackText,
                            hasPdfContent: !!existingFeedback.overall.pdfContent,
                            feedbackId: existingFeedback._id
                        };
                    }
                } else {
                    const sectionFeedback = existingFeedback.section?.find(
                        s => s.section.toLowerCase() === section.toLowerCase()
                    );
                    // Only return if we have actual feedback text
                    if (sectionFeedback?.feedbackText) {
                        console.log('Returning existing section feedback');
                        return {
                            feedback: sectionFeedback.feedbackText,
                            hasPdfContent: !!sectionFeedback.pdfContent,
                            feedbackId: existingFeedback._id
                        };
                    }
                    console.log('Found empty section feedback, generating new feedback');
                }
            }

            // Get grouped scores
            const sectionScores = await this.getScoresForSection(userId, section, timeRangeHours);
            console.log('Section scores for feedback:', sectionScores);
            
            let feedbackParts;
            
            if (Object.keys(sectionScores).length === 0) {
                console.log('No scores found, generating default feedback');
                feedbackParts = generateDefaultFeedback(section);
            } else {
                console.log('Generating AI feedback for scores');
                const prompt = generateFeedbackPrompt(sectionScores);

                const aiResponse = await this.getAIResponseWithRetry(prompt);

                if (!aiResponse) {
                    console.error('Failed to get AI response, falling back to default feedback');
                    feedbackParts = generateDefaultFeedback(section);
                } else {
                    try {
                        feedbackParts = this.parseFeedbackResponse(aiResponse);
                    } catch (error) {
                        console.error('Error parsing AI response:', error);
                        feedbackParts = generateDefaultFeedback(section);
                    }
                }
            }

            if (!feedbackParts?.mainFeedback) {
                console.error('Invalid feedback format, falling back to default');
                feedbackParts = generateDefaultFeedback(section);
            }

            console.log('Generated feedback parts:', feedbackParts);

            // Prepare feedback document
            const feedbackDoc = this.prepareFeedbackDocument(userId, section, feedbackParts);

            // Save feedback to database with upsert logic
            const savedFeedback = await PracticeFeedback.findOneAndUpdate(
                {
                    userId,
                    createdAt: { $gte: startOfDay }
                },
                this.getUpdateOperation(section, feedbackDoc),
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );

            console.log('Saved feedback document:', savedFeedback);

            // Return the feedback with content
            const response = {
                feedback: feedbackParts.mainFeedback,
                hasPdfContent: !!feedbackParts.pdfContent,
                feedbackId: savedFeedback._id
            };

            console.log('Returning feedback response:', response);
            return response;
        } catch (error) {
            console.error('Error generating feedback:', error);
            throw error;
        }
    }

    async getAIResponseWithRetry(prompt, maxRetries = 3) {
        let retries = 0;
        let lastError = null;

        while (retries < maxRetries) {
            try {
                console.log('Generating AI response with prompt:', prompt);
                const response = await generateAiResponse(
                    getPromptMessages(prompt),
                    { skipBilingualTone: true }
                );
                console.log('AI response received:', response);

                return response;
            } catch (error) {
                console.error('AI response generation attempt failed:', error);
                lastError = error;
                retries++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
            }
        }

        console.error('All AI response generation attempts failed:', lastError);
        return null;
    }

    parseFeedbackResponse(aiResponse) {
        // The AI response should be HTML content
        const cleanedResponse = aiResponse.trim();
        
        // Basic validation that it's HTML
        if (!cleanedResponse.includes('<h3>') || !cleanedResponse.includes('</h3>')) {
            throw new Error('Invalid AI response format: Expected HTML content');
        }

        return {
            mainFeedback: cleanedResponse,
            pdfContent: null
        };
    }

    prepareFeedbackDocument(userId, section, feedbackParts) {
        const feedbackDoc = {
            userId,
            generatedAt: new Date()
        };

        if (section.toLowerCase() === 'overall') {
            feedbackDoc.overall = {
                feedbackText: feedbackParts.mainFeedback,
                ...(feedbackParts.pdfContent && { pdfContent: feedbackParts.pdfContent })
            };
        } else {
            feedbackDoc.section = [{
                section,
                feedbackText: feedbackParts.mainFeedback,
                ...(feedbackParts.pdfContent && { pdfContent: feedbackParts.pdfContent })
            }];
        }

        return feedbackDoc;
    }

    getUpdateOperation(section, feedbackDoc) {
        if (section.toLowerCase() === 'overall') {
            return {
                $set: {
                    userId: feedbackDoc.userId,
                    overall: feedbackDoc.overall,
                    generatedAt: feedbackDoc.generatedAt
                }
            };
        }

        return {
            $set: {
                userId: feedbackDoc.userId,
                generatedAt: feedbackDoc.generatedAt
            },
            $addToSet: {
                section: {
                    $each: feedbackDoc.section
                }
            }
        };
    }
}

module.exports = new PracticeFeedbackService();