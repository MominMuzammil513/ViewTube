import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import likeRouter from './routes/like.routes.js';

// Initialize Express app
const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Path setup for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(express.json({ limit: '16kB' }));
app.use(express.urlencoded({ extended: true, limit: '16kB' }));
app.use(cookieParser());

// Route declarations
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/channel', dashboardRouter);
app.use('/api/v1/like', likeRouter);

// Error handling middleware (optional but recommended)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export { app };
