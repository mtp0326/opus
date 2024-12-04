import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Navigation2 from '../components/Navigation2';
import styles from '../Projects/SurveyPreview.module.css';
import { submitSurveyCompletion } from '../Projects/api';

function TakeSurveyLink() {
  const { surveyId } = useParams();
  const location = useLocation();
  const { formData } = location.state || {};
  const [completionCode, setCompletionCode] = useState('');

  const handleSubmit = async () => {
    try {
      await submitSurveyCompletion({
        surveyId: surveyId!,
        completionCode,
      });
      alert('Survey completion submitted successfully!');
      // You might want to navigate somewhere after successful submission
    } catch (error) {
      console.error('Error submitting survey completion:', error);
      alert('Failed to submit survey completion');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navigation2 />
      <div className={styles.container}>
        <div className={styles.previewBox}>
          <div className={styles.surveyInfo}>
            <h4 style={{ textAlign: 'center' }}>{formData.title}</h4>
            <p>{formData.description}</p>
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
                onClick={handleSubmit}
                disabled={!completionCode}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeSurveyLink;
