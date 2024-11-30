// Uncomment the following line if you are using Next.js:
// 'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import { slk } from 'survey-core';
import {
  Button,
  ButtonGroup,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import styles from './SurveyBuilder.module.css';
import { postData, getData } from '../util/api.tsx';

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true,
  haveCommercialLicense: true,
  textEditMode: 'text',
  showEmbededSurveyTab: false,
};

slk('M2ZlMjI3N2UtOTM4ZS00YWM1LTgxNjgtNjlhMjM3MTMzY2JiOzE9MjAyNS0xMS0xNA==');

function SurveyBuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const setupData = location.state?.setupData;

  // Create a ref to store the creator instance
  const creatorRef = React.useRef<SurveyCreator | null>(null);

  const creator = useMemo(() => {
    const c = new SurveyCreator(creatorOptions);

    // Load from setupData or localStorage
    const savedSurvey = localStorage.getItem('currentSurvey');
    if (setupData?.title) {
      c.survey.title = setupData.title;
      c.survey.description = setupData.description;
    } else if (savedSurvey) {
      c.JSON = JSON.parse(savedSurvey);
    }

    creatorRef.current = c;

    // Save survey state when it changes
    c.saveSurveyFunc = (saveNo: number, callback: Function) => {
      localStorage.setItem('currentSurvey', JSON.stringify(c.JSON));
      callback(saveNo, true);
    };

    return c;
  }, [setupData]);

  // Clear localStorage when unmounting only if navigating away from survey pages
  useEffect(() => {
    return () => {
      const path = window.location.pathname;
      if (
        !path.includes('survey-builder') &&
        !path.includes('survey-builder-setup')
      ) {
        localStorage.removeItem('currentSurvey');
      }
    };
  }, []);

  const [notification, setNotification] = useState({
    message: '',
    type: 'info',
  });
  const [showNotification, setShowNotification] = useState(false);
  const [surveys, setSurveys] = useState<Array<{ _id: string; title: string }>>(
    [],
  );
  const [selectedSurveyId, setSelectedSurveyId] = useState('');

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
  };

  const handleSave = useCallback(async () => {
    try {
      if (!creatorRef.current) return;
      const surveyJSON = creatorRef.current.JSON;
      const title = creatorRef.current.survey.title || 'Untitled Survey';
      const description = creatorRef.current.survey.description || '';

      // Get the current survey ID from localStorage
      const savedSurvey = localStorage.getItem('currentSurveyId');

      // If we have an existing survey ID, update it; otherwise create new
      const endpoint = savedSurvey
        ? `surveys/js/${savedSurvey}/edit`
        : 'surveys/js/save';

      const response = await postData(endpoint, {
        title,
        description,
        content: surveyJSON,
        status: 'draft',
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Save the survey ID for future updates
      if (!savedSurvey && response.data?._id) {
        localStorage.setItem('currentSurveyId', response.data._id);
      }

      showAlert('Survey saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save survey:', error);
      showAlert('Failed to save survey', 'error');
    }
  }, []);

  // Fetch available draft surveys
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await getData('surveys/js/drafts');
        if (!response.error && response.data) {
          setSurveys(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Failed to fetch surveys:', error);
        showAlert('Failed to fetch surveys', 'error');
      }
    };

    fetchSurveys();
  }, []);

  const handleLoadSurvey = useCallback(async () => {
    if (!selectedSurveyId || !creatorRef.current) {
      showAlert('Please select a survey to load', 'error');
      return;
    }

    try {
      const response = await getData(`surveys/js/${selectedSurveyId}`);
      if (response.error) {
        throw new Error(response.error.message);
      }
      creatorRef.current.JSON = response.data.content;
      showAlert('Survey loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load survey:', error);
      showAlert('Failed to load survey', 'error');
    }
  }, [selectedSurveyId]);

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <SurveyCreatorComponent creator={creator} />
        <ButtonGroup
          variant="contained"
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={handleSave} color="primary">
            Save Survey
          </Button>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="survey-select-label">Select Survey</InputLabel>
            <Select
              labelId="survey-select-label"
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              label="Select Survey"
            >
              {Array.isArray(surveys) &&
                surveys.map((survey) => (
                  <MenuItem key={survey._id} value={survey._id}>
                    {survey.title}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Button onClick={handleLoadSurvey} disabled={!selectedSurveyId}>
            Load Survey
          </Button>
          <Button
            onClick={async () => {
              await handleSave();
              navigate('/survey-builder-setup');
            }}
            color="secondary"
          >
            Publish Setup
          </Button>
        </ButtonGroup>
        <Snackbar
          open={showNotification}
          autoHideDuration={6000}
          onClose={() => setShowNotification(false)}
        >
          <Alert severity={notification.type as 'success' | 'error' | 'info'}>
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
}

export default SurveyBuilder;
