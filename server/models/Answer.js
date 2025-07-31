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
    }]
  }
}, {
  timestamps: true
});

// Initialize votes arrays if they don't exist
answerSchema.pre('save', function(next) {
  if (!this.votes) {
    this.votes = { upvotes: [] };
  }
  if (!this.votes.upvotes) {
    this.votes.upvotes = [];
  }
  next();
});

answerSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length;
});

export default mongoose.model('Answer', answerSchema);