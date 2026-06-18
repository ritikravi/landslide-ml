import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupSocketHandlers } from './socket/socketHandler.js';
import sensorRoutes from './routes/sensorRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import mlRoutes from './routes/mlRoutes.js';
import powerbiRoutes from './routes/powerbiRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Trust proxy for Render.com deployment
app.set('trust proxy', true);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());  // Allow all origins for now
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting with proper trust proxy configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  // Trust X-Forwarded-For from Render proxy
  validate: { trustProxy: false }
});
app.use('/api', limiter);

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', sensorRoutes);
app.use('/api', alertRoutes);
app.use('/api', mlRoutes);
app.use('/api/powerbi', powerbiRoutes); // Power BI integration routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Setup Socket.IO
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
  });
};

startServer();
