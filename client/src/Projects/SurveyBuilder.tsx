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
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { SurveyJSON5, PropertyEditorCreatedEvent } from 'survey-creator-core';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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

  // Get surveyId from localStorage
  const [surveyId, setSurveyId] = useState<string | null>(
    localStorage.getItem('currentSurveyId'),
  );

  const creator = useMemo(() => {
    const c = new SurveyCreator(creatorOptions);

    // Simpler handler for empty text
    c.onPropertyEditorCreated.add((sender, options) => {
      // Type assertion for the specific properties we need
      const contentElement = (options as any)?.propertyEditor
        ?.contentElement as HTMLElement | undefined;

      if (contentElement) {
        contentElement.addEventListener('input', () => {
          if (
            !contentElement.textContent ||
            contentElement.textContent.trim() === ''
          ) {
            contentElement.textContent = ' ';
          }
        });
      }
    });

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
        (!path.includes('survey-builder') &&
          !path.includes('survey-builder-setup')) ||
        path === '/whome' // Add this condition to clear when going to home
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
  const [isGeneratingQC, setIsGeneratingQC] = useState(false);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  const showAlert = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setShowNotification(true);
  };

  const handleSave = useCallback(async () => {
    try {
      const response = await handleSurveyJsSave(creatorRef, showAlert);
      // Update surveyId state if it's a new survey
      if (response?.data?.data?._id) {
        setSurveyId(response.data.data._id);
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  }, []);

  const handleGenerateQC = useCallback(async () => {
    try {
      if (!creatorRef.current?.JSON) {
        showAlert('Please save your survey first', 'error');
        return;
      }

      setIsGeneratingQC(true);
      console.log(
        '📋 Survey JSON being sent:',
        JSON.stringify(creatorRef.current.JSON, null, 2),
      );
      console.log('🟢 Sending request to generate QC questions...');
      const response = await postData('surveys/quality-control', {
        surveyJson: creatorRef.current.JSON,
      });
      console.log('📋 JSON being sent:', creatorRef.current.JSON);

      console.log('🔵 Response from backend:', response.data.data);

      if (response.data) {
        // Update the survey with the new QC questions
        creatorRef.current.JSON = response.data.data;

        // Force the creator to refresh its view
        creatorRef.current.survey.render();
        // Save the updated survey to localStorage
        localStorage.setItem(
          'currentSurvey',
          JSON.stringify(response.data.data),
        );
        showAlert(
          'Quality control questions generated successfully',
          'success',
        );
      } else {
        console.error('🔴 Backend returned no data:', response);
        showAlert('Failed to generate quality control questions', 'error');
      }
    } catch (error) {
      console.error('❌ Generate QC failed:', error);
      showAlert('Failed to generate quality control questions', 'error');
    } finally {
      setIsGeneratingQC(false);
    }
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Check if it's a Word document
      if (!file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
        showAlert('Please upload a Word document (.doc or .docx)', 'error');
        return;
      }

      try {
        setIsProcessingDoc(true);
        const formData = new FormData();
        formData.append('document', file);

        const response = await postData('surveys/process-document', formData);

        if (response.error) {
          throw new Error(response.error.message);
        }

        if (response.data) {
          // Update the survey with the processed questions
          creatorRef.current!.JSON = response.data.data;
          creatorRef.current!.survey.render();
          showAlert('Questions imported successfully', 'success');
        }
      } catch (error) {
        console.error('Failed to process document:', error);
        showAlert('Failed to process document', 'error');
      } finally {
        setIsProcessingDoc(false);
        // Reset the file input using a new FileList
        const newInput = event.target.cloneNode(true) as HTMLInputElement;
        event.target.parentNode?.replaceChild(newInput, event.target);
      }
    },
    [],
  );

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
        <div style={{ padding: '8px 0', marginTop: '16px' }}>
          <ButtonGroup
            variant="contained"
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              '& .MuiButton-root': {
                backgroundColor: '#58CC02',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '12px !important',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 0 #45a501',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#45a501',
                  transform: 'translateY(1px)',
                  boxShadow: '0 3px 0 #45a501',
                },
                '&:not(:last-child)': {
                  borderRight: 'none',
                },
              },
            }}
          >
            <input
              type="file"
              accept=".doc,.docx"
              style={{ display: 'none' }}
              id="upload-document"
              onChange={handleFileUpload}
              disabled={isProcessingDoc}
            />
            <label htmlFor="upload-document">
              <Tooltip title="Upload Word document with questions">
                <Button
                  component="span"
                  disabled={isProcessingDoc}
                  startIcon={
                    isProcessingDoc ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <UploadFileIcon />
                    )
                  }
                >
                  {isProcessingDoc ? 'Processing...' : 'Import Questions'}
                </Button>
              </Tooltip>
            </label>
            <Button
              onClick={handleGenerateQC}
              disabled={isGeneratingQC}
              startIcon={
                isGeneratingQC ? (
                  <CircularProgress size={20} color="inherit" />
                ) : null
              }
            >
              {isGeneratingQC ? 'Generating...' : 'Generate QC Questions'}
            </Button>
            <Button onClick={handleSave}>Save Survey</Button>
            <Button
              onClick={async () => {
                await handleSave();
                navigate('/survey-builder-setup');
              }}
              sx={{
                backgroundColor: '#1cb0f6 !important',
                boxShadow: '0 4px 0 #1899d6 !important',
                '&:hover': {
                  backgroundColor: '#1899d6 !important',
                  transform: 'translateY(1px)',
                  boxShadow: '0 3px 0 #1899d6 !important',
                },
              }}
            >
              Publish Setup
            </Button>
          </ButtonGroup>
        </div>
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
