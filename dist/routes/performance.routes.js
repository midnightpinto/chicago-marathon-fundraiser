"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const performance_controller_1 = require("../controllers/performance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.post('/reviews', performance_controller_1.PerformanceController.createReview);
router.get('/reviews', performance_controller_1.PerformanceController.getReviews);
router.get('/reviews/:review_id/assessments', performance_controller_1.PerformanceController.getReviewAssessments);
router.post('/reviews/:review_id/self-assessment', performance_controller_1.PerformanceController.submitSelfAssessment);
exports.default = router;
