import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import Navigation2 from '../components/Navigation2.tsx';
import { useTheme } from '../context/ThemeContext';

function PointRewards() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const themeColors = {
    background: isDarkMode ? '#141F25' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#141F25',
    primary: '#58CC02',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  if (!user || !user.email) {
    return (
      <Box
        sx={{ margin: 0, padding: 0, backgroundColor: themeColors.background }}
      >
        <Navigation2 />
        <Box
          sx={{
            textAlign: 'center',
            mt: 4,
            fontFamily: 'Feather Bold',
            color: themeColors.text,
          }}
        >
          <h2>Please log in to view account information</h2>
          <button
            type="button"
            onClick={() => navigate('/wlogin')}
            style={{
              fontFamily: 'Feather Bold',
              backgroundColor: themeColors.primary,
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 0 #45a501',
              '&:hover': {
                backgroundColor: '#45a501',
                transform: 'translateY(1px)',
                boxShadow: '0 3px 0 #45a501',
              },
            }}
          >
            Go to Login
          </button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: themeColors.background, minHeight: '100vh' }}>
      <Navigation2 />
      <Box sx={{ padding: 3, color: themeColors.text }}>
        <h1>Point Rewards</h1>
        {user.points !== null ? (
          <p>Your current points: {user.points ?? 0}</p>
        ) : (
          <p>Loading points...</p>
        )}
      </Box>
    </Box>
  );
}

export default PointRewards;
