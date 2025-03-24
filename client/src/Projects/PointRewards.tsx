import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import Navigation2 from '../components/Navigation2.tsx';
import { getWorkerByEmail } from './api';
import { useTheme } from '../context/ThemeContext';
import IUser from '../util/types/user';

// Add font styles
const fontStyles = `
  @font-face {
    font-family: 'Feather Bold';
    src: url('/fonts/Feather-Bold.woff2') format('woff2'),
         url('/fonts/Feather-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
  }
  @font-face {
    font-family: 'DIN Next Rounded LT W01 Regular';
    src: url('/fonts/DINNextRoundedLTW01-Regular.woff2') format('woff2'),
         url('/fonts/DINNextRoundedLTW01-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;

function PointRewards() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [userInfo, setUserInfo] = useState<IUser | undefined>(undefined);

  const themeColors = {
    background: isDarkMode ? '#102622' : '#FFFAED',
    text: isDarkMode ? '#ffffff' : '#285943',
    primary: '#285943',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  useEffect(() => {
    // Fetch user info from the server
    // Add font styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    if (user && user.email) {
      getWorkerByEmail(user.email).then((data) => {
        setUserInfo(data[0]);
      });
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [user]);

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
      <Box
        sx={{
          padding: 3,
          color: isDarkMode ? '#ffffff' : themeColors.text,
          fontFamily: 'Feather Bold',
        }}
      >
        <h1 style={{ textAlign: 'center' }}>Point Rewards</h1>

        {/* New Box for Point Rewards */}
        <Paper
          sx={{
            p: 4,
            borderRadius: '16px',
            backgroundColor: isDarkMode ? '#141F25' : '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            textAlign: 'center', // Center the text inside the box
            margin: '0 auto', // Center the box itself
            maxWidth: '600px', // Optional: Set a max width for the box
          }}
        >
          {userInfo?.points !== null ? (
            <Typography
              variant="h5"
              sx={{ color: isDarkMode ? '#ffffff' : themeColors.primary }}
            >
              Your current points: {userInfo?.points ?? 0}
            </Typography>
          ) : (
            <Typography variant="h5" sx={{ color: themeColors.primary }}>
              Loading points...
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default PointRewards;
