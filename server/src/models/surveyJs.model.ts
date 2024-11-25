import mongoose from 'mongoose';

interface ISurveyJs {
  title: string;
  createdBy: string;
  content: Record<string, any>; // The survey JSON schema
  createdAt: Date;
  updatedAt: Date;
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
});

export default mongoose.model('SurveyJs', surveyJsSchema);
