/**
 * All the controller functions containing the logic for routes relating to a
 * user's authentication such as login, logout, and registration.
 */
import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import { hash } from 'bcrypt';
import { logger_info } from '../config/configDatadog.ts';
import { IUser } from '../models/user.model.ts';
import StatusCode from '../util/statusCode.ts';
import {
  passwordHashSaltRounds,
  createUser,
  getUserByEmail,
  getUserByResetPasswordToken,
  getUserByVerificationToken,
  getAllAccounts,
} from '../services/user.service.ts';
import {
  emailResetPasswordLink,
  emailVerificationLink,
} from '../services/mail.service.ts';
import ApiError from '../util/apiError.ts';
import {
  getInviteByToken,
  removeInviteByToken,
} from '../services/invite.service.ts';
import { IInvite } from '../models/invite.model.ts';
import mixpanel from '../config/configMixpanel.ts';

/**
 * A controller function to login a user and create a session with Passport.
 * On success, the user's information is returned.
 * Else, send an appropriate error message.
 */

const login = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.isAuthenticated()) {
    next(ApiError.badRequest('Already logged in'));
    return;
  }

  const { email, userType } = req.body;

  // Retrieve users with the same email
  const users = ((await getAllAccounts(email.toLowerCase())) as IUser[]) || [];

  if (users.length === 0) {
    return next(ApiError.unauthorized('No account found with this email'));
  }

  // Find the user that matches the requested userType
  const user = users.find((u) => u.userType === userType);

  if (!user) {
    return next(ApiError.unauthorized(`No ${userType} account found`));
  }

  // Proceed with authentication
  passport.authenticate(
    ['local'],
    {
      failureMessage: true,
    },
    (err: Error | null, authenticatedUser: any, _info: any) => {
      if (err) {
        next(ApiError.internal('Failed to authenticate user.'));
        return;
      }
      if (!authenticatedUser) {
        next(ApiError.unauthorized('Incorrect credentials'));
        return;
      }
      if (!authenticatedUser.verified) {
        next(ApiError.unauthorized('Need to verify account by email'));
        return;
      }

      req.logIn(authenticatedUser, (error) => {
        if (error) {
          next(ApiError.internal('Failed to log in user'));
          return;
        }

        // Mixpanel login tracking
        mixpanel.track('Login', {
          distinct_id: authenticatedUser._id,
          email: authenticatedUser.email,
        });

        // Datadog login
        logger_info.info('Login');
        res.status(StatusCode.OK).send(authenticatedUser);
      });
    },
  )(req, res, next);
};

/**
 * A controller function to logout a user with Passport and clear the session.
 */
const logout = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Logout with Passport which modifies the request object
  req.logout((err) => {
    if (err) {
      next(ApiError.internal('Failed to log out user'));
      return;
    }
    // Destroy the session
    if (req.session) {
      req.session.destroy((e) => {
        if (e) {
          next(ApiError.internal('Unable to logout properly'));
        } else {
          res.sendStatus(StatusCode.OK);
        }
      });
    }
    // Datadog logout
    logger_info.info('Logout');

    // Mixpanel logout tracking
    mixpanel.track('Logout', {
      distinct_id: req.user ? (req.user as IUser)._id : undefined,
      email: req.user ? (req.user as IUser).email : undefined,
    });
  });
};

/**
 * A controller function to register a user in the database.
 */
const register = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { firstName, lastName, email, password, userType } = req.body;
  if (!firstName || !lastName || !email || !password || !userType) {
    next(
      ApiError.missingFields([
        'firstName',
        'lastName',
        'email',
        'password',
        'userType',
      ]),
    );
    return;
  }

  // Validate userType
  if (!['researcher', 'worker'].includes(userType)) {
    next(
      ApiError.badRequest(
        'Invalid user type. Must be either "researcher" or "worker".',
      ),
    );
    return;
  }

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;

  const passwordRegex = /^[a-zA-Z0-9!?$%^*)(+=._-]{6,61}$/;

  const nameRegex = /^[a-z ,.'-]+/i;

  if (
    !email.match(emailRegex) ||
    !password.match(passwordRegex) ||
    !firstName.match(nameRegex) ||
    !lastName.match(nameRegex)
  ) {
    next(ApiError.badRequest('Invalid email, password, or name.'));
    return;
  }

  if (req.isAuthenticated()) {
    next(ApiError.badRequest('Already logged in.'));
    return;
  }
  const lowercaseEmail = email.toLowerCase();
  // Check if user exists
  const existingUser =
    ((await getAllAccounts(email.toLowerCase())) as IUser[]) || [];
  // Find the user that matches the requested userType
  const userWithType = existingUser.find((u) => u.userType === userType);
  console.log('User with specified type:', userWithType);
  if (userWithType) {
    next(
      ApiError.badRequest(
        `An account with email ${lowercaseEmail} already exists.`,
      ),
    );
    return;
  }

  // Create user and send verification email
  try {
    const user = await createUser(
      firstName,
      lastName,
      lowercaseEmail,
      password,
      userType,
    );

    // Don't need verification email if testing
    if (process.env.NODE_ENV === 'test') {
      user!.verified = true;
      await user?.save();
    } else {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user!.verificationToken = verificationToken;
      await user!.save();
      await emailVerificationLink(lowercaseEmail, verificationToken);
    }
    // Mixpanel Register tracking
    mixpanel.track('Register', {
      distinct_id: user?._id,
      email: user?.email,
    });

    res.sendStatus(StatusCode.CREATED);
  } catch (err) {
    next(ApiError.internal('Unable to register user.'));
  }
};

