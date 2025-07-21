import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['IT', 'Finance', 'FMCG', 'Healthcare', 'Manufacturing', 'Consulting', 'E-commerce', 'Other']
  },
  description: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Company', companySchema);