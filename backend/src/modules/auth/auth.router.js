const router = require('express').Router();
const { bodyValidator } = require('../../middleware/validator.middleware');
const { LoginDTO } = require('./auth.request');
const AuthController = require('./auth.controller');
const verifyToken = require('../../middleware/verifyToken.middleware');
const loginCheck = require('../../middleware/auth.middleware');

router.post('/login', bodyValidator(LoginDTO), AuthController.login)
router.post('/logout', verifyToken, AuthController.logout)
router.get('/me',loginCheck, verifyToken, AuthController.me)


module.exports = router;

