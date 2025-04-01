import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks';
import { logout as logoutAction, selectUser } from '../util/redux/userSlice';
import { logout as logoutApi } from '../Home/api';

function Navigation() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

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
              fontFamily: 'Feather Bold, sans-serif',
              color: isDarkMode ? '#fff' : '#4b4b4b',
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
            color="inherit"
            onClick={() => handleNavigate('/create-project')}
            sx={{
              fontFamily: 'Feather Bold, sans-serif',
              color: isDarkMode ? '#fff' : '#4b4b4b',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
              },
            }}
          >
            Create Project
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/manage-tasks')}
            sx={{
              fontFamily: 'Feather Bold, sans-serif',
              color: isDarkMode ? '#fff' : '#4b4b4b',
              '&:hover': {
                backgroundColor: isDarkMode
                  ? 'rgba(255, 255, 255, 0.1)'
                  : '#aff8e5',
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
            fontFamily: 'Feather Bold, sans-serif',
            color: isDarkMode ? '#fff' : '#4b4b4b',
            '&:hover': {
              backgroundColor: isDarkMode
                ? 'rgba(255, 255, 255, 0.1)'
                : '#aff8e5',
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
