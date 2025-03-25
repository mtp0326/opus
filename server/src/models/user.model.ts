import mongoose from 'mongoose';

// -----------------------------
// User Schema & Interface
// -----------------------------
export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  verified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiryDate?: Date;
  admin: boolean;
  league: 'Wood' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  cashBalance: number; // New: user's total cash/account value
  onboarded: boolean;
  userType: 'researcher' | 'worker';
  points: number;
  surveysCompleted: number;
}

const UserSchema = new mongoose.Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    // Simple email regex
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true },
  verified: { type: Boolean, required: true, default: false },
  verificationToken: { type: String, unique: true, sparse: true },
  resetPasswordToken: { type: String, unique: true, sparse: true },
  resetPasswordTokenExpiryDate: Date,
  admin: { type: Boolean, required: true, default: false },
  league: {
    type: String,
    enum: ['Wood', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Wood',
  },
  cashBalance: { type: Number, default: 0 },
  onboarded: { type: Boolean, default: false },
  userType: { type: String, enum: ['researcher', 'worker'], required: true },
  points: { type: Number, default: 0 },
  surveysCompleted: { type: Number, default: 0 },
});

const User = mongoose.model<IUser>('User', UserSchema);

// -----------------------------
// Constants & Helper Functions
// -----------------------------
const BASE_POINTS = 10; // Starting points for survey completion.
const SURVEY_BONUS = 5; // Additional points per survey.
const BASE_FEE = 10; // Base fee (cash payout) upon survey completion.

// Bonus based on how fast the survey is completed (in minutes).
const getSpeedBonus = (completionSpeed: number): number => {
  return Math.max(0, 10 - completionSpeed);
};

// Calculate new points when a survey is completed.
export const calculatePoints = (
  surveysCompleted: number,
  completionSpeed: number,
): number => {
  return (
    BASE_POINTS +
    surveysCompleted * SURVEY_BONUS +
    getSpeedBonus(completionSpeed)
  );
};

// Update the user's league based on points.
export const updateLeague = async (user: IUser) => {
  if (user.points >= 8000) user.league = 'Diamond';
  else if (user.points >= 5000) user.league = 'Platinum';
  else if (user.points >= 3000) user.league = 'Gold';
  else if (user.points >= 2000) user.league = 'Silver';
  else if (user.points >= 1000) user.league = 'Bronze';
  else user.league = 'Wood';
  await user.save();
};

// -----------------------------
// Payout Functions
// -----------------------------

/**
 * Award the base fee to a user upon survey completion.
 * The payout comes from the survey's remainingBudget.
 */
export const awardBaseFee = async (user: IUser, survey: any) => {
  const payout = Math.min(BASE_FEE, survey.remainingBudget);
  if (payout > 0) {
    user.cashBalance += payout;
    survey.remainingBudget -= payout;
  }
  await user.save();
  await survey.save();
};

/**
 * Distribute lottery payouts for a specific survey.
 * This bonus payout is awarded from the survey's remainingBudget to its participants.
 */
export const distributeSurveyLottery = async (
  surveyId: string,
  highestReward: number,
) => {
  const Survey = (await import('./survey.model')).default;
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new Error('Survey not found');

  const participantIds = survey.submitterList;
  if (!participantIds.length) return;

  const users = await User.find({ _id: { $in: participantIds } });
  const numParticipants = users.length;

  // Define probability tiers.
  const topProb = Math.min(0.05, 1 / (2 * numParticipants));
  const midProb = Math.min(0.1, 1 / numParticipants);
  const smallProb = Math.min(0.2, 2 / numParticipants);

  for (const user of users) {
    const roll = Math.random();
    let bonus = 0;
    if (roll < topProb) bonus = highestReward;
    else if (roll < topProb + midProb) bonus = highestReward / 2;
    else if (roll < topProb + midProb + smallProb) bonus = highestReward / 5;

    // Ensure payout does not exceed the survey's remaining budget.
    bonus = Math.min(bonus, survey.remainingBudget);
    if (bonus > 0) {
      user.cashBalance += bonus;
      survey.remainingBudget -= bonus;
      await user.save();
    }
    if (survey.remainingBudget <= 0) break;
  }
  await survey.save();
};

/**
 * BiWeekly Payout:
 *
 * For each survey created in the past two weeks, reserve 2.5% of its reward (or what remains
 * in its budget) for the biWeekly pool. Then distribute this pool across all users in proportion
 * to their points (i.e. the user with the highest points receives the largest share).
 */
