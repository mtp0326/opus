/**
 * Specifies the middleware and controller functions to call for each route
 * relating to admin users.
 */
import express from 'express';
import { isAuthenticated } from '../controllers/auth.middleware.ts';
import {
  getWorkerInfo,
  promoteUser,
  putWorkerTags,
} from '../controllers/worker.controller.ts';
import 'dotenv/config';

const router = express.Router();

/**
 * A GET route to get all users. Checks first if the requestor is a
 * authenticated and is an admin.
 */
router.get('/:userEmail', isAuthenticated, getWorkerInfo);

/**
 * A GET route to get all users. Checks first if the requestor is a
 * authenticated and is an admin.
 */
router.put('/:userEmail/tags', isAuthenticated, putWorkerTags);

/**
 * A PUT route to promote a user to the next league.
 */
router.put('/:userEmail/promote', isAuthenticated, promoteUser);

export default router;
