import express, { Request, Response } from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import {
  publishSurvey,
  getResearcherSurveys,
  getUserSurveys,
  getAllSurveys,
  saveSurvey,
  editSurvey,
  deleteSurvey,
  submitSurveyCompletion,
  saveSurveyJs,
  loadSurveyJs,
  getDraftSurveys,
  editSurveyJs,
  getSurveyById,
  getSurveyResults,
  updateSubmissionsBatch,
  addQualityControlQuestions,
  getStripePayment,
  getRandomSurvey,
  processDocument,
} from '../controllers/survey.controller.ts';
import { IUser } from '../models/user.model.ts';

interface CustomRequest extends Request {
  user?: IUser;
}

const router = express.Router();

/**
 * A GET route to fetch a single survey by ID
 * Expects surveyId in URL params
 */
router.get(
  '/js/:surveyId',
  isAuthenticated,
  getSurveyById as express.RequestHandler,
);

router.post(
  '/js/save',
  isAuthenticated,
  saveSurveyJs as express.RequestHandler,
);

router.get('/js/load', isAuthenticated, loadSurveyJs as express.RequestHandler);

router.get(
  '/js/drafts',
  isAuthenticated,
  getDraftSurveys as express.RequestHandler,
);

router.put(
  '/js/:surveyId/edit',
  isAuthenticated,
  editSurveyJs as express.RequestHandler,
);

/**
 * A GET route to fetch published surveys
 * Expects a query parameter to filter surveys by publisher
 */
router.get(
  '/published',
  isAuthenticated,
  getResearcherSurveys as express.RequestHandler,
);
router.post('/save', isAuthenticated, saveSurvey as express.RequestHandler);

router.get(
  '/all-surveys',
  isAuthenticated,
  getAllSurveys as express.RequestHandler,
);

router.get(
  '/:userEmail/surveys',
  isAuthenticated,
  getUserSurveys as express.RequestHandler,
);

/**
 * A POST route to edit an existing survey
 * Expects surveyId in URL params and survey details in request body
 */
router.put(
  '/:surveyId/edit',
  isAuthenticated,
  editSurvey as express.RequestHandler,
);

/**
 * A PUT route to publish an existing survey
 * Expects surveyId in URL params
 */
router.put(
  '/:surveyId/publish',
  isAuthenticated,
  publishSurvey as express.RequestHandler,
);

/**
 * A PUT route to delete an existing survey
 * Expects surveyId in URL params
 */
router.put(
  '/:surveyId/delete',
  isAuthenticated,
  deleteSurvey as express.RequestHandler,
);

/**
 * A POST route to submit a survey completion
 * Expects surveyId in URL params and completion code in request body
 */
router.post(
  '/:surveyId/submit',
  isAuthenticated,
  submitSurveyCompletion as express.RequestHandler,
);

/**
 * A GET route to fetch survey results
 * Expects surveyId in URL params
 */
router.get(
  '/:surveyId/results',
  isAuthenticated,
  getSurveyResults as express.RequestHandler,
);

/**
 * A PUT route to update submissions batch
 * Expects surveyId in URL params
 */
router.put(
  '/:surveyId/submissions/batch',
  isAuthenticated,
  updateSubmissionsBatch as express.RequestHandler,
);

/**
 * A POST route to add quality control questions to a survey
 */
router.post(
  '/quality-control',
  isAuthenticated,
  addQualityControlQuestions as express.RequestHandler,
);

router.post(
  '/create-checkout-session',
  isAuthenticated,
  getStripePayment as express.RequestHandler,
);

router.get(
  '/random-survey',
  isAuthenticated,
  getRandomSurvey as express.RequestHandler,
);

/**
 * A POST route to process a Word document and convert it to SurveyJS format
 */
router.post(
  '/process-document',
  isAuthenticated,
  processDocument as express.RequestHandler,
);

export default router;
