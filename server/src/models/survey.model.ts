import mongoose from 'mongoose';

export interface ISurvey extends mongoose.Document {
  title: string;
  survey_id: string;
  description: string;
  surveyUrl: string;
  reward: number;
  remainingBudget: number;
  respondents: number;
  timeToComplete: number;
  expiresIn: number;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
  status: 'active' | 'completed' | 'expired' | 'draft';
  createdBy: string;
  createdAt: Date;
  submitterList: string[];
  instructions: string;
}

const SurveySchema = new mongoose.Schema<ISurvey>({
  title: { type: String, required: true },
  survey_id: { type: String, required: true },
  description: { type: String, required: true },
  surveyUrl: { type: String, required: true },
  reward: { type: Number, required: true, min: 0 },
  // Track the remaining budget. Initially, it is set to the survey's reward.
  remainingBudget: {
    type: Number,
    min: 0,
    default: function () {
      return this.reward;
    },
  },
  respondents: { type: Number, required: true, min: 1 },
  timeToComplete: { type: Number, required: true, min: 1 },
  expiresIn: { type: Number, required: true, min: 1 },
  workerQualifications: {
    type: String,
    enum: ['basic', 'intermediate', 'expert'],
    default: 'basic',
  },
  createdBy: { type: String, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  submitterList: { type: [String], default: [] },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired', 'draft'],
    default: 'active',
  },
  instructions: { type: String, required: true },
});

export default mongoose.model<ISurvey>('Survey', SurveySchema);
