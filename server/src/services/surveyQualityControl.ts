import { OpenAI } from 'openai';
import SurveyJs from '../models/surveyJs.model';
import Survey from '../models/survey.model';
import { Document } from 'mongoose';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

async function generateQualityControlQuestions(surveyId: string) {
  try {
    // Try to find survey in both collections
    const [externalSurvey, jsSurvey] = await Promise.all([
      Survey.findById(surveyId),
      SurveyJs.findById(surveyId),
    ]);

    const survey = externalSurvey || jsSurvey;
    if (!survey) {
      throw new Error('Survey not found');
    }

    // Extract existing questions based on survey type
    let existingQuestions = '';
    if (jsSurvey) {
      // For SurveyJS surveys, extract questions from content
      const pages = jsSurvey.content.pages || [];
      existingQuestions = pages
        .flatMap((page: any) => page.elements || [])
        .map((element: any) => element.title || element.name)
        .join('\n');
    } else if (externalSurvey) {
      // For external surveys, we might not have access to questions
      // Use description or title as context
      existingQuestions = `${externalSurvey.title}\n${externalSurvey.description}`;
    }

    // Generate quality control questions using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a survey expert. Generate 2-3 quality control questions based on the existing survey questions. These should help verify the respondent is paying attention and giving consistent answers. Format the response as a SurveyJS compatible JSON object.',
        },
        {
          role: 'user',
          content: `Here are the existing survey questions/context:\n${existingQuestions}\n\nGenerate quality control questions that would be appropriate for this survey. Return them in this format:
          {
            "elements": [
              {
                "type": "...",
                "name": "qc_1",
                "title": "...",
                "isRequired": true,
                "isQualityControl": true
              }
            ]
          }`,
        },
      ],
      temperature: 0.7,
    });

    // Parse the generated questions
    const generatedQuestions = JSON.parse(completion.choices[0].message.content);

    // Update the survey based on its type
    if (jsSurvey) {
      // Add quality control questions to SurveyJS content
      const updatedContent = {
        ...jsSurvey.content,
        pages: [
          ...(jsSurvey.content.pages || []),
          { elements: generatedQuestions.elements },
        ],
      };

      const updatedSurvey = await SurveyJs.findByIdAndUpdate(
        surveyId,
        { content: updatedContent },
        { new: true }
      );

      return updatedSurvey;
    } else {
      // For external surveys, we might want to store QC questions separately
      // or handle differently
      throw new Error('Quality control questions for external surveys not yet implemented');
    }
  } catch (error) {
    console.error('Error generating quality control questions:', error);
    throw error;
  }
}

export { generateQualityControlQuestions }; 