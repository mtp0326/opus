import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './PublishSurvey.module.css';
import { publishSurvey } from './api';
import Navigation from '../components/Navigation';
import { postData } from '../util/api';

const FEE_PERCENTAGE = 0.2; // 20% fee

function PublishSurvey() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Get surveyId from location state
  const { formData, surveyId } = location.state || {};

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('payment') === 'failure') {
      // Refresh the page on payment failure
      window.location.href = window.location.pathname;
    }
  }, [location]);

  if (!formData || !surveyId) {
    navigate('/rhome');
    return null;
  }

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

      const response = await postData('surveys/create-checkout-session', {
        amount: totalCost,
        surveyId,
        title: formData.title,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      console.log('💰 Payment session created:', response.data.data);
      window.location.href = response.data.url;

      const publishedSurvey = await publishSurvey(surveyId);
      console.log('✅ Published survey:', publishedSurvey);

      localStorage.removeItem('currentSurvey');
      localStorage.removeItem('currentSurveyId');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <h2 className={styles.title}>Review and Publish Survey</h2>

        <div className={styles.surveyInfo}>
          <h3>Survey Details</h3>
          <p>
            <strong>Title:</strong> {formData.title}
          </p>
          <p>
            <strong>Description:</strong> {formData.description}
          </p>
          {formData.surveyUrl && (
            <p>
              <strong>Survey URL:</strong> {formData.surveyUrl}
            </p>
          )}
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
          {formData.instructions && (
            <p>
              <strong>Instructions:</strong> {formData.instructions}
            </p>
          )}
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
            type="button"
            onClick={() => {
              console.log('Button clicked via inline handler');
              handlePublish();
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <span className={styles.stripeButton}>
                {/* Stripe logo */}
                <svg
                  className={styles.stripeLogo}
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 16L14 12V4L7 8V16ZM6.5 7.25L13.5 3.25L7 0L0 4L6.5 7.25Z"
                    fill="currentColor"
                  />
                </svg>
                Publish & Pay with Stripe
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default PublishSurvey;
