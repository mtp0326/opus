import express from 'express';
import { User } from '../models/user.model.ts';

const router = express.Router();

router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ points: -1 }).limit(10); // Example: top 10 users
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

export default router; 