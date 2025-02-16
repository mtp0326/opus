import React, { useEffect, useState } from 'react';
import { Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';
import Navigation2 from '../components/Navigation2.tsx';
import { IUser } from 'server/src/models/user.model.ts';

function AccountInfoPage() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();

  const handleResetPassword = () => {
    navigate('/email-reset');
  };

  return (
    <ScreenGrid>
      <Navigation2 />
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h2" align="center">
            Account Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Name: {user.firstName} {user.lastName}</Typography>
          <Typography variant="h6">Email: {user.email}</Typography>
          <Typography variant="h6">League: {user.league}</Typography>
          <Typography variant="h6">Points: {user.points}</Typography>
          <Typography variant="h6">Cash Balance: ${user.cashBalance}</Typography>
          <Typography variant="h6">Surveys Completed: {user.surveysCompleted}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
        </Grid>
      </Grid>
    </ScreenGrid>
  );
}

export default AccountInfoPage; 