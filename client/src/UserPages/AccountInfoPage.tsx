import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import Navigation2 from '../components/Navigation2.tsx';
import { useTheme } from '../context/ThemeContext';
import { getWorkerByEmail } from '../Projects/api';
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

function AccountInfoPage() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [userInfo, setUserInfo] = useState<IUser | undefined>(undefined);

  useEffect(() => {
    // Add font styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    // Fetch user info from the server
    if (user && user.email) {
      getWorkerByEmail(user.email).then((data) => {
        setUserInfo(data[0]);
      });
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [user]);

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

  function StatBox({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '12px',
          border: '3px solid #E5E5E5',
          textAlign: 'center',
          transition: 'transform 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <div
          style={{
            color: themeColors.text,
            fontFamily: 'DIN Next Rounded LT W01 Regular',
            marginBottom: '8px',
            fontSize: '1rem',
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: themeColors.primary,
            fontFamily: 'Feather Bold',
            fontSize: '1.5rem',
          }}
        >
          {value}
        </div>
      </Paper>
    );
  }

  return (
    <Box
      sx={{ margin: 0, padding: 0, backgroundColor: themeColors.background }}
    >
      <Navigation2 />
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleDarkMode}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: themeColors.primary,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: themeColors.primary,
                  },
                }}
              />
            }
            label="Dark Mode"
            sx={{ color: themeColors.text }}
          />
        </Box>

        <h1
          style={{
            fontFamily: 'Feather Bold',
            color: themeColors.primary,
            textAlign: 'center',
            marginBottom: '2rem',
            fontSize: '2.5rem',
          }}
        >
          Account Information
        </h1>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 4,
                borderRadius: '16px',
                backgroundColor: isDarkMode ? '#141F25' : '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <h2
                      style={{
                        fontFamily: 'Feather Bold',
                        color: themeColors.text,
                        marginBottom: '1rem',
                      }}
                    >
                      Profile Details
                    </h2>
                    <div
                      style={{
                        fontFamily: 'DIN Next Rounded LT W01 Regular',
                        fontSize: '1.1rem',
                        color: themeColors.text,
                        lineHeight: '1.8',
                      }}
                    >
                      <div>
                        Name: {user?.firstName || 'N/A'}{' '}
                        {user?.lastName || 'N/A'}
                      </div>
                      <div>Email: {user?.email || 'N/A'}</div>
                    </div>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <button
                    onClick={() => navigate('/email-reset')}
                    style={{
                      fontFamily: 'Feather Bold',
                      backgroundColor: themeColors.primary,
                      color: 'white',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 0 #45a501',
                      '&:hover': {
                        backgroundColor: '#45a501',
                        transform: 'translateY(1px)',
                        boxShadow: '0 3px 0 #45a501',
                      },
                    }}
                  >
                    Change Password
                  </button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox label="League" value={userInfo?.league || 'Wood'} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox label="Points" value={userInfo?.points ?? 0} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox
                  label="Cash Balance"
                  value={`$${userInfo?.cashBalance ?? 0}`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatBox
                  label="Surveys Completed"
                  value={userInfo?.surveysCompleted ?? 0}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AccountInfoPage;
