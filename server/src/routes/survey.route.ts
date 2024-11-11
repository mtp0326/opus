import express, { Request } from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import { createSurvey } from '../controllers/survey.controller.ts';
import { IUser } from '../models/user.model'; // Adjust import path as needed

interface CustomRequest extends Request {
  user?: IUser;
}

const router = express.Router();

/**
 * A POST route to create a new survey
 * Expects a JSON body with the survey details
 */
router.post('/publish', isAuthenticated, createSurvey as express.RequestHandler);

export default router; 