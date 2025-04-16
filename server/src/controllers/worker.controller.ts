/**
 * All the controller functions containing the logic for routes relating to
 * admin users such as getting all users, deleting users and upgrading users.
 */
import express from 'express';
import ApiError from '../util/apiError.ts';
import StatusCode from '../util/statusCode.ts';
import { IUser } from '../models/user.model.ts';
import {
  getUserByEmail,
  getWorkerInfoFromDB,
  postWorkerTagsFromDB,
} from '../services/user.service.ts';

/**
 * Get all users from the database. Upon success, send the a list of all users in the res body with 200 OK status code.
 */
const getWorkerInfo = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { userEmail } = req.params;
  return (
    getWorkerInfoFromDB(userEmail)
      .then((worker) => {
        if (!worker) {
          return res
            .status(StatusCode.NOT_FOUND)
            .json({ error: 'Worker not found' });
        }
        res.status(StatusCode.OK).json(worker);
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((e) => {
        next(ApiError.internal('Unable to retrieve worker information'));
      })
  );
};

const putWorkerTags = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { userEmail } = req.params;
  if (!userEmail) {
    next(ApiError.missingFields(['email']));
    return;
  }

  const worker: IUser | null = await getUserByEmail(userEmail);
  if (!worker) {
    next(ApiError.notFound(`User with email ${userEmail} does not exist`));
    return;
  }

  if (!Array.isArray(req.body.preferences)) {
    return res.status(400).json({ error: 'Tags must be an array.' });
  }

  return postWorkerTagsFromDB(worker.id, req.body.preferences)
    .then((result) => {
      if (result === null) {
        return res
          .status(StatusCode.INTERNAL_SERVER_ERROR)
          .json({ error: 'Failed to update tags.' });
      }
      res.status(StatusCode.OK).send({ message: 'Tags updated successfully.' });
    })
    .catch((e) => {
      next(ApiError.internal(`Unable to update tags: ${e.message}`));
    });
};

export { getWorkerInfo, putWorkerTags };
