/**
 * Interface for the user data type return from the backend
 */
interface IUser {
  _id: string;
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
  cashBalance: number;
  streak?: number;
  tickets?: number;
  lastSurveyDate?: Date | null;
  userType: 'researcher' | 'worker';
  points: number;
  surveysCompleted: number;
}

export default IUser;
