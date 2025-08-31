const practiceQuestionService = require("./practiceQuestion.service");

class PracticeQuestionController {
  handlePractice = async (req, res, next) => {
    try {
      const type = req.params.type;
      const userId = req.userId;
      const section = req.body.section;
      
      // Check if req.body exists and provide default values
      if (!req.body) {
        return res.status(400).json({ 
          success: false, 
          message: "Request body is required" 
        });
      }

      const {
        actionType,
        userAnswer,
        lastFeedback,
        attemptDuration,
      } = req.body;

      // Special handling for speaking section audio submissions
      if (section === 'speaking' && actionType === 'submit') {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Audio file is required for speaking section"
          });
        }

        // Parse userAnswer from form data
        const parsedUserAnswer = typeof userAnswer === 'string' ? JSON.parse(userAnswer) : userAnswer;

        const result = await practiceQuestionService.handleSpeakingSubmission(
          type,
          {
            userId,
            audioFile: {
              buffer: req.file.buffer,
              mimetype: req.file.mimetype,
              size: req.file.size
            },
            userAnswer: parsedUserAnswer,
            attemptDuration
          }
        );

        return res.json({
          message: "Speaking evaluation completed",
          result: result,
          meta: null
        });
      }

      // Regular handling for other sections (reading, writing, listening)
      const result = await practiceQuestionService.handlePractice(
        type,
        actionType,
        {
          userId,
          userAnswer,
          lastFeedback,
          section,
          attemptDuration
        }
      );

      res.json({
         message: "question generated",
         result: result,
         meta: null
      });
    } catch (exception) {
      console.error("Practice controller error:", exception);
      next(exception);
    }
  };

  evaluate = async (req, res) => {
    try {
      const { answers, originalQuestion } = req.body;

      // Validate request body
      if (!answers || !originalQuestion) {
        return res.status(400).json({
          result: null,
          message: 'Missing required fields: answers and originalQuestion',
          meta: null
        });
      }

      // Format the answer data for service layer
      const userAnswer = {
        answer: answers,
        originalQuestion
      };

      const result = await practiceQuestionService.handlePractice(
        originalQuestion.type,
        'submit',
        {
          userId: req.userId,
          userAnswer,
          section: 'listening', // For Fill in the Blanks (Listening)
          attemptDuration: 0 // You might want to pass this from frontend if needed
        }
      );

      return res.status(200).json({
        result: result,
        message: 'Evaluation completed successfully',
        meta: null
      });
    } catch (error) {
      console.error('Error in evaluate controller:', error);
      return res.status(500).json({
        result: null,
        message: error.message || 'Error during evaluation',
        meta: null
      });
    }
  };
}

module.exports = new PracticeQuestionController();
