import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { User } from '../models/user.model';

// Initialize Plaid client
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidAccount {
  account_id: string;
  name: string;
  type: string;
  balance: {
    available: number;
    current: number;
    limit?: number;
    iso_currency_code?: string;
    unofficial_currency_code?: string;
  };
}

export class PlaidService {
  /**
   * Create a link token for initializing Plaid Link
   */
  static async createLinkToken(userId: string): Promise<PlaidLinkTokenResponse> {
    try {
      const request = {
        user: { client_user_id: userId },
        client_name: 'Opus',
        products: ['auth'],
        country_codes: ['US'],
        language: 'en',
      };

      const response = await plaidClient.linkTokenCreate(request);
      return response.data;
    } catch (error) {
      console.error('Error creating link token:', error);
      throw new Error('Failed to create link token');
    }
  }

  /**
   * Exchange public token for access token
   */
  static async exchangePublicToken(publicToken: string): Promise<string> {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw new Error('Failed to exchange public token');
    }
  }

  /**
   * Get bank account information
   */
  static async getBankAccountInfo(accessToken: string): Promise<PlaidAccount[]> {
    try {
      const response = await plaidClient.accountsGet({
        access_token: accessToken,
      });
      return response.data.accounts;
    } catch (error) {
      console.error('Error getting bank account info:', error);
      throw new Error('Failed to get bank account information');
    }
  }

  /**
   * Process a withdrawal to the user's bank account
   */
  static async processWithdrawal(
    userId: string,
    amount: number,
    accessToken: string,
    accountId: string,
  ): Promise<boolean> {
    try {
      // Get user and verify sufficient balance
      const user = await User.findById(userId);
      if (!user || user.cashBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // In sandbox mode, we'll simulate the transfer
      // In production, you would use Plaid's transfer API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      // Update user's balance
      user.cashBalance -= amount;
      await user.save();

      return true;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw new Error('Failed to process withdrawal');
    }
  }
} 