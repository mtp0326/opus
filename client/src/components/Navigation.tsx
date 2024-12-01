import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  const clearStorage = () => {
    sessionStorage.removeItem('surveyFormData');
    sessionStorage.removeItem('comingFromPreview');
  };

  const handleNavigate = (path: string) => {
    clearStorage();
    navigate(path);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => handleNavigate('/rhome')}>
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/create-project')}
          >
            Create Project
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/manage-tasks')}
          >
            Manage Tasks
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/leaderboard')}
          >
            Leaderboard
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
