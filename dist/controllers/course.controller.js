"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const db_1 = __importDefault(require("../../config/db"));
class CourseController {
    static createCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description } = req.body;
                const created_by = req.user.userId;
                const [result] = yield db_1.default.query('INSERT INTO courses (title, description, created_by, status) VALUES (?, ?, ?, ?)', [title, description, created_by, 'draft']);
                const [newCourse] = yield db_1.default.query('SELECT * FROM courses WHERE course_id = ?', [result.insertId]);
                res.status(201).json(newCourse[0]);
            }
            catch (error) {
                console.error('Error creating course:', error);
                res.status(500).json({ message: 'Error creating course' });
            }
        });
    }
    static getCourses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield db_1.default.query('SELECT * FROM courses ORDER BY created_at DESC');
                res.json(rows);
            }
            catch (error) {
                console.error('Error fetching courses:', error);
                res.status(500).json({ message: 'Error fetching courses' });
            }
        });
    }
    static getCourseById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const [rows] = yield db_1.default.query('SELECT * FROM courses WHERE course_id = ?', [id]);
                if (!rows.length) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                res.json(rows[0]);
            }
            catch (error) {
                console.error('Error fetching course:', error);
                res.status(500).json({ message: 'Error fetching course' });
            }
        });
    }
    static updateCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { title, description, status } = req.body;
                const [result] = yield db_1.default.query('UPDATE courses SET title = ?, description = ?, status = ? WHERE course_id = ?', [title, description, status, id]);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                const [updatedCourse] = yield db_1.default.query('SELECT * FROM courses WHERE course_id = ?', [id]);
                res.json(updatedCourse[0]);
            }
            catch (error) {
                console.error('Error updating course:', error);
                res.status(500).json({ message: 'Error updating course' });
            }
        });
    }
    static deleteCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const [result] = yield db_1.default.query('DELETE FROM courses WHERE course_id = ?', [id]);
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'Course not found' });
                }
                res.json({ message: 'Course deleted successfully' });
            }
            catch (error) {
                console.error('Error deleting course:', error);
                res.status(500).json({ message: 'Error deleting course' });
            }
        });
    }
}
exports.CourseController = CourseController;
