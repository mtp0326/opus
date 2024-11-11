import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './PublishSurvey.module.css';

const FEE_PERCENTAGE = 0.20; // 20% fee

const PublishSurvey = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state;
  const [isLoading, setIsLoading] = useState(false);

  // Calculate costs
  const baseReward = parseFloat(formData.reward);
  const feeAmount = baseReward * FEE_PERCENTAGE;
  const totalCostPerWorker = (baseReward + feeAmount) / formData.respondents;
  const totalCost = totalCostPerWorker * formData.respondents;

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          surveyUrl: formData.surveyUrl,
          reward: baseReward,
          respondents: formData.respondents,
          timeToComplete: formData.timeToComplete,
          expiresIn: formData.expiresIn,
          workerQualifications: formData.workerQualifications || 'basic',
          status: 'active',
          // createdBy will be set by the backend using the authenticated user
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create survey');
      }

      navigate('/', { 
        state: { message: 'Survey published successfully!' }
      });
    } catch (error) {
      console.error('Error publishing survey:', error);
      // Handle error (show error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Review and Publish Survey</h2>
      
      <div className={styles.surveyInfo}>
        <h3>Survey Details</h3>
        <p><strong>Title:</strong> {formData.title}</p>
        <p><strong>Description:</strong> {formData.description}</p>
        <p><strong>Survey URL:</strong> {formData.surveyUrl}</p>
        <p><strong>Time to Complete:</strong> {formData.timeToComplete} minutes</p>
        <p><strong>Number of Respondents:</strong> {formData.respondents}</p>
        <p><strong>Expires In:</strong> {formData.expiresIn} days</p>
        <p><strong>Worker Qualifications:</strong> {formData.workerQualifications || 'Basic'}</p>
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
            This amount covers {formData.respondents} worker{formData.respondents > 1 ? 's ' : ' '} 
            at ${totalCostPerWorker.toFixed(2)} each
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.publishButton}
          onClick={handlePublish}
          disabled={isLoading}
        >
          {isLoading ? 'Publishing...' : 'Publish Survey'}
        </button>
      </div>
    </div>
  );
};

export default PublishSurvey; 