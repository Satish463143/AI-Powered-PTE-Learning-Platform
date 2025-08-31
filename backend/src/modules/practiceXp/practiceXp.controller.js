const practiceXpService = require("./practiceXp.service");

class practiceXpController {
    calculateXp = async (req, res, next) => {
        try {
            const userId = req.authUser._id;
            const { section } = req.body;

            if (!section) {
                return res.status(422).json({
                    message: "Missing required field: section",
                    meta: null
                });
            }

            const result = await practiceXpService.calculateXp(userId, section);

            res.json({
                result,
                message: "XP calculated successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    }

    getPracticeXp = async (req, res, next) => {
        try {
            const userId = req.authUser._id;
            const result = await practiceXpService.getPracticeXp(userId);

            res.json({
                result,
                message: "XP data retrieved successfully",
                meta: null
            });
        } catch (exception) {
            next(exception);
        }
    }
}

module.exports = new practiceXpController();