import express from 'express';
import Answer from '../models/Answer.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create answer
router.post('/', auth, async (req, res) => {
  try {
    const { content, question } = req.body;

    const answer = new Answer({
      content,
      question,
      author: req.user._id
    });

    await answer.save();
    await answer.populate('author', 'name avatar');

    req.io.to(`question-${question}`).emit('answer-created', answer);
    res.status(201).json(answer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on answer
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body;
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Ensure votes object exists
    if (!answer.votes) {
      answer.votes = { upvotes: [], downvotes: [] };
    }
    if (!answer.votes.upvotes) {
      answer.votes.upvotes = [];
    }
    if (!answer.votes.downvotes) {
      answer.votes.downvotes = [];
    }

    const userId = req.user._id;
    const upvoteIndex = answer.votes.upvotes.findIndex(id => id.toString() === userId.toString());

    // If user is voting the same way, remove the vote (toggle)
    if (voteType === 'upvote' && upvoteIndex > -1) {
      answer.votes.upvotes.splice(upvoteIndex, 1);
    } else if (voteType === 'upvote' && upvoteIndex === -1) {
      // Add new vote only if user hasn't voted before
      answer.votes.upvotes.push(req.user._id);
    }

    await answer.save();
    await answer.populate('author', 'name avatar');

    req.io.to(`question-${answer.question}`).emit('answer-voted', answer);
    res.json(answer);
  } catch (error) {
    console.error('Answer vote error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update answer
router.put('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content } = req.body;
    
    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    ).populate('author', 'name avatar');

    req.io.to(`question-${answer.question}`).emit('answer-updated', updatedAnswer);
    res.json(updatedAnswer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete answer
router.delete('/:id', auth, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Answer.findByIdAndDelete(req.params.id);

    req.io.to(`question-${answer.question}`).emit('answer-deleted', req.params.id);
    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;