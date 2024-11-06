import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SurveyLink.module.css';

interface FormData {
  title: string;
  description: string;
  surveyUrl: string;
  reward: string;
  respondents: string;
  timeToComplete: string;
  expiresIn: string;
  workerQualifications: string;
}

interface FormErrors {
  [key: string]: string;
}

function SurveyLink() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    surveyUrl: '',
    reward: '',
    respondents: '',
    timeToComplete: '',
    expiresIn: '',
    workerQualifications: 'basic',
  });

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

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Navigate to preview page with form data
    navigate('/survey-preview', {
      state: {
        formData,
      },
    });
  };

  return (
    <div className={styles.surveyLink}>
      <h2>Add External Survey Link</h2>
      <form onSubmit={handlePreview}>
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
          />
          {errors.reward && <div className={styles.error}>{errors.reward}</div>}
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
            value={formData.respondents}
            onChange={handleChange}
            disabled={isLoading}
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
            value={formData.timeToComplete}
            onChange={handleChange}
            disabled={isLoading}
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
            value={formData.expiresIn}
            onChange={handleChange}
            disabled={isLoading}
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

        <button
          className={`${styles.button} ${isLoading ? styles.loading : ''}`}
          type="submit"
          disabled={isLoading}
        >
          Preview Survey
        </button>
      </form>
    </div>
  );
}

export default SurveyLink;