export const distributeBiWeeklyPayout = async () => {
  const Survey = (await import('./survey.model')).default;
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  // Find surveys created in the past two weeks.
  const surveys = await Survey.find({ createdAt: { $gte: twoWeeksAgo } });
  let biWeeklyPool = 0;

  // For each survey, reserve 2.5% of its reward (or up to its remainingBudget).
  for (const survey of surveys) {
    const contribution = Math.min(
      0.025 * survey.reward,
      survey.remainingBudget,
    );
    biWeeklyPool += contribution;
    survey.remainingBudget -= contribution;
    await survey.save();
  }

  if (biWeeklyPool <= 0) return; // Nothing to distribute.

  // Get all users and calculate the sum of their points.
  const users = await User.find({});
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  if (totalPoints <= 0) return; // Prevent division by zero.

  // Distribute the biWeekly pool proportionally to each user's points.
  for (const user of users) {
    const bonus = (user.points / totalPoints) * biWeeklyPool;
    user.cashBalance += bonus;
    await user.save();
  }
};

/**
 * Leaderboard generator.
 * Optionally filter by league. Returns ranking, points, cashBalance, etc.
 */
export const generateLeaderboard = async (league?: IUser['league']) => {
  const filter = league ? { league } : {};
  const users = await User.find(filter).sort({ points: -1 });
  return users.map((user, idx) => ({
    rank: idx + 1,
    userId: user._id,
    name: `${user.firstName} ${user.lastName}`,
    points: user.points,
    cashBalance: user.cashBalance,
    league: user.league,
  }));
};

/**
 * Handle survey completion.
 * Updates user's stats and awards the base fee (from the survey's budget),
 * while adding the user to the survey's participant list.
 */
export const onSurveyCompletion = async (
  userId: string,
  surveyId: string,
  completionSpeed: number, // in minutes
) => {
  const Survey = (await import('./survey.model')).default;
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  console.log('🔍 User!!!!!!:', user);

  const survey = await Survey.findById(surveyId);
  if (!survey) throw new Error('Survey not found');

  // Add user to the survey's submitterList if not already present.
  if (!survey.submitterList.includes(userId)) {
    survey.submitterList.push(userId);
  }

  user.surveysCompleted += 1;
  user.points = calculatePoints(user.surveysCompleted, completionSpeed);
  await updateLeague(user);

  // Award the base fee (subject to survey remainingBudget).
  await awardBaseFee(user, survey);
};

/**
 * Run a lottery with XP-based weighted probabilities and geometric distribution of prizes.
 * @param lotteryPool - The total amount of money to distribute in the lottery
 * @returns The winner's information and their prize amount
 */
export const runXPLottery = async (lotteryPool: number) => {
  // Get all users with non-zero XP
  const users = await User.find({ points: { $gt: 0 } });
  if (users.length === 0) {
    throw new Error('No eligible users found for lottery');
  }

  // Calculate total XP and weights
  const totalXP = users.reduce((sum: number, user: IUser) => sum + user.points, 0);
  const weights = users.map((user: IUser) => user.points / totalXP);

  // Select winner using weighted random selection
  const random = Math.random();
  let cumulativeWeight = 0;
  let winnerIndex = 0;
  
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      winnerIndex = i;
      break;
    }
  }

  const winner = users[winnerIndex];

  // Calculate geometric distribution of prizes
  const numPrizes = Math.min(5, users.length); // Award up to 5 prizes
  const geometricRatio = 0.5; // Each subsequent prize is half of the previous
  const prizes: { userId: string; amount: number }[] = [];

  let remainingPool = lotteryPool;
  let currentPrize = lotteryPool * (1 - geometricRatio); // First prize is 50% of pool

  for (let i = 0; i < numPrizes; i++) {
    if (remainingPool <= 0) break;
    
    const prize = Math.min(currentPrize, remainingPool);
    prizes.push({
      userId: users[i]._id.toString(),
      amount: prize
    });
    
    remainingPool -= prize;
    currentPrize *= geometricRatio;
  }

  // Update winners' bank balances
  for (const prize of prizes) {
    const user = await User.findById(prize.userId);
    if (user) {
      user.cashBalance += prize.amount;
      await (user as mongoose.Document).save();
    }
  }

  return {
    mainWinner: {
      userId: winner._id.toString(),
      name: `${winner.firstName} ${winner.lastName}`,
      xp: winner.points,
      prize: prizes[0].amount
    },
    allPrizes: prizes
  };
};

export { User };
