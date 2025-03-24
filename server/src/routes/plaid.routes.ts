import express from 'express';
import { PlaidController } from '../controllers/plaid.controller';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Create a link token for initializing Plaid Link
router.post('/create-link-token', PlaidController.createLinkToken);

// Exchange public token for access token and get bank account info
router.post('/exchange-token', PlaidController.exchangeToken);

// Process a withdrawal to the user's bank account
router.post('/withdraw', PlaidController.processWithdrawal);

export default router; 