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

interface SubmissionsTableProps {
  data: SurveySubmission[];
  showCheckboxes?: boolean;
  selectedSubmissions: string[];
  surveyType: 'surveyjs' | 'external' | null;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSubmission: (submissionId: string) => void;
  pendingSubmissions: SurveySubmission[];
}

function SubmissionsTable({
  data,
  showCheckboxes = false,
  selectedSubmissions,
  surveyType,
  onSelectAll,
  onSelectSubmission,
  pendingSubmissions,
}: SubmissionsTableProps) {
  const getRowBackgroundColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'rgba(76, 175, 80, 0.1)';
      case 'rejected':
        return 'rgba(244, 67, 54, 0.1)';
      default:
        return 'inherit';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <CancelIcon color="error" />;
      default:
        return <CircularProgress size={20} />;
    }
  };

  return (
    <TableContainer component={Paper} sx={{ overflow: 'visible' }}>
      <Table>
        <TableHead>
          <TableRow>
            {showCheckboxes && (
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selectedSubmissions.length > 0 &&
                    selectedSubmissions.length < pendingSubmissions.length
                  }
                  checked={
                    pendingSubmissions.length > 0 &&
                    selectedSubmissions.length === pendingSubmissions.length
                  }
                  onChange={onSelectAll}
                />
              </TableCell>
            )}
            <TableCell>Rank</TableCell>
            <TableCell>Worker</TableCell>
            <TableCell>Submission Time</TableCell>
            <TableCell>Status</TableCell>
            {surveyType === 'surveyjs' && (
              <>
                <TableCell>Attention Score</TableCell>
                <TableCell>Response Data</TableCell>
              </>
            )}
            {surveyType === 'external' && (
              <TableCell>Completion Code</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((submission) => (
            <TableRow
              key={submission._id}
              sx={{
                backgroundColor: getRowBackgroundColor(submission.status),
                '& > td': {
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                },
              }}
            >
              {showCheckboxes && (
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedSubmissions.includes(submission._id)}
                    onChange={() => onSelectSubmission(submission._id)}
                    disabled={submission.status !== 'pending'}
                    size="small"
                  />
                </TableCell>
              )}
              <TableCell>{submission.rank || '-'}</TableCell>
              <TableCell>{submission.worker}</TableCell>
              <TableCell>
                {new Date(submission.submittedAt).toLocaleString()}
              </TableCell>
              <TableCell>{getStatusIcon(submission.status)}</TableCell>
              {surveyType === 'surveyjs' && (
                <>
                  <TableCell>
                    {submission.attentionCheckScore || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        position: 'relative',
                        '& .truncated': {
                          maxHeight: '60px',
                          overflow: 'hidden',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '20px',
                            background: 'linear-gradient(transparent, white)',
                            pointerEvents: 'none',
                          },
                        },
                        '& pre': {
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.75rem',
                          lineHeight: 1.2,
                        },
                        '& .full-data': {
                          position: 'absolute',
                          opacity: 0,
                          pointerEvents: 'none',
                          zIndex: -1,
                        },
                      }}
                    >
                      <div className="truncated">
                        <pre>
                          {JSON.stringify(submission.responseData, null, 2)}
                        </pre>
                      </div>
                      <div className="full-data">
                        <pre>
                          {JSON.stringify(submission.responseData, null, 2)}
                        </pre>
                      </div>
                    </Box>
                  </TableCell>
                </>
              )}
              {surveyType === 'external' && (
                <TableCell>{submission.completionCode}</TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
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

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const processedSubmissions = submissions.filter(
    (s) => s.status !== 'pending',
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSubmissions(pendingSubmissions.map((s) => s._id));
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
    ? (submissions.filter((s) => s.status !== 'rejected').length /
        surveyDetails.respondents) *
      100
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
                    Submissions:{' '}
                    {submissions.filter((s) => s.status !== 'rejected').length}{' '}
                    / {surveyDetails.respondents}
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
            <SubmissionsTable
              data={pendingSubmissions}
              showCheckboxes
              selectedSubmissions={selectedSubmissions}
              surveyType={surveyType}
              onSelectAll={handleSelectAll}
              onSelectSubmission={handleSelectSubmission}
              pendingSubmissions={pendingSubmissions}
            />
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
              No pending submissions
            </Typography>
          )}

          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h6">Processed Submissions</Typography>
          </Box>

          {processedSubmissions.length > 0 ? (
            <SubmissionsTable
              data={processedSubmissions}
              showCheckboxes={false}
              selectedSubmissions={selectedSubmissions}
              surveyType={surveyType}
              onSelectAll={handleSelectAll}
              onSelectSubmission={handleSelectSubmission}
              pendingSubmissions={pendingSubmissions}
            />
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
