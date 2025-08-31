const practcieFeedbackService = require('./practiceFeedback.service');


class practiceFeedbackController {
    showFeedback = async (req, res, next) => {
        try {
            console.log('Feedback request received for:', {
                userId: req.authUser._id,
                section: req.body.section
            });

            const userId = req.authUser._id;
            const { section } = req.body;

            if (!section) {
                console.log('Missing section in request');
                return res.status(422).json({
                    message: "Missing required field: section",
                    meta: null
                });
            }

            console.log('Generating feedback for:', {
                userId,
                section
            });

            const result = await practcieFeedbackService.generateFeedback(userId, section);
            
            console.log('Feedback generated:', result);

            // Check if we actually got feedback content
            if (!result.feedback && result.feedbackId) {
                console.log('Warning: Feedback ID present but no feedback content');
            }

            res.json({
                result: {
                    ...result,
                    feedback: result.feedback || 'No feedback content available'
                },
                message: "Feedback generated successfully",
                meta: null
            });

        } catch (exception) {
            console.error('Error in feedback controller:', exception);
            next(exception);
        }
    }
}

module.exports = new practiceFeedbackController();