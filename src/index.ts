import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import authRoutes from './routes/authRoutes';
import pool from './models/db'; // <-- Make sure this is imported to access the database

const app = express();
app.use(json());

// Register auth routes
app.use('/auth', authRoutes);

// Test DB connection route
app.get('/test-db', async (req: Request, res: Response) => {
    try {
      const result = await pool.query('SELECT NOW()');
      res.json(result.rows);
    } catch (error) {
      console.error('DB test failed:', error); // Already here, good
      res.status(500).json({ message: 'DB connection failed', error });
    }
  });
  

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
