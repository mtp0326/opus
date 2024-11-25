/**
 * A file for defining functions used to interact with the backend server
 * for project and survey-related operations.
 */
import { postData, getData, putData } from '../util/api.tsx';

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

interface SurveyCompletionData {
  surveyId: string;
  completionCode: string;
}

/**
 * Sends a request to the server to publish a survey
 * @param surveyId The ID of the survey to publish
 * @param formData The survey data to publish
 * @throws An {@link Error} with a `message` field describing any issues in publishing
 */
async function publishSurvey(surveyId: string) {
  console.log('📝 Publishing survey:', surveyId);

  const response = await putData(`surveys/${surveyId}/publish`);

  if (response.error) {
    console.error('❌ Failed to publish survey:', response.error);
    throw Error(response.error.message);
  }

  console.log('✅ Survey published successfully:', response);
  return response.data;
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
    status: 'draft',
  });

  if (res.error) {
    console.error('❌ Failed to save survey:', res.error);
    throw Error(res.error.message);
  }

  console.log('✅ Survey saved successfully:', res.data);
  return res.data;
}

/**
 * Updates an existing survey in the database
 * @param surveyId The ID of the survey to update
 * @param formData The updated survey data
 * @throws An {@link Error} with a `message` field describing any issues in updating
 */
async function editSurvey(surveyId: string, formData: SurveyData) {
  console.log('📝 Editing survey:', {
    id: surveyId,
    formData,
  });

  const response = await putData(`surveys/${surveyId}/edit`, formData);

  if (response.error) {
    console.error('❌ Failed to edit survey:', response.error);
    throw Error(response.error.message);
  }

  console.log('✅ Survey edited successfully:', response);
  return response.data;
}

export const deleteSurvey = async (surveyId: string) => {
  console.log('🗑️ Deleting survey:', surveyId);

  const response = await putData(`surveys/${surveyId}/delete`);

  if (response.error) {
    console.error('❌ Failed to delete survey:', response.error);
    throw Error(response.error.message);
  }

  console.log('✅ Survey deleted successfully');
  return response.data;
};

export const submitSurveyCompletion = async (data: SurveyCompletionData) => {
  const response = await postData(`surveys/${data.surveyId}/submit`, {
    completionCode: data.completionCode,
  });

  if (response.error) {
    console.error('❌ Failed to submit completion code:', response.error);
    throw new Error(
      response.error.message || 'Failed to submit survey completion',
    );
  }

  return response.data;
};

export {
  publishSurvey,
  getPublishedSurveys,
  saveSurvey,
  editSurvey,
  type SurveyData,
};
