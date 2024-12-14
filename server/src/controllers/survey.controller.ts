import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import ApiError from '../util/apiError.ts';
import Survey from '../models/survey.model.ts';
import { IUser } from '../models/user.model.ts';
import SurveySubmission from '../models/surveySubmission.model.ts';
import SurveyJs from '../models/surveyJs.model.ts';

export const publishSurvey = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    console.log('📨 Publishing survey:', req.params.surveyId);

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const { surveyId } = req.params;

    // Try to update in both collections
    const [updatedSurvey, updatedSurveyJs] = await Promise.all([
      Survey.findOneAndUpdate(
        { _id: surveyId, createdBy: req.user._id },
        { status: 'active' },
        { new: true },
      ),
      SurveyJs.findOneAndUpdate(
        { _id: surveyId, createdBy: req.user._id },
        { status: 'active' },
        { new: true },
      ),
    ]);

    // Check if the survey was found and updated in either collection
    const publishedSurvey = updatedSurvey || updatedSurveyJs;

    if (!publishedSurvey) {
      return res
        .status(404)
        .json({ error: { message: 'Survey not found or unauthorized' } });
    }

    console.log('✅ Survey published:', publishedSurvey._id);
    return res.json({
      data: publishedSurvey,
      message: 'Survey published successfully',
    });
  } catch (error: any) {
    console.error('❌ Error publishing survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const getResearcherSurveys = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    console.log('📧 Fetching surveys for user:', req.user?._id);

    // Fetch from both collections
    const [externalSurveys, jsSurveys] = await Promise.all([
      Survey.find({
        createdBy: req.user?._id,
      }).sort({ createdAt: -1 }),

      SurveyJs.find({
        createdBy: req.user?._id,
      })
        .select('_id title description content createdAt status') // Explicitly select content
        .sort({ createdAt: -1 }),
    ]);

    // Combine and format the results
    const allSurveys = [
      ...externalSurveys,
      ...jsSurveys.map((survey) => ({
        ...survey.toObject(),
        surveyType: 'surveyjs', // Add identifier for frontend
      })),
    ];

    console.log('🔍 Found surveys:', allSurveys.length);
    console.log('📊 Query results:', JSON.stringify(allSurveys, null, 2));

    return res.json(allSurveys);
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    return res.status(500).json({ message: 'Error fetching surveys' });
  }
};

export const getUserSurveys = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const { userEmail } = req.params;
  if (!userEmail) {
    next(ApiError.missingFields(['userId']));
    return;
  }
  try {
    // Fetch from both collections
    const [externalSurveys, jsSurveys] = await Promise.all([
      Survey.find({
        submitterList: userEmail,
      })
        .select('_id title description createdAt surveyUrl status') // Explicitly select content
        .sort({ createdAt: -1 }),

      SurveyJs.find({
        submitterList: userEmail,
      })
        .select('_id title description createdAt status') // Explicitly select content
        .sort({ createdAt: -1 }),
    ]);

    // Combine and format the results
    const allSurveys = [
      ...externalSurveys,
      ...jsSurveys.map((survey) => ({
        ...survey.toObject(),
        surveyType: 'surveyjs', // Add identifier for frontend
      })),
    ];

    console.log('🔍 Found surveys:', allSurveys.length);
    console.log('📊 Query results:', JSON.stringify(allSurveys, null, 2));

    return res.json(allSurveys);
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    return res.status(500).json({ message: 'Error fetching surveys' });
  }
};

export const getAllSurveys = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  try {
    // Fetch from both collections
    const [externalSurveys, jsSurveys] = await Promise.all([
      Survey.find({})
        .select(
          '_id title description createdAt surveyUrl status submitterList',
        ) // Explicitly select content
        .sort({ createdAt: -1 }),

      SurveyJs.find({})
        .select('_id title description createdAt status submitterList') // Explicitly select content
        .sort({ createdAt: -1 }),
    ]);

    // Combine and format the results
    const allSurveys = [
      ...externalSurveys,
      ...jsSurveys.map((survey) => ({
        ...survey.toObject(),
        surveyType: 'surveyjs', // Add identifier for frontend
      })),
    ];

    console.log('🔍 Found surveys:', allSurveys.length);
    console.log('📊 Query results:', JSON.stringify(allSurveys, null, 2));

    return res.json(allSurveys);
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    return res.status(500).json({ message: 'Error fetching surveys' });
  }
};

