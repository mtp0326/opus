import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import Navigation2 from '../components/Navigation2';
import { submitSurveyCompletion } from '../Projects/api';

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

function TakeSurveyLink() {
  const { surveyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state || {};
  const [completionCode, setCompletionCode] = useState('');

  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleSubmit = async () => {
    try {
      await submitSurveyCompletion({
        surveyId: surveyId!,
        completionCode,
        isSurveyJs: false,
      });
      alert('Survey completion submitted successfully!');
      navigate('/whome');
    } catch (error) {
      console.error('Error submitting survey completion:', error);
      alert('Failed to submit survey completion');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navigation2 />
      <Box
        sx={{
          maxWidth: '800px',
          margin: '0 auto',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
              variant="h4"
              sx={{
                color: 'white',
                fontFamily: 'Feather Bold',
                textAlign: 'center',
              }}
            >
              {formData.title}
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Typography
              sx={{
                mb: 4,
                fontFamily: 'DIN Next Rounded LT W01 Regular',
                fontSize: '1.1rem',
                color: '#4b4b4b',
                textAlign: 'center',
              }}
            >
              {formData.description}
            </Typography>

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
                  value={completionCode}
                  onChange={(e) => setCompletionCode(e.target.value)}
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
                  onClick={handleSubmit}
                  disabled={!completionCode}
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
                    '&:disabled': {
                      backgroundColor: '#E5E5E5',
                      boxShadow: '0 4px 0 #cccccc',
                    },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default TakeSurveyLink;
