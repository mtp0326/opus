import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Box,
  Button,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Navigation from '../components/Navigation';
import { getPublishedSurveys, type SurveyData } from './api';
import { deleteSurvey } from './api';
import styles from './ManageTasks.module.css';

interface Survey extends SurveyData {
  createdAt: string;
  _id: string;
  surveyType?: 'surveyjs';
  content?: any;
}

function ManageTasks() {
  const navigate = useNavigate();
  const location = useLocation();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    console.log('🎯 ManageTasks component mounted - fetching surveys...');

    const fetchSurveys = async () => {
      try {
        const response = await getPublishedSurveys();
        setSurveys(response as Survey[]);
      } catch (error) {
        console.error('❌ Error fetching surveys:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment') === 'success') {
      setShowPaymentSuccess(true);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
    }
  }, [location]);

  const handleEdit = async (survey: Survey) => {
    if (survey.surveyType === 'surveyjs') {
      localStorage.setItem('currentSurvey', JSON.stringify(survey.content));
      localStorage.setItem('currentSurveyId', survey._id);
      navigate('/survey-builder');
    } else {
      navigate('/survey-link', { state: { survey } });
    }
  };

  const handleDelete = async (surveyId: string) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await deleteSurvey(surveyId);
        // Refresh the surveys list
        setSurveys(surveys.filter((survey) => survey._id !== surveyId));
      } catch (error) {
        console.error('❌ Error deleting survey:', error);
        alert('Failed to delete survey');
      }
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {showPaymentSuccess && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <p>✅ Payment completed successfully!</p>
          </div>
        </div>
      )}
      <Navigation />
      <Container maxWidth="lg">
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: '#58CC02',
            }}
          >
            Manage Tasks
          </Typography>

          <Grid container spacing={2}>
            {surveys.map((survey) => (
              <Grid item xs={12} key={survey._id}>
                <Card sx={{ '&:hover': { borderColor: '#58CC02' } }}>
                  <CardContent>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item xs={8}>
                        <Typography variant="h6" gutterBottom>
                          {survey.title}
                        </Typography>
                        {survey.description && (
                          <Typography color="textSecondary">
                            {survey.description}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={4}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end', // Align content to the right
                          }}
                        >
                          <Typography variant="body2" color="textSecondary">
                            Created:{' '}
                            {new Date(survey.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Status: {survey.status}
                          </Typography>
                          {survey.status === 'draft' && (
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                mt: 1,
                                justifyContent: 'flex-end', // Align buttons to the right
                              }}
                            >
                              <Button
                                startIcon={<EditIcon />}
                                onClick={() => handleEdit(survey)}
                                size="small"
                              >
                                Edit
                              </Button>
                              <Button
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDelete(survey._id)}
                                size="small"
                                color="error"
                              >
                                Delete
                              </Button>
                            </Box>
                          )}
                          {(survey.status === 'active' ||
                            survey.status === 'completed') && (
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                mt: 1,
                                justifyContent: 'flex-end',
                              }}
                            >
                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: '#58CC02',
                                  '&:hover': { backgroundColor: '#45a501' },
                                }}
                                onClick={() =>
                                  navigate(`/survey-results/${survey._id}`)
                                }
                              >
                                Review Results
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {surveys.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body1" align="center">
                  No published surveys found.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Container>
    </>
  );
}

export default ManageTasks;