export const saveSurvey = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    console.log('📨 Received survey save request from user:', req.user?._id);

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const survey = new Survey({
      ...req.body,
      createdBy: (req.user as IUser)._id,
      status: 'draft',
    });

    await survey.save();

    console.log('💾 Survey saved to database with ID:', survey._id);
    res.status(201).json(survey);
  } catch (error: any) {
    console.error('❌ Error saving survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const editSurvey = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const { surveyId } = req.params;
    const updatedSurvey = await Survey.findOneAndUpdate(
      { _id: surveyId, createdBy: req.user._id },
      req.body,
      { new: true },
    );

    if (!updatedSurvey) {
      return res
        .status(404)
        .json({ error: { message: 'Survey not found or unauthorized' } });
    }

    console.log('✅ Updated survey:', updatedSurvey);
    return res.json({
      data: updatedSurvey,
      message: 'Survey updated successfully',
    });
  } catch (error: any) {
    console.error('❌ Error updating survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const deleteSurvey = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const { surveyId } = req.params;

    // Try to delete from both collections
    const [deletedSurvey, deletedSurveyJs] = await Promise.all([
      Survey.findOneAndDelete({
        _id: surveyId,
        createdBy: req.user._id,
        status: 'draft', // Only allow deletion of draft surveys
      }),
      SurveyJs.findOneAndDelete({
        _id: surveyId,
        createdBy: req.user._id,
        status: 'draft', // Only allow deletion of draft surveys
      }),
    ]);

    // Check if the survey was found and deleted in either collection
    const deletedResult = deletedSurvey || deletedSurveyJs;

    if (!deletedResult) {
      return res.status(404).json({
        error: { message: 'Survey not found or cannot be deleted' },
      });
    }

    console.log('✅ Survey deleted:', surveyId);
    return res.json({
      data: deletedResult,
      message: 'Survey deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const submitSurveyCompletion = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    const { surveyId } = req.params;
    const { completionCode } = req.body;
    const workerId = req.user?._id;
    const workerEmail = req.user?.email;

    if (!workerId || !workerEmail) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if survey exists and is active
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.status !== 'active') {
      return res.status(400).json({
        message: 'This survey is no longer accepting submissions',
      });
    }

    // Check if user has already submitted this survey
    const existingSubmission = await SurveySubmission.findOne({
      survey: surveyId,
      worker: workerId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        message: 'You have already submitted this survey',
      });
    }

    // Create submission
    const submission = new SurveySubmission({
      survey: surveyId,
      worker: workerId,
      completionCode,
      submissionUrl: survey.surveyUrl,
      status: 'pending',
    });

    // Add user to submitter list and check if survey is complete
    if (!survey.submitterList) {
      survey.submitterList = [];
    }
    survey.submitterList.push(workerEmail);

    // Check if we've reached the required number of respondents
    if (survey.submitterList.length >= survey.respondents) {
      survey.status = 'completed';
    }

    // Save both the submission and updated survey
    await Promise.all([submission.save(), survey.save()]);

    res.status(201).json({
      message: 'Survey completion submitted successfully',
      data: submission,
    });
  } catch (error) {
    console.error('Failed to submit survey completion:', error);
    // Check if this is a duplicate key error
    if (
      error instanceof Error &&
      error.name === 'MongoServerError' &&
      (error as any).code === 11000
    ) {
      return res.status(400).json({
        message: 'You have already submitted this survey',
      });
    }
    res.status(500).json({
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
};

export const saveSurveyJs = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const { title, description, content } = req.body;
    console.log(' Received survey data:', { title, description });

    if (!content) {
      return res.status(400).json({
        error: { message: 'Survey content is required' },
      });
    }

    const survey = new SurveyJs({
      title,
      description,
      content,
      createdBy: req.user._id,
      status: 'draft',
    });

    await survey.save();
    console.log('💾 Saved survey with ID:', survey._id.toString());

    const responseData = {
      data: {
        _id: survey._id.toString(),
        title: survey.title,
        description: survey.description,
      },
    };
    console.log('📤 Sending response:', responseData);
    return res.status(201).json(responseData);
  } catch (error) {
    console.error('Failed to save survey:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to save survey',
      },
    });
  }
};

export const loadSurveyJs = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const surveys = await SurveyJs.find({ createdBy: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(1);

    if (!surveys.length) {
      return res.status(404).json({ error: { message: 'No surveys found' } });
    }

    res.json({ data: surveys[0] });
  } catch (error) {
    console.error('Failed to load survey:', error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to load survey',
      },
    });
  }
};

export const getDraftSurveys = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const surveys = await SurveyJs.find({
      createdBy: req.user._id,
      status: 'draft',
    })
      .select('_id title')
      .sort({ updatedAt: -1 });

    res.json({ data: surveys });
  } catch (error) {
    console.error('Failed to fetch draft surveys:', error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to fetch surveys',
      },
    });
  }
};

export const editSurveyJs = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Unauthorized' } });
    }

    const { surveyId } = req.params;
    const { title, description, content } = req.body;

    const survey = await SurveyJs.findOneAndUpdate(
      { _id: surveyId, createdBy: req.user._id },
      { title, description, content },
      { new: true },
    );

    if (!survey) {
      return res.status(404).json({
        error: { message: 'Survey not found or unauthorized' },
      });
    }

    return res.json({ data: survey });
  } catch (error) {
    console.error('Failed to update survey:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to update survey',
      },
    });
  }
};

export const getSurveyById = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    const { surveyId } = req.params;
    console.log('🔍 Fetching survey by ID:', surveyId);

    // Try to find in both collections
    const [externalSurvey, jsSurvey] = await Promise.all([
      Survey.findById(surveyId),
      SurveyJs.findById(surveyId).select(
        '_id title description content createdAt status',
      ),
    ]);

    const survey = externalSurvey || jsSurvey;

    if (!survey) {
      return res.status(404).json({ error: { message: 'Survey not found' } });
    }

    console.log('✅ Found survey:', survey._id);
    console.log('Survey content exists:', 'content' in survey);
    return res.json({ data: survey });
  } catch (error) {
    console.error('❌ Error fetching survey:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to fetch survey',
      },
    });
  }
};
