import React from 'react';
import { AppBar, Toolbar, Button, Box, Avatar } from '@mui/material';
import { selectUser } from '../util/redux/userSlice.ts';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../util/redux/hooks.ts';
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
`;

function Navigation2() {
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const clearStorage = () => {
    sessionStorage.removeItem('surveyFormData');
    sessionStorage.removeItem('comingFromPreview');
  };

  const handleNavigate = (path: string) => {
    clearStorage();
    navigate(path);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: isDarkMode ? '#141F25' : '#66c8b9 ',
        text: '#ffffff',
        boxShadow: 'none',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            onClick={() => handleNavigate('/whome')}
            sx={{
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontFamily: 'Feather Bold',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
              },
            }}
          >
            Home
          </Button>
          <Button
            onClick={() => handleNavigate('/wrecommended')}
            sx={{
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontFamily: 'Feather Bold',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
              },
            }}
          >
            Recommended
          </Button>
          <Button
            onClick={() => handleNavigate('/leaderboard')}
            sx={{
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontFamily: 'Feather Bold',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
              },
            }}
          >
            Leagues
          </Button>
          <Button
            onClick={() => handleNavigate('/point-rewards')}
            sx={{
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontFamily: 'Feather Bold',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
              },
            }}
          >
            Point Rewards
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar
            onClick={() => handleNavigate('/account-info')}
            sx={{
              cursor: 'pointer',
              bgcolor: isDarkMode ? '#fff' : '#102622',
              color: isDarkMode ? '#4b4b4b' : '#fff',
            }}
          >
            {user?.firstName ? user.firstName.charAt(0) : 'U'}
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation2;
