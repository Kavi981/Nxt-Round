import express from 'express';
import Comment from '../models/Comment.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create comment
router.post('/', auth, async (req, res) => {
  try {
    const { content, question, parentComment } = req.body;

    const comment = new Comment({
      content,
      question,
      parentComment,
      author: req.user._id
    });

    await comment.save();
    await comment.populate('author', 'name avatar');

    req.io.to(`question-${question}`).emit('comment-created', comment);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update comment
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content } = req.body;
    
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    ).populate('author', 'name avatar');

    req.io.to(`question-${comment.question}`).emit('comment-updated', updatedComment);
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    req.io.to(`question-${comment.question}`).emit('comment-deleted', req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;