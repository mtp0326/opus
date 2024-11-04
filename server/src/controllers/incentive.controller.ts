import { User } from '../models/user.model.ts';
import { Request, Response } from 'express';

// Function to update user league based on performance
export const updateLeague = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Example logic for league progression
  if (user.streak >= 30) {
    user.league = 'Platinum';
  } else if (user.streak >= 15) {
    user.league = 'Gold';
  } else if (user.streak >= 7) {
    user.league = 'Silver';
  } else {
    user.league = 'Bronze';
  }

  await user.save();
};

// Function to update streaks and tickets
export const updateStreakAndTickets = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  const today = new Date();
  const lastSurveyDate = user.lastSurveyDate || new Date(0);
  const diffDays = Math.floor((today.getTime() - lastSurveyDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    user.streak += 1;
  } else if (diffDays > 1) {
    user.streak = 1; // Reset streak if a day is missed
  }

  // Allocate tickets based on league
  switch (user.league) {
    case 'Bronze':
      user.tickets += 1;
      break;
    case 'Silver':
      user.tickets += 2;
      break;
    case 'Gold':
      user.tickets += 3;
      break;
    case 'Platinum':
      user.tickets += 5;
      break;
  }

  user.lastSurveyDate = today;
  await user.save();
};

// Example endpoint to simulate survey completion
export const completeSurvey = async (req: Request, res: Response) => {
  const userId = req.body.userId;
  await updateStreakAndTickets(userId);
  await updateLeague(userId);
  res.status(200).send('Survey completed and incentives updated.');
}; 