import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks';
import { logout as logoutAction, selectUser } from '../util/redux/userSlice';
import { logout as logoutApi } from '../Home/api';

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

function Navigation() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

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

  const handleLogout = async () => {
    if (await logoutApi()) {
      dispatch(logoutAction());
      navigate('/rlogin', { replace: true });
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: isDarkMode ? '#141F25' : '#66c8b9',
        boxShadow: '0 4px 0 #45a501',
      }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/rhome')}
            sx={{
              fontFamily: 'Feather Bold',
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease',
              },
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/create-project')}
            sx={{
              fontFamily: 'Feather Bold',
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease',
              },
            }}
          >
            Create Project
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/manage-tasks')}
            sx={{
              fontFamily: 'Feather Bold',
              color: isDarkMode ? '#fff' : '#4b4b4b',
              fontSize: '1.1rem',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
                transform: 'translateY(-2px)',
                transition: 'transform 0.2s ease',
              },
            }}
          >
            Manage Tasks
          </Button>
        </Box>
        <Button
          color="inherit"
          onClick={handleLogout}
          sx={{
            fontFamily: 'Feather Bold',
            color: isDarkMode ? '#fff' : '#4b4b4b',
            fontSize: '1.1rem',
            '&:hover': {
              backgroundColor: isDarkMode
                ? 'rgba(255, 255, 255, 0.1)'
                : '#aff8e5',
              transform: 'translateY(-2px)',
              transition: 'transform 0.2s ease',
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
