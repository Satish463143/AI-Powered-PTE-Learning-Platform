const loginCheck = require("../../middleware/auth.middleware");
const sectionMockTestController = require("./sectionMockTest.controller");
const router = require("express").Router();

router.post('/mock-test/start',loginCheck, sectionMockTestController.createMockTest);
router.post('/mock-test/next',loginCheck, sectionMockTestController.nextQuestion);
router.post('/mock-test/submit',loginCheck, sectionMockTestController.submitMockTest);
router.get("/mock-test/reports",loginCheck, sectionMockTestController.getMockTestReport);
router.get("/mock-test/report/:mockTestId",loginCheck, sectionMockTestController.getMockTestReportById);

router.get('/mock-test/stats',loginCheck, sectionMockTestController.getMockTestStats);


module.exports = router;