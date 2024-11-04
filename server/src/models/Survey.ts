import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  surveyUrl: {
    type: String,
    required: true,
  },
  reward: {
    type: Number,
    required: true,
    min: 0,
  },
  respondents: {
    type: Number,
    required: true,
    min: 1,
  },
  timeToComplete: {
    type: Number,
    required: true,
    min: 1,
  },
  expiresIn: {
    type: Number,
    required: true,
    min: 1,
  },
  workerQualifications: {
    type: String,
    enum: ['basic', 'intermediate', 'expert'],
    default: 'basic',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active',
  }
});

export const Survey = mongoose.model('Survey', surveySchema); 