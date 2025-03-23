import { Request, Response } from 'express';
import pool from '../../config/db';

export class PerformanceController {
  static async createReview(req: Request, res: Response) {
    try {
      const { employee_id, review_period_start, review_period_end } = req.body;
      const manager_id = (req as any).user.userId;

      const [result] = await pool.query(
        'INSERT INTO performance_reviews (employee_id, manager_id, review_period_start, review_period_end, status) VALUES (?, ?, ?, ?, ?)',
        [employee_id, manager_id, review_period_start, review_period_end, 'draft']
      );

      const [newReview] = await pool.query('SELECT * FROM performance_reviews WHERE review_id = ?', [(result as any).insertId]);
      res.status(201).json((newReview as any)[0]);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  }

  static async getReviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const userRole = (req as any).user.role;

      const query = userRole === 'manager' 
        ? 'SELECT * FROM performance_reviews WHERE manager_id = ?'
        : 'SELECT * FROM performance_reviews WHERE employee_id = ?';

      const [rows] = await pool.query(query, [userId]);
      res.json(rows);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }

  static async submitSelfAssessment(req: Request, res: Response) {
    try {
      const { review_id } = req.params;
      const { assessments } = req.body;
      const userId = (req as any).user.userId;

      // Begin transaction
      await pool.query('START TRANSACTION');

      // Verify user is the review employee
      const [reviewCheck] = await pool.query(
        'SELECT * FROM performance_reviews WHERE review_id = ? AND employee_id = ?',
        [review_id, userId]
      );

      if (!(reviewCheck as any[]).length) {
        await pool.query('ROLLBACK');
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Delete existing assessments
      await pool.query('DELETE FROM self_assessments WHERE review_id = ?', [review_id]);

      // Insert new assessments
      for (const assessment of assessments) {
        await pool.query(
          'INSERT INTO self_assessments (review_id, category, rating, comments) VALUES (?, ?, ?, ?)',
          [review_id, assessment.category, assessment.rating, assessment.comments]
        );
      }

      // Update review status
      await pool.query(
        'UPDATE performance_reviews SET status = ? WHERE review_id = ?',
        ['submitted', review_id]
      );

      await pool.query('COMMIT');

      res.json({ message: 'Self assessment submitted successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error submitting self assessment:', error);
      res.status(500).json({ message: 'Error submitting self assessment' });
    }
  }

  static async getReviewAssessments(req: Request, res: Response) {
    try {
      const { review_id } = req.params;
      const userId = (req as any).user.userId;

      const [review] = await pool.query(
        'SELECT * FROM performance_reviews WHERE review_id = ? AND (employee_id = ? OR manager_id = ?)',
        [review_id, userId, userId]
      );

      if (!(review as any[]).length) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const [selfAssessments] = await pool.query(
        'SELECT * FROM self_assessments WHERE review_id = ?',
        [review_id]
      );

      const [managerAssessments] = await pool.query(
        'SELECT * FROM manager_assessments WHERE review_id = ?',
        [review_id]
      );

      res.json({
        self_assessments: selfAssessments,
        manager_assessments: managerAssessments
      });
    } catch (error) {
      console.error('Error fetching assessments:', error);
      res.status(500).json({ message: 'Error fetching assessments' });
    }
  }
}