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
exports.AuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
class AuthController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, firstName, lastName, role } = req.body;
                const existingUser = yield User_1.UserModel.findByEmail(email);
                if (existingUser) {
                    return res.status(400).json({ message: 'User already exists' });
                }
                const user = yield User_1.UserModel.create(email, password, firstName, lastName, role);
                const token = jsonwebtoken_1.default.sign({ userId: user.user_id, role: user.role }, JWT_SECRET);
                res.status(201).json({ token, user: Object.assign(Object.assign({}, user), { password_hash: undefined }) });
            }
            catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ message: 'Error during registration' });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield User_1.UserModel.findByEmail(email);
                if (!user) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                const isValidPassword = yield User_1.UserModel.verifyPassword(password, user.password_hash);
                if (!isValidPassword) {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
                const token = jsonwebtoken_1.default.sign({ userId: user.user_id, role: user.role }, JWT_SECRET);
                res.json({ token, user: Object.assign(Object.assign({}, user), { password_hash: undefined }) });
            }
            catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ message: 'Error during login' });
            }
        });
    }
}
exports.AuthController = AuthController;
