import React from 'react';
import { Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScreenGrid from '../components/ScreenGrid';

function CreateProject() {
  const navigate = useNavigate();

  return (
    <ScreenGrid>
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
    </ScreenGrid>
  );
}

export default CreateProject; 