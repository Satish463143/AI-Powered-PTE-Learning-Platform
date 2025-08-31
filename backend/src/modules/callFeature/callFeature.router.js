const router = require('express').Router();
const loginCheck = require('../../middleware/auth.middleware');
const callFeatureController = require('./callFeature.controller');
const geminiService = require('../../utils/gemini.service');


router.post('/start_call', loginCheck, callFeatureController.startCall);
router.post('/end_call', loginCheck, callFeatureController.endCall);
router.get('/get_call_history', loginCheck, callFeatureController.getCallHistory);

module.exports = router;