import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Button,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getData } from '../util/api.tsx';
import Navigation from '../components/Navigation';

interface SurveySummary {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'expired' | 'draft';
  respondents: number;
  reward: number;
  createdAt: string;
  surveyType: 'surveyjs' | 'external';
}

function SurveyResultsSummary() {
  const [surveys, setSurveys] = useState<SurveySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await getData('surveys/published');
        if (response.error) {
          throw new Error(response.error.message);
        }
        setSurveys(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch surveys');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleViewResults = (surveyId: string) => {
    navigate(`/survey-results/${surveyId}`);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <Container>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <Container>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h4" gutterBottom>
            Survey Results Summary
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View and manage results for all your surveys
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Respondents</TableCell>
                  <TableCell>Reward</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey._id}>
                    <TableCell>{survey.title}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor:
                            survey.status === 'active'
                              ? 'success.light'
                              : survey.status === 'completed'
                              ? 'info.light'
                              : 'warning.light',
                          color: 'white',
                        }}
                      >
                        {survey.status}
                      </Box>
                    </TableCell>
                    <TableCell>{survey.respondents}</TableCell>
                    <TableCell>${survey.reward}</TableCell>
                    <TableCell>
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleViewResults(survey._id)}
                      >
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}

export default SurveyResultsSummary; 