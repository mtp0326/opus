import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { getLeaderboard } from './api';
import IUser from '../util/types/user';
import Navigation2 from '../components/Navigation2';
import { useAppSelector } from '../util/redux/hooks';
import { selectUser } from '../util/redux/userSlice';

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

function Leaderboard() {
  const [users, setUsers] = useState<IUser[]>([]);
  const currentUser = useAppSelector(selectUser);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    const fetchLeaderboardData = async () => {
      try {
        const data = await getLeaderboard();
        // Filter users to only show those in the same league as current user
        const sameLeagueUsers = data.filter(
          (user: IUser) => user.league === currentUser.league,
        );
        // Sort by points in descending order
        const sortedUsers = sameLeagueUsers.sort((a, b) => b.points - a.points);
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [currentUser.league]);

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return { color: '#FFD700' }; // Gold
      case 2:
        return { color: '#C0C0C0' }; // Silver
      case 3:
        return { color: '#CD7F32' }; // Bronze
      default:
        return { color: '#4b4b4b' };
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navigation2 />
      <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Feather Bold',
            color: '#58CC02',
            textAlign: 'center',
            mb: 2,
            fontSize: '2.5rem',
          }}
        >
          {currentUser.league} League
        </Typography>

        <Typography
          sx={{
            fontFamily: 'DIN Next Rounded LT W01 Regular',
            color: '#4b4b4b',
            textAlign: 'center',
            mb: 4,
            fontSize: '1.2rem',
          }}
        >
          Compete with others in your league to earn rewards!
        </Typography>

        <Paper
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {users.map((user, index) => (
            <Box
              key={user._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 2rem',
                borderBottom: '1px solid #E5E5E5',
                backgroundColor:
                  user.email === currentUser.email ? '#f0f9f0' : 'white',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.002)',
                  backgroundColor: '#f8f8f8',
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
              }}
            >
              {/* Position Number */}
              <Typography
                sx={{
                  fontFamily: 'Feather Bold',
                  fontSize: '1.5rem',
                  width: '50px',
                  ...getPositionStyle(index + 1),
                }}
              >
                {index + 1}
              </Typography>

              {/* User Info */}
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
              </Box>

              {/* Points */}
              <Typography
                sx={{
                  fontFamily: 'Feather Bold',
                  color: '#58CC02',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {user.points}
                <span style={{ fontSize: '0.9rem', color: '#757575' }}>
                  pts
                </span>
              </Typography>
            </Box>
          ))}
        </Paper>

        {users.length === 0 && (
          <Typography
            sx={{
              fontFamily: 'DIN Next Rounded LT W01 Regular',
              color: '#757575',
              textAlign: 'center',
              mt: 4,
              fontSize: '1.1rem',
            }}
          >
            No users found in your league yet.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default Leaderboard;
