import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Paper, Typography, Box } from '@mui/material';
import { submitSurveyCompletion } from './api';

function SurveyCompletion(): JSX.Element {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [completionCode, setCompletionCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await submitSurveyCompletion({
        surveyId: surveyId!,
        completionCode,
      });
      navigate('/whome'); // Or wherever you want to redirect after successful submission
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to submit completion code',
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Submit Survey Completion
        </Typography>

        <Typography variant="body1" sx={{ mb: 3 }}>
          Please enter the completion code you received at the end of the
          survey.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Completion Code"
            value={completionCode}
            onChange={(e) => setCompletionCode(e.target.value)}
            required
            error={!!error}
            helperText={error}
            sx={{ mb: 2 }}
          />

          <Button type="submit" variant="contained" color="primary" fullWidth>
            Submit Completion Code
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default SurveyCompletion;
