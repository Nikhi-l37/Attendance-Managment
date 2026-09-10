import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRouter from './routes/auth.js';
import studentsRouter from './routes/students.js';
import teachersRouter from './routes/teachers.js';
import attendanceRouter from './routes/attendance.js';
import marksRouter from './routes/marks.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB().catch(err => {
  console.error('Failed to initialize MongoDB connection:', err.message);
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/teachers', teachersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'MongoDB Atlas',
    timestamp: new Date().toISOString(),
  });
});

import fs from 'fs';

// Serve static frontend build if present
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Client-side routing fallback for React SPA
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Academia Attendance & Marks API Server is running.');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Academia API Server running on port ${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}/api`);
});
