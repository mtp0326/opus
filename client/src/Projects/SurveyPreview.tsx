import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './SurveyPreview.module.css';
import Navigation from '../components/Navigation';

const SurveyPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state;
  const [completionCode, setCompletionCode] = useState('');

  useEffect(() => {
    sessionStorage.setItem('surveyFormData', JSON.stringify(formData));
  }, [formData]);

  const handleNext = () => {
    navigate('/create-publish-test', { 
      state: { 
        formData,
      } 
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
            <p><strong>Instructions:</strong> {formData.instructions}</p>
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
                value={completionCode}
                onChange={(e) => setCompletionCode(e.target.value)}
                placeholder="Enter the code shown at the end of the survey"
                className={styles.input}
              />
              <button 
                className={styles.submitButton}
                onClick={() => alert('This is a preview. Submit functionality will be available to workers.')}
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        <div className={styles.previewActions}>
          <button 
            className={styles.nextButton}
            onClick={handleNext}
          >
            Next: Create and Publish Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyPreview; 