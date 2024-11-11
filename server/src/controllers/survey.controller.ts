import { Request, Response } from 'express';
import { Survey } from '../models/survey.model';

export const createSurvey = async (req: Request, res: Response) => {
  try {
    const survey = new Survey(req.body);
    await survey.save();
    
    res.status(201).json(survey);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}; 