import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { getData } from '../util/api';

interface PayoutDetails {
  _id: string;
  survey: string;
  worker: {
    _id: string;
    email: string;
    xp: number;
  };
  xpEarned: number;
  monetaryPayment: number;
  attentionCheckScore: string;
  status: string;
}

function SurveyPayoutDetails() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payouts, setPayouts] = useState<PayoutDetails[]>([]);
  const [surveyDetails, setSurveyDetails] = useState<{
    title: string;
    totalReward: number;
  } | null>(null);

  useEffect(() => {
    const fetchPayoutDetails = async () => {
      if (!surveyId) {
        setError('Invalid survey ID');
        setLoading(false);
        return;
      }

      try {
        // Fetch survey details
        const surveyResponse = await getData(`surveys/js/${surveyId}`);
        if (surveyResponse.error) {
          throw new Error(surveyResponse.error.message);
        }
        setSurveyDetails({
          title: surveyResponse.data.title,
          totalReward: surveyResponse.data.reward || 0,
        });

        // Fetch payout details
        const payoutsResponse = await getData(
          `surveys/${surveyId}/payout-details`,
        );
        if (payoutsResponse.error) {
          throw new Error(payoutsResponse.error.message);
        }
        setPayouts(payoutsResponse.data);
      } catch (err) {
        console.error('Error fetching payout details:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch payout details',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutDetails();
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
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/manage-tasks')}
            >
              Return to Manage Tasks
            </Button>
          </Paper>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Payout Details
          </Typography>
          {surveyDetails && (
            <Typography variant="h6" gutterBottom>
              Survey: {surveyDetails.title}
            </Typography>
          )}
          <Typography variant="subtitle1" gutterBottom>
            Total Reward Pool: ${surveyDetails?.totalReward || 0}
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Respondent Email</TableCell>
                  <TableCell align="right">XP Earned</TableCell>
                  <TableCell align="right">Monetary Payment</TableCell>
                  <TableCell align="right">Attention Check Score</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout._id}>
                    <TableCell>{payout.worker.email}</TableCell>
                    <TableCell align="right">{payout.xpEarned}</TableCell>
                    <TableCell align="right">${payout.monetaryPayment.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {payout.attentionCheckScore}
                    </TableCell>
                    <TableCell align="right">{payout.status}</TableCell>
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

export default SurveyPayoutDetails;
