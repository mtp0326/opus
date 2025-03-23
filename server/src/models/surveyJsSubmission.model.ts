import mongoose from 'mongoose';

interface ISurveyJsSubmission {
  survey: mongoose.Types.ObjectId;
  worker: string;
  responseData: Record<string, any>; // The actual survey responses
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  rank?: number; // Rank based on submission time
  xpEarned?: number; // XP earned from the submission
  attentionCheckScore?: string; // Format: "X/Y" where X is passed checks and Y is total checks
}

const surveyJsSubmissionSchema = new mongoose.Schema<ISurveyJsSubmission>({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
  },
  worker: {
    type: String,
    ref: 'User',
    required: true,
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  rank: {
    type: Number,
  },
  xpEarned: {
    type: Number,
  },
  attentionCheckScore: {
    type: String,
  },
});

// Ensure one submission per worker per survey
surveyJsSubmissionSchema.index({ survey: 1, worker: 1 }, { unique: true });

export default mongoose.model('SurveyJsSubmission', surveyJsSubmissionSchema);
