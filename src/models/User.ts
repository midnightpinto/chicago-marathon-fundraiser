import bcrypt from 'bcrypt';
import pool from '../../config/db';

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
}

export class UserModel {
  static async create(email: string, password: string, firstName: string, lastName: string, role: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, role]
    );
    const [newUser] = await pool.query('SELECT * FROM users WHERE user_id = ?', [(result as any).insertId]);
    return (newUser as any)[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return (rows as any)[0] || null;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}