import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

answerSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
});

export default mongoose.model('Answer', answerSchema);