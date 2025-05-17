const router = require('express').Router();
const AiChatController = require('./aiChat.controller');



router.post('/chat', AiChatController.handleChat);

module.exports = router;
