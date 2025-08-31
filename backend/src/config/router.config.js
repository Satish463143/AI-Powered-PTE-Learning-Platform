const router = require('express').Router()
const userRouter = require('../modules/user/user.router')
const aiChatRouter = require('../modules/aiChat/aiChat.router')
const authRouter = require('../modules/auth/auth.router')
const practiceQuestionRouter = require('../modules/practiceQuestion/practiceQuestion.router')
const fullMockTestRouter = require('../modules/fullMockTest/fullMockTest.route')
const sectionMockTestRouter = require('../modules/sectionMockTest/sectionMockTest.route')
const practiceXpRouter = require('../modules/practiceXp/practiceXp.router')
const practiceFeedbackRouter = require('../modules/practiceFeedback/practiceFeedback.router')
const callfeatrueRouter = require('../modules/callFeature/callFeature.router')

router.use('/user', userRouter)
router.use('/aiChat', aiChatRouter)
router.use('/auth', authRouter)
router.use('/question', practiceQuestionRouter)
router.use('/fullMockTest', fullMockTestRouter)
router.use('/sectionMockTest', sectionMockTestRouter)
router.use('/practiceXp', practiceXpRouter)
router.use('/practiceFeedback', practiceFeedbackRouter)
router.use('/call', callfeatrueRouter)


module.exports = router