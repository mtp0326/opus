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
  const progressRef = React.useRef(0);
  const progressSound = React.useRef(
    new Audio('/assets/sounds/duolingo-correct.mp3'),
  );

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

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

      surveyModel.showProgressBar = 'off';
      surveyModel.progressBarType = 'questions';
      surveyModel.progressBarShowPageNumbers = false;
      surveyModel.progressBarShowPageTitles = false;
      surveyModel.showProgressText = false;

      // Add custom rendering
      surveyModel.onAfterRenderSurvey.add((sender, options) => {
        const descriptionElement =
          options.htmlElement.querySelector('.sd-description');
        if (descriptionElement) {
          // Remove any existing progress bars first
          const existingProgressBars = options.htmlElement.querySelectorAll(
            '.progress-bar-container',
          );
          existingProgressBars.forEach((bar) => bar.remove());

          const progressBarContainer = document.createElement('div');
          progressBarContainer.className = 'progress-bar-container';
          progressBarContainer.innerHTML = `
            <div class="progress-wrapper">
              <div class="custom-progress-bar" style="height: 16px; border-radius: 8px; background-color: #e0e0e0;">
                <div style="width: ${progress}%; height: 100%; border-radius: 8px; background-color: #89e219; transition: width 0.3s ease;"></div>
                <div class="particles">
                  <span class="particle" style="--angle: 30deg"></span>
                  <span class="particle" style="--angle: 60deg"></span>
                  <span class="particle" style="--angle: 90deg"></span>
                  <span class="particle" style="--angle: 120deg"></span>
                  <span class="particle" style="--angle: 150deg"></span>
                  <span class="particle" style="--angle: 180deg"></span>
                </div>
              </div>
              <img src="/assets/images/treasure-chest.png" class="treasure-chest" alt="treasure chest" width="24" height="24" />
            </div>
          `;
          descriptionElement.parentNode?.insertBefore(
            progressBarContainer,
            descriptionElement.nextSibling,
          );
        }
      });

      const updateProgress = () => {
        const questions = surveyModel.getAllQuestions();
        const totalQuestions = questions.length;
        const answeredQuestions = questions.filter((q) => q.isAnswered).length;
        const progressValue =
          Math.ceil((answeredQuestions / totalQuestions) * 100) || 0;

        // Only update if the progress value has changed
        if (progressValue !== progressRef.current) {
          console.log('Progress calculation:', {
            totalQuestions,
            answeredQuestions,
            progressValue,
            currentProgress: progressRef.current,
            questions: questions.map((q) => ({
              name: q.name,
              isAnswered: q.isAnswered,
              value: q.value,
            })),
          });

          // Play the progress sound
          progressSound.current.currentTime = 0.3; // Reset sound to start
          progressSound.current
            .play()
            .catch((err) => console.log('Error playing sound:', err));

          setProgress(progressValue);
          // Update the progress bar width with animation
          const progressBars = document.querySelectorAll(
            '.custom-progress-bar div',
          );
          progressBars.forEach((bar) => {
            const elem = bar as HTMLElement;
            if (elem.classList.contains('particles')) return; // Skip particles container
            elem.style.width = `${progressValue}%`;
            // Add animation class
            elem.classList.add('progress-update');
            // Remove the class after animation completes
            setTimeout(() => elem.classList.remove('progress-update'), 300);

            // Reset particle animations by removing and re-adding particles container
            const particlesContainer =
              elem.parentElement?.querySelector('.particles');
            if (particlesContainer) {
              const newParticles = particlesContainer.cloneNode(true);
              particlesContainer.parentNode?.replaceChild(
                newParticles,
                particlesContainer,
              );
            }
          });
        }
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

          // Only update progress when moving forward to a new, unseen page
          if (options.isGoingForward && options.newCurrentPage) {
            updateProgress();
          }
        },
      );

      // Initial progress calculation
      updateProgress();

      // Add custom CSS for the survey
      const surveyStyles = document.createElement('style');
      surveyStyles.textContent = `
        /* Set Feather Bold as default for all survey elements */
        .sv_main * {
          font-family: 'Feather Bold' !important;
        }

        /* Progress bar container and particles positioning */
        .progress-bar-container {
          margin-bottom: 16px;
          width: 100%;
          padding: 0 20px;
          box-sizing: border-box;
        }

        .progress-wrapper {
          position: relative;
          width: 100%;
          height: 16px;
        }

        .custom-progress-bar {
          width: calc(100% - 32px);
          position: relative;
        }

        .treasure-chest {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          display: block;
          z-index: 2;
        }

        .particles {
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          width: 20px;
          height: 20px;
          z-index: 2;
        }

        .particle {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          pointer-events: none;
          opacity: 0;
          transform-origin: -10px 50%;
          animation: particleAnimation 0.6s ease-out forwards;
        }

        /* Individual particle colors and delays */
        .particle:nth-child(1) {
          background-color: #58CC02;
          animation-delay: 0s;
        }
        .particle:nth-child(2) {
          background-color: #89e219;
          animation-delay: 0.1s;
        }
        .particle:nth-child(3) {
          background-color: #9cf134;
          animation-delay: 0.15s;
        }
        .particle:nth-child(4) {
          background-color: #ffd900;
          animation-delay: 0.05s;
        }
        .particle:nth-child(5) {
          background-color: #ff9600;
          animation-delay: 0.2s;
        }
        .particle:nth-child(6) {
          background-color: #58CC02;
          animation-delay: 0.25s;
        }

        @keyframes particleAnimation {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(30px) scale(0);
            opacity: 0;
          }
        }

        /* Progress bar animation */
        @keyframes progressPulse {
          0% { 
            transform: scaleY(1);
            background-color: #89e219;
          }
          50% { 
            transform: scaleY(1.15);
            background-color: #9cf134;
          }
          100% { 
            transform: scaleY(1);
            background-color: #89e219;
          }
        }

        .progress-update {
          animation: progressPulse 0.3s ease;
          transform-origin: center;
        }

        /* Position progress bar container */
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

        /* Title styling */
        .sd-title {
          color: #58CC02 !important;
        }

        /* Next button styling */
        .sd-btn.sd-navigation__next-btn {
          background-color: #58CC02 !important;
          color: white !important;
          border: none !important;
        }

        /* Complete button styling */
        .sd-btn.sd-btn--action.sd-navigation__complete-btn {
          background-color: #58CC02 !important;
          color: white !important;
          border: none !important;
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
          height: 16px !important;
          border-radius: 8px !important;
          transition: width 0.3s ease !important;
        }
        .sv_progress {
          background-color: #e0e0e0 !important;
          height: 16px !important;
          margin: 16px 20px !important;
          border-radius: 8px !important;
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
        surveyModel.onCurrentPageChanged.remove(updateProgress);
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
