import { putData } from '../util/api';

interface PayoutResult {
  // Add appropriate types based on your server response
  success: boolean;
  message?: string;
  // ... other fields
}

const issueSurveyPayout = async (
  surveyId: string,
  payoutType: 'lottery',
): Promise<PayoutResult> => {
  const response = await putData(`surveys/${surveyId}/payout`, {
    type: payoutType,
  });
  return response.data;
};

export default issueSurveyPayout;
