// Uncomment the following line if you are using Next.js:
// 'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
// import noUiSlider from 'nouislider';
// import 'nouislider/dist/nouislider.css';
// import * as widgets from 'surveyjs-widgets';
import * as SurveyCore from 'survey-core';

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
import { postData, getData, putData } from '../util/api.tsx';
import { handleSurveyJsSave } from './api';

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
    c.saveSurveyFunc = (
      saveNo: number,
      callback: (saveNo: number, success: boolean) => void,
    ) => {
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
        localStorage.removeItem('currentSurveyId');
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

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
  };

  const handleSave = useCallback(async () => {
    try {
      await handleSurveyJsSave(creatorRef, showAlert);
    } catch (error) {
      console.error('Save failed:', error);
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
