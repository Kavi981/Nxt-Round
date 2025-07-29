import mongoose from 'mongoose';
import Question from '../models/Question.js';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nxt_round';

async function updateCategories() {
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const updates = [
    { old: 'Technical', new: 'Technical HR' },
    { old: 'HR', new: 'General HR' }
  ];
  for (const { old, new: newCat } of updates) {
    const res = await Question.updateMany({ category: old }, { $set: { category: newCat } });
    console.log(`Updated ${res.nModified || res.modifiedCount} questions from '${old}' to '${newCat}'`);
  }
  mongoose.disconnect();
}

updateCategories().catch(err => {
  console.error('Error updating categories:', err);
  process.exit(1);
}); 