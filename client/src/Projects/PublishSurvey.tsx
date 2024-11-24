import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './PublishSurvey.module.css';
import { publishSurvey } from './api';
import Navigation from '../components/Navigation';

const FEE_PERCENTAGE = 0.2; // 20% fee

function PublishSurvey() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get surveyId from location state
  const { formData, surveyId } = location.state || {};

  console.log('📝 Survey data:', { formData, surveyId }); // Debug log

  // Calculate costs
  const baseReward = parseFloat(formData.reward);
  const feeAmount = baseReward * FEE_PERCENTAGE;
  const totalCostPerWorker = (baseReward + feeAmount) / formData.respondents;
  const totalCost = totalCostPerWorker * formData.respondents;

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      if (!surveyId) {
        throw new Error('Survey ID is required');
      }

      const publishedSurvey = await publishSurvey(surveyId);
      console.log('✅ Published survey:', publishedSurvey);

      navigate('/rhome', {
        state: { message: 'Survey published successfully!' },
      });
    } catch (error) {
      console.error('❌ Error publishing survey:', error);
      // Add error handling UI feedback here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <h2>Review and Publish Survey</h2>

        <div className={styles.surveyInfo}>
          <h3>Survey Details</h3>
          <p>
            <strong>Title:</strong> {formData.title}
          </p>
          <p>
            <strong>Description:</strong> {formData.description}
          </p>
          <p>
            <strong>Survey URL:</strong> {formData.surveyUrl}
          </p>
          <p>
            <strong>Time to Complete:</strong> {formData.timeToComplete} minutes
          </p>
          <p>
            <strong>Number of Respondents:</strong> {formData.respondents}
          </p>
          <p>
            <strong>Expires In:</strong> {formData.expiresIn} days
          </p>
          <p>
            <strong>Worker Qualifications:</strong>{' '}
            {formData.workerQualifications || 'Basic'}
          </p>
          <p>
            <strong>Instructions:</strong> {formData.instructions}
          </p>
        </div>

        <div className={styles.costBreakdown}>
          <h3>Cost Breakdown</h3>
          <div className={styles.costGrid}>
            <div className={styles.costItem}>
              <span>Total Reward:</span>
              <span>${baseReward.toFixed(2)}</span>
            </div>
            <div className={styles.costItem}>
              <span>Platform Fee (20%):</span>
              <span>${feeAmount.toFixed(2)}</span>
            </div>
            <div className={styles.costItem}>
              <span>Total Cost per Worker:</span>
              <span>${totalCostPerWorker.toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.totalCost}>
            <h4>Total Project Cost:</h4>
            <p className={styles.totalAmount}>${totalCost.toFixed(2)}</p>
            <p className={styles.costNote}>
              This amount covers {formData.respondents} worker
              {formData.respondents > 1 ? 's ' : ' '}
              at ${totalCostPerWorker.toFixed(2)} each
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.publishButton}
            onClick={() => {
              console.log('Button clicked via inline handler');
              handlePublish();
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Publishing...' : 'Publish Survey'}
          </button>
        </div>
      </div>
    </>
  );
}

export default PublishSurvey;
