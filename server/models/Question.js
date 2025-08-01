import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Aptitude', 'Coding', 'Technical MCQs', 'Technical HR', 'General HR', 'Behavioral'],
    default: 'Technical HR'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  tags: [String]
}, {
  timestamps: true
});

questionSchema.virtual('voteScore').get(function() {
  return this.votes.upvotes.length;
});

export default mongoose.model('Question', questionSchema);