import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import questionRoutes from './routes/questions.js';
import answerRoutes from './routes/answers.js';
import commentRoutes from './routes/comments.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS configuration for production
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nxtround.vercel.app", // Corrected: no trailing slash
  process.env.CORS_ORIGIN
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
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

  socket.on('join-question', (questionId) => {
    socket.join(`question-${questionId}`);
  });

  socket.on('leave-question', (questionId) => {
    socket.leave(`question-${questionId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5003;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});