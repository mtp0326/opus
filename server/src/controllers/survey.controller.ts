import { Request, Response } from 'express';
import { Survey } from '../models/survey.model';
import mongoose from 'mongoose';
import { IUser } from '../models/user.model.ts';


export const createSurvey = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    console.log('📨 Received survey creation request from user:', req.user?._id);

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const survey = new Survey({
      ...req.body,
      createdBy: (req.user as IUser)._id
    });
    
    await survey.save();
    
    console.log('💾 Survey saved to database with ID:', survey._id);
    res.status(201).json(survey);
  } catch (error: any) {
    console.error('❌ Error creating survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const getSurveys = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    console.log('📧 Fetching surveys for user:', req.user?._id);
    
    const surveys = await Survey.find({ 
      createdBy: req.user?._id
    }).sort({ createdAt: -1 });
    
    console.log('🔍 Found surveys:', surveys.length);
    console.log('📊 Query results:', JSON.stringify(surveys, null, 2));
    
    res.json(surveys);
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    res.status(500).json({ message: 'Error fetching surveys' });
  }
};

export const saveSurvey = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    console.log('📨 Received survey save request from user:', req.user?._id);

    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }

    const survey = new Survey({
      ...req.body,
      createdBy: (req.user as IUser)._id,
      status: 'draft'
    });
    
    await survey.save();
    
    console.log('💾 Survey saved to database with ID:', survey._id);
    res.status(201).json(survey);
  } catch (error: any) {
    console.error('❌ Error saving survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const editSurvey = async (req: Request, res: Response) => {
  try {
    const { surveyId } = req.params;
    const updatedSurvey = await Survey.findByIdAndUpdate(
      surveyId,
      req.body,
      { new: true }
    );

    if (!updatedSurvey) {
      return res.status(404).json({ error: { message: 'Survey not found' } });
    }

    res.json({ data: updatedSurvey });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to update survey' } });
  }
}; 