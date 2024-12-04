import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/defaultV2.min.css';
import Navigation2 from '../components/Navigation2';
import styles from '../Projects/SurveyPreview.module.css';
import { getSurveyById } from '../Projects/api';

function TakeSurveyJs() {
  const { surveyId } = useParams();
  const location = useLocation();
  const { formData: initialFormData } = location.state || {};
  const [formData, setFormData] = useState(initialFormData);
  const [survey, setSurvey] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurvey = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // If we don't have formData from navigation state, fetch it
        if (!initialFormData && surveyId) {
          console.log('Fetching survey data for ID:', surveyId);
          const surveyData = await getSurveyById(surveyId);
          console.log('Fetched survey data:', surveyData);
          setFormData({
            title: surveyData.title,
            description: surveyData.description,
            content: surveyData.content,
          });
        }

        // Now we should have formData either from navigation state or from API
        if (formData?.content) {
          console.log('Creating survey with content:', formData.content);
          try {
            // Parse the content if it's a string
            const surveyContent =
              typeof formData.content === 'string'
                ? JSON.parse(formData.content)
                : formData.content;

            console.log('Parsed survey content:', surveyContent);

            // Create survey model with the content
            const surveyModel = new Model(surveyContent);
            console.log('Survey model created:', surveyModel);

            // Add completion handler
            surveyModel.onComplete.add((sender) => {
              const results = sender.data;
              console.log('Survey results:', results);
              alert('Thank you for completing the survey!');
            });

            setSurvey(surveyModel);
          } catch (parseError) {
            console.error('Error creating survey:', parseError);
            setError('Error creating survey. Please try again later.');
          }
        } else {
          console.error('No survey content available');
          setError('Survey content not found.');
        }
      } catch (loadError) {
        console.error('Error loading survey:', loadError);
        setError('Error loading survey. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [surveyId, initialFormData, formData]);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Navigation2 />
        <div className={styles.container}>
          <div className={styles.previewBox}>
            <h4>Loading survey...</h4>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <Navigation2 />
        <div className={styles.container}>
          <div className={styles.previewBox}>
            <h4>Error</h4>
            <p>{error}</p>
            <p>Debug info:</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify({ formData, surveyId }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className={styles.pageContainer}>
        <Navigation2 />
        <div className={styles.container}>
          <div className={styles.previewBox}>
            <h4>Survey not found</h4>
            <p>The survey could not be loaded.</p>
            <p>Debug info:</p>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify({ formData, surveyId }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Navigation2 />
      <div className={styles.container}>
        <div className={styles.previewBox}>
          <div className={styles.surveyInfo}>
            <h4>{formData.title}</h4>
            <p>{formData.description}</p>
          </div>

          <div className={styles.surveyContainer}>
            <Survey model={survey} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeSurveyJs;
