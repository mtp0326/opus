/**
 * All the middleware functions related to authentication
 */
import express from 'express';
import { Request } from 'express';
import ApiError from '../util/apiError.ts';

// Extend the Express Request interface to include the user type
declare global {
  namespace Express {
    interface User {
      userType: string; // Ensure this matches your user structure
      // ... other properties ...
    }
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to check if a user is authenticated using any Passport Strategy
 * and creates an {@link ApiError} to pass on to error handlers if not
 */
const isAuthenticated = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // TODO: remove this in prod
  console.log(isAuthenticated);
  if (req.isAuthenticated()) {
    next(); // Go to the next non-error-handling middleware
    return;
  }
  // Providing a parameter means go to the next error handler
  next(ApiError.unauthorized('Must be logged in.'));
};

/**
 * Middleware to check if the authenticated user is a researcher
 * and creates an {@link ApiError} to pass on to error handlers if not
 */
const isResearcher = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Check if the user has the 'researcher' role
  if (req.user && req.user.userType === 'researcher') {
    next(); // Go to the next non-error-handling middleware
    return;
  }

  // Providing a parameter means go to the next error handler
  next(ApiError.forbidden('Must be a researcher.'));
};

const isWorker = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Check if the user has the 'researcher' role
  if (req.user && req.user.userType === 'worker') {
    next(); // Go to the next non-error-handling middleware
    return;
  }

  // Providing a parameter means go to the next error handler
  next(ApiError.forbidden('Must be a worker.'));
};

// eslint-disable-next-line import/prefer-default-export
export { isAuthenticated, isResearcher, isWorker };
export { isAuthenticated, isResearcher, isWorker };
