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
        setUserInfo(data[0]);
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
            return;
          }

          setFormData(response.data);
          setIsFound(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching random survey:', error);
        setIsLoading(false);
      }
    };

    fetchRandomSurvey();
  }, [isFound, setFormData, setIsLoading, setIsFound]);

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
      setSurvey(surveyModel);
    } catch (error) {
      console.error('Error creating survey model:', error);
      setError('Failed to load survey content.');
    }
  }, [formData, isLoading, isFound, setError, setSurvey]);

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

  const updatePointsAndCount = async () => {
    try {
      const response = await getWorkerByEmail(userInfo?.email);
      if (response.data) {
        setDailyQuestions(response.data.dailyQuestions);
        setPoints(response.data.points);
      }
    } catch (error) {
      console.error('Error updating points and count:', error);
    }
  };

  const getCurrentRankDifference = (
    leaderboardUsers: IUser[],
    currentUserEmail: string,
  ): number => {
    const currentUserIndex = leaderboardUsers.findIndex(
      (leaderboardUser) => leaderboardUser.email === currentUserEmail,
    );
    return currentUserIndex >= 0 ? currentUserIndex + 1 : 0;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await getWorkerByEmail(userInfo?.email);
        if (response.data) {
          setUserInfo(response.data);
          setUserGoalPoints(getUserGoalPoints(response.data.league));
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, [userInfo?.email, userInfo?.league]);

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
