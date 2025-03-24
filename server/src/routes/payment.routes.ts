import express from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Get payment history
router.get('/history', PaymentController.getPaymentHistory);

// Get current balance
router.get('/balance', PaymentController.getCurrentBalance);

// Get total earnings within a date range
router.get('/earnings', PaymentController.getTotalEarnings);

// Process a withdrawal
router.post('/withdraw', PaymentController.processWithdrawal);

export default router; 