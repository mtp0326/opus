import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  Stack,
  LinearProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import Navigation from '../components/Navigation';
import { getData, putData } from '../util/api.tsx';
import { useTheme } from '../context/ThemeContext';

interface SurveySubmission {
  _id: string;
  worker: string;
  completionCode?: string;
  responseData?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  rank?: number;
  attentionCheckScore?: string;
  submissionUrl?: string;
}

interface SurveyDetails {
  title: string;
  description: string;
  respondents: number;
  status: string;
}

function SurveyResults() {
  const { surveyId } = useParams();
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveyType, setSurveyType] = useState<'surveyjs' | 'external' | null>(null);
  const [surveyDetails, setSurveyDetails] = useState<SurveyDetails | null>(null);
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [processingAction, setProcessingAction] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await getData(`surveys/${surveyId}/results`);
        if (response.error) {
          throw new Error(response.error.message);
        }
        setSubmissions(response.data.data.submissions);
        setSurveyType(response.data.data.surveyType);
        setSurveyDetails(response.data.data.surveyDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [surveyId]);

  const handleBatchAction = async (action: 'approved' | 'rejected') => {
    if (selectedSubmissions.length === 0) return;

    setProcessingAction(true);
    try {
      await putData(`surveys/${surveyId}/submissions/batch`, {
        submissionIds: selectedSubmissions,
        status: action,
      });

      setSubmissions((prev) =>
        prev.map((submission) =>
          selectedSubmissions.includes(submission._id)
            ? { ...submission, status: action }
            : submission,
        ),
      );
      setSelectedSubmissions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process submissions');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleExportCSV = () => {
    if (!surveyDetails) return;

    const csvContent = convertToCSV(submissions, surveyType);
    const filename = `${surveyDetails.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()}_results.csv`;
    downloadCSV(csvContent, filename);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Box sx={{ 
          backgroundColor: '#FFFAED', 
          minHeight: '100vh', 
          p: 2,
          '& .MuiContainer-root': {
            backgroundColor: '#FFFAED',
          },
        }}>
          <Container>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
              <CircularProgress />
            </Box>
          </Container>
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Box sx={{ 
          backgroundColor: '#FFFAED', 
          minHeight: '100vh', 
          p: 2,
          '& .MuiContainer-root': {
            backgroundColor: '#FFFAED',
          },
        }}>
          <Container>
            <Card sx={{ p: 3, mt: 3, backgroundColor: '#FFFAED' }}>
              <Typography color="error">{error}</Typography>
            </Card>
          </Container>
        </Box>
      </>
    );
  }

  const progress = surveyDetails
    ? (submissions.filter((s) => s.status !== 'rejected').length /
        surveyDetails.respondents) *
      100
    : 0;

  return (
    <>
      <Navigation />
      <Box sx={{ 
        backgroundColor: '#FFFAED', 
        minHeight: '100vh', 
        p: 2,
        '& .MuiContainer-root': {
          backgroundColor: '#FFFAED',
        },
        '& .MuiCard-root': {
          backgroundColor: '#FFFAED',
        },
        '& .MuiCardContent-root': {
          backgroundColor: '#FFFAED',
        },
        '& .MuiGrid-root': {
          backgroundColor: '#FFFAED',
        },
        '& .MuiBox-root': {
          backgroundColor: '#FFFAED',
        },
      }}>
        <Container maxWidth="lg">
          <Card sx={{ 
            p: 3, 
            mt: 2, 
            backgroundColor: '#FFFAED',
          }}>
            {surveyDetails && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: 'Feather Bold',
                      color: '#285943',
                    }}
                  >
                    {surveyDetails.title}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#58CC02',
                      '&:hover': { backgroundColor: '#45a501' },
                      fontFamily: 'Feather Bold',
                    }}
                    startIcon={<DownloadIcon />}
                    onClick={handleExportCSV}
                  >
                    Export CSV
                  </Button>
                </Box>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ fontFamily: 'DIN Next Rounded LT W01 Regular' }}
                >
                  {surveyDetails.description}
                </Typography>
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'Feather Bold' }}
                    >
                      Submissions:{' '}
                      {submissions.filter((s) => s.status !== 'rejected').length}{' '}
                      / {surveyDetails.respondents}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'Feather Bold' }}
                    >
                      {Math.round(progress)}% Complete
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
                        backgroundColor: progress === 100 ? '#58CC02' : '#1cb0f6',
                      },
                    }}
                  />
                </Box>
              </>
            )}

            <Grid container spacing={2}>
              {submissions.map((submission) => (
                <Grid item xs={12} key={submission._id}>
                  <Card
                    sx={{
                      '&:hover': { borderColor: '#285943' },
                    }}
                  >
                    <CardContent>
                      <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item xs={8}>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontFamily: 'Feather Bold' }}
                          >
                            {submission.worker}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ fontFamily: 'DIN Next Rounded LT W01 Regular' }}
                          >
                            Submitted: {new Date(submission.submittedAt).toLocaleString()}
                          </Typography>
                          {surveyType === 'surveyjs' && submission.attentionCheckScore && (
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              sx={{ fontFamily: 'DIN Next Rounded LT W01 Regular' }}
                            >
                              Attention Score: {submission.attentionCheckScore}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'inline-block',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                backgroundColor:
                                  submission.status === 'approved'
                                    ? 'rgba(88, 204, 2, 0.1)'
                                    : submission.status === 'rejected'
                                    ? 'rgba(255, 0, 0, 0.1)'
                                    : 'rgba(28, 176, 246, 0.1)',
                                color:
                                  submission.status === 'approved'
                                    ? '#58CC02'
                                    : submission.status === 'rejected'
                                    ? '#ff0000'
                                    : '#1cb0f6',
                                fontFamily: 'Feather Bold',
                                mb: 1,
                              }}
                            >
                              {submission.status}
                            </Box>
                            {submission.status === 'pending' && (
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="contained"
                                  sx={{
                                    backgroundColor: '#58CC02',
                                    '&:hover': { backgroundColor: '#45a501' },
                                    fontFamily: 'Feather Bold',
                                  }}
                                  startIcon={<CheckCircleIcon />}
                                  onClick={() => handleBatchAction('approved')}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="contained"
                                  sx={{
                                    backgroundColor: '#ff0000',
                                    '&:hover': { backgroundColor: '#cc0000' },
                                    fontFamily: 'Feather Bold',
                                  }}
                                  startIcon={<CancelIcon />}
                                  onClick={() => handleBatchAction('rejected')}
                                >
                                  Deny
                                </Button>
                              </Stack>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Container>
      </Box>
    </>
  );
}

export default SurveyResults;
