import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { OpenAI } from 'openai';
import multer from 'multer';
import mammoth from 'mammoth';
import ApiError from '../util/apiError.ts';
import Survey from '../models/survey.model.ts';
import { User, IUser } from '../models/user.model.ts';
import SurveySubmission from '../models/surveySubmission.model.ts';
import SurveyJs from '../models/surveyJs.model.ts';
import SurveyJsSubmission from '../models/surveyJsSubmission.model.ts';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/msword'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .doc and .docx files are allowed'));
    }
  },
}).single('document');

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
          '_id title description reward timeToComplete createdAt surveyUrl status submitterList',
        ) // Explicitly select content
        .sort({ createdAt: -1 }),

      SurveyJs.find({})
        .select(
          '_id title description reward timeToComplete createdAt surveyUrl status submitterList',
        ) // Explicitly select content
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
    const { completionCode, responseData } = req.body;
    const workerId = req.user?._id;
    const workerEmail = req.user?.email;

    const worker = await User.findById(workerId);

    if (!workerId || !workerEmail || !worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if survey exists in either collection
    const [externalSurvey, jsSurvey] = await Promise.all([
      Survey.findById(surveyId),
      SurveyJs.findById(surveyId),
    ]);

    const survey = externalSurvey || jsSurvey;
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.status !== 'active') {
      return res.status(400).json({
        message: 'This survey is no longer accepting submissions',
      });
    }

    // Check if user has already submitted this survey
    const existingSubmission = jsSurvey
      ? await SurveyJsSubmission.findOne({
          survey: surveyId,
          worker: workerId,
        })
      : await SurveySubmission.findOne({
          survey: surveyId,
          worker: workerId,
        });

    if (existingSubmission) {
      return res.status(400).json({
        message: 'You have already submitted this survey',
      });
    }

    // Calculate XP and attention check score for SurveyJS submissions
    let xpEarned = 0;
    let attentionCheckScore = '0/0';
    let submission;

    if (jsSurvey && responseData) {
      // Get the count of existing submissions to determine rank
      const submissionCount = await SurveyJsSubmission.countDocuments({
        survey: surveyId,
      });
      const rank = submissionCount + 1;

      // Calculate base XP
      const totalXPPool = (survey.reward || 0) * 100;
      const baseXPPerSubmission = totalXPPool / (survey.respondents || 1);

      // Calculate rank bonus (max 5% difference)
      const rankBonus = Math.max(
        0,
        (1 - rank / (survey.respondents || 1)) * 0.05,
      );
      // Check attention check questions
      let passedChecks = 0;
      let totalChecks = 0;

      // Find quality control page in survey content
      const surveyContent = jsSurvey.content;
      const qcPage = surveyContent.pages?.find(
        (page: any) => page.name === 'quality_control',
      );
      if (qcPage) {
        totalChecks = qcPage.elements?.length || 0;
        passedChecks =
          qcPage.elements?.reduce((count: number, element: any) => {
            const response = responseData[element.name];
            // Check if the response matches the correct answer
            // For now, assuming correct answer is always "Item 1"
            return count + (response === 'Item 1' ? 1 : 0);
          }, 0) || 0;
      }

      // Calculate attention check multiplier
      const attentionCheckMultiplier =
        totalChecks > 0
          ? 1 - ((totalChecks - passedChecks) / totalChecks) * 0.5
          : 1;

      // Calculate final XP
      xpEarned = Math.round(
        baseXPPerSubmission * (1 + rankBonus) * attentionCheckMultiplier,
      );

      // Set attention check score
      attentionCheckScore = `${passedChecks}/${totalChecks}`;

      // Create submission with XP and attention check score
      submission = new SurveyJsSubmission({
        survey: surveyId,
        worker: workerId,
        responseData,
        status: 'pending',
        rank,
        xpEarned,
        attentionCheckScore,
      });
    } else {
      // For external surveys, use base reward
      xpEarned = survey.reward || 0;
      submission = new SurveySubmission({
        survey: surveyId,
        worker: workerId,
        completionCode,
        submissionUrl: survey.surveyUrl || '',
        status: 'pending',
      });
    }

    // Add user to submitter list
    if (!survey.submitterList) {
      survey.submitterList = [];
    }
    survey.submitterList.push(workerEmail);

    // Count both pending and approved submissions
    const validSubmissionsCount = await (jsSurvey
      ? SurveyJsSubmission.countDocuments({
          survey: surveyId,
          status: { $in: ['pending', 'approved'] },
        })
      : SurveySubmission.countDocuments({
          survey: surveyId,
          status: { $in: ['pending', 'approved'] },
        }));

    // Check if we've reached the required number of valid submissions
    if (validSubmissionsCount >= (survey.respondents || 0)) {
      survey.status = 'completed';
    }

    // Add survey points to the user's total points
    if (xpEarned > 0) {
      worker.points = (worker.points || 0) + xpEarned;
    }

    worker.surveysCompleted = (worker.surveysCompleted || 0) + 1;

    // Save both the submission and updated survey
    await Promise.all([submission.save(), survey.save(), worker.save()]);

    res.status(201).json({
      message: 'Survey completion submitted successfully',
      data: {
        ...submission.toObject(),
        xpEarned,
        attentionCheckScore,
      },
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
    const {
      title,
      description,
      content,
      reward,
      respondents,
      timeToComplete,
      expiresIn,
      workerQualifications,
    } = req.body;

    const survey = await SurveyJs.findOneAndUpdate(
      {
        _id: surveyId,
        createdBy: req.user._id,
        status: 'draft', // Only allow editing of draft surveys
      },
      {
        title,
        description,
        content,
        reward,
        respondents,
        timeToComplete,
        expiresIn,
        workerQualifications,
      },
      { new: true },
    );

    if (!survey) {
      // Check if survey exists but is not in draft status
      const existingSurvey = await SurveyJs.findOne({ _id: surveyId });
      if (existingSurvey && existingSurvey.status !== 'draft') {
        return res.status(400).json({
          error: { message: 'Only draft surveys can be edited' },
        });
      }
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

    if (!surveyId) {
      return res
        .status(400)
        .json({ error: { message: 'Survey ID is required' } });
    }

    // Since this is called from /js/:surveyId, we only need to look in SurveyJs collection
    const survey = await SurveyJs.findById(surveyId).select(
      'content reward respondents',
    );
    console.log('Found survey:', survey ? 'yes' : 'no');

    if (!survey) {
      return res.status(404).json({ error: { message: 'Survey not found' } });
    }

    // Return the survey data
    console.log('✅ Returning survey data');
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

export const getSurveyResults = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    const { surveyId } = req.params;
    console.log('🔍 Fetching results for survey:', surveyId);

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    // Check if survey exists in either collection
    const [externalSurvey, jsSurvey] = await Promise.all([
      Survey.findOne({ _id: surveyId, createdBy: req.user._id }),
      SurveyJs.findOne({ _id: surveyId, createdBy: req.user._id }),
    ]);

    const survey = externalSurvey || jsSurvey;
    if (!survey) {
      return res
        .status(404)
        .json({ error: { message: 'Survey not found or unauthorized' } });
    }

    // Check if survey has expired, comment out for testing
    // if (survey.status === 'active' && survey.expiresIn) {
    //   const createdDate = new Date(survey.createdAt);
    //   const expirationDate = new Date(
    //     createdDate.getTime() + survey.expiresIn * 24 * 60 * 60 * 1000,
    //   );

    //   if (new Date() > expirationDate) {
    //     // Update survey status to completed if expired
    //     survey.status = 'completed';
    //     await survey.save();
    //   }
    // }

    // Get submissions based on survey type and sort by rank
    const submissions = jsSurvey
      ? await SurveyJsSubmission.find({ survey: surveyId }).sort({ rank: 1 })
      : await SurveySubmission.find({ survey: surveyId }).sort({
          submittedAt: 1,
        });

    console.log('✅ Found submissions:', submissions.length);
    return res.json({
      data: {
        submissions,
        surveyType: jsSurvey ? 'surveyjs' : 'external',
        surveyDetails: {
          title: survey.title,
          description: survey.description,
          respondents: survey.respondents || 0,
          status: survey.status,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error fetching survey results:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch survey results',
      },
    });
  }
};

export const updateSubmissionsBatch = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    const { surveyId } = req.params;
    const { submissionIds, status } = req.body;

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    if (!submissionIds || !Array.isArray(submissionIds) || !status) {
      return res.status(400).json({
        error: { message: 'Invalid request. Missing submissionIds or status' },
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: { message: 'Invalid status. Must be "approved" or "rejected"' },
      });
    }

    // Check if the survey exists and belongs to the user
    const [externalSurvey, jsSurvey] = await Promise.all([
      Survey.findOne({ _id: surveyId, createdBy: req.user._id }),
      SurveyJs.findOne({ _id: surveyId, createdBy: req.user._id }),
    ]);

    const survey = externalSurvey || jsSurvey;
    if (!survey) {
      return res.status(404).json({
        error: { message: 'Survey not found or unauthorized' },
      });
    }

    // Get the submissions to process
    const submissions = jsSurvey
      ? await SurveyJsSubmission.find({
          _id: { $in: submissionIds },
          survey: surveyId,
          status: 'pending',
        })
      : await SurveySubmission.find({
          _id: { $in: submissionIds },
          survey: surveyId,
          status: 'pending',
        });

    // If rejecting submissions, deduct points from users
    if (status === 'rejected' && survey.reward) {
      const userIds = submissions.map((sub) => sub.worker);
      const users = await User.find({ _id: { $in: userIds } });

      // Deduct points from each user
      await Promise.all(
        users.map(async (user) => {
          const rewardAmount = survey.reward || 0; // Add type safety
          user.points = Math.max(0, (user.points || 0) - rewardAmount);
          user.surveysCompleted = Math.max(0, (user.surveysCompleted || 0) - 1);
          await user.save();
        }),
      );
    }

    // Update submissions based on survey type
    const updatePromise = jsSurvey
      ? SurveyJsSubmission.updateMany(
          {
            _id: { $in: submissionIds },
            survey: surveyId,
            status: 'pending', // Only update pending submissions
          },
          {
            $set: {
              status,
              reviewedAt: new Date(),
            },
          },
        )
      : SurveySubmission.updateMany(
          {
            _id: { $in: submissionIds },
            survey: surveyId,
            status: 'pending', // Only update pending submissions
          },
          {
            $set: {
              status,
              reviewedAt: new Date(),
            },
          },
        );

    const result = await updatePromise;

    // Count both pending and approved submissions
    const validSubmissionsCount = await (jsSurvey
      ? SurveyJsSubmission.countDocuments({
          survey: surveyId,
          status: { $in: ['pending', 'approved'] },
        })
      : SurveySubmission.countDocuments({
          survey: surveyId,
          status: { $in: ['pending', 'approved'] },
        }));

    // Check if we've reached the required number of valid submissions
    if (validSubmissionsCount >= (survey.respondents || 0)) {
      survey.status = 'completed';
      await survey.save();
    }

    console.log(`✅ Updated ${result.modifiedCount} submissions to ${status}`);
    return res.json({
      message: `Successfully updated ${result.modifiedCount} submissions`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('❌ Error updating submissions:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update submissions',
      },
    });
  }
};

