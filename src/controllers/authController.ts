import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../models/db'; // Assuming this is your PostgreSQL connection pool
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'worisecretkey';

// // Function to generate a random string for tokens or other purposes
// function generateRandomString(length: number): string {
//   const characters =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   const charactersLength = characters.length;
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength));
//   }
//   return result;
// }

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Insert the user into the database
    const result = await pool.query(
      `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING username, email
      `,
      [username, email, hashedPassword]
    );
    const user = result.rows(0);
    res.status(500).json({messages:'User registratered successfully',});
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const login = async (req: Request, res: Response) => {
  // try {
  //   // 1. Get email and password from the request body
  //   const { email, password } = req.body;

  //   // 2. Check if the user exists in the database
  //   const result = await pool.query(
  //     `
  //       SELECT * FROM users WHERE email = $1
  //     `,
  //     [email]
  //   );

  //   if (result.rows.length === 0) {
  //     return res.status(401).json({ message: 'Invalid credentials' });
  //   }

  //   const user = result.rows[0];

  //   // 3. Compare the provided password with the hashed password in the database
  //   const isMatch = await bcrypt.compare(password, user.password);

  //   if (!isMatch) {
  //     return res.status(401).json({ message: 'Invalid credentials' });
  //   }

  //   // 4. Generate a JWT token
  //   const token = jwt.sign(
  //     { userId: user.id, email: user.email },
  //     JWT_SECRET,
  //     { expiresIn: '1h' }
  //   );

  //   // 5. Send the token as a response
  //   res.json({
  //     message: 'Login successful',
  //     token,
  //     user: {
  //       id: user.id,
  //       username: user.username,
  //       email: user.email,
  //     },
  //   });
  // } catch (error) {
  //   console.error('Error during login:', error);
  //   res.status(500).json({ message: 'Internal Server Error' });
  // }
};