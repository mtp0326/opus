/**
 * Defines the User model for the database and also the interface to
 * access the model in TypeScript.
 */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    match:
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  verificationToken: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  resetPasswordToken: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  resetPasswordTokenExpiryDate: {
    type: Date,
    required: false,
  },
  admin: {
    type: Boolean,
    required: true,
    default: false,
  },
  league: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze',
  },
  streak: {
    type: Number,
    default: 0,
  },
  tickets: {
    type: Number,
    default: 0,
  },
  lastSurveyDate: {
    type: Date,
    default: null,
  },
  points: {
    type: Number,
    default: 0,
  },
  surveysCompleted: {
    type: Number,
    default: 0,
  },
});

interface IUser extends mongoose.Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken: string | null | undefined;
  resetPasswordToken: string | null | undefined;
  resetPasswordTokenExpiryDate: Date | null | undefined;
  admin: boolean;
  league: string;
  streak: number;
  tickets: number;
  lastSurveyDate: Date | null | undefined;
  points: number;
  surveysCompleted: number;
}

const User = mongoose.model<IUser>('User', UserSchema);

export { IUser, User };

export const updateLeague = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Calculate points
  const completionSpeed = 5; // Example: calculate this based on actual data
  user.points = calculatePoints(user.streak, user.surveysCompleted, completionSpeed);

  // Update league based on points
  if (user.points >= 100) {
    user.league = 'Platinum';
  } else if (user.points >= 50) {
    user.league = 'Gold';
  } else if (user.points >= 20) {
    user.league = 'Silver';
  } else {
    user.league = 'Bronze';
  }

  await user.save();
};

function calculateLotteryRewards(totalBudget: number, numParticipants: number, baseFee: number, highestReward: number, decayRate: number) {
  const lotteryPool = totalBudget - (numParticipants * baseFee);
  const rewards = [];
  let remainingPool = lotteryPool;

  for (let i = 0; i < numParticipants; i++) {
    const reward = highestReward * Math.pow(1 - decayRate, i);
    rewards.push(reward);
    remainingPool -= reward;
    if (remainingPool <= 0) break;
  }

  return rewards;
}

function calculateProbabilities(numParticipants: number) {
  return {
    topReward: 1 / (2 * numParticipants),
    midReward: 1 / numParticipants,
    smallReward: 2 / numParticipants,
  };
}

function calculatePoints(streak: number, surveysCompleted: number, completionSpeed: number): number {
  const basePoints = 10;
  const streakBonus = streak * 2; // Example: 2 points per day of streak
  const surveyBonus = surveysCompleted * 5; // Example: 5 points per survey completed
  const speedBonus = Math.max(0, 10 - completionSpeed); // Example: faster completion gets more points

  return basePoints + streakBonus + surveyBonus + speedBonus;
}

function applyBoosters(userId: string, boosterType: string) {
  // Logic to apply boosters to a user's account
  // This could involve increasing points or chances to win
}