/**
 * A dummy controller function which sends a 200 OK status code. Should be used to close a request after a middleware call.
 */
export const approve = (req: express.Request, res: express.Response) => {
  // TODO: remove this in prod
  console.log('User data in approve:', req.user);
  res.status(200).json({
    error: false,
    user: req.user,
  });
};

/**
 * A controller function to verify an account with a verification token.
 */
const verifyAccount = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { token } = req.body;
  if (!token) {
    next(ApiError.missingFields(['token']));
    return;
  }

  const user = await getUserByVerificationToken(token);
  if (!user) {
    next(ApiError.badRequest('Invalid verification token.'));
    return;
  }
  user!.verificationToken = undefined;
  user!.verified = true;
  try {
    await user!.save();
    // mixpanel tracking
    mixpanel.track('Verify Account', {
      distinct_id: user._id,
      email: user.email,
    });
    res.sendStatus(StatusCode.OK);
  } catch (err) {
    next(ApiError.internal('Unable to verify the account.'));
  }
};

/**
 * A controller function to send a password reset link to a user's email.
 */
const sendResetPasswordEmail = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { email } = req.body;
  if (!email) {
    next(ApiError.missingFields(['email']));
    return;
  }
  const lowercaseEmail = email.toLowerCase();

  const user: IUser | null = await getUserByEmail(lowercaseEmail);
  if (!user) {
    next(
      ApiError.notFound(`No user with email ${lowercaseEmail} is registered.`),
    );
    return;
  }

  // Generate a token for the user for this reset link
  const token = crypto.randomBytes(32).toString('hex');
  user!.resetPasswordToken = token;
  user!.resetPasswordTokenExpiryDate = new Date(
    new Date().getTime() + 60 * 60 * 1000,
  ); // Expires in an hour
  await user!.save();

  // Send the email and return an appropriate response
  emailResetPasswordLink(lowercaseEmail, token)
    .then(() =>
      res.status(StatusCode.CREATED).send({
        message: `Reset link has been sent to ${lowercaseEmail}`,
      }),
    )
    .catch(() => {
      next(ApiError.internal('Failed to email reset password link.'));
    });
};

/**
 * A controller function to reset a user's password.
 */
const resetPassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { password, token } = req.body;
  if (!password || !token) {
    next(ApiError.missingFields(['password', 'token']));
    return;
  }

  const user: IUser | null = await getUserByResetPasswordToken(token);
  if (!user) {
    next(ApiError.badRequest('Invalid reset password token.'));
    return;
  }

  if (Date.now() > user.resetPasswordTokenExpiryDate!.getTime()) {
    next(ApiError.forbidden('Reset password token has expired.'));
    return;
  }
  // Hash the password before storing
  let hashedPassword: string | undefined;
  try {
    hashedPassword = await hash(password, passwordHashSaltRounds);
  } catch (err) {
    next(ApiError.internal('Unable to reset the password'));
    return;
  }

  // Set new password for user
  user!.password = hashedPassword;
  user!.resetPasswordToken = undefined;
  user!.resetPasswordTokenExpiryDate = undefined;
  try {
    await user.save();
    res.sendStatus(StatusCode.OK);
  } catch (err) {
    next(ApiError.internal('Unable to reset the password'));
  }
};

const registerInvite = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { firstName, lastName, email, password, inviteToken } = req.body;
  if (!firstName || !lastName || !email || !password) {
    next(
      ApiError.missingFields([
        'firstName',
        'lastName',
        'email',
        'password',
        'inviteToken',
      ]),
    );
    return;
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/g;

  const passwordRegex = /^[a-zA-Z0-9!?$%^*)(+=._-]{6,61}$/;

  const nameRegex = /^[a-z ,.'-]+/i;

  if (
    !email.match(emailRegex) ||
    !password.match(passwordRegex) ||
    !firstName.match(nameRegex) ||
    !lastName.match(nameRegex)
  ) {
    next(ApiError.badRequest('Invalid email, password, or name.'));
    return;
  }

  if (req.isAuthenticated()) {
    next(ApiError.badRequest('Already logged in.'));
    return;
  }

  // Check if invite exists
  const invite: IInvite | null = await getInviteByToken(inviteToken);
  if (!invite || invite.email !== email) {
    next(ApiError.badRequest(`Invalid invite`));
    return;
  }

  const lowercaseEmail = email.toLowerCase();
  // Check if user exists
  const existingUser: IUser | null = await getUserByEmail(lowercaseEmail);
  if (existingUser) {
    next(
      ApiError.badRequest(
        `An account with email ${lowercaseEmail} already exists.`,
      ),
    );
    return;
  }

  // Create user
  try {
    const user = await createUser(
      firstName,
      lastName,
      lowercaseEmail,
      password,
      'worker', // set userType to worker by default, should be changed later
    );
    user!.verified = true;
    await user?.save();
    await removeInviteByToken(inviteToken);
    res.sendStatus(StatusCode.CREATED);
  } catch (err) {
    next(ApiError.internal('Unable to register user.'));
  }
};

export {
  login,
  logout,
  register,
  verifyAccount,
  sendResetPasswordEmail,
  resetPassword,
  registerInvite,
};
