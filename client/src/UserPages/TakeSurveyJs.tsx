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
  const [isFound, setIsFound] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setIsLoading(true);
        if (!isFound && surveyId) {
          const response = await getSurveyById(surveyId);
          const surveyData = response.data;
          setFormData({
            title: surveyData.title,
            description: surveyData.description,
            content: surveyData.content,
          });
          setIsFound(true);
        }
      } catch (fetchError) {
        console.error('Error loading survey:', fetchError);
        setError('Error loading survey. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId, isFound]);

  useEffect(() => {
    if (!formData?.content) {
      setError('Survey content not found.');
      return;
    }

    try {
      const surveyContent =
        typeof formData.content === 'string'
          ? JSON.parse(formData.content)
          : formData.content;

      const surveyModel = new Model(surveyContent);
      surveyModel.onComplete.add((sender) => {
        console.log('Survey results:', sender.data);
        alert('Thank you for completing the survey!');
      });

      setSurvey(surveyModel);
      setError(null);
    } catch (error) {
      console.error('Error creating survey:', error);
      setError('Error creating survey. Please try again later.');
    }
  }, [formData?.content]);

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
          <div className={styles.surveyContainer}>
            <Survey model={survey} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeSurveyJs;
