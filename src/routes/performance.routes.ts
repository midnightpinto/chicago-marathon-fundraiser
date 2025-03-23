import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/reviews', PerformanceController.createReview);
router.get('/reviews', PerformanceController.getReviews);
router.get('/reviews/:review_id/assessments', PerformanceController.getReviewAssessments);
router.post('/reviews/:review_id/self-assessment', PerformanceController.submitSelfAssessment);

export default router;