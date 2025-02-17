import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
import { Box, LinearProgress, Typography } from '@mui/material';
import styles from '../Projects/SurveyPreview.module.css';
import { getSurveyById, submitSurveyCompletion } from '../Projects/api';

// Add font styles
const fontStyles = `
  @font-face {
    font-family: 'Feather Bold';
    src: url('/fonts/Feather-Bold.woff2') format('woff2'),
         url('/fonts/Feather-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
  }
  @font-face {
    font-family: 'DIN Next Rounded LT W01 Regular';
    src: url('/fonts/DINNextRoundedLTW01-Regular.woff2') format('woff2'),
         url('/fonts/DINNextRoundedLTW01-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;

function TakeSurveyJs() {
  const { surveyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { formData: initialFormData } = location.state || {};
  const [formData, setFormData] = useState(initialFormData);
  const [survey, setSurvey] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFound, setIsFound] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setIsLoading(true);
        if (!isFound && surveyId) {
          console.log('🔍 Attempting to fetch survey with ID:', surveyId);
          console.log(
            '🔗 Full URL that will be called:',
            `surveys/js/${surveyId}`,
          );
          const response = await getSurveyById(surveyId);
          console.log('📦 Survey response:', response);
          if (!response.data) {
            throw new Error('Survey data not found');
          }
          setFormData({
            content: response.data.content,
          });
          setIsFound(true);
        }
      } catch (fetchError) {
        console.error('Error loading survey:', fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Error loading survey. Please try again later.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, isFound]);

  useEffect(() => {
    // Add font styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (!formData?.content) {
      setError('Survey content not found.');
      return;
    }

    try {
      const surveyContent =
        typeof formData.content === 'string'
          ? JSON.parse(formData.content)
          : formData.content;

      const surveyModel = new Model(surveyContent);

      surveyModel.showProgressBar = 'top';
      surveyModel.progressBarType = 'questions';
      surveyModel.progressBarShowPageNumbers = false;
      surveyModel.progressBarShowPageTitles = false;
      surveyModel.showProgressText = false;

      const updateProgress = () => {
        const questions = surveyModel.getAllQuestions();
        const totalQuestions = questions.length;
        const answeredQuestions = questions.filter((q) => q.isAnswered).length;
        const progressValue =
          Math.ceil((answeredQuestions / totalQuestions) * 100) || 0;
        console.log('Progress calculation:', {
          totalQuestions,
          answeredQuestions,
          progressValue,
          questions: questions.map((q) => ({
            name: q.name,
            isAnswered: q.isAnswered,
            value: q.value,
          })),
        });
        setProgress(progressValue);
      };

      // Add event handler for page changes with detailed logging
      surveyModel.onCurrentPageChanged.add(
        (
          sender: Model,
          options: {
            oldCurrentPage: any;
            newCurrentPage: any;
            isNextPage: boolean;
            isPrevPage: boolean;
            isGoingForward: boolean;
            isGoingBackward: boolean;
          },
        ) => {
          console.log('Page Change Details:', {
            isNextPage: options.isNextPage,
            isPrevPage: options.isPrevPage,
            isGoingForward: options.isGoingForward,
            isGoingBackward: options.isGoingBackward,
            oldPage: options.oldCurrentPage?.name,
            newPage: options.newCurrentPage?.name,
          });
          updateProgress();
        },
      );

      // Set up other event handlers
      surveyModel.onValueChanged.add(updateProgress);
      surveyModel.onQuestionAdded.add(updateProgress);

      // Initial progress calculation
      updateProgress();

      // Add custom CSS for the survey
      const surveyStyles = document.createElement('style');
      surveyStyles.textContent = `
        /* Set Feather Bold as default for all survey elements */
        .sv_main * {
          font-family: 'Feather Bold' !important;
        }

        /* Position progress bar container */
        .progress-bar-container {
          margin-bottom: 16px;
          width: 100%;
        }

        /* Ensure progress bar appears above title */
        .sd-root-modern {
          display: flex;
          flex-direction: column;
        }

        .sd-root-modern .progress-bar-container {
          order: 1;
        }

        .sd-root-modern .sd-page__title {
          order: 2;
        }

        /* Hide progress text */
        .sd-progress__text {
          display: none !important;
        }
        .sv-progress-buttons__text {
          display: none !important;
        }
        .sd-progress__text {
          display: none !important;
        }
        .sv-progress-pages {
          display: none !important;
        }
        .sd-progress__text {
          display: none !important;
        }

        /* Headers and Titles - Additional specific selectors for Feather Bold */
        .sd-root-modern,
        .sd-container-modern,
        .sd-root-modern h3,
        .sd-root-modern h4,
        .sd-root-modern h5,
        .sd-element__title,
        .sd-header__text,
        .sd-page__title,
        .sd-question__title,
        .sd-title,
        .sd-header__title,
        .sd-container-modern__title,
        .sd-title-actions__title,
        .sd-btn,
        .sd-navigation__complete-btn,
        .sd-navigation__prev-btn,
        .sd-navigation__next-btn,
        .sd-navigation__preview-btn,
        .sd-navigation__start-btn {
          font-family: 'Feather Bold' !important;
        }
        
        /* Explicitly set these elements to DIN Next Rounded */
        .sd-question__description,
        .sd-selectbase__item,
        .sd-item__control-label,
        .sd-radio__label span,
        .sd-checkbox__label span,
        .sd-item__string-viewer,
        .sd-rating__item-text,
        .sd-dropdown__value-container,
        .sd-input,
        .sd-comment,
        .sv-ranking-item__text,
        input, 
        select, 
        textarea {
          font-family: 'DIN Next Rounded LT W01 Regular' !important;
        }

        /* Progress bar styles */
        .sv_progress_bar {
          background-color: #89e219 !important;
          height: 8px !important;
          border-radius: 4px !important;
          transition: width 0.3s ease !important;
        }
        .sv_progress {
          background-color: #e0e0e0 !important;
          height: 8px !important;
          margin: 16px 20px !important;
          border-radius: 4px !important;
          width: calc(100% - 40px) !important;
        }
        .sv_progress_text {
          color: #666 !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          margin: 8px 20px !important;
          text-align: center !important;
          width: calc(100% - 40px) !important;
          font-family: 'Feather Bold' !important;
        }
        .sv_container {
          width: 100% !important;
        }
      `;
      document.head.appendChild(surveyStyles);

      surveyModel.onComplete.add(async (sender) => {
        try {
          console.log('📝 Survey completed, preparing to submit results...');
          const surveyData = sender.data;
          console.log('📦 Survey response data:', surveyData);

          await submitSurveyCompletion({
            surveyId: surveyId!,
            completionCode: JSON.stringify(surveyData),
            isSurveyJs: true,
          });

          console.log(
            '✅ Survey submitted successfully, navigating to home...',
          );
          alert('Thank you for completing the survey!');
          navigate('/whome');
        } catch (err) {
          console.error('❌ Error submitting survey:', err);
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to submit survey. Please try again.';
          console.error('Error details:', errorMessage);
          alert(errorMessage);
        }
      });

      setSurvey(surveyModel);
      setError(null);

      return () => {
        document.head.removeChild(surveyStyles);
        surveyModel.onValueChanged.remove(updateProgress);
        surveyModel.onCurrentPageChanged.remove(updateProgress);
        surveyModel.onQuestionAdded.remove(updateProgress);
      };
    } catch (err) {
      console.error('Error creating survey:', err);
      setError('Error creating survey. Please try again later.');
    }
  }, [formData?.content, navigate, surveyId]);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.previewBox}>
            <h4>Loading survey...</h4>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.previewBox}>
            <h4>Error</h4>
            <p>{error}</p>
            <p>Debug info:</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify({ formData, surveyId }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.container}>
          <div className={styles.previewBox}>
            <h4>Survey not found</h4>
            <p>The survey could not be loaded.</p>
            <p>Debug info:</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify({ formData, surveyId }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.previewBox}>
          <div className={styles.surveyContainer}>
            <Box className="progress-bar-container">
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2" sx={{ fontFamily: 'Feather Bold' }}>
                  Survey Progress
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: progress === 100 ? '#89e219' : '#89e219',
                  },
                }}
              />
            </Box>
            <Survey
              model={survey}
              css={{ root: { width: '100%', height: '100%' } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeSurveyJs;
