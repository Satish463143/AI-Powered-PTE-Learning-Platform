const loginCheck = require('../../middleware/auth.middleware');
const practiceXpController = require('./practiceXp.controller');

const router = require('express').Router();

router.post('/', loginCheck, practiceXpController.calculateXp);

router.get('/', loginCheck, practiceXpController.getPracticeXp);

module.exports = router;