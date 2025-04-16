import { Request, Response } from 'express';
import { generateLeaderboard, IUser } from '../models/user.model.ts';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    console.log('Fetching leaderboard data');
    const { league } = req.query;

    // Validate league parameter if provided
    const validLeagues = [
      'Wood',
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Diamond',
    ] as const;
    if (
      league &&
      !validLeagues.includes(league as (typeof validLeagues)[number])
    ) {
      return res.status(400).json({ error: 'Invalid league specified' });
    }

    // If league is provided, filter by league, otherwise get all users
    const users = await generateLeaderboard(league as IUser['league']);

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
};
