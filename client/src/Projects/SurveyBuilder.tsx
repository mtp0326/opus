// Uncomment the following line if you are using Next.js:
// 'use client'

import React, { useCallback, useMemo, useState } from 'react';
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import { slk } from 'survey-core';
import { Button, ButtonGroup, Snackbar, Alert } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Navigation from '../components/Navigation';
import styles from './SurveyBuilder.module.css';
import { postData, getData } from '../util/api.tsx';

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true,
  haveCommercialLicense: true,
};

slk('M2ZlMjI3N2UtOTM4ZS00YWM1LTgxNjgtNjlhMjM3MTMzY2JiOzE9MjAyNS0xMS0xNA==');

function SurveyBuilder() {
  const location = useLocation();
  const setupData = location.state?.setupData;
  const creator = useMemo(() => {
    const c = new SurveyCreator(creatorOptions);
    if (setupData?.title) {
      c.survey.title = setupData.title;
      c.survey.description = setupData.description;
    }
    return c;
  }, [setupData]);
  const [notification, setNotification] = useState({
    message: '',
    type: 'info',
  });
  const [showNotification, setShowNotification] = useState(false);

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
  };

  const handleSave = useCallback(async () => {
    try {
      const surveyJSON = creator.JSON;
      const title = creator.survey.title || 'Untitled Survey';

      // Save to backend
      const response = await postData('surveys/js/save', {
        title,
        content: surveyJSON,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      showAlert('Survey saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save survey:', error);
      showAlert('Failed to save survey', 'error');
    }
  }, [creator]);

  const handleLoadSurvey = useCallback(async () => {
    try {
      const response = await getData('surveys/js/load');
      if (response.error) {
        throw new Error(response.error.message);
      }
      creator.JSON = response.data.content;
      showAlert('Survey loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load survey:', error);
      showAlert('Failed to load survey', 'error');
    }
  }, [creator]);

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <ButtonGroup variant="contained" sx={{ mb: 2 }}>
          <Button onClick={handleSave} color="primary">
            Save Survey
          </Button>
          <Button onClick={handleLoadSurvey}>Load Survey</Button>
        </ButtonGroup>
        <SurveyCreatorComponent creator={creator} />
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
