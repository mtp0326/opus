import axios from 'axios';

// Base API URL - adjust to your backend endpoint
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const createLinkToken = async (userEmail: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/plaid/create_link_token`,
      {
        user_email: userEmail,
      },
    );
    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token', error);
    throw error;
  }
};

export const exchangePublicToken = async (public_token: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/plaid/exchange_public_token`,
      {
        public_token,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error exchanging public token', error);
    throw error;
  }
};

export const initiateWithdrawal = async (withdrawalData: {
  access_token: string;
  item_id: string;
  amount: number;
  email: string;
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/plaid/withdraw`,
      withdrawalData,
    );
    return response.data;
  } catch (error) {
    console.error('Withdrawal error', error);
    throw error;
  }
};
