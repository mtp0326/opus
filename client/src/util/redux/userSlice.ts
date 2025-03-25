/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface UserState {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  admin: boolean | null;
  userType: 'researcher' | 'worker' | null;
  league: 'Wood' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | null;
  cashBalance: number;
  points: number;
  surveysCompleted: number;
  verified: boolean;
  onboarded: boolean;
}

interface Payload {
  email: string;
  firstName: string;
  lastName: string;
  admin: boolean;
  userType: 'researcher' | 'worker';
  league: 'Wood' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  cashBalance: number;
  points: number;
  surveysCompleted: number;
  verified: boolean;
  onboarded: boolean;
}

const initialState: UserState = {
  email: null,
  firstName: null,
  lastName: null,
  admin: null,
  userType: null,
  league: 'Wood', // default league
  cashBalance: 0,
  points: 0,
  surveysCompleted: 0,
  verified: false,
  onboarded: false,
};

/**
 * A slice of the redux store that contains the user's information.
 * This slice defines reducers for logging in a user, logging out a user,
 * and toggling admin status.
 */
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<Payload>) => {
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.admin = action.payload.admin;
      state.userType = action.payload.userType;
      state.league = action.payload.league;
      state.cashBalance = action.payload.cashBalance;
      state.points = action.payload.points;
      state.surveysCompleted = action.payload.surveysCompleted;
      state.verified = action.payload.verified;
      state.onboarded = action.payload.onboarded;
    },
    toggleAdmin: (state) => {
      if (state.admin !== null) {
        state.admin = !state.admin;
      }
    },
    logout: (state) => {
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.admin = null;
      state.userType = null;
      state.league = null;
      state.cashBalance = 0;
      state.points = 0;
      state.surveysCompleted = 0;
      state.verified = false;
      state.onboarded = false;
    },
    updateCashBalance: (state, action: PayloadAction<number>) => {
      if (state) {
        // Assuming cashBalance is a property of the user object
        state.cashBalance = (state.cashBalance || 0) + action.payload;
      }
    },
  },
});

export const { login, logout, toggleAdmin, updateCashBalance } =
  userSlice.actions;
export default userSlice.reducer;

/**
 * A selector that returns the user state.
 * @param state The redux store state.
 * @returns The user state.
 */
export const selectUser = (state: RootState) => state.user;
