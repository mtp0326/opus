import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Stack,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import ScreenGrid from '../components/ScreenGrid';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import Navigation2 from '../components/Navigation2.tsx';
import { putData } from '../util/api.tsx';

function OnboardingPage() {
  const user = useAppSelector(selectUser);
  const navigator = useNavigate();

  // State for selected answers
  const [selectedSurveyTypes, setSelectedSurveyTypes] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleSurveyTypeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedSurveyTypes((prev) => [...prev, value]);
    } else {
      setSelectedSurveyTypes((prev) => prev.filter((type) => type !== value));
    }
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedLanguages((prev) => [...prev, value]);
    } else {
      setSelectedLanguages((prev) =>
        prev.filter((language) => language !== value),
      );
    }
  };

  const handleSubmit = async () => {
    const preferences = {
      surveyTypes: selectedSurveyTypes,
      preferredLanguages: selectedLanguages,
    };

    try {
      const response = await putData(`worker/${user.email}/tags`, {
        preferences,
      });

      if (!response) {
        throw new Error('Failed to submit preferences');
      }

      navigator('/whome', { replace: true });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <>
      <Navigation2 />
      <ScreenGrid>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 'calc(100vh - 64px)',
            padding: 2,
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}
        >
          <Stack spacing={3} direction="column" sx={{ width: '100%' }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
              Onboarding Questions
            </Typography>

            {/* Question 1: Survey Types */}
            <FormControl component="fieldset">
              <FormLabel component="legend">
                What Survey Types are you interested in?
              </FormLabel>
              <Box>
                {[
                  'Finance',
                  'Health',
                  'Education',
                  'Technology',
                  'Travel',
                  'Food',
                  'Sports',
                  'Entertainment',
                  'Science',
                  'Politics',
                  'Environment',
                ].map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={selectedSurveyTypes.includes(type)}
                        onChange={handleSurveyTypeChange}
                        value={type}
                      />
                    }
                    label={type}
                  />
                ))}
              </Box>
            </FormControl>

            {/* Question 2: Preferred Languages */}
            <FormControl component="fieldset">
              <FormLabel component="legend">
                What are your preferred languages?
              </FormLabel>
              <Box>
                {['English', 'Spanish', 'Chinese'].map((language) => (
                  <FormControlLabel
                    key={language}
                    control={
                      <Checkbox
                        checked={selectedLanguages.includes(language)}
                        onChange={handleLanguageChange}
                        value={language}
                      />
                    }
                    label={language}
                  />
                ))}
              </Box>
            </FormControl>

            {/* Submit Button */}
            <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Submit Preferences
              </Button>
            </Box>
          </Stack>
        </Box>
      </ScreenGrid>
    </>
  );
}

export default OnboardingPage;
