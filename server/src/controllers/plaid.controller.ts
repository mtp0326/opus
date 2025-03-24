import { Request, Response } from 'express';
import { PlaidService } from '../services/plaid.service';

export class PlaidController {
  /**
   * Create a link token for initializing Plaid Link
   */
  static async createLinkToken(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const linkToken = await PlaidService.createLinkToken(userId.toString());
      res.json(linkToken);
    } catch (error) {
      console.error('Error in createLinkToken:', error);
      res.status(500).json({ error: 'Failed to create link token' });
    }
  }

  /**
   * Exchange public token for access token and get bank account info
   */
  static async exchangeToken(req: Request, res: Response) {
    try {
      const { publicToken } = req.body;
      if (!publicToken) {
        return res.status(400).json({ error: 'Public token is required' });
      }

      const accessToken = await PlaidService.exchangePublicToken(publicToken);
      const accounts = await PlaidService.getBankAccountInfo(accessToken);

      res.json({ accessToken, accounts });
    } catch (error) {
      console.error('Error in exchangeToken:', error);
      res.status(500).json({ error: 'Failed to exchange token' });
    }
  }

  /**
   * Process a withdrawal to the user's bank account
   */
  static async processWithdrawal(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount, accessToken, accountId } = req.body;
      if (!amount || !accessToken || !accountId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const success = await PlaidService.processWithdrawal(
        userId.toString(),
        amount,
        accessToken,
        accountId,
      );

      res.json({ success });
    } catch (error) {
      console.error('Error in processWithdrawal:', error);
      res.status(500).json({ error: 'Failed to process withdrawal' });
    }
  }
} 