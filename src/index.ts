import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import performanceRoutes from './routes/performance.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001; // Changed from 5000 to 5001

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/performance', performanceRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});