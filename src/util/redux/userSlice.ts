interface UserState {
  cashBalance: number;
}

const initialState: UserState = {
  cashBalance: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateCashBalance: (state, action: PayloadAction<number>) => {
      if (state.cashBalance !== undefined) {
        state.cashBalance += action.payload;
      }
    },
  },
});

export const { login, logout, toggleAdmin, updateCashBalance } = userSlice.actions; 