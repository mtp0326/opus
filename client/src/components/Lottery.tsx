import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { runLottery } from '../api/lotteryApi';

interface LotteryResult {
  mainWinner: {
    userId: string;
    name: string;
    xp: number;
    prize: number;
  };
  allPrizes: Array<{
    userId: string;
    amount: number;
  }>;
}

export default function Lottery() {
  const [lotteryPool, setLotteryPool] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunLottery = async () => {
    const poolAmount = parseFloat(lotteryPool);
    if (isNaN(poolAmount) || poolAmount <= 0) {
      setError('Please enter a valid lottery pool amount');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const lotteryResult = await runLottery(poolAmount);
      setResult(lotteryResult);
    } catch (err: any) {
      setError(err.message || 'Failed to run lottery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          XP Lottery
        </Typography>
        <Typography variant="body1" paragraph>
          Run a lottery where users with higher XP have a better chance of
          winning! Prizes are distributed geometrically, with the first place
          winner getting 50% of the pool.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Lottery Pool Amount"
            type="number"
            value={lotteryPool}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setLotteryPool(e.target.value)
            }
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleRunLottery}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Run Lottery'}
          </Button>
        </Box>

        {error && (
          <Typography color="error" paragraph>
            {error}
          </Typography>
        )}

        {result && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Main Winner
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, bgcolor: 'primary.light' }}
            >
              <Typography variant="h5" color="primary.contrastText">
                {result.mainWinner.name}
              </Typography>
              <Typography variant="body1" color="primary.contrastText">
                XP: {result.mainWinner.xp}
              </Typography>
              <Typography variant="h6" color="primary.contrastText">
                Prize: ${result.mainWinner.prize.toFixed(2)}
              </Typography>
            </Paper>

            <Typography variant="h6" gutterBottom>
              All Winners
            </Typography>
            <List>
              {result.allPrizes.map(
                (prize: { userId: string; amount: number }, index: number) => (
                  <React.Fragment key={prize.userId}>
                    <ListItem>
                      <ListItemText
                        primary={`${index + 1}. Prize: $${prize.amount.toFixed(
                          2,
                        )}`}
                        secondary={`User ID: ${prize.userId}`}
                      />
                    </ListItem>
                    {index < result.allPrizes.length - 1 && <Divider />}
                  </React.Fragment>
                ),
              )}
            </List>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
