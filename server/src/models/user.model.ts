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
    enum: ['Wood', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Wood',
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
  onboarded: {
    type: Boolean,
    default: false,
  },
  userType: {
    type: String,
    enum: ['researcher', 'worker'],
    required: true,
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
  onboarded: boolean;
  userType: 'researcher' | 'worker';
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
  user.points = calculatePoints(
    user.streak,
    user.surveysCompleted,
    completionSpeed,
  );

  // Update league based on points
  if (user.points >= 8001) {
    user.league = 'Diamond';
  } else if (user.points >= 5001) {
    user.league = 'Platinum';
  } else if (user.points >= 3001) {
    user.league = 'Gold';
  } else if (user.points >= 2001) {
    user.league = 'Silver';
  } else if (user.points >= 1001) {
    user.league = 'Bronze';
  } else {
    user.league = 'Wood';
  }

  await user.save();
};

function calculateLotteryRewards(
  totalBudget: number,
  numParticipants: number,
  baseFee: number,
  highestReward: number,
  decayRate: number,
) {
  const lotteryPool = totalBudget - numParticipants * baseFee;
  const biWeeklyJackpot = 0.1 * lotteryPool;
  const adjustedLotteryPool = lotteryPool - biWeeklyJackpot;
  const rewards = [];
  let remainingPool = adjustedLotteryPool;

  for (let i = 0; i < numParticipants; i++) {
    const reward = highestReward * Math.pow(1 - decayRate, i);
    rewards.push(reward);
    remainingPool -= reward;
    if (remainingPool <= 0) break;
  }

  return { rewards, biWeeklyJackpot };
}

function calculateProbabilities(numParticipants: number) {
  return {
    topReward: 1 / (2 * numParticipants),
    midReward: 1 / numParticipants,
    smallReward: 2 / numParticipants,
  };
}

function calculatePoints(
  streak: number,
  surveysCompleted: number,
  completionSpeed: number,
): number {
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

export const generateLeaderboard = async () => {
  const users = await User.find({}).sort({ points: -1 });
  const leaderboard = users.map((user, index) => {
    let leagueMultiplier = 1;

    // Assign multiplier based on league
    switch (user.league) {
      case 'Wood':
        leagueMultiplier = 0.8;
        break;
      case 'Bronze':
        leagueMultiplier = 1;
        break;
      case 'Silver':
        leagueMultiplier = 1.2;
        break;
      case 'Gold':
        leagueMultiplier = 1.5;
        break;
      case 'Platinum':
        leagueMultiplier = 2;
        break;
      case 'Diamond':
        leagueMultiplier = 2.5;
        break;
    }

    // Rank the user with league multipliers taken into account
    return {
      rank: index + 1,
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      points: user.points,
      adjustedPoints: user.points * leagueMultiplier,
      league: user.league,
    };
  });

  return leaderboard;
};

export const distributeLotteryRewards = async (
  totalBudget: number,
  baseFee: number,
  highestReward: number,
  decayRate: number,
) => {
  const users = await User.find({}).sort({ points: -1 });
  const numParticipants = users.length;

  const { rewards, biWeeklyJackpot } = calculateLotteryRewards(
    totalBudget,
    numParticipants,
    baseFee,
    highestReward,
    decayRate,
  );

  for (let i = 0; i < users.length; i++) {
    if (i < rewards.length) {
      users[i].tickets += rewards[i];
      await users[i].save();
    }
  }

  await distributeBiWeeklyJackpot(biWeeklyJackpot);
};

export const distributeBiWeeklyJackpot = async (biWeeklyJackpot: number) => {
  const leagues = ['Wood', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

  for (const league of leagues) {
    const usersInLeague = await User.find({ league });
    if (usersInLeague.length > 0) {
      const randomIndex = Math.floor(Math.random() * usersInLeague.length);
      const winningUser = usersInLeague[randomIndex];
      winningUser.tickets += biWeeklyJackpot / leagues.length;
      await winningUser.save();
    }
  }
};

export const rewardTopPerformers = async () => {
  const leaderboard = await generateLeaderboard();
  leaderboard.forEach(async (user, index) => {
    const additionalTickets = Math.max(0, 10 - index); // Example: reward top users with decreasing tickets based on rank
    const foundUser = await User.findById(user.userId);
    if (foundUser && additionalTickets > 0) {
      foundUser.tickets += additionalTickets;
      await foundUser.save();
    }
  });
};
