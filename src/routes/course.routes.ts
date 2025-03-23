import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/', CourseController.createCourse);
router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourseById);
router.put('/:id', CourseController.updateCourse);
router.delete('/:id', CourseController.deleteCourse);

export default router;