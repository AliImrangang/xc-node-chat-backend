import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../models/db'; 
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'worisecretkey';

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Insert the user into the database
    const result = await pool.query(
      `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [username, email, hashedPassword]
    );
    const user = result.rows[0];
    res.status(201).json({messages:'User registratered successfully',user});
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '10h' });
  
    let finalResult = {...user,token}
    res.json({ user: finalResult });
  } catch (error) {
    res.status(500).json({ message: 'Failed to log in' });
  }
};