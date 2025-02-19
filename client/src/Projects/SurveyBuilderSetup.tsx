import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Select, MenuItem, Paper, Box } from '@mui/material';
import Navigation from '../components/Navigation';
import styles from './SurveyLink.module.css';
import { handleSurveyJsSave, handleSurveyJsEdit } from './api';

interface FormData {
  reward: string;
  respondents: string;
  timeToComplete: string;
  expiresIn: string;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
}

function SurveyBuilderSetup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    reward: '',
    respondents: '',
    timeToComplete: '',
    expiresIn: '',
    workerQualifications: 'basic',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const preventScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.reward || Number(formData.reward) <= 0)
      newErrors.reward = 'Please enter a valid reward';
    if (!formData.respondents || Number(formData.respondents) <= 0)
      newErrors.respondents = 'Please enter a valid number';
    if (!formData.timeToComplete || Number(formData.timeToComplete) <= 0)
      newErrors.timeToComplete = 'Please enter a valid time';
    if (!formData.expiresIn || Number(formData.expiresIn) <= 0)
      newErrors.expiresIn = 'Please enter a valid expiration';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Get the survey content and ID from localStorage
        const savedSurvey = localStorage.getItem('currentSurvey');
        const surveyId = localStorage.getItem('currentSurveyId');
        const surveyContent = savedSurvey ? JSON.parse(savedSurvey) : {};

        console.log('📝 Current survey ID:', surveyId);
        console.log('📦 Survey content:', surveyContent);

        let response;
        if (surveyId) {
          // Edit existing survey
          console.log('🔄 Editing existing survey...');
          response = await handleSurveyJsEdit(surveyId, surveyContent, {
            reward: Number(formData.reward),
            respondents: Number(formData.respondents),
            timeToComplete: Number(formData.timeToComplete),
            expiresIn: Number(formData.expiresIn),
            workerQualifications: formData.workerQualifications,
          });
          console.log('✅ Survey edited successfully:', response);
        } else {
          // Save new survey
          console.log('✨ Creating new survey...');
          const showAlert = (
            message: string,
            type: 'success' | 'error' | 'info',
          ) => {
            console.log(message);
          };
          response = await handleSurveyJsSave(
            { current: { JSON: surveyContent } },
            showAlert,
          );
          console.log('✅ Survey saved successfully:', response);
        }

        // Navigate to payment review page with all necessary data
        navigate('/create-publish-test', {
          state: {
            formData: {
              ...formData,
              reward: Number(formData.reward),
              respondents: Number(formData.respondents),
              timeToComplete: Number(formData.timeToComplete),
              expiresIn: Number(formData.expiresIn),
              title: surveyContent.title || 'Untitled Survey',
              description: surveyContent.description || '',
              surveyType: 'surveyjs',
              content: surveyContent,
            },
            surveyId: response?.data?.data?._id || surveyId,
          },
        });
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to save survey. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navigation />
      <div className={styles.container}>
        <Paper sx={{ p: 3, maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            Publishing Setup
          </h2>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="reward">
                  Reward ($):
                </label>
                <input
                  className={styles.input}
                  style={{ width: '500px' }}
                  type="number"
                  id="reward"
                  name="reward"
                  min="0"
                  step="0.01"
                  value={formData.reward}
                  onChange={handleChange}
                  disabled={isLoading}
                  onWheel={preventScroll}
                />
                {errors.reward && (
                  <div className={styles.error}>{errors.reward}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="respondents">
                  Number of Respondents:
                </label>
                <input
                  className={styles.input}
                  style={{ width: '500px' }}
                  type="number"
                  id="respondents"
                  name="respondents"
                  min="1"
                  step="1"
                  value={formData.respondents}
                  onChange={handleChange}
                  disabled={isLoading}
                  onWheel={preventScroll}
                />
                {errors.respondents && (
                  <div className={styles.error}>{errors.respondents}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="timeToComplete">
                  Estimated Time to Complete (minutes):
                </label>
                <input
                  className={styles.input}
                  style={{ width: '500px' }}
                  type="number"
                  id="timeToComplete"
                  name="timeToComplete"
                  min="1"
                  step="1"
                  value={formData.timeToComplete}
                  onChange={handleChange}
                  disabled={isLoading}
                  onWheel={preventScroll}
                />
                {errors.timeToComplete && (
                  <div className={styles.error}>{errors.timeToComplete}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="expiresIn">
                  Survey Expires In (days):
                </label>
                <input
                  className={styles.input}
                  style={{ width: '500px' }}
                  type="number"
                  id="expiresIn"
                  name="expiresIn"
                  min="1"
                  step="1"
                  value={formData.expiresIn}
                  onChange={handleChange}
                  disabled={isLoading}
                  onWheel={preventScroll}
                />
                {errors.expiresIn && (
                  <div className={styles.error}>{errors.expiresIn}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="workerQualifications">
                  Worker Qualifications:
                </label>
                <select
                  className={styles.select}
                  style={{ width: '500px' }}
                  id="workerQualifications"
                  name="workerQualifications"
                  value={formData.workerQualifications}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div
                className={styles.buttonGroup}
                style={{ textAlign: 'center' }}
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="contained"
                  sx={{
                    backgroundColor: '#58CC02',
                    padding: '14px 28px',
                    fontSize: '1.1rem',
                    borderRadius: '8px',
                    boxShadow: '0 3px 0 #45a501',
                    letterSpacing: '0.3px',
                    fontWeight: 'bold',
                    border: '1px solid #45a501',
                    minWidth: '220px',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    margin: '0 auto',
                    display: 'inline-block',
                    '&:hover': {
                      backgroundColor: '#45a501',
                      transform: 'translateY(1px)',
                      boxShadow: '0 2px 0 #45a501',
                    },
                    '&:disabled': {
                      backgroundColor: '#E5E5E5',
                      boxShadow: '0 3px 0 #cccccc',
                      border: '1px solid #cccccc',
                    },
                  }}
                >
                  Continue to Payment
                </Button>
              </div>
            </Box>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default SurveyBuilderSetup;
