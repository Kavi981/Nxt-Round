import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import commentRoutes from './routes/comments.js';
import statsRoutes from './routes/stats.js';

// Check if .env file exists and load environment variables
const envPath = join(process.cwd(), '.env');
console.log('🔍 Looking for .env file at:', envPath);
console.log('📁 Current working directory:', process.cwd());

if (existsSync(envPath)) {
  console.log('✅ .env file found');
  dotenv.config({ path: envPath });
} else {
  console.log('❌ .env file not found at:', envPath);
  // Try loading from default location
  dotenv.config();
}

// Debug: Log environment variables (remove in production)
console.log('🔧 Environment Variables Check:');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('- EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
console.log('- FROM_EMAIL:', process.env.FROM_EMAIL ? 'Set' : 'Not set');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

const app = express();
const server = createServer(app);

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nxtround.tech",
  "https://nxtround.tech/",
  "https://nxt-round.onrender.com",
  "https://nxt-round.vercel.app",
  process.env.CORS_ORIGIN
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
  allowRequest: (req, callback) => {
    // Allow all requests for now, you can add authentication logic here
    callback(null, true);
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add compression for better performance
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
  next();
});

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stats', statsRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  console.log('Socket transport:', socket.conn.transport.name);

  socket.on('join-question', (questionId) => {
    socket.join(`question-${questionId}`);
    console.log(`User ${socket.id} joined question ${questionId}`);
  });

  socket.on('leave-question', (questionId) => {
    socket.leave(`question-${questionId}`);
    console.log(`User ${socket.id} left question ${questionId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle transport upgrades
  socket.on('upgrade', () => {
    console.log(`Socket ${socket.id} upgraded to:`, socket.conn.transport.name);
  });

  // Handle transport errors
  socket.conn.on('error', (error) => {
    console.error(`Transport error for socket ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 5003;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
  console.log(`🔗 MongoDB connected: ${process.env.MONGODB_URI ? 'Yes' : 'No'}`);
});