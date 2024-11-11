import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Grid,
  CircularProgress,
  Box
} from '@mui/material';
import { getPublishedSurveys, type SurveyData } from './api';
import Navigation from '../components/Navigation';

interface Survey extends SurveyData {
  createdAt: string;
}

function ManageTasks() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg">
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h4" gutterBottom>
            Manage Tasks
          </Typography>
          
          <Grid container spacing={2}>
            {surveys.map((survey, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Grid container justifyContent="space-between" alignItems="center">
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
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="textSecondary">
                            Created: {new Date(survey.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Status: {survey.status}
                          </Typography>
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