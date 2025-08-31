const loginCheck = require("../../middleware/auth.middleware");
const { setPath, uploadFile, uploadToGCS } = require("../../middleware/fileUploader.middleware");
const { FileFilterType } = require("../../config/constant.config");
const fullMockTestController = require("./fullMockTest.controller");
const router = require("express").Router();

router.post('/mock-test/about-me',
    loginCheck,
    setPath('AboutMe'),
    uploadFile(FileFilterType.AUDIO),
    uploadToGCS,
    fullMockTestController.saveAboutMe
);

router.post('/mock-test/start', 
    loginCheck,
    setPath('UserAnswers'), 
    uploadFile(FileFilterType.AUDIO),
    uploadToGCS,
    fullMockTestController.createMockTest
);
router.get("/mock-test/reports",loginCheck, fullMockTestController.getMockTestReport);
router.get("/mock-test/report/:mockTestId",loginCheck, fullMockTestController.getMockTestReportById);

router.get('/mock-test/stats',loginCheck, fullMockTestController.getMockTestStats);

module.exports = router;