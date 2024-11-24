import mongoose from 'mongoose';

interface ISurveySubmission {
  survey: mongoose.Types.ObjectId;
  worker: string;
  submissionUrl: string;
  completionCode: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
}

const surveySubmissionSchema = new mongoose.Schema<ISurveySubmission>({
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
  submissionUrl: {
    type: String,
    required: true,
  },
  completionCode: {
    type: String,
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
});

surveySubmissionSchema.index(
  { survey: 1, completionCode: 1 },
  { unique: true },
);

export default mongoose.model('SurveySubmission', surveySubmissionSchema);
