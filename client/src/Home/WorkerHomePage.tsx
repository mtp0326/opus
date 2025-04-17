import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, NavigateFunction } from 'react-router-dom';
import { Box, Typography, Grid, Button } from '@mui/material';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
import { useSpring, animated } from '@react-spring/web';
import { height } from '@mui/system';
import IUser from '../util/types/user';
import styles from '../Projects/SurveyPreview.module.css';
import {
  getRandomSurvey,
  submitSurveyCompletion,
  getWorkerByEmail,
  getPointsForNextLeague,
  getLeaderboard,
} from '../Projects/api';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import ScreenGrid from '../components/ScreenGrid.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import Navigation2 from '../components/Navigation2.tsx';
import { getData } from '../util/api';
import fireImage from '../assets/images/fire.png';
import { useTheme } from '../context/ThemeContext';

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

interface PromoteButtonProps {
  admin: boolean | null;
  navigator: NavigateFunction;
}

function Number({ n1 = 0, n2 = 0 }: { n1?: number; n2?: number }) {
  const { number } = useSpring({
    from: { number: n1 || 0 },
    to: { number: n2 || 0 },
    delay: 100,
    config: { mass: 1, tension: 20, friction: 10 },
  });
  return <animated.span>{number.to((n) => n.toFixed(0))}</animated.span>;
}

/**
 * A button which, when clicked, will promote the user to admin. If the user is already admin, the button will be a link to the admin dashboard.
 * @param admin - a boolean indicating whether the user is an admin
 * @param navigator - a function which navigates to a new page (passed in from parent function)
 */
function PromoteButton({ admin, navigator }: PromoteButtonProps) {
  if (admin === null) {
    return null;
  }
  return admin ? (
    <PrimaryButton
      variant="contained"
      onClick={() => navigator('/users', { replace: true })}
      sx={{
        backgroundColor: '#58CC02',
        '&:hover': { backgroundColor: '#45a501' },
        fontFamily: 'Feather Bold',
      }}
    >
      View all users
    </PrimaryButton>
  ) : null;
}

// Function to get color based on league name
const getLeagueColor = (league: string) => {
  switch (league.toLowerCase()) {
    case 'wood':
      return '#8B4513'; // Brown color for wood
    case 'bronze':
      return '#CD7F32'; // Bronze color
    case 'silver':
      return '#C0C0C0'; // Silver color
    case 'gold':
      return '#FFD700'; // Gold color
    case 'platinum':
      return '#E5E4E2'; // Platinum color
    case 'diamond':
      return '#B9F2FF'; // Diamond color
    default:
      return '#000000'; // Default to black if no match
  }
};

const getLeagueVibrantColor = (league: string) => {
  // More saturated, vibrant versions of league colors for dark mode
  switch (league.toLowerCase()) {
    case 'wood':
      return '#CD853F'; // Peru
    case 'bronze':
      return '#FF6F00'; // Vibrant bronze/orange
    case 'silver':
      return '#90A4AE'; // Vibrant silver (a bluish gray)
    case 'gold':
      return '#FFC107'; // Vibrant gold (amber)
    case 'platinum':
      return '#4DD0E1'; // Vibrant cyan
    case 'diamond':
      return '#40C4FF'; // Vibrant blue
    default:
      return '#000000';
  }
};

const getUserGoalPoints = (league: string) => {
  switch (league.toLowerCase()) {
    case 'wood':
      return 5;
    case 'bronze':
      return 10;
    case 'silver':
      return 15;
    case 'gold':
      return 20;
    case 'platinum':
      return 25;
    case 'diamond':
      return 30;
    default:
      return 10;
  }
};

/**
 * The HomePage of the user dashboard. Displays a welcome message, a logout button and a button to promote the user to admin if they are not already an admin. If the user is an admin, the button will navigate them to the admin dashboard. This utilizes redux to access the current user's information.
 */
