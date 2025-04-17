import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableCell,
  TableRow,
} from '@mui/material';
import { getLeaderboard, getWorkerByEmail } from './api';
import IUser from '../util/types/user';
import Navigation2 from '../components/Navigation2';
import { useAppSelector } from '../util/redux/hooks';
import { selectUser } from '../util/redux/userSlice';
import { useTheme } from '../context/ThemeContext';

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

function getNextLeague(currentLeague: string): string {
  switch (currentLeague.toLowerCase()) {
    case 'wood':
      return 'Bronze';
    case 'bronze':
      return 'Silver';
    case 'silver':
      return 'Gold';
    case 'gold':
      return 'Platinum';
    case 'platinum':
      return 'Diamond';
    default:
      return 'Diamond';
  }
}

function Leaderboard() {
  const [users, setUsers] = useState<IUser[]>([]);
  const user = useAppSelector(selectUser);
  const [userInfo, setUserInfo] = useState<IUser | undefined>(undefined);
  const { isDarkMode } = useTheme();

  const themeColors = {
    background: isDarkMode ? '#102622' : '#FFFAED',
    text: isDarkMode ? '#808080' : '#141F25',
    primary: '#285943',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  useEffect(() => {
    // Add font styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    // Fetch user info from the server
    if (user && user.email) {
      getWorkerByEmail(user.email)
        .then((userData) => {
          console.log('🔍 User info response:', userData);
          if (userData) {
            setUserInfo(userData);
          } else {
            console.error('Invalid user data received:', userData);
          }
        })
        .catch((error) => {
          console.error('Error fetching user info:', error);
        });
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [user]);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    const fetchLeaderboardData = async () => {
      try {
        console.log('🔍 Current userInfo:', userInfo);
        if (!userInfo?.league) {
          console.error('User league not available');
          return;
        }

        console.log('📊 Fetching leaderboard for league:', userInfo.league);
        const data = await getLeaderboard(userInfo.league);
        console.log('📊 Leaderboard data received:', data);

        if (data && Array.isArray(data)) {
          // Sort by points in descending order
          const sortedUsers = data.sort((a, b) => b.points - a.points);
          console.log('📊 Sorted users:', sortedUsers);
          setUsers(sortedUsers);
        } else {
          console.error('Invalid leaderboard data received:', data);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setUsers([]);
      }
    };

    fetchLeaderboardData();

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [userInfo?.league]);

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

  const getCurrentRankDifference = (
    leaderboardUsers: IUser[],
    currentUserEmail: string,
  ): number => {
    const currentUserIndex = leaderboardUsers.findIndex(
      (leaderboardUser) => leaderboardUser.email === currentUserEmail,
    );
    return currentUserIndex >= 0 ? currentUserIndex + 1 : 0;
  };

  const renderUserRow = (leaderboardUser: IUser, index: number) => {
    const isCurrentUser = leaderboardUser.email === userInfo?.email;
    const position = index + 1;
    const positionStyle = getPositionStyle(position);

    return (
      <TableRow
        key={leaderboardUser._id}
        sx={{
          backgroundColor: isCurrentUser ? '#FFFAED' : 'inherit',
          '&:hover': {
            backgroundColor: isCurrentUser ? '#FFF5D6' : '#f5f5f5',
          },
          borderBottom: '1px solid #E5E5E5',
          '&:last-child': {
            borderBottom: 'none',
          },
        }}
      >
        <TableCell
          sx={{
            ...positionStyle,
            fontFamily: 'Feather Bold',
            fontSize: '1.2rem',
            width: '50px',
            padding: '1rem 2rem',
          }}
        >
          {position}
        </TableCell>
        <TableCell sx={{ padding: '1rem 2rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              sx={{
                fontFamily: 'Feather Bold',
                color: themeColors.text,
                fontSize: '1.1rem',
              }}
            >
              {leaderboardUser.firstName} {leaderboardUser.lastName}
            </Typography>
          </Box>
        </TableCell>
        <TableCell
          sx={{
            fontFamily: 'Feather Bold',
            color: themeColors.primary,
            fontSize: '1.1rem',
            padding: '1rem 2rem',
          }}
        >
          {leaderboardUser.points} pts
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: themeColors.background }}>
      <Navigation2 />
      <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Feather Bold',
            color: isDarkMode ? '#ffffff' : '#285943',
            textAlign: 'center',
            mb: 2,
            fontSize: '2.5rem',
          }}
        >
          {userInfo?.league} League
        </Typography>

        <Typography
          sx={{
            fontFamily: 'DIN Next Rounded LT W01 Regular',
            color: isDarkMode ? '#ffffff' : '#4b4b4b',
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
            backgroundColor: isDarkMode ? '#424242' : 'white',
            padding: '1rem',
          }}
        >
          <Table>
            <TableRow
              sx={{
                backgroundColor: isDarkMode ? '#1C2B34' : '#f5f5f5',
                '& th': {
                  padding: '1rem 2rem',
                  borderBottom: '2px solid #E5E5E5',
                },
              }}
            >
              <TableCell
                sx={{ fontFamily: 'Feather Bold', color: themeColors.primary }}
              >
                Rank
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'Feather Bold', color: themeColors.primary }}
              >
                User
              </TableCell>
              <TableCell
                sx={{ fontFamily: 'Feather Bold', color: themeColors.primary }}
              >
                Points
              </TableCell>
            </TableRow>
            {users.map((user, index) => renderUserRow(user, index))}
          </Table>
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
