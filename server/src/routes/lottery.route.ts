import express, { Request, Response } from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import { runXPLottery } from '../models/user.model.ts';

const router = express.Router();

/**
 * A POST route to run the XP-based lottery
 * Expects lottery pool amount in request body
 */
router.post('/run', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { lotteryPool } = req.body;
    if (!lotteryPool || lotteryPool <= 0) {
      return res.status(400).json({ message: 'Invalid lottery pool amount' });
    }
    const result = await runXPLottery(lotteryPool);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 