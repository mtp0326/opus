import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Navigation from '../components/Navigation';

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

function SurveyPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || {};

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    sessionStorage.setItem('surveyFormData', JSON.stringify(formData));
    sessionStorage.setItem('comingFromPreview', 'true');

    return () => {
      document.head.removeChild(styleElement);
      const navType = window.performance.getEntriesByType('navigation')[0].type;
      if (navType !== 'reload' && navType !== 'back_forward') {
        sessionStorage.removeItem('comingFromPreview');
      }
    };
  }, [formData]);

  const handleNext = () => {
    navigate('/create-publish-test', {
      state: {
        formData,
        surveyId: formData._id,
      },
    });
  };

  if (!location.state?.formData) {
    return (
      <Typography sx={{ textAlign: 'center', mt: 4, color: '#4b4b4b' }}>
        No survey data available
      </Typography>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navigation />
      <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: '#58CC02',
            fontFamily: 'Feather Bold',
            textAlign: 'center',
            mb: 4,
          }}
        >
          Survey Preview
        </Typography>

        <Paper
          elevation={3}
          sx={{
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '2px solid #E5E5E5',
            '&:hover': {
              borderColor: '#58CC02',
            },
            transition: 'all 0.2s ease',
            mb: 4,
          }}
        >
          <Box
            sx={{
              backgroundColor: '#58CC02',
              p: 3,
              borderBottom: '4px solid #45a501',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: 'white',
                fontFamily: 'Feather Bold',
                textAlign: 'center',
              }}
            >
              Worker View
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Feather Bold',
                color: '#4b4b4b',
                mb: 2,
              }}
            >
              {formData.title}
            </Typography>

            <Typography
              sx={{
                fontFamily: 'DIN Next Rounded LT W01 Regular',
                color: '#4b4b4b',
                mb: 2,
              }}
            >
              {formData.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontFamily: 'DIN Next Rounded LT W01 Regular',
                  color: '#58CC02',
                  mb: 1,
                }}
              >
                Reward: ${formData.reward}
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'DIN Next Rounded LT W01 Regular',
                  color: '#4b4b4b',
                  mb: 1,
                }}
              >
                Estimated Time: {formData.timeToComplete} minutes
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'DIN Next Rounded LT W01 Regular',
                  color: '#4b4b4b',
                }}
              >
                <strong>Instructions:</strong> {formData.instructions}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                alignItems: 'center',
              }}
            >
              <Button
                href={formData.surveyUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                sx={{
                  backgroundColor: '#58CC02',
                  fontFamily: 'Feather Bold',
                  padding: '12px 24px',
                  fontSize: '1.1rem',
                  borderRadius: '12px',
                  boxShadow: '0 4px 0 #45a501',
                  '&:hover': {
                    backgroundColor: '#45a501',
                    transform: 'translateY(1px)',
                    boxShadow: '0 3px 0 #45a501',
                  },
                }}
              >
                Take Survey
              </Button>

              <Box sx={{ width: '100%', maxWidth: '400px' }}>
                <Typography
                  sx={{
                    mb: 1,
                    fontFamily: 'Feather Bold',
                    color: '#4b4b4b',
                  }}
                >
                  Enter Completion Code:
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter the code shown at the end of the survey"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'DIN Next Rounded LT W01 Regular',
                      '&:hover fieldset': {
                        borderColor: '#58CC02',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#58CC02',
                      },
                    },
                  }}
                />
                <Button
                  fullWidth
                  onClick={() =>
                    alert(
                      'This is a preview. Submit functionality will be available to workers.',
                    )
                  }
                  sx={{
                    mt: 2,
                    backgroundColor: '#58CC02',
                    fontFamily: 'Feather Bold',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 0 #45a501',
                    '&:hover': {
                      backgroundColor: '#45a501',
                      transform: 'translateY(1px)',
                      boxShadow: '0 3px 0 #45a501',
                    },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            onClick={handleNext}
            variant="contained"
            startIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: '#58CC02',
              fontFamily: 'Feather Bold',
              padding: '16px 32px',
              fontSize: '1.1rem',
              borderRadius: '12px',
              boxShadow: '0 4px 0 #45a501',
              textTransform: 'none',
              minWidth: '300px',
              '&:hover': {
                backgroundColor: '#45a501',
                transform: 'translateY(1px)',
                boxShadow: '0 3px 0 #45a501',
              },
              '&:active': {
                transform: 'translateY(4px)',
                boxShadow: 'none',
              },
            }}
          >
            Next: Create and Publish Test
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SurveyPreview;
