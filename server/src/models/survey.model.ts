import mongoose, { Types } from 'mongoose';

interface ISurvey {
  title: string;
  description: string;
  surveyUrl: string;
  reward: number;
  respondents: number;
  timeToComplete: number;
  expiresIn: number;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
  status: 'active' | 'completed' | 'expired';
  createdBy: string;
  createdAt: Date;
}

const surveySchema = new mongoose.Schema<ISurvey>({
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
    type: String,
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