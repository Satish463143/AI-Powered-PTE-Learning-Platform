const router = require('express').Router();
const authOrAnonymous = require('../../middleware/authOrAnonymous.middleware');
const AiChatController = require('./aiChat.controller');

router.post('/chat', authOrAnonymous, AiChatController.handleChat);


module.exports = router;
