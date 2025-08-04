import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';

dotenv.config();

const fixVoteData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix questions with missing votes object
    const questionsToUpdate = await Question.find({
      $or: [
        { votes: { $exists: false } },
        { 'votes.upvotes': { $exists: false } }
      ]
    });

    console.log(`Found ${questionsToUpdate.length} questions with missing vote data`);

    for (const question of questionsToUpdate) {
      if (!question.votes) {
        question.votes = { upvotes: [] };
      }
      if (!question.votes.upvotes) {
        question.votes.upvotes = [];
      }
      await question.save();
    }

    // Fix answers with missing votes object
    const answersToUpdate = await Answer.find({
      $or: [
        { votes: { $exists: false } },
        { 'votes.upvotes': { $exists: false } }
      ]
    });

    console.log(`Found ${answersToUpdate.length} answers with missing vote data`);

    for (const answer of answersToUpdate) {
      if (!answer.votes) {
        answer.votes = { upvotes: [] };
      }
      if (!answer.votes.upvotes) {
        answer.votes.upvotes = [];
      }
      await answer.save();
    }

    console.log('Vote data fix completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing vote data:', error);
    process.exit(1);
  }
};

fixVoteData(); 