import mongoose from 'mongoose';

interface ISurveyJs {
  title: string;
  createdBy: string;
  content: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  surveyUrl?: string;
  reward?: number;
  respondents?: number;
  timeToComplete?: number;
  expiresIn?: number;
  workerQualifications?: 'basic' | 'intermediate' | 'expert';
  status?: 'active' | 'completed' | 'expired' | 'draft';
  instructions?: string;
}

const surveyJsSchema = new mongoose.Schema<ISurveyJs>({
  title: {
    type: String,
    required: true,
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
  description: {
    type: String,
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
  instructions: {
    type: String,
  },
});

export default mongoose.model('SurveyJs', surveyJsSchema);