export const addQualityControlQuestions = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    console.log('🎯 Starting quality control questions generation...');

    const { surveyJson } = req.body;

    console.log('📋 Received request:', {
      hasSurveyJson: !!surveyJson,
      surveyJsonKeys: surveyJson ? Object.keys(surveyJson) : [],
    });

    if (!surveyJson) {
      console.log('❌ No survey JSON provided');
      return res.status(400).json({
        error: { message: 'Survey JSON is required' },
      });
    }

    // Extract existing questions from the provided survey JSON
    console.log('📊 Analyzing survey structure...');
    const pages = surveyJson.pages || [];
    const existingQuestions = pages
      .flatMap((page: any) => page.elements || [])
      .map((element: any) => element.title || element.name)
      .join('\n');

    // Count total questions
    const totalQuestions = pages.reduce((count: number, page: any) => {
      return count + (page.elements?.length || 0);
    }, 0);

    // Determine number of QC questions based on survey length
    let numQCQuestions;
    if (totalQuestions <= 5) {
      numQCQuestions = 1;
    } else if (totalQuestions <= 10) {
      numQCQuestions = 2;
    } else if (totalQuestions <= 20) {
      numQCQuestions = 3;
    } else {
      numQCQuestions = 4;
    }

    console.log('📈 Survey analysis:', {
      totalPages: pages.length,
      totalQuestions,
      numQCQuestions,
      existingQuestions: existingQuestions.split('\n').length,
    });

    // Generate quality control questions using OpenAI
    console.log('🤖 Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a survey expert. Generate ${numQCQuestions} quality control questions that will help verify if respondents are paying attention. Return them in a specific JSON format that matches the SurveyJS schema.`,
        },
        {
          role: 'user',
          content: `Here are the existing survey questions/context:\n${existingQuestions}\n\nGenerate ${numQCQuestions} quality control questions that would be appropriate for this survey. Return them in this exact format:
{
  "pages": [
    {
      "name": "quality_control",
      "elements": [
        {
          "type": "radiogroup",
          "name": "qc_1",
          "title": "Your quality control question here",
          "choices": [
            {
              "value": "Item 1",
              "text": "First choice"
            },
            {
              "value": "Item 2",
              "text": "Second choice"
            },
            {
              "value": "Item 3",
              "text": "Third choice"
            }
          ]
        }
      ]
    }
  ]
}

Important format notes:
1. Keep the exact structure with "pages" array containing one page
2. The page should have "name": "quality_control"
3. Each question should be of type "radiogroup"
4. Question names should be "qc_1", "qc_2", etc.
5. Make questions that are clear attention checks
6. Each choice must have both "value" and "text" properties
7. Values should be "Item 1", "Item 2", etc.
8. Keep the structure minimal - only include the shown fields`,
        },
      ],
      temperature: 0.0,
    });
    console.log('✅ Received response from OpenAI');

    // Parse the generated questions
    const { content } = completion.choices[0].message;
    if (!content) {
      console.log('❌ No content received from OpenAI');
      throw new Error('No content received from OpenAI');
    }

    console.log('📄 Parsing OpenAI response:', content);
    const generatedQuestions = JSON.parse(content);

    // Since the response is already in the correct format, we can use it directly
    const updatedSurveyJson = {
      ...surveyJson,
      pages: [...surveyJson.pages, ...generatedQuestions.pages],
    };

    console.log('✅ Successfully generated QC questions');
    console.log('📊 Updated survey structure:', {
      totalPages: updatedSurveyJson.pages.length,
      qcPageIndex: updatedSurveyJson.pages.length - 1,
      qcQuestionsCount: generatedQuestions.pages[0].elements.length,
    });

    return res.json({
      data: updatedSurveyJson,
      message: 'Quality control questions added successfully',
    });
  } catch (error) {
    console.error('❌ Error adding quality control questions:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to add quality control questions',
      },
    });
  }
};

