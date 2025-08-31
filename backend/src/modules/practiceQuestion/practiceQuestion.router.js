const router = require('express').Router();
const authOrAnonymous = require('../../middleware/authOrAnonymous.middleware');
const { uploadFile } = require('../../middleware/fileUploader.middleware');
const { FileFilterType } = require('../../config/constant.config');
const practiceQuestionController = require('./practiceQuestion.controller');

router.post('/practice/:type', 
    authOrAnonymous, 
    uploadFile(FileFilterType.AUDIO, 'audio'),
    practiceQuestionController.handlePractice
);

module.exports = router;
