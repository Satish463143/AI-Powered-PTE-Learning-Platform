const router = require('express').Router()
const userRouter = require('../modules/user/user.router')
const aiChatRouter = require('../modules/aiChat/aiChat.router')
const authRouter = require('../modules/auth/auth.router')

router.use('/user', userRouter)
router.use('/aiChat', aiChatRouter)
router.use('/auth', authRouter)


module.exports = router