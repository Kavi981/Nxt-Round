import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Comment from '../models/Comment.js';
import Company from '../models/Company.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload avatar
router.post('/upload/avatar', auth, avatarUpload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `/uploads/avatars/${req.file.filename}`;
    // Save the avatar URL to the user's profile
    await User.findByIdAndUpdate(req.user._id, { avatar: fileUrl });
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Serve uploaded avatar files
router.get('/uploads/avatars/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', 'avatars', req.params.filename);
  res.sendFile(filePath);
});

// Get user dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  console.log('Dashboard endpoint called');
  try {
    const userId = req.user._id;
    console.log('User ID:', userId);

    // Get user's questions count
    const questionsCount = await Question.countDocuments({ author: userId });
    console.log('Questions count:', questionsCount);
    
    // Get user's answers count
    const answersCount = await Answer.countDocuments({ author: userId });
    console.log('Answers count:', answersCount);
    
    // Get user's comments count
    const commentsCount = await Comment.countDocuments({ author: userId });
    console.log('Comments count:', commentsCount);
    
    // Get user's companies count
    const companiesCount = await Company.countDocuments({ createdBy: userId });
    console.log('Companies count:', companiesCount);
    
    // Get total votes received on user's questions
    const userQuestions = await Question.find({ author: userId });
    const totalQuestionVotes = userQuestions.reduce((total, question) => {
      return total + question.votes.upvotes.length + question.votes.downvotes.length;
    }, 0);
    
    // Get total votes received on user's answers
    const userAnswers = await Answer.find({ author: userId });
    const totalAnswerVotes = userAnswers.reduce((total, answer) => {
      return total + answer.votes.upvotes.length + answer.votes.downvotes.length;
    }, 0);
    
    // Get recent activity (last 5 questions, answers, comments)
    const recentQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('company', 'name');
    
    const recentAnswers = await Answer.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('question', 'title');
    
    const recentComments = await Comment.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('question', 'title');
    
    // Get user's top voted questions
    const topQuestions = await Question.find({ author: userId })
      .sort({ 'votes.upvotes': -1 })
      .limit(3)
      .populate('company', 'name');
    
    // Get user's top voted answers
    const topAnswers = await Answer.find({ author: userId })
      .sort({ 'votes.upvotes': -1 })
      .limit(3)
      .populate('question', 'title');

    const dashboardData = {
      stats: {
        questions: questionsCount,
        answers: answersCount,
        comments: commentsCount,
        companies: companiesCount,
        totalVotes: totalQuestionVotes + totalAnswerVotes
      },
      recentActivity: {
        questions: recentQuestions,
        answers: recentAnswers,
        comments: recentComments
      },
      topContent: {
        questions: topQuestions,
        answers: topAnswers
      }
    };

    console.log('Dashboard data prepared:', dashboardData);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add GET /:id route to fetch a user by their ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Promote user to admin (Admin only)
router.put('/:id/promote', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: 'admin' },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add GET /profile route to return current user's profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;