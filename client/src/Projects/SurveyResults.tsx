import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import Navigation from '../components/Navigation';
import { getData } from '../util/api.tsx';

interface SurveySubmission {
  _id: string;
  worker: string;
  completionCode?: string;
  responseData?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
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
  const [surveyType, setSurveyType] = useState<'surveyjs' | 'external' | null>(
    null,
  );
  const [surveyDetails, setSurveyDetails] = useState<SurveyDetails | null>(
    null,
  );

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
        setError(
          err instanceof Error ? err.message : 'Failed to fetch results',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [surveyId]);

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

  const progress = surveyDetails
    ? (submissions.length / surveyDetails.respondents) * 100
    : 0;

  return (
    <>
      <Navigation />
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          {surveyDetails && (
            <>
              <Typography variant="h4" gutterBottom>
                {surveyDetails.title}
              </Typography>
              <Typography variant="body1" gutterBottom>
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
                  <Typography variant="body2">
                    Submissions: {submissions.length} /{' '}
                    {surveyDetails.respondents}
                  </Typography>
                  <Typography variant="body2">
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
                      backgroundColor: progress === 100 ? '#4caf50' : '#2196f3',
                    },
                  }}
                />
              </Box>
            </>
          )}

          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Submissions
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Worker</TableCell>
                  {surveyType === 'external' ? (
                    <TableCell>Completion Code</TableCell>
                  ) : (
                    <TableCell>Response Data</TableCell>
                  )}
                  <TableCell>Status</TableCell>
                  <TableCell>Submitted At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell>{submission.worker}</TableCell>
                    <TableCell>
                      {surveyType === 'external'
                        ? submission.completionCode
                        : JSON.stringify(submission.responseData)}
                    </TableCell>
                    <TableCell>{submission.status}</TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleString()}
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

export default SurveyResults;
