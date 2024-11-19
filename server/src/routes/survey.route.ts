import express, { Request, Response } from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import { publishSurvey, getSurveys, saveSurvey, editSurvey, deleteSurvey } from '../controllers/survey.controller.ts';
import { IUser } from '../models/user.model'; // Adjust import path as needed

interface CustomRequest extends Request {
  user?: IUser;
}

const router = express.Router();

/**
 * A GET route to fetch published surveys
 * Expects a query parameter to filter surveys by publisher
 */
router.get('/published', isAuthenticated, getSurveys as express.RequestHandler); 

router.post('/save', isAuthenticated, saveSurvey as express.RequestHandler);

/**
 * A POST route to edit an existing survey
 * Expects surveyId in URL params and survey details in request body
 */
router.put('/:surveyId/edit', isAuthenticated, editSurvey as express.RequestHandler);

/**
 * A PUT route to publish an existing survey
 * Expects surveyId in URL params
 */
router.put('/:surveyId/publish', isAuthenticated, publishSurvey as express.RequestHandler);

/**
 * A PUT route to delete an existing survey
 * Expects surveyId in URL params
 */
router.put('/:surveyId/delete', isAuthenticated, deleteSurvey as express.RequestHandler);

export default router; 