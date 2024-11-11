/**
 * A file for defining functions used to interact with the backend server
 * for project and survey-related operations.
 */
import { postData } from '../util/api.tsx';

interface SurveyData {
  title: string;
  description: string;
  surveyUrl: string;
  reward: number;
  respondents: number;
  timeToComplete: number;
  expiresIn: number;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
  status?: 'active' | 'completed' | 'expired';
}

/**
 * Sends a request to the server to publish a survey
 * @param formData The survey data to publish
 * @throws An {@link Error} with a `message` field describing any issues in publishing
 */
async function publishSurvey(formData: SurveyData) {
  console.log('📝 Publishing survey:', {
    title: formData.title,
    reward: formData.reward,
    respondents: formData.respondents,
  });

  const res = await postData('surveys/publish', {
    ...formData,
    workerQualifications: formData.workerQualifications || 'basic',
    status: 'active'
  });
  
  if (res.error) {
    console.error('❌ Failed to publish survey:', res.error);
    throw Error(res.error.message);
  }

  console.log('✅ Survey published successfully:', res.data);
  return res.data;
}

export {
  publishSurvey,
  type SurveyData
}; 