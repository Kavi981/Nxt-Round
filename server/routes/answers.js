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

    const userId = req.user._id.toString();
    const upvoteIndex = answer.votes.upvotes.findIndex(id => id.toString() === userId);
    const downvoteIndex = answer.votes.downvotes.findIndex(id => id.toString() === userId);

    // If user is voting the same way, remove the vote (toggle)
    if (voteType === 'upvote' && upvoteIndex > -1) {
      answer.votes.upvotes.splice(upvoteIndex, 1);
    } else if (voteType === 'downvote' && downvoteIndex > -1) {
      answer.votes.downvotes.splice(downvoteIndex, 1);
    } else {
      // Remove existing votes first
      if (upvoteIndex > -1) answer.votes.upvotes.splice(upvoteIndex, 1);
      if (downvoteIndex > -1) answer.votes.downvotes.splice(downvoteIndex, 1);

      // Add new vote
      if (voteType === 'upvote') {
        answer.votes.upvotes.push(req.user._id);
      } else if (voteType === 'downvote') {
        answer.votes.downvotes.push(req.user._id);
      }
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