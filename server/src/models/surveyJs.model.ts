import mongoose from 'mongoose';

interface ISurveyJs {
  title: string;
  description: string;
  createdBy: string;
  content: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  surveyUrl?: string;
  reward?: number;
  respondents?: number;
  timeToComplete?: number;
  expiresIn?: number;
  workerQualifications?: 'basic' | 'intermediate' | 'expert';
  status: 'active' | 'completed' | 'expired' | 'draft';
}

const surveyJsSchema = new mongoose.Schema<ISurveyJs>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
    default: '',
  },
  createdBy: {
    type: String,
    ref: 'User',
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  surveyUrl: {
    type: String,
  },
  reward: {
    type: Number,
    min: 0,
  },
  respondents: {
    type: Number,
    min: 1,
  },
  timeToComplete: {
    type: Number,
    min: 1,
  },
  expiresIn: {
    type: Number,
    min: 1,
  },
  workerQualifications: {
    type: String,
    enum: ['basic', 'intermediate', 'expert'],
    default: 'basic',
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'draft'],
    default: 'draft',
  },
});

export default mongoose.model('SurveyJs', surveyJsSchema);
