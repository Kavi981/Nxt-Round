import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Comment from '../models/Comment.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { company, category, difficulty, search, sort = 'recent' } = req.query;
    let query = {};
    
    if (company) query.company = company;
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    let sortQuery = {};
    switch (sort) {
      case 'popular':
        sortQuery = { 'votes.upvotes': -1 };
        break;
      case 'recent':
      default:
        sortQuery = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .select('title content tags company category createdAt difficulty votes')
      .populate('company', 'name industry')
      .populate('author', 'name avatar')
      .sort(sortQuery)
      .limit(50);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get top voted questions for home page
router.get('/top-voted', async (req, res) => {
  try {
    const questions = await Question.aggregate([
      {
        $addFields: {
          voteScore: {
            $subtract: [
              { $size: '$votes.upvotes' },
              { $size: '$votes.downvotes' }
            ]
          }
        }
      },
      { $sort: { voteScore: -1, createdAt: -1 } },
      { $limit: 10 }
    ]);

    await Question.populate(questions, [
      { path: 'company', select: 'name industry' },
      { path: 'author', select: 'name avatar' }
    ]);

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('company', 'name industry')
      .populate('author', 'name avatar');
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    const comments = await Comment.find({ question: req.params.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({ question, answers, comments });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Create question
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, company, category, difficulty, tags } = req.body;

    const question = new Question({
      title,
      content,
      company,
      category,
      difficulty,
      tags,
      author: req.user._id
    });

    await question.save();
    await question.populate([
      { path: 'company', select: 'name industry' },
      { path: 'author', select: 'name avatar' }
    ]);

    req.io.emit('question-created', question);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Update question
router.put('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, content, category, difficulty, tags } = req.body;
    
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { title, content, category, difficulty, tags },
      { new: true }
    ).populate([
      { path: 'company', select: 'name industry' },
      { path: 'author', select: 'name avatar' }
    ]);

    req.io.to(`question-${req.params.id}`).emit('question-updated', updatedQuestion);
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Vote on question
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id.toString();
    const upvoteIndex = question.votes.upvotes.findIndex(id => id.toString() === userId);
    const downvoteIndex = question.votes.downvotes.findIndex(id => id.toString() === userId);

    // If user is voting the same way, remove the vote (toggle)
    if (voteType === 'upvote' && upvoteIndex > -1) {
      question.votes.upvotes.splice(upvoteIndex, 1);
    } else if (voteType === 'downvote' && downvoteIndex > -1) {
      question.votes.downvotes.splice(downvoteIndex, 1);
    } else {
      // Remove existing votes first
      if (upvoteIndex > -1) question.votes.upvotes.splice(upvoteIndex, 1);
      if (downvoteIndex > -1) question.votes.downvotes.splice(downvoteIndex, 1);

      // Add new vote
      if (voteType === 'upvote') {
        question.votes.upvotes.push(req.user._id);
      } else if (voteType === 'downvote') {
        question.votes.downvotes.push(req.user._id);
      }
    }

    await question.save();
    await question.populate([
      { path: 'company', select: 'name industry' },
      { path: 'author', select: 'name avatar' }
    ]);

    req.io.to(`question-${req.params.id}`).emit('question-voted', question);
    res.json(question);
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete question
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Question.findByIdAndDelete(req.params.id);
    await Answer.deleteMany({ question: req.params.id });
    await Comment.deleteMany({ question: req.params.id });

    req.io.emit('question-deleted', req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;