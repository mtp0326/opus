import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';

export class PaymentController {
  /**
   * Get user's payment history
   */
  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const skip = parseInt(req.query.skip as string) || 0;

      const transactions = await PaymentService.getPaymentHistory(
        userId.toString(),
        limit,
        skip,
      );

      res.json(transactions);
    } catch (error) {
      console.error('Error in getPaymentHistory:', error);
      res.status(500).json({ error: 'Failed to get payment history' });
    }
  }

  /**
   * Get user's current balance
   */
  static async getCurrentBalance(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const balance = await PaymentService.getCurrentBalance(userId.toString());
      res.json({ balance });
    } catch (error) {
      console.error('Error in getCurrentBalance:', error);
      res.status(500).json({ error: 'Failed to get current balance' });
    }
  }

  /**
   * Get user's total earnings within a date range
   */
  static async getTotalEarnings(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const total = await PaymentService.getTotalEarnings(
        userId.toString(),
        new Date(startDate as string),
        new Date(endDate as string),
      );

      res.json({ total });
    } catch (error) {
      console.error('Error in getTotalEarnings:', error);
      res.status(500).json({ error: 'Failed to get total earnings' });
    }
  }

  /**
   * Process a withdrawal request
   */
  static async processWithdrawal(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount, description } = req.body;
      if (!amount || !description) {
        return res.status(400).json({ error: 'Amount and description are required' });
      }

      const success = await PaymentService.processWithdrawal(
        userId.toString(),
        amount,
        description,
      );

      res.json({ success });
    } catch (error) {
      console.error('Error in processWithdrawal:', error);
      if (error instanceof Error && error.message === 'Insufficient balance') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to process withdrawal' });
      }
    }
  }
} 