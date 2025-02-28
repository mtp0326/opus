import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
        backgroundColor: isDarkMode ? '#141F25' : '#fff',
        boxShadow: 'none'
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
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
              }
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
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
              }
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
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
              }
            }}
          >
            Leagues
          </Button>
          <Button 
            onClick={() => handleNavigate('/account-info')}
            sx={{ 
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontFamily: 'Feather Bold',
              '&:hover': { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)' 
              }
            }}
          >
            Account Info
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation2;
