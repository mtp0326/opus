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
  Checkbox,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Navigation from '../components/Navigation';
import { getData, putData } from '../util/api.tsx';

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
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [processingAction, setProcessingAction] = useState(false);

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

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const processedSubmissions = submissions.filter(s => s.status !== 'pending');

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSubmissions(pendingSubmissions.map(s => s._id));
    } else {
      setSelectedSubmissions([]);
    }
  };

  const handleSelectSubmission = (submissionId: string) => {
    setSelectedSubmissions((prev) => {
      if (prev.includes(submissionId)) {
        return prev.filter((id) => id !== submissionId);
      }
      return [...prev, submissionId];
    });
  };

  const handleBatchAction = async (action: 'approved' | 'rejected') => {
    if (selectedSubmissions.length === 0) return;

    setProcessingAction(true);
    try {
      await putData(`surveys/${surveyId}/submissions/batch`, {
        submissionIds: selectedSubmissions,
        status: action,
      });

      // Update local state
      setSubmissions((prev) =>
        prev.map((submission) =>
          selectedSubmissions.includes(submission._id)
            ? { ...submission, status: action }
            : submission,
        ),
      );
      setSelectedSubmissions([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to process submissions',
      );
    } finally {
      setProcessingAction(false);
    }
  };

  const SubmissionsTable = ({ data, showCheckboxes = false }: { data: SurveySubmission[], showCheckboxes?: boolean }) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {showCheckboxes && (
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedSubmissions.length === pendingSubmissions.length}
                  indeterminate={selectedSubmissions.length > 0 && selectedSubmissions.length < pendingSubmissions.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
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
          {data.map((submission) => (
            <TableRow
              key={submission._id}
              sx={{
                backgroundColor:
                  submission.status === 'approved'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : submission.status === 'rejected'
                    ? 'rgba(244, 67, 54, 0.1)'
                    : 'inherit',
              }}
            >
              {showCheckboxes && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedSubmissions.includes(submission._id)}
                    onChange={() => handleSelectSubmission(submission._id)}
                  />
                </TableCell>
              )}
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
  );

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

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">Pending Submissions</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                disabled={selectedSubmissions.length === 0 || processingAction}
                onClick={() => handleBatchAction('approved')}
              >
                Accept Selected
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                disabled={selectedSubmissions.length === 0 || processingAction}
                onClick={() => handleBatchAction('rejected')}
              >
                Deny Selected
              </Button>
            </Stack>
          </Box>

          {pendingSubmissions.length > 0 ? (
            <SubmissionsTable data={pendingSubmissions} showCheckboxes={true} />
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No pending submissions
            </Typography>
          )}

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6">Processed Submissions</Typography>
          </Box>

          {processedSubmissions.length > 0 ? (
            <SubmissionsTable data={processedSubmissions} showCheckboxes={false} />
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No processed submissions
            </Typography>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default SurveyResults;
