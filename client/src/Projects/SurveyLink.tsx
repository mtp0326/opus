import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SurveyLink.module.css';
import { saveSurvey, editSurvey } from './api';
import Navigation from '../components/Navigation';

type WorkerQualification = 'basic' | 'intermediate' | 'expert';
type SurveyStatus = 'draft' | 'active' | 'completed' | 'expired';

interface FormData {
  _id?: string;
  title: string;
  description: string;
  surveyUrl: string;
  reward: string;
  respondents: string;
  timeToComplete: string;
  expiresIn: string;
  workerQualifications: WorkerQualification;
  instructions: string;
}

interface FormErrors {
  [key: string]: string;
}

const SurveyLink = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<FormData>(() => {
    const storedData = sessionStorage.getItem('surveyFormData');
    const comingFromPreview = sessionStorage.getItem('comingFromPreview');
    const existingSurveyData = location.state?.survey;

    console.log('Coming from preview:', !!comingFromPreview);
    console.log('Stored Data exists:', !!storedData);
    console.log('Existing survey data:', existingSurveyData);

    // First priority: use existing survey data if available
    if (existingSurveyData) {
      return existingSurveyData;
    }

    // Second priority: use stored data if coming from preview
    if (storedData && comingFromPreview) {
      sessionStorage.removeItem('comingFromPreview'); // Clear the flag
      return JSON.parse(storedData);
    }

    // Otherwise use default values
    sessionStorage.removeItem('surveyFormData');
    sessionStorage.removeItem('comingFromPreview');
    return {
      title: '',
      description: '',
      surveyUrl: '',
      reward: '',
      respondents: '',
      timeToComplete: '',
      expiresIn: '',
      workerQualifications: 'basic',
      instructions: `[Replace with your own instructions] Click on the button to start the survey. To receive credit for completion, enter the unique code provided at the end of the survey and click submit.`,
    };
  });

  // Cleanup when leaving SurveyLink
  useEffect(() => {
    return () => {
      if (!window.location.pathname.includes('preview')) {
        sessionStorage.removeItem('surveyFormData');
        sessionStorage.removeItem('comingFromPreview');
      }
    };
  }, []);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.surveyUrl.trim()) {
      newErrors.surveyUrl = 'Survey URL is required';
    } else if (!isValidUrl(formData.surveyUrl)) {
      newErrors.surveyUrl = 'Please enter a valid URL';
    }

    if (!formData.reward || Number(formData.reward) <= 0) {
      newErrors.reward = 'Please enter a valid reward amount';
    }

    if (!formData.respondents || Number(formData.respondents) <= 0) {
      newErrors.respondents = 'Please enter a valid number of respondents';
    }

    if (!formData.timeToComplete || Number(formData.timeToComplete) <= 0) {
      newErrors.timeToComplete = 'Please enter a valid time estimate';
    }

    if (!formData.expiresIn || Number(formData.expiresIn) <= 0) {
      newErrors.expiresIn = 'Please enter a valid expiration period';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePreviewAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const surveyData = {
        ...formData,
        reward: parseFloat(formData.reward),
        respondents: parseInt(formData.respondents),
        timeToComplete: parseInt(formData.timeToComplete),
        expiresIn: parseInt(formData.expiresIn),
        status: 'draft' as SurveyStatus,
      };

      let savedSurvey;
      if (formData._id) {
        savedSurvey = await editSurvey(formData._id, surveyData);
        console.log('📡 Edited survey response:', savedSurvey);
      } else {
        savedSurvey = await saveSurvey(surveyData);
      }

      navigate('/survey-preview', {
        state: {
          formData: savedSurvey.data || savedSurvey,
          surveyId: savedSurvey.data ? savedSurvey.data._id : savedSurvey._id,
        },
      });
    } catch (error) {
      console.error('❌ Error saving survey:', error);
      alert('Failed to save survey');
    } finally {
      setIsLoading(false);
    }
  };

  const preventScroll = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  return (
    <div className={styles.pageContainer}>
      <Navigation />
      <div className={styles.container}>
        <h2>Add External Survey Link</h2>
        <form onSubmit={handlePreviewAndSave}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="surveyUrl">
              Survey URL:
            </label>
            <input
              className={styles.input}
              type="url"
              id="surveyUrl"
              name="surveyUrl"
              value={formData.surveyUrl}
              onChange={handleChange}
              placeholder="https://your-survey-url.com"
              disabled={isLoading}
            />
            {errors.surveyUrl && (
              <div className={styles.error}>{errors.surveyUrl}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="title">
              Survey Title:
            </label>
            <input
              className={styles.input}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.title && <div className={styles.error}>{errors.title}</div>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="description">
              Description:
            </label>
            <textarea
              className={styles.textarea}
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.description && (
              <div className={styles.error}>{errors.description}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reward">
              Reward ($):
            </label>
            <input
              className={styles.input}
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

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="instructions">
              Instructions:
            </label>
            <textarea
              className={styles.textarea}
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Enter detailed instructions for survey participants"
            />
            {errors.instructions && (
              <div className={styles.error}>{errors.instructions}</div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${isLoading ? styles.loading : ''}`}
              type="submit"
              disabled={isLoading}
            >
              Save and Preview Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyLink;
