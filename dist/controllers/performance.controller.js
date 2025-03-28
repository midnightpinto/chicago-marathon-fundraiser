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
exports.PerformanceController = void 0;
const db_1 = __importDefault(require("../../config/db"));
class PerformanceController {
    static createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employee_id, review_period_start, review_period_end } = req.body;
                const manager_id = req.user.userId;
                const [result] = yield db_1.default.query('INSERT INTO performance_reviews (employee_id, manager_id, review_period_start, review_period_end, status) VALUES (?, ?, ?, ?, ?)', [employee_id, manager_id, review_period_start, review_period_end, 'draft']);
                const [newReview] = yield db_1.default.query('SELECT * FROM performance_reviews WHERE review_id = ?', [result.insertId]);
                res.status(201).json(newReview[0]);
            }
            catch (error) {
                console.error('Error creating review:', error);
                res.status(500).json({ message: 'Error creating review' });
            }
        });
    }
    static getReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.userId;
                const userRole = req.user.role;
                const query = userRole === 'manager'
                    ? 'SELECT * FROM performance_reviews WHERE manager_id = ?'
                    : 'SELECT * FROM performance_reviews WHERE employee_id = ?';
                const [rows] = yield db_1.default.query(query, [userId]);
                res.json(rows);
            }
            catch (error) {
                console.error('Error fetching reviews:', error);
                res.status(500).json({ message: 'Error fetching reviews' });
            }
        });
    }
    static submitSelfAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { review_id } = req.params;
                const { assessments } = req.body;
                const userId = req.user.userId;
                // Begin transaction
                yield db_1.default.query('START TRANSACTION');
                // Verify user is the review employee
                const [reviewCheck] = yield db_1.default.query('SELECT * FROM performance_reviews WHERE review_id = ? AND employee_id = ?', [review_id, userId]);
                if (!reviewCheck.length) {
                    yield db_1.default.query('ROLLBACK');
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                // Delete existing assessments
                yield db_1.default.query('DELETE FROM self_assessments WHERE review_id = ?', [review_id]);
                // Insert new assessments
                for (const assessment of assessments) {
                    yield db_1.default.query('INSERT INTO self_assessments (review_id, category, rating, comments) VALUES (?, ?, ?, ?)', [review_id, assessment.category, assessment.rating, assessment.comments]);
                }
                // Update review status
                yield db_1.default.query('UPDATE performance_reviews SET status = ? WHERE review_id = ?', ['submitted', review_id]);
                yield db_1.default.query('COMMIT');
                res.json({ message: 'Self assessment submitted successfully' });
            }
            catch (error) {
                yield db_1.default.query('ROLLBACK');
                console.error('Error submitting self assessment:', error);
                res.status(500).json({ message: 'Error submitting self assessment' });
            }
        });
    }
    static getReviewAssessments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { review_id } = req.params;
                const userId = req.user.userId;
                const [review] = yield db_1.default.query('SELECT * FROM performance_reviews WHERE review_id = ? AND (employee_id = ? OR manager_id = ?)', [review_id, userId, userId]);
                if (!review.length) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
                const [selfAssessments] = yield db_1.default.query('SELECT * FROM self_assessments WHERE review_id = ?', [review_id]);
                const [managerAssessments] = yield db_1.default.query('SELECT * FROM manager_assessments WHERE review_id = ?', [review_id]);
                res.json({
                    self_assessments: selfAssessments,
                    manager_assessments: managerAssessments
                });
            }
            catch (error) {
                console.error('Error fetching assessments:', error);
                res.status(500).json({ message: 'Error fetching assessments' });
            }
        });
    }
}
exports.PerformanceController = PerformanceController;
