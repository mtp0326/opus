import express, { Request, Response } from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import { createSurvey, getSurveys, saveSurvey } from '../controllers/survey.controller.ts';
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

/**
 * A GET route to fetch published surveys
 * Expects a query parameter to filter surveys by publisher
 */
router.get('/published', isAuthenticated, getSurveys as express.RequestHandler); 

router.post('/save', isAuthenticated, saveSurvey as express.RequestHandler);


export default router; 