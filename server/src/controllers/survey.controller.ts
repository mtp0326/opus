import { Request, Response } from 'express';
import { Survey } from '../models/survey.model';
import mongoose from 'mongoose';
import { IUser } from '../models/user.model.ts';


export const createSurvey = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    console.log('📨 Received survey creation request from user:', req.user?.email);

    if (!req.user?.email) {
      throw new Error('User not authenticated');
    }

    const survey = new Survey({
      ...req.body,
      createdBy: (req.user as IUser).email
    });
    
    await survey.save();
    
    console.log('💾 Survey saved to database with ID:', survey._id);
    res.status(201).json(survey);
  } catch (error: any) {
    console.error('❌ Error creating survey:', error.message);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const getPublishedSurveys = async (req: Request & { user?: IUser }, res: Response) => {
  try {
    console.log('📧 Fetching surveys for user:', req.user?.email);
    
    const surveys = await Survey.find({ 
      createdBy: req.user?.email
    }).sort({ createdAt: -1 });
    
    console.log('🔍 Found surveys:', surveys.length);
    console.log('📊 Query results:', JSON.stringify(surveys, null, 2));
    
    res.json(surveys);
  } catch (error) {
    console.error('❌ Error fetching surveys:', error);
    res.status(500).json({ message: 'Error fetching surveys' });
  }
}; 