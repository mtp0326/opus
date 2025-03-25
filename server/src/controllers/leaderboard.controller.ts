import { Request, Response } from 'express';
import { User } from '../models/user.model.ts';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    console.log('TRYING');

    // const users = await User.find().sort({ points: -1 }).limit(10); // Fetch top 10 users
    const users = await User.find().sort({ points: -1 }); // Fetch all users
    res.json(users);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
};
