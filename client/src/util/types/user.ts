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
  verificationToken: string | null | undefined;
  resetPasswordToken: string | null | undefined;
  resetPasswordTokenExpiryDate: Date | null | undefined;
  admin: boolean;
  league: string;
  streak: number;
  tickets: number;
  lastSurveyDate: Date | null | undefined;
  userType: 'researcher' | 'worker';
  points: number;
  surveysCompleted: number;
}

export default IUser;