function WorkerHomePage() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigator = useNavigate();
  const [admin, setAdmin] = useState(user.admin);

  const location = useLocation();
  const navigate = useNavigate();
  const { formData: initialFormData } = location.state || {};
  const [surveyId, setSurveyId] = useState<string | undefined>('');
  const [formData, setFormData] = useState(initialFormData);
  const [survey, setSurvey] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFound, setIsFound] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = React.useRef(0);
  const startTime = React.useRef(Date.now());
  const progressSound = React.useRef(
    new Audio('/assets/sounds/duolingo-correct.mp3'),
  );
  const completionSound = React.useRef(new Audio('/assets/sounds/Wii-Win.mp3'));
  const [dailyQuestions, setDailyQuestions] = useState(0);
  const [daily10Xp, setDaily10Xp] = useState(false);
  const [daily15Xp, setDaily15Xp] = useState(false);
  const [daily20Xp, setDaily20Xp] = useState(false);
  const [userGoalPoints, setUserGoalPoints] = useState(10);
  const [dailyProgress, setDailyProgress] = useState(() => {
    const stored = localStorage.getItem('dailyQuestions');
    const storedData = stored ? JSON.parse(stored) : { date: '', count: 0 };
    const today = new Date().toISOString().split('T')[0];
    const currentCount = storedData.date === today ? storedData.count : 0;
    return currentCount <= userGoalPoints
      ? Math.ceil((currentCount / userGoalPoints) * 100) || 0
      : 100;
  });
  const [points, setPoints] = useState(() => {
    const stored = localStorage.getItem('dailyPoints');
    const storedData = stored ? JSON.parse(stored) : { date: '', points: 0 };
    const today = new Date().toISOString().split('T')[0];
    return storedData.date === today ? storedData.points : 0;
  });
  const [userInfo, setUserInfo] = useState<IUser | undefined>(undefined);
  const [prevPoints, setPrevPoints] = useState(points);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<IUser[]>([]);
  const [prevPointsNeeded, setPrevPointsNeeded] = useState(0);

  // Define background colors for the daily progress UI based on dark mode setting
  const dailyProgressContainerBg = isDarkMode ? '#102622' : '#FFFAED';
  const dailyProgressBarBgColor = isDarkMode ? '#d3d3d3' : '#FEDC97';

  // Idt we need selfpromote for a worker account/nonadmin account
  // const handleSelfPromote = async () => {
  //   const newAdminStatus = await selfUpgrade(user.email as string);
  //   if (newAdminStatus) {
  //     dispatch(toggleAdmin());
  //     setAdmin(true);
  //   }
  // };

  // commenting out onboarding for now cause it wasn't working
  // useEffect(() => {
  //   const styleElement = document.createElement('style');
  //   styleElement.textContent = fontStyles;
  //   document.head.appendChild(styleElement);

  //   const fetchOutcomes = async () => {
  //     try {
  //       // if (!user.email) return;
  //       // const workerInfo = await getData(`worker/${user.email}`);
  //       // console.log(workerInfo);
  //       // if (workerInfo.data[0].onboarded === false) {
  //       //   navigator('/wonboard', { replace: true });
  //       // }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     }
  //   };
  //   fetchOutcomes();

  //   return () => {
  //     document.head.removeChild(styleElement);
  //   };
  // }, []);

  const themeColors = {
    background: isDarkMode ? '#102622' : '#FFFAED',
    text: isDarkMode ? '#ffffff' : '#ffffff',
    primary: '#285943',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  // const message = `Welcome to the Opus, ${user.firstName} ${user.lastName}!`;
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    // Add font styles to document head
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    // Fetch user info from the server
    if (user && user.email) {
      getWorkerByEmail(user.email).then((data) => {
        console.log('🔍 User info:', data);
        setUserInfo(data);
        setUserGoalPoints(getUserGoalPoints(userInfo?.league ?? 'wood'));
      });
    }

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [user]);

  // get survey in random from surveyJs
  useEffect(() => {
    const fetchRandomSurvey = async () => {
      try {
        setIsLoading(true);
        if (!isFound) {
          const response = await getRandomSurvey();
          console.log('📦 Survey response:', response.data);

          if (!response.data || response.data === 0) {
            return (
              <>
                <Navigation2 />
                <ScreenGrid>
                  <Typography
                    variant="h2"
                    sx={{
                      color: '#58CC02',
                      fontFamily: 'Feather Bold',
                      textAlign: 'center',
                      mb: 4,
                    }}
                  >
                    No More Surveys for Today, Good Job!
                  </Typography>
                  <Grid item container justifyContent="center">
                    <PromoteButton admin={admin} navigator={navigator} />
                  </Grid>
                  <Grid item container justifyContent="center">
                    <Button
                      onClick={handleLogout}
                      sx={{
                        color: '#58CC02',
                        fontFamily: 'DIN Next Rounded LT W01 Regular',
                        '&:hover': { backgroundColor: '#f0f9f0' },
                      }}
                    >
                      Logout
                    </Button>
                  </Grid>
                </ScreenGrid>
              </>
            );
          }
          // if (!response.data) {
          //   throw new Error('Survey data not found');
          // }
          setFormData({
            content: response.data.content,
            reward: response.data.reward,
            respondents: response.data.respondents,
          });
          console.log('Survey ID:', response.data._id);
          setSurveyId(response.data._id);
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

    fetchRandomSurvey();
  }, [isFound]);

  useEffect(() => {
    // Skip validation if still loading or no formData yet
    if (isLoading || !isFound) {
      return;
    }

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

      // Each question is answered
      const updateProgress = () => {
        const questions = surveyModel.getAllQuestions();
        const totalQuestions = questions.length;
        const answeredQuestions = questions.filter((q) => q.isAnswered).length;
        const progressValue =
          Math.ceil((answeredQuestions / totalQuestions) * 100) || 0;

        setCurrentQuestion(answeredQuestions);
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

          // Only update progress and daily questions when moving forward
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
          color: #285943 !important;
        }

        /* Next button styling */
        .sd-btn.sd-navigation__next-btn {
          background-color: #66c8b9 !important;
          color: white !important;
          border: none !important;
        }

        /* Complete button styling */
        .sd-btn.sd-btn--action.sd-navigation__complete-btn {
          background-color: #66c8b9 !important;
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

      surveyModel.onComplete.add((sender) => {
        try {
          // Set progress to 100% and play sound
          const progressBars = document.querySelectorAll(
            '.custom-progress-bar div',
          );
          progressBars.forEach((bar) => {
            const elem = bar as HTMLElement;
            if (elem.classList.contains('particles')) return; // Skip particles container
            elem.style.width = '100%';
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

          // Play progress sound
          progressSound.current.currentTime = 0.3;
          progressSound.current
            .play()
            .catch((err) => console.log('Error playing sound:', err));

          // Wait for progress sound to finish before playing completion sound
          setTimeout(() => {
            completionSound.current.currentTime = 0;
            completionSound.current.play().catch((err) => {
              console.log('Error playing completion sound:', err);
              completionSound.current.load();
            });
          }, 500);

          console.log('📝 Survey completed, preparing to submit results...');
          const surveyData = sender.data;
          console.log('📦 Survey response data:', surveyData);

          // Submit survey data
          submitSurveyCompletion({
            surveyId: surveyId!,
            completionCode: JSON.stringify(surveyData),
            isSurveyJs: true,
          })
            .then((submissionResponse) => {
              console.log('✅ Survey submitted successfully');

              // Wait for the default completion page to render
              setTimeout(() => {
                const completionPage =
                  document.querySelector('.sd-completedpage');
                if (completionPage) {
                  // Compute total XP (survey reward plus bonus)
                  const newDailyCount = dailyQuestions + 1;

                  console.log('🔍 Daily count:', newDailyCount);
                  console.log('🔍 User goal points:', userGoalPoints);

                  let bonusXp = 0;
                  if (newDailyCount >= userGoalPoints && !daily10Xp) {
                    bonusXp = 20;
                    setDaily10Xp(true);
                  } else if (
                    newDailyCount >= 0.75 * userGoalPoints &&
                    !daily15Xp
                  ) {
                    bonusXp = 15;
                    setDaily15Xp(true);
                  } else if (
                    newDailyCount >= userGoalPoints / 2 &&
                    !daily20Xp
                  ) {
                    bonusXp = 10;
                    setDaily20Xp(true);
                  }
                  console.log('🔍 Bonus XP:', bonusXp);
                  const totalXp =
                    (submissionResponse?.data.xpEarned || 0) + bonusXp;

                  // If bonusXp exists, append an indicator to the stat text.
                  const bonusText =
                    bonusXp > 0 ? ` (+${bonusXp} bonus XP)` : '';

                  // Clear existing content
                  completionPage.innerHTML = '';

                  // Create completion message and move it upward by applying a negative top margin
                  const message = document.createElement('h2');
                  message.style.color = '#58CC02';
                  message.style.marginBottom = '1rem';
                  message.style.marginTop = '-3rem';
                  message.textContent = `Survey Completed! ${bonusText}`;
                  completionPage.appendChild(message);

                  // Create stats container
                  const statsContainer = document.createElement('div');
                  statsContainer.style.display = 'flex';
                  statsContainer.style.justifyContent = 'center';
                  statsContainer.style.gap = '2rem';
                  statsContainer.style.marginBottom = '2rem';
                  completionPage.appendChild(statsContainer);

                  // Create stat boxes with ring design
                  const createStatBox = (
                    label: string,
                    value: string,
                    color: string,
                  ) => {
                    const box = document.createElement('div');
                    box.style.padding = '1.5rem';
                    box.style.borderRadius = '12px';
                    box.style.backgroundColor = 'white';
                    box.style.border = `3px solid ${color}`;
                    box.style.textAlign = 'center';
                    box.style.width = '160px';
                    box.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

                    const labelElement = document.createElement('div');
                    labelElement.style.fontSize = '0.9rem';
                    labelElement.style.marginBottom = '0.5rem';
                    labelElement.style.color = color;
                    labelElement.style.fontWeight = 'bold';
                    labelElement.textContent = label;

                    const valueElement = document.createElement('div');
                    valueElement.style.fontSize = '1.4rem';
                    valueElement.style.fontWeight = 'bold';
                    valueElement.style.color = color;
                    valueElement.textContent = value;

                    box.appendChild(labelElement);
                    box.appendChild(valueElement);
                    return box;
                  };

                  // Add stat boxes with the specified colors
                  statsContainer.appendChild(
                    createStatBox(
                      'Points Gained',
                      `+${totalXp || 0} XP`,
                      '#1cb0f6',
                    ),
                  );
                  statsContainer.appendChild(
                    createStatBox(
                      'Attention Score',
                      submissionResponse?.data.attentionCheckScore || '0/0',
                      '#ff9600',
                    ),
                  );
                  statsContainer.appendChild(
                    createStatBox(
                      'Time Spent',
                      `${Math.round((Date.now() - startTime.current) / 1000)}s`,
                      '#ce82ff',
                    ),
                  );

                  // Create return to home button
                  const button = document.createElement('button');
                  button.style.backgroundColor = '#58CC02';
                  button.style.color = 'white';
                  button.style.padding = '12px 24px';
                  button.style.border = 'none';
                  button.style.borderRadius = '8px';
                  button.style.cursor = 'pointer';
                  button.style.fontSize = '1rem';
                  button.style.fontWeight = 'bold';
                  button.style.transition = 'background-color 0.2s ease';
                  button.textContent = 'Next Survey';
                  button.addEventListener('mouseover', (e) => {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.backgroundColor = '#45a501';
                  });
                  button.addEventListener('mouseout', (e) => {
                    const btn = e.target as HTMLButtonElement;
                    btn.style.backgroundColor = '#58CC02';
                  });
                  button.onclick = () => {
                    // Reset survey state to render a new survey
                    setIsFound(false); // Reset the survey found flag
                    setProgress(0); // Reset the progress bar
                    setFormData(null); // Clear the current survey data
                    setSurveyId(undefined); // Clear the survey ID

                    // Update points and count with bonus XP logic
                    updatePointsAndCount();
                  };
                  completionPage.appendChild(button);
                }
              }, 100); // Wait 100ms for the completion page to render
            })
            .catch((err) => {
              console.error('❌ Error submitting survey:', err);
              const errorMessage =
                err instanceof Error
                  ? err.message
                  : 'Failed to submit survey. Please try again.';
              console.error('Error details:', errorMessage);
              alert(errorMessage);
            });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.content, navigate, surveyId, isLoading, isFound]);

  useEffect(() => {
    // Get the current date as YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Get stored count and date
    const stored = localStorage.getItem('dailyQuestions');
    const storedData = stored ? JSON.parse(stored) : { date: '', count: 0 };

    // Reset count if it's a new day
    if (storedData.date !== today) {
      localStorage.setItem(
        'dailyQuestions',
        JSON.stringify({ date: today, count: 0 }),
      );
      setDailyQuestions(0);
      setDaily10Xp(false);
      setDaily15Xp(false);
      setDaily20Xp(false);
    } else {
      setDailyQuestions(storedData.count);
    }
  }, []);

  const updateDailyQuestions = () => {
    const today = new Date().toISOString().split('T')[0];
    const newCount = dailyQuestions + 1;
    localStorage.setItem(
      'dailyQuestions',
      JSON.stringify({ date: today, count: newCount }),
    );
    setDailyQuestions(newCount);
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('dailyPoints');
    const storedData = stored ? JSON.parse(stored) : { date: '', points: 0 };

    if (storedData.date !== today) {
      localStorage.setItem(
        'dailyPoints',
        JSON.stringify({ date: today, points: 0 }),
      );
      setPoints(0);
    } else {
      setPoints(storedData.points);
    }
  }, []);

  const updatePointsAndCount = () => {
    const today = new Date().toISOString().split('T')[0];
    const newDailyCount = dailyQuestions + 1;

    // Compute bonus XP based on the new daily count:
    let bonusXp = 0;
    if (newDailyCount >= userGoalPoints) {
      bonusXp = 20;
    } else if (newDailyCount >= 0.75 * userGoalPoints) {
      bonusXp = 15;
    } else if (newDailyCount >= userGoalPoints / 2) {
      bonusXp = 10;
    }

    const xpReward = (formData?.reward || 0) + bonusXp;
    const newPoints = points + xpReward;

    // Update daily survey count in local storage and state:
    localStorage.setItem(
      'dailyQuestions',
      JSON.stringify({ date: today, count: newDailyCount }),
    );
    setDailyQuestions(newDailyCount);
    const progressPercentage =
      newDailyCount <= userGoalPoints
        ? Math.ceil((newDailyCount / userGoalPoints) * 100) || 0
        : 100;
    setDailyProgress(progressPercentage);

    // Update points in local storage and state:
    localStorage.setItem(
      'dailyPoints',
      JSON.stringify({ date: today, points: newPoints }),
    );
    setPrevPoints(points);
    setPoints(newPoints);
  };

  const getCurrentRankDifference = (
    users: IUser[],
    currentUserEmail: string,
  ): number => {
    const sortedUsers = [...users].sort((a, b) => b.points - a.points);
    const currentUserIndex = sortedUsers.findIndex(
      (user) => user.email === currentUserEmail,
    );

    if (currentUserIndex <= 0) return 0;

    const pointsAhead = sortedUsers[currentUserIndex - 1].points;
    const currentPoints = sortedUsers[currentUserIndex].points;
    return pointsAhead - currentPoints + 1;
  };

  useEffect(() => {
    if (userInfo?.league) {
      getLeaderboard().then((data) => {
        const sameLeagueUsers = data.filter(
          (user) => user.league === userInfo.league,
        );
        setUsers(sameLeagueUsers);
      });
    }
  }, [userInfo?.league]);

  if (isLoading) {
    return (
      <>
        <Navigation2 />
        <div className={styles.pageContainer}>
          <div className={styles.container}>
            <div className={styles.previewBox}>
              <h4>Loading survey...</h4>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation2 />
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
      </>
    );
  }

  if (!survey) {
    return (
      <>
        <Navigation2 />
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
      </>
    );
  }

  return (
    <Box
      sx={{
        margin: 0,
        padding: 0,
        backgroundColor: themeColors.background,
        minHeight: '100vh',
      }}
    >
      <Navigation2 />
      <Box
        sx={{
          width: '100%',
          padding: '0 20px',
          marginBottom: '20px',
          backgroundColor: dailyProgressContainerBg,
        }}
      >
        <Typography
          sx={{
            color: isDarkMode ? '#ffffff' : '#285943',
            padding: '10px',
            fontFamily: 'Feather Bold',
            textAlign: 'center',
            mb: 1,
          }}
        >
          Daily Progress ({dailyQuestions}/
          {getUserGoalPoints(userInfo?.league ?? 'wood')})
        </Typography>
        <Box
          sx={{
            height: '8px',
            backgroundColor: dailyProgressBarBgColor,
            borderRadius: '4px',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${dailyProgress}%`,
              height: '100%',
              backgroundColor: '#66c8b9',
              transition: 'width 0.3s ease',
              position: 'relative',
            }}
          >
            <img
              src={fireImage}
              alt="fire"
              style={{
                position: 'absolute',
                right: '-12px',
                top: '-13px',
                width: '30px',
                height: '30px',
                transition: 'right 0.3s ease',
              }}
            />
          </Box>
          {/* Vertical markers inside the progress bar */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: '2px',
              height: '100%',
              backgroundColor: '#F87060',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: '75%',
              top: 0,
              width: '2px',
              height: '100%',
              backgroundColor: '#F87060',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '2px',
              height: '100%',
              backgroundColor: '#F87060',
            }}
          />

          {/* Point labels below */}
          <Box
            sx={{
              position: 'absolute',
              backgroundColor: dailyProgressContainerBg,
              top: '100%',
              left: 0,
              width: '100%',
              display: 'flex',
              mt: 1,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#58CC02',
                  fontFamily: 'Feather Bold',
                }}
              >
                +10 xp
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                left: '75%',
                transform: 'translateX(-50%)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#58CC02',
                  fontFamily: 'Feather Bold',
                }}
              >
                +15 xp
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                textAlign: 'right',
                paddingRight: '2px',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: '#58CC02',
                  fontFamily: 'Feather Bold',
                }}
              >
                +20 xp
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
        {/* Main content */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: isDarkMode ? '#102622' : '#FFFAED',
            color: '#102622',
            minHeight: '100vh',
          }}
        >
          <div className={styles.pageContainer}>
            <div className={styles.container}>
              <div
                className={styles.previewBox}
                style={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}
              >
                <div className={styles.surveyContainer}>
                  {isDarkMode && (
                    <style>{`
                      /* Make all text within the survey white, except for form fields */
                      .sv_main * {
                        color: white !important;
                      }
                      
                      /* Override input, textarea, and select elements for dark mode */
                      .sv_main input,
                      .sv_main textarea,
                      .sv_main select {
                        background-color: #d3d3d3 !important; /* light grey background */
                        color: #000 !important; /* black text */
                      }
                      
                      /* Set survey titles and headers to bright green */
                      .sv_main .sd-page__title,
                      .sv_main .sd-question__title,
                      .sv_main .sd-title,
                      .sv_main h3,
                      .sv_main h4,
                      .sv_main h5 {
                        color: #58CC02 !important;
                      }
                    `}</style>
                  )}

                  <Survey model={survey} css={{ root: 'sv_main' }} />
                  <div
                    className={styles.topRightBoxContainer}
                    style={{ top: '0.5rem' }}
                  >
                    <div
                      className={styles.topRightBox}
                      style={{
                        backgroundColor: isDarkMode ? '#d3d3d3' : '#fff',
                      }}
                    >
                      Q: {currentQuestion + 1}/{formData?.content.pages.length}
                    </div>
                    <div
                      className={styles.topRightBox}
                      style={{
                        backgroundColor: isDarkMode ? '#d3d3d3' : '#fff',
                      }}
                    >
                      {(() => {
                        const reward = formData?.reward || 0;
                        const respondents = formData?.respondents || 1;
                        const baseXP = Math.round((reward * 100) / respondents);
                        console.log('XP Calculation Debug:', {
                          reward,
                          respondents,
                          baseXP,
                          formData,
                        });
                        return `+${baseXP} Base XP`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Box>

        {/* Sidebar - now on the right */}
        <Box
          sx={{
            width: '240px',
            backgroundColor: themeColors.background,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: '100vh',
          }}
        >
          <Box
            sx={{
              backgroundColor: isDarkMode ? '#d3d3d3' : 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #ff9600',
            }}
          >
            <Typography
              sx={{
                color: isDarkMode ? '#FF6D00' : '#ff9600',
                fontSize: '1rem',
                marginBottom: '8px',
                fontFamily: 'Feather Bold',
              }}
            >
              Current League
            </Typography>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: isDarkMode
                  ? getLeagueVibrantColor(userInfo?.league || 'wood')
                  : getLeagueColor(userInfo?.league || 'wood'),
                fontFamily: 'Feather Bold',
              }}
            >
              {userInfo?.league}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: isDarkMode ? '#d3d3d3' : 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #58CC02',
            }}
          >
            <Typography
              sx={{
                color: isDarkMode ? '#00E676' : '#58CC02',
                fontSize: '1rem',
                marginBottom: '8px',
                fontFamily: 'Feather Bold',
              }}
            >
              Today's Progress
            </Typography>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: isDarkMode ? '#00C853' : '#58CC02',
                fontFamily: 'Feather Bold',
              }}
            >
              {dailyQuestions}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: isDarkMode ? '#388E3C' : '#666',
                fontFamily: 'Feather Bold',
              }}
            >
              surveys completed
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: isDarkMode ? '#d3d3d3' : 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #1cb0f6',
            }}
          >
            <Typography
              sx={{
                color: isDarkMode ? '#2979FF' : '#1cb0f6',
                fontSize: '1rem',
                marginBottom: '8px',
                fontFamily: 'Feather Bold',
              }}
            >
              Points Gained Today
            </Typography>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: isDarkMode ? '#2979FF' : '#1cb0f6',
                fontFamily: 'Feather Bold',
              }}
            >
              +<Number n1={prevPoints} n2={points} /> XP
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: isDarkMode ? '#d3d3d3' : 'white',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '3px solid #ce82ff',
              marginTop: '16px',
            }}
          >
            <Typography
              sx={{
                color: isDarkMode ? '#D500F9' : '#ce82ff',
                fontSize: '1rem',
                marginBottom: '8px',
                fontFamily: 'Feather Bold',
              }}
            >
              Progress Tracker
            </Typography>

            {/* Points to next league */}
            <Typography
              sx={{
                fontSize: '1.1rem',
                color: isDarkMode ? '#666' : '#666',
                fontFamily: 'Feather Bold',
                marginBottom: '4px',
              }}
            >
              <Number
                n1={prevPointsNeeded}
                n2={getPointsForNextLeague(userInfo?.points || 0)}
              />{' '}
              points until{' '}
              <span
                style={{
                  color: isDarkMode
                    ? getLeagueVibrantColor(
                        userInfo?.league === 'Wood'
                          ? 'Bronze'
                          : userInfo?.league === 'Bronze'
                          ? 'Silver'
                          : userInfo?.league === 'Silver'
                          ? 'Gold'
                          : userInfo?.league === 'Gold'
                          ? 'Platinum'
                          : userInfo?.league === 'Platinum'
                          ? 'Diamond'
                          : 'Diamond',
                      )
                    : getLeagueColor(
                        userInfo?.league === 'Wood'
                          ? 'Bronze'
                          : userInfo?.league === 'Bronze'
                          ? 'Silver'
                          : userInfo?.league === 'Silver'
                          ? 'Gold'
                          : userInfo?.league === 'Gold'
                          ? 'Platinum'
                          : userInfo?.league === 'Platinum'
                          ? 'Diamond'
                          : 'Diamond',
                      ),
                }}
              >
                {userInfo?.league === 'Wood'
                  ? 'Bronze'
                  : userInfo?.league === 'Bronze'
                  ? 'Silver'
                  : userInfo?.league === 'Silver'
                  ? 'Gold'
                  : userInfo?.league === 'Gold'
                  ? 'Platinum'
                  : userInfo?.league === 'Platinum'
                  ? 'Diamond'
                  : ''}
              </span>{' '}
              League!
            </Typography>

            {/* Points to climb rank - only show if we have users data */}
            {users.length > 0 && (
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  color: isDarkMode ? '#666' : '#666',
                  fontFamily: 'Feather Bold',
                }}
              >
                {getCurrentRankDifference(users, userInfo?.email || '')} points
                to climb a rank!
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default WorkerHomePage;
