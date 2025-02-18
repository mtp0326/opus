import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import styles from './PublishSurvey.module.css';
import { publishSurvey } from './api';
import Navigation from '../components/Navigation';
import StripePaymentPage from './StripePaymentPage';

const FEE_PERCENTAGE = 0.2; // 20% fee

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(
  'pk_test_51QtYHnIHTStKHWzZs15W04R6zkKhZgo1gLvLaU3HW3MKdOvK2BvKJ81HYsMhmTHQaPJnXuGSP4gL6eebW3lAkA8300PUP85evs',
);

function PublishSurvey() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

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

      console.log('Creating payment intent for amount:', totalCost);

      // Create payment intent on the server
      const response = await fetch('/api/surveys/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCost,
          surveyId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment intent failed: ${errorData.error}`);
      }

      const data = await response.json();
      console.log('Payment intent created:', data);

      setClientSecret(data.clientSecret);
      setShowPayment(true);
    } catch (error) {
      console.error('Error in handlePublish:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const publishedSurvey = await publishSurvey(surveyId);
      console.log('✅ Published survey:', publishedSurvey);

      // Clear survey data from localStorage
      localStorage.removeItem('currentSurvey');
      localStorage.removeItem('currentSurveyId');
      console.log('🗑️ Cleared survey data from localStorage');

      navigate('/rhome', {
        state: { message: 'Survey published successfully!' },
      });
    } catch (error) {
      console.error('❌ Error publishing survey:', error);
      // Add error handling UI feedback here
    }
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showPayment && clientSecret) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <StripePaymentPage
          amount={totalCost}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </Elements>
    );
  }

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
          <form>
            <PaymentElement />
            <button
              className={styles.publishButton}
              type="button"
              onClick={() => {
                console.log('Button clicked via inline handler');
                handlePublish();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Publishing...' : 'Publish Survey'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PublishSurvey;
