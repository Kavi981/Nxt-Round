import express from 'express';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Question from '../models/Question.js';

const router = express.Router();

// Public stats endpoint
router.get('/', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const companiesCount = await Company.countDocuments();
    const questionsCount = await Question.countDocuments();
    res.json({ users: usersCount, companies: companiesCount, questions: questionsCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 