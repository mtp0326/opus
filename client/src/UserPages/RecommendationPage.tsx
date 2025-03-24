import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Navigation2 from '../components/Navigation2';
import { useAppSelector } from '../util/redux/hooks';
import { selectUser } from '../util/redux/userSlice';
import { getData } from '../util/api';
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

interface SurveyData {
  _id: string;
  title: string;
  description: string;
  reward: number;
  timeToComplete: string;
  surveyUrl?: string;
  content?: any;
  surveyType?: 'surveyjs' | undefined;
  submitterList: string[];
  status: 'active' | 'inactive';
}

function RecommendationPage() {
  const [recommendedSurveys, setRecommendedSurveys] = useState<SurveyData[]>(
    [],
  );
  const [recentSurveys, setRecentSurveys] = useState<SurveyData[]>([]);
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const themeColors = {
    background: isDarkMode ? '#102622' : '#FFFAED',
    text: isDarkMode ? '#ffffff' : '#ffffff',
    primary: '#58CC02',
    secondary: '#1cb0f6',
    accent: '#ce82ff',
  };

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    const fetchSurveys = async () => {
      try {
        const response = await getData(`surveys/all-surveys`);
        const allSurveys = response.data;

        // Filter surveys into recommended and recent based on submitterList
        const recommended = allSurveys.filter(
          (survey: SurveyData) => !survey.submitterList.includes(user.email),
        );
        const recent = allSurveys.filter((survey: SurveyData) =>
          survey.submitterList.includes(user.email),
        );

        setRecommendedSurveys(recommended);
        setRecentSurveys(recent);
      } catch (error) {
        console.error('Error fetching surveys:', error);
      }
    };

    fetchSurveys();

    return () => {
      document.head.removeChild(styleElement);
    };
  }, [user.email]);

  const handleAcceptWork = (survey: SurveyData) => {
    if (survey.surveyType === 'surveyjs') {
      navigate(`/take-survey-js/${survey._id}`, {
        state: {
          formData: {
            title: survey.title,
            description: survey.description,
            content: survey.content,
          },
        },
      });
    } else {
      navigate(`/take-survey-link/${survey._id}`, {
        state: {
          formData: {
            title: survey.title,
            description: survey.description,
            surveyUrl: survey.surveyUrl,
          },
        },
      });
    }
  };

  function SurveyTable({
    surveys = [],
    isRecent = false,
  }: {
    surveys: SurveyData[];
    isRecent?: boolean;
  }) {
    return (
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#66c8b9' }}>
              <TableCell
                sx={{
                  fontFamily: 'Feather Bold',
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                Survey Title
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: 'Feather Bold',
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                Description
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontFamily: 'Feather Bold',
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                Time
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  fontFamily: 'Feather Bold',
                  color: 'white',
                  fontSize: '1.1rem',
                }}
              >
                Jackpot Payout
              </TableCell>
              {!isRecent && (
                <TableCell
                  align="center"
                  sx={{
                    fontFamily: 'Feather Bold',
                    color: 'white',
                    fontSize: '1.1rem',
                  }}
                >
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {surveys && surveys.length > 0 ? (
              surveys.map((survey) => (
                <TableRow
                  key={survey._id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#f0f9f0',
                      transform: 'scale(1.002)',
                    },
                    '&:nth-of-type(odd)': {
                      backgroundColor: '#fafafa',
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      fontFamily: 'Feather Bold',
                      color: '#4b4b4b',
                      fontSize: '1.1rem',
                    }}
                  >
                    {survey.title}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontFamily: 'DIN Next Rounded LT W01 Regular',
                      color: '#757575',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {survey.description}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontFamily: 'DIN Next Rounded LT W01 Regular',
                      color: '#4b4b4b',
                    }}
                  >
                    {survey.timeToComplete || '10-15 min'}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontFamily: 'Feather Bold',
                      color: '#66c8b9',
                      fontSize: '1.1rem',
                    }}
                  >
                    ${survey.reward}
                  </TableCell>
                  {!isRecent && (
                    <TableCell align="center">
                      <button
                        onClick={() => handleAcceptWork(survey)}
                        style={{
                          fontFamily: 'Feather Bold',
                          backgroundColor: '#66c8b9 ',
                          color: 'black',
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 4px 0 #45a501',
                          '&:hover': {
                            backgroundColor: '#aff8e5',
                            transform: 'translateY(1px)',
                            boxShadow: '0 3px 0 #45a501',
                          },
                        }}
                      >
                        Accept & Work
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={isRecent ? 4 : 5}
                  align="center"
                  sx={{
                    fontFamily: 'DIN Next Rounded LT W01 Regular',
                    color: '#757575',
                    py: 4,
                  }}
                >
                  {isRecent
                    ? 'No recent surveys found'
                    : 'No recommended surveys available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: themeColors.background }}>
      <Navigation2 />
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Feather Bold',
            // color: themeColors.primary,
            color: isDarkMode ? '#ffffff' : '#285943',
            textAlign: 'center',
            mb: 4,
            fontSize: '2.5rem',
          }}
        >
          Recommended Surveys
        </Typography>

        <SurveyTable surveys={recommendedSurveys} />

        <Typography
          variant="h2"
          sx={{
            fontFamily: 'Feather Bold',
            color: isDarkMode ? '#ffffff' : themeColors.primary,
            textAlign: 'center',
            mb: 4,
            mt: 6,
            fontSize: '2rem',
          }}
        >
          Recent Activity
        </Typography>

        <SurveyTable surveys={recentSurveys} isRecent />
      </Box>
    </Box>
  );
}

export default RecommendationPage;
