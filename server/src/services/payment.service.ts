import mongoose from 'mongoose';
import { User, IUser } from '../models/user.model';

// Define an interface for payment transactions
interface IPaymentTransaction {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'survey_completion' | 'lottery_win' | 'biweekly_bonus' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed';
  surveyId?: mongoose.Types.ObjectId;
  timestamp: Date;
  description: string;
}

// Create a schema for payment transactions
const PaymentTransactionSchema = new mongoose.Schema<IPaymentTransaction>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['survey_completion', 'lottery_win', 'biweekly_bonus', 'withdrawal'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  timestamp: { type: Date, default: Date.now },
  description: { type: String, required: true },
});

const PaymentTransaction = mongoose.model<IPaymentTransaction>(
  'PaymentTransaction',
  PaymentTransactionSchema,
);

export class PaymentService {
  /**
   * Record a new payment transaction
   */
  static async recordTransaction(
    userId: string,
    amount: number,
    type: IPaymentTransaction['type'],
    description: string,
    surveyId?: string,
  ): Promise<IPaymentTransaction> {
    const transaction = new PaymentTransaction({
      userId,
      amount,
      type,
      description,
      surveyId: surveyId ? new mongoose.Types.ObjectId(surveyId) : undefined,
    });

    await transaction.save();
    return transaction;
  }

  /**
   * Get payment history for a user
   */
  static async getPaymentHistory(
    userId: string,
    limit = 10,
    skip = 0,
  ): Promise<IPaymentTransaction[]> {
    return PaymentTransaction.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  /**
   * Get total earnings for a user within a date range
   */
  static async getTotalEarnings(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await PaymentTransaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: { $gte: startDate, $lte: endDate },
          type: { $ne: 'withdrawal' },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  /**
   * Process a payout and record the transaction
   */
  static async processPayout(
    userId: string,
    amount: number,
    type: IPaymentTransaction['type'],
    description: string,
    surveyId?: string,
  ): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // Record the transaction
      const transaction = await this.recordTransaction(
        userId,
        amount,
        type,
        description,
        surveyId,
      );

      // Update user's cash balance
      user.cashBalance += amount;
      await user.save({ session });

      // Mark transaction as completed
      transaction.status = 'completed';
      await transaction.save({ session });

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get user's current balance
   */
  static async getCurrentBalance(userId: string): Promise<number> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.cashBalance;
  }

  /**
   * Process a withdrawal and update user's balance
   */
  static async processWithdrawal(
    userId: string,
    amount: number,
    description: string,
  ): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.cashBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Record the withdrawal transaction
      const transaction = await this.recordTransaction(
        userId,
        -amount, // Negative amount for withdrawals
        'withdrawal',
        description,
      );

      // Update user's cash balance
      user.cashBalance -= amount;
      await user.save({ session });

      // Mark transaction as completed
      transaction.status = 'completed';
      await transaction.save({ session });

      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export { PaymentTransaction, IPaymentTransaction }; 