const loginCheck = require('../../middleware/auth.middleware');
const practiceFeedbackController = require('./practiceFeedback.controller');

const router = require('express').Router();

router.post('/', loginCheck, practiceFeedbackController.showFeedback);

module.exports = router;