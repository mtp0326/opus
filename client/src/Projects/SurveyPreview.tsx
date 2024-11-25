import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SurveyPreview.module.css';
import Navigation from '../components/Navigation';

function SurveyPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData || {};

  // Add debug log
  console.log('🔍 Preview received:', location.state);

  if (!location.state?.formData) {
    return <div>No survey data available</div>;
  }

  useEffect(() => {
    // When preview mounts, save the form data and set a flag
    console.log('Saving survey data to session storage:', formData);
    console.log('Survey ID:', formData._id);
    sessionStorage.setItem('surveyFormData', JSON.stringify(formData));
    sessionStorage.setItem('comingFromPreview', 'true');

    return () => {
      // Only remove the flag if we're navigating forward, not on reload or back
      const navType = window.performance.getEntriesByType('navigation')[0].type;
      console.log('Navigation type:', navType);
      console.log('Cleanup - current formData:', formData);
      if (navType !== 'reload' && navType !== 'back_forward') {
        console.log('Removing comingFromPreview flag');
        sessionStorage.removeItem('comingFromPreview');
      }
    };
  }, [formData]);

  const handleNext = () => {
    // Make sure we pass both formData and surveyId to the next page
    navigate('/create-publish-test', {
      state: {
        formData,
        surveyId: formData._id, // Make sure we're passing the ID
      },
    });
  };

  return (
    <div className={styles.pageContainer}>
      <Navigation />
      <div className={styles.container}>
        <h2>Survey Preview</h2>
        <div className={styles.previewBox}>
          <h3>Worker View</h3>

          <div className={styles.surveyInfo}>
            <h4>{formData.title}</h4>
            <p>{formData.description}</p>
            <p>Reward: ${formData.reward}</p>
            <p>Estimated Time: {formData.timeToComplete} minutes</p>
            <p>
              <strong>Instructions:</strong> {formData.instructions}
            </p>
          </div>

          <div className={styles.surveyActions}>
            <a
              href={formData.surveyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.surveyLink}
            >
              Take Survey
            </a>

            <div className={styles.completionCodeSection}>
              <label htmlFor="completionCode">Enter Completion Code:</label>
              <input
                type="text"
                id="completionCode"
                placeholder="Enter the code shown at the end of the survey"
                className={styles.input}
              />
              <button
                className={styles.submitButton}
                onClick={() =>
                  alert(
                    'This is a preview. Submit functionality will be available to workers.',
                  )
                }
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className={styles.previewActions}>
          <button className={styles.nextButton} onClick={handleNext}>
            Next: Create and Publish Test
          </button>
        </div>
      </div>
    </div>
  );
}

export default SurveyPreview;
