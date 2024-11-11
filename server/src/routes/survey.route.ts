import express from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import { createSurvey } from '../controllers/survey.controller.ts';

const router = express.Router();

/**
 * A POST route to create a new survey
 * Expects a JSON body with the survey details
 */
router.post('/', isAuthenticated, createSurvey);

export default router; 