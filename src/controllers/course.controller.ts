import { Request, Response } from 'express';
import pool from '../../config/db';

export class CourseController {
  static async createCourse(req: Request, res: Response) {
    try {
      const { title, description } = req.body;
      const created_by = (req as any).user.userId;

      const [result] = await pool.query(
        'INSERT INTO courses (title, description, created_by, status) VALUES (?, ?, ?, ?)',
        [title, description, created_by, 'draft']
      );

      const [newCourse] = await pool.query('SELECT * FROM courses WHERE course_id = ?', [(result as any).insertId]);
      res.status(201).json((newCourse as any)[0]);
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ message: 'Error creating course' });
    }
  }

  static async getCourses(req: Request, res: Response) {
    try {
      const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
      res.json(rows);
    } catch (error) {
      console.error('Error fetching courses:', error);
      res.status(500).json({ message: 'Error fetching courses' });
    }
  }

  static async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [rows] = await pool.query('SELECT * FROM courses WHERE course_id = ?', [id]);
      
      if (!(rows as any[]).length) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json((rows as any)[0]);
    } catch (error) {
      console.error('Error fetching course:', error);
      res.status(500).json({ message: 'Error fetching course' });
    }
  }

  static async updateCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body;

      const [result] = await pool.query(
        'UPDATE courses SET title = ?, description = ?, status = ? WHERE course_id = ?',
        [title, description, status, id]
      );

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const [updatedCourse] = await pool.query('SELECT * FROM courses WHERE course_id = ?', [id]);
      res.json((updatedCourse as any)[0]);
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Error updating course' });
    }
  }

  static async deleteCourse(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [result] = await pool.query('DELETE FROM courses WHERE course_id = ?', [id]);

      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Error deleting course' });
    }
  }
}