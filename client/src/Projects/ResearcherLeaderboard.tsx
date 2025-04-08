import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { getData } from '../util/api';
import { useTheme } from '../context/ThemeContext';
import Navigation from '../components/Navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

const getLeagueColor = (league: string) => {
  switch (league.toLowerCase()) {
    case 'diamond':
      return '#b9f2ff';
    case 'platinum':
      return '#e5e4e2';
    case 'gold':
      return '#ffd700';
    case 'silver':
      return '#c0c0c0';
    case 'bronze':
      return '#cd7f32';
    case 'wood':
      return '#deb887';
    default:
      return '#ffffff';
  }
};

function ResearcherLeaderboard() {
  const [users, setUsers] = useState<IUser[]>([]);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Add font styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    const fetchLeaderboardData = async () => {
      try {
        const response = await getData('leaderboard/');
        if (response.error) {
          console.error('Error fetching leaderboard data:', response.error);
          return;
        }
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Group users by league
  const leagues = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Wood'];
  const usersByLeague = leagues.map(league => ({
    league,
    users: users
      .filter(user => user.league === league)
      .sort((a, b) => b.points - a.points)
  }));

  const themeColors = {
    background: isDarkMode ? '#102622' : '#FFFAED',
    text: isDarkMode ? '#ffffff' : '#141F25',
    primary: '#285943',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: themeColors.background }}>
      <Navigation />
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Feather Bold',
            color: themeColors.text,
            textAlign: 'center',
            mb: 4,
            fontSize: '2.5rem',
          }}
        >
          Researcher Leaderboard
        </Typography>

        {usersByLeague.map((leagueData) => (
          <Accordion
            key={leagueData.league}
            sx={{
              mb: 2,
              backgroundColor: getLeagueColor(leagueData.league),
              '&:before': {
                display: 'none',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: getLeagueColor(leagueData.league),
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                },
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Feather Bold',
                  fontSize: '1.5rem',
                  color: themeColors.primary,
                }}
              >
                {leagueData.league} League ({leagueData.users.length} users)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper
                sx={{
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: isDarkMode ? '#424242' : 'white',
                }}
              >
                {leagueData.users.map((user, index) => (
                  <Box
                    key={user._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem 2rem',
                      borderBottom: '1px solid #E5E5E5',
                      backgroundColor: isDarkMode ? '#424242' : 'white',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Feather Bold',
                        fontSize: '1.2rem',
                        width: '50px',
                        color: themeColors.primary,
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: 'Feather Bold',
                          color: themeColors.text,
                          fontSize: '1.1rem',
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'DIN Next Rounded LT W01 Regular',
                          color: isDarkMode ? '#b0b0b0' : '#757575',
                          fontSize: '0.9rem',
                        }}
                      >
                        {user.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3 }}>
                      <Typography
                        sx={{
                          fontFamily: 'Feather Bold',
                          color: themeColors.primary,
                          fontSize: '1.1rem',
                        }}
                      >
                        {user.points} pts
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'Feather Bold',
                          color: themeColors.primary,
                          fontSize: '1.1rem',
                        }}
                      >
                        ${user.cashBalance?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}

export default ResearcherLeaderboard; 