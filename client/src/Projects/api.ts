/**
 * A file for defining functions used to interact with the backend server
 * for project and survey-related operations.
 */
import { SurveyCreator } from 'survey-creator-react';
import { postData, getData, putData } from '../util/api.tsx';

interface SurveyData {
  _id: string;
  title: string;
  description: string;
  surveyUrl: string;
  reward: number;
  respondents: number;
  data?: any;
  content?: any;
  timeToComplete: number;
  expiresIn: number;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
  status?: 'active' | 'completed' | 'expired' | 'draft';
  instructions: string;
}

interface SurveyCompletionData {
  surveyId: string;
  completionCode: string;
  isSurveyJs: boolean;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  points: number;
  surveysCompleted: number;
  cashBalance: number;
  league: string;
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
  console.log('📤 Submitting survey completion:', {
    surveyId: data.surveyId,
    hasData: !!data.completionCode,
    isSurveyJs: data.isSurveyJs,
  });

  const payload = data.isSurveyJs
    ? { responseData: JSON.parse(data.completionCode) }
    : { completionCode: data.completionCode };

  console.log('📦 Submission payload:', payload);

  const response = await postData(`surveys/${data.surveyId}/submit`, payload);

  if (response.error) {
    console.error('❌ Failed to submit survey:', response.error);
    throw new Error(
      response.error.message || 'Failed to submit survey completion',
    );
  }

  console.log('✅ Survey submitted successfully:', response.data);
  return response.data;
};

export const handleSurveyJsSave = async (
  creatorRef: React.RefObject<SurveyCreator>,
  showAlert: (message: string, type: 'success' | 'error' | 'info') => void,
) => {
  try {
    if (!creatorRef.current) return;
    const surveyJSON = creatorRef.current.JSON;
    const title = creatorRef.current.survey.title || 'Untitled Survey';
    const description = creatorRef.current.survey.description || '';

    const savedSurveyId = localStorage.getItem('currentSurveyId');

    // Get the respondents from localStorage
    const formData = JSON.parse(localStorage.getItem('surveyFormData') || '{}');

    const saveData = {
      title,
      description,
      content: surveyJSON,
      status: 'draft',
      respondents: formData.respondents || 1, // Default to 1 if not set
    };

    let response;
    if (savedSurveyId) {
      response = await putData(`surveys/js/${savedSurveyId}/edit`, saveData);
    } else {
      response = await postData('surveys/js/save', saveData);
      if (response.data?.data?._id) {
        const surveyId = response.data.data._id.toString();
        localStorage.setItem('currentSurveyId', surveyId);
      }
    }

    if (response.error) {
      throw new Error(response.error.message);
    }

    showAlert('Survey saved successfully!', 'success');
    return response;
  } catch (error) {
    console.error('Failed to save survey:', error);
    showAlert('Failed to save survey', 'error');
    throw error;
  }
};

/**
 * Fetches the leaderboard data from the server
 * @returns A promise that resolves to an array of users
 * @throws An {@link Error} with a `message` field describing any issues in fetching
 */
export const getLeaderboard = async (): Promise<IUser[]> => {
  const response = await getData('leaderboard/');

  if (response.error) {
    console.error('❌ Failed to fetch leaderboard:', response.error);
    throw new Error(response.error.message);
  }

  return response.data; // Ensure this matches the expected data structure
};

export const getSurveyById = async (surveyId: string) => {
  console.log('🔍 Fetching survey:', surveyId);

  const response = await getData(`surveys/js/${surveyId}`);

  if (response.error) {
    console.error('❌ Failed to fetch survey:', response.error);
    throw new Error(response.error.message || 'Failed to fetch survey');
  }

  return response.data;
};

export const handleSurveyJsEdit = async (
  surveyId: string,
  surveyContent: any,
  setupData: {
    reward: number;
    respondents: number;
    timeToComplete: number;
    expiresIn: number;
    workerQualifications: 'basic' | 'intermediate' | 'expert';
  },
) => {
  try {
    console.log('📤 Sending edit request for survey:', surveyId);
    console.log('📦 Update data:', { surveyContent, setupData });

    const response = await putData(`surveys/js/${surveyId}/edit`, {
      title: surveyContent.title || 'Untitled Survey',
      description: surveyContent.description || '',
      content: surveyContent,
      ...setupData,
    });

    if (response.error) {
      console.error('❌ Edit request failed:', response.error);
      throw new Error(response.error.message || 'Failed to edit survey');
    }

    console.log('✅ Survey edited successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Failed to edit survey:', error);
    throw error;
  }
};

/**
 * Fetches a random survey from the server
 * @returns A promise that resolves to a random survey
 * @throws An {@link Error} with a `message` field describing any issues in fetching
 */
export const getRandomSurvey = async (): Promise<SurveyData> => {
  console.log('🎲 Fetching random survey');

  const response = await getData('surveys/random-survey');

  if (response.error) {
    console.error('❌ Failed to fetch random survey:', response.error);
    throw new Error(response.error.message || 'Failed to fetch random survey');
  }

  console.log('✅ Random survey fetched successfully:', response.data);
  return response.data;
};

/**
 * Fetches worker information from the server using the worker's email
 * @param email The email of the worker
 * @returns A promise that resolves to the worker's information
 * @throws An {@link Error} with a `message` field describing any issues in fetching
 */
export const getWorkerByEmail = async (email: string): Promise<IUser> => {
  console.log('🔍 Fetching worker information for email:', email);

  const response = await getData(`worker/${email}`);

  if (response.error) {
    console.error('❌ Failed to fetch worker information:', response.error);
    throw new Error(
      response.error.message || 'Failed to fetch worker information',
    );
  }

  console.log('✅ Worker information fetched successfully:', response.data);
  return response.data; // Return the single user object
};

export const getPointsForNextLeague = (currentPoints: number): number => {
  if (currentPoints < 1000) return 1000 - currentPoints;
  if (currentPoints < 2000) return 2000 - currentPoints;
  if (currentPoints < 3000) return 3000 - currentPoints;
  if (currentPoints < 5000) return 5000 - currentPoints;
  if (currentPoints < 8000) return 8000 - currentPoints;
  return 0; // Already in Diamond league
};

/**
 * Gets the total number of responses for a survey
 * @param surveyId The ID of the survey
 * @returns A promise that resolves to the total number of responses
 */
export const getSurveyResponses = async (surveyId: string): Promise<number> => {
  const response = await getData(`surveys/${surveyId}/responses`);

  if (response.error) {
    console.error('❌ Failed to fetch survey responses:', response.error);
    throw new Error(
      response.error.message || 'Failed to fetch survey responses',
    );
  }

  // The server returns the number directly, not wrapped in a data object
  return response.data;
};

export {
  publishSurvey,
  getPublishedSurveys,
  saveSurvey,
  editSurvey,
  type SurveyData,
};
