import React, { useEffect } from 'react';
import { Typography, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import Navigation2 from '../components/Navigation2.tsx';

function AccountInfoPage() {
  useEffect(() => {
    console.log('=== AccountInfoPage Mount ===');
  }, []);

  console.log('Redux hooks imported:', { useAppSelector, selectUser });

  const user = useAppSelector((state) => {
    console.log('Redux state:', state);
    return selectUser(state);
  });

  console.log('User from Redux:', user);

  const navigate = useNavigate();
  
  if (!user || !user.email) {
    console.log('No user data found or user not logged in');
    return (
      <div style={{ margin: 0, padding: 0 }}>
        <Navigation2 />
        <Typography variant="h6" align="center">
          Please log in to view account information
        </Typography>
        <Button onClick={() => navigate('/wlogin')}>Go to Login</Button>
      </div>
    );
  }

  const handleResetPassword = () => {
    navigate('/email-reset');
  };

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <Navigation2 />
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h2" align="center">
            Account Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">
            Name: {user.firstName || 'N/A'} {user.lastName || 'N/A'}
          </Typography>
          <Typography variant="h6">Email: {user.email || 'N/A'}</Typography>
          <Typography variant="h6">League: {user.league || 'N/A'}</Typography>
          <Typography variant="h6">Points: {user.points ?? 0}</Typography>
          <Typography variant="h6">
            Cash Balance: ${user.cashBalance ?? 0}
          </Typography>
          <Typography variant="h6">
            Surveys Completed: {user.surveysCompleted ?? 0}
          </Typography>
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
    </div>
  );
}

export default AccountInfoPage;
