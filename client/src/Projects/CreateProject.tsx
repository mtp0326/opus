import React from 'react';
import { Typography, Button, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScreenGrid from '../components/ScreenGrid';
import Navigation from '../components/Navigation';

function CreateProject() {
  const navigate = useNavigate();

  return (
<<<<<<< HEAD
    <ScreenGrid>
      <Typography variant="h2" sx={{ mb: 4 }}>
        Create New Project
      </Typography>
      <Stack spacing={3} direction="row" justifyContent="center">
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/survey-link')}
        >
          Survey Link
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/survey-builder')}
        >
          Survey Builder
        </Button>
      </Stack>
    </ScreenGrid>
=======
    <>
      <Navigation />
      <ScreenGrid>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)' // 64px is default MUI AppBar height
        }}>
          <Typography variant="h2" sx={{ mb: 4 }}>Create New Project</Typography>
          <Stack spacing={3} direction="row" justifyContent="center">
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/survey-link')}
            >
              Survey Link
            </Button>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/survey-builder')}
            >
              Survey Builder
            </Button>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/label-data')}
            >
              Label Data
            </Button>
          </Stack>
        </Box>
      </ScreenGrid>
    </>
>>>>>>> origin/main
  );
}

export default CreateProject;
