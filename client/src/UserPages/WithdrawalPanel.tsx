import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';

interface BankAccount {
  account_id: string;
  name: string;
  type: string;
  balance: {
    available: number;
    current: number;
  };
}

export const WithdrawalPanel: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch user's current balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get('/api/user/balance');
        setBalance(response.data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    fetchBalance();
  }, []);

  // Plaid Link configuration
  const { open, ready } = usePlaidLink({
    token: null, // Will be set when creating link token
    onSuccess: async (publicToken, metadata) => {
      try {
        const response = await axios.post('/api/plaid/exchange-token', {
          publicToken,
        });
        setAccounts(response.data.accounts);
        setError('');
      } catch (error) {
        setError('Failed to link bank account');
      }
    },
    onExit: () => {
      setError('Bank account linking cancelled');
    },
    onError: (error) => {
      setError('Error linking bank account');
    },
    onLoad: () => {},
    onEvent: (eventName) => {},
    language: 'en',
    countryCodes: ['US'],
  });

  // Handle bank account linking
  const handleLinkAccount = async () => {
    try {
      const response = await axios.post('/api/plaid/create-link-token');
      open();
    } catch (error) {
      setError('Failed to initialize bank account linking');
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!amount || !selectedAccount) {
      setError('Please enter an amount and select a bank account');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      await axios.post('/api/plaid/withdraw', {
        amount: withdrawalAmount,
        accountId: selectedAccount,
      });
      setSuccess('Withdrawal processed successfully');
      setAmount('');
      setError('');
    } catch (error) {
      setError('Failed to process withdrawal');
    }
  };

  return (
    <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Withdraw Funds
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Current Balance: ${balance.toFixed(2)}</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {accounts.length === 0 ? (
          <Button
            variant="contained"
            onClick={handleLinkAccount}
            disabled={!ready}
            sx={{ mb: 2 }}
          >
            Link Bank Account
          </Button>
        ) : (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Bank Account</InputLabel>
              <Select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                label="Select Bank Account"
              >
                {accounts.map((account) => (
                  <MenuItem key={account.account_id} value={account.account_id}>
                    {account.name} - ${account.balance.available.toFixed(2)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleWithdraw}
              disabled={!selectedAccount || !amount}
              fullWidth
            >
              Withdraw
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}; 