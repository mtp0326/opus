import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { getData } from '../util/api';
import { useTheme } from '../context/ThemeContext';
import Navigation from '../components/Navigation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IUser from '../util/types/user';

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
  }, []);

  // Group users by league
  const leagues = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Wood'];
  const usersByLeague = leagues.map(league => ({
    league,
    users: users
      .filter(user => user.league === league)
      .sort((a, b) => b.points - a.points)
  }));

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#102622' : '#FFFAED' }}>
      <Navigation />
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Feather Bold',
            color: isDarkMode ? '#ffffff' : '#285943',
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
                  color: '#285943',
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
                      backgroundColor: 'white',
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
                        color: '#285943',
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: 'Feather Bold',
                          color: '#4b4b4b',
                          fontSize: '1.1rem',
                        }}
                      >
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'DIN Next Rounded LT W01 Regular',
                          color: '#757575',
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
                          color: '#285943',
                          fontSize: '1.1rem',
                        }}
                      >
                        {user.points} pts
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'Feather Bold',
                          color: '#285943',
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