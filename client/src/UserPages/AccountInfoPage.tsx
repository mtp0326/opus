import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Paper,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { usePlaidLink } from 'react-plaid-link';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../util/redux/hooks.ts';
import {
  logout as logoutAction,
  selectUser,
  updateCashBalance,
} from '../util/redux/userSlice.ts';
import Navigation2 from '../components/Navigation2.tsx';
import { useTheme } from '../context/ThemeContext';
import { getWorkerByEmail } from '../Projects/api';
import { logout as logoutApi } from '../Home/api.tsx';
import {
  createLinkToken,
  exchangePublicToken,
  initiateWithdrawal,
} from '../api/plaidApi'; // New Plaid API service
import IUser from '../util/types/user';

// Existing font styles and league color function remain the same
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

const getLeagueColor = (league: string) => {
  switch (league.toLowerCase()) {
    case 'wood':
      return '#8B4513';
    case 'bronze':
      return '#CD7F32';
    case 'silver':
      return '#C0C0C0';
    case 'gold':
      return '#FFD700';
    case 'platinum':
      return '#E5E4E2';
    case 'diamond':
      return '#B9F2FF';
    default:
      return '#000000';
  }
};

function AccountInfoPage() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [userInfo, setUserInfo] = useState<IUser | undefined>(undefined);

  // Plaid withdrawal states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [linkToken, setLinkToken] = useState<string | null>(null);

  const logoutDispatch = () => dispatch(logoutAction());
  const handleLogout = async () => {
    if (await logoutApi()) {
      logoutDispatch();
      navigate('/wlogin', { replace: true });
    }
  };

  // Fetch link token and user info
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    // Fetch user info
    if (user && user.email) {
      getWorkerByEmail(user.email).then((data) => {
        setUserInfo(data[0]);
      });

      // Fetch Plaid link token
      const fetchLinkToken = async () => {
        try {
          const token = await createLinkToken(user.email);
          setLinkToken(token);
        } catch (error) {
          console.error('Failed to create link token', error);
        }
      };
      fetchLinkToken();
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [user]);

  // Plaid Link configuration
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        // Exchange public token for access token
        const { access_token, item_id } = await exchangePublicToken(
          public_token,
        );

        // Initiate withdrawal
        const withdrawalResult = await initiateWithdrawal({
          access_token,
          item_id,
          amount: withdrawAmount,
          email: user?.email || '',
        });

        // Update local cash balance
        if (withdrawalResult.success) {
          dispatch(updateCashBalance(-withdrawAmount));

          // Close modal and reset state
          setIsWithdrawModalOpen(false);
          setWithdrawAmount(0);
        }
      } catch (error) {
        console.error('Withdrawal failed', error);
        // TODO: Add user-friendly error handling
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error('Plaid Link error', err);
      }
    },
  });

  // Update the handleWithdraw function
  const handleWithdraw = () => {
    const cashBalance = userInfo?.cashBalance ?? 0;
    if (withdrawAmount > 0 && withdrawAmount <= cashBalance) {
      // Update cash balance
      dispatch(updateCashBalance(-withdrawAmount));
      // Open Plaid in new tab
      window.open('https://plaid.com/', '_blank');
      // Close modal and reset amount
      setIsWithdrawModalOpen(false);
      setWithdrawAmount(0);
    } else {
      alert('Invalid withdrawal amount');
    }
  };

  const themeColors = {
    background: isDarkMode ? '#102622' : '#FFFAED',
    text: isDarkMode ? '#ffffff' : '#141F25',
    primary: '#285943',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  // Existing StatBox component remains the same
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
          backgroundColor: isDarkMode ? '#1C2B34' : '#fff',
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
            color:
              typeof value === 'string' && label === 'League'
                ? getLeagueColor(value)
                : isDarkMode
                ? '#fff'
                : themeColors.primary,
            fontFamily: 'Feather Bold',
            fontSize: '1.5rem',
          }}
        >
          {value}
        </div>
      </Paper>
    );
  }

  // Not logged in view remains the same
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

  return (
    <Box
      sx={{
        margin: 0,
        padding: 0,
        backgroundColor: themeColors.background,
        minHeight: '100vh',
      }}
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
            color: isDarkMode ? '#ffffff' : themeColors.primary,
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
                  <Grid item container justifyContent="center" sx={{ mt: 2 }}>
                    <Button
                      onClick={handleLogout}
                      style={{
                        fontFamily: 'Feather Bold',
                        backgroundColor: themeColors.primary,
                        color: 'white',
                        padding: '8px 24px',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 0 #45a501',
                        textTransform: 'none',
                      }}
                    >
                      Logout
                    </Button>
                    </Grid><Grid item container justifyContent="center" sx={{ mt: 2 }}>
                    <Button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      disabled={!(userInfo?.cashBalance ?? 0 > 0)}
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
                        textTransform: 'none', // This ensures the text is not in uppercase
                        '&:hover': {
                          backgroundColor: '#45a501',
                          transform: 'translateY(1px)',
                          boxShadow: '0 3px 0 #45a501',
                        },
                      }}
                    >
                      Withdraw Cash
                    </Button>
                  </Grid>
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

        {/* Update the Withdrawal Modal */}
        <Dialog
          open={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
        >
          <DialogTitle>Withdraw Cash Balance</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Available Balance: ${userInfo?.cashBalance ?? 0}
            </Typography>
            <TextField
              label="Withdrawal Amount"
              type="number"
              fullWidth
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              inputProps={{
                max: userInfo?.cashBalance ?? 0,
                min: 0,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsWithdrawModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawAmount <= 0 || withdrawAmount > (userInfo?.cashBalance ?? 0)}
            >
              Confirm Withdrawal
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default AccountInfoPage;
