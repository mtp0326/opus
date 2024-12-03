import express from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import { getLeaderboard } from '../controllers/leaderboard.controller.ts';

const router = express.Router();

/**
 * A GET route to fetch the leaderboard
 * This route is protected and requires authentication
 */
router.get('/', isAuthenticated, getLeaderboard as express.RequestHandler);

export default router; 