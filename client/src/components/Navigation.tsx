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
    <AppBar
      position="static"
      sx={{ backgroundColor: '#58CC02', boxShadow: '0 4px 0 #45a501' }}
    >
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/rhome')}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/create-project')}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Create Project
          </Button>
          <Button
            color="inherit"
            onClick={() => handleNavigate('/manage-tasks')}
            sx={{
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            Manage Tasks
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navigation;
