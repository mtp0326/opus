/**
 * A file for defining functions used to interact with the backend server
 * for project and survey-related operations.
 */
import { postData, getData } from '../util/api.tsx';

interface SurveyData {
  title: string;
  description: string;
  surveyUrl: string;
  reward: number;
  respondents: number;
  timeToComplete: number;
  expiresIn: number;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
  status?: 'active' | 'completed' | 'expired' | 'draft';
  instructions: string;
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

/**
 * Fetches all published surveys from the server
 * @returns A promise that resolves to an array of published surveys
 * @throws An {@link Error} with a `message` field describing any issues in fetching
 */
async function getPublishedSurveys(): Promise<SurveyData[]> {
  const res = await getData('surveys/published');
  
  if (res.error) {
    console.error('❌ Failed to fetch surveys:', res.error);
    throw Error(res.error.message);
  }

  console.log('✅ Surveys fetched successfully:', res.data);
  return res.data;
}

async function saveSurvey(formData: SurveyData) {
  console.log('📝 Saving survey:', {
    title: formData.title,
    reward: formData.reward,
    respondents: formData.respondents,
  });

  const res = await postData('surveys/save', {
    ...formData,
    workerQualifications: formData.workerQualifications || 'basic',
    status: 'draft'
  });
  
  if (res.error) {
    console.error('❌ Failed to save survey:', res.error);
    throw Error(res.error.message);
  }

  console.log('✅ Survey saved successfully:', res.data);
  return res.data;
}

export {
  publishSurvey,
  getPublishedSurveys,
  saveSurvey,
  type SurveyData
}; 