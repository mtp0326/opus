import React from 'react';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Navigation2() {
  const navigate = useNavigate();

  const clearStorage = () => {
    sessionStorage.removeItem('surveyFormData');
    sessionStorage.removeItem('comingFromPreview');
  };

  const handleNavigate = (path: string) => {
    clearStorage();
    navigate(path);
  };
  // Vikram add leaderboard here
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => handleNavigate('/whome')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => handleNavigate('/whome')}>
            Leaderboard
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation2;