export const getStripePayment = async (req: Request, res: Response) => {
  try {
    const { amount, surveyId, title } = req.body;
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Survey Payment For ${title}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/manage-tasks?payment=success`, // Add payment status
      cancel_url: `${process.env.CLIENT_URL}/create-publish-test?payment=failure`,
    });

    res.status(201).json({
      message: 'Checkout session created successfully',
      url: stripeSession.url,
    });
  } catch (error) {
    console.error('❌ Error creating Stripe session:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session',
      },
    });
  }
};

export const getRandomSurvey = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    console.log('🎲 Fetching random active survey');

    // Get all active surveys that the user hasn't submitted yet and have non-empty content
    const activeSurveys = await SurveyJs.aggregate([
      {
        $match: {
          status: 'active',
          // Exclude surveys where user's email is in submitterList
          submitterList: {
            $not: { $in: [req.user?.email] },
          },
          // Ensure content is not an empty object
          content: { $ne: {} },
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          reward: 1,
          respondents: 1,
        },
      },
      { $sample: { size: 1 } }, // Get random document
    ]);

    if (!activeSurveys.length) {
      return res.json({ data: 0 });
    }

    const randomSurvey = activeSurveys[0];
    console.log('✅ Found random survey:', randomSurvey._id);

    return res.json({ data: randomSurvey });
  } catch (error) {
    console.error('❌ Error fetching random survey:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to fetch random survey',
      },
    });
  }
};

export const processDocument = async (
  req: Request & { user?: IUser },
  res: Response,
) => {
  try {
    // Handle file upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          error: { message: err.message },
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: { message: 'No file uploaded' },
        });
      }

      try {
        // Extract text from Word document
        const result = await mammoth.extractRawText({
          buffer: req.file.buffer,
        });
        const text = result.value;

        // Use OpenAI to convert the text to SurveyJS format
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a survey expert. Convert the provided document text into a SurveyJS compatible JSON format. Each question should be properly formatted with appropriate question types and choices.`,
            },
            {
              role: 'user',
              content: `Convert the following questions into SurveyJS format. Use appropriate question types (radiogroup for multiple choice, text for open-ended, etc.). Return only valid JSON that matches this structure, the question "type" can be different based on the question:
{
  "pages": [
    {
      "name": "page1",
      "elements": [
        {
          "type": "radiogroup",
          "name": "question1",
          "title": "Question text here",
          "choices": [
            {
              "value": "Item 1",
              "text": "First choice"
            },
            {
              "value": "Item 2",
              "text": "Second choice"
            }
          ]
        }
      ]
    }
  ]
}

Here are the questions to convert:

${text}`,
            },
          ],
          temperature: 0.0,
        });

        const { content } = completion.choices[0].message;
        if (!content) {
          throw new Error('No content received from OpenAI');
        }

        // Parse and validate the generated JSON
        const surveyJson = JSON.parse(content);

        console.log('✅ Successfully converted document to SurveyJS format');
        return res.json({
          data: surveyJson,
          message: 'Document processed successfully',
        });
      } catch (error) {
        console.error('❌ Error processing document:', error);
        return res.status(500).json({
          error: {
            message:
              error instanceof Error
                ? error.message
                : 'Failed to process document',
          },
        });
      }
    });
  } catch (error) {
    console.error('❌ Error handling file upload:', error);
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to handle file upload',
      },
    });
  }
};
