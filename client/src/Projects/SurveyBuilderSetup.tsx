import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Select, MenuItem, Paper, Box } from '@mui/material';
import Navigation from '../components/Navigation';
import styles from './SurveyLink.module.css'; // Reuse existing styles

interface FormData {
  title: string;
  description: string;
  reward: string;
  respondents: string;
  timeToComplete: string;
  expiresIn: string;
  workerQualifications: 'basic' | 'intermediate' | 'expert';
  instructions: string;
}

function SurveyBuilderSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    reward: '',
    respondents: '',
    timeToComplete: '',
    expiresIn: '',
    workerQualifications: 'basic',
    instructions: 'Please complete the following survey carefully.',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

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
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description)
      newErrors.description = 'Description is required';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/survey-builder', { state: { setupData: formData } });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navigation />
      <div className={styles.container}>
        <Paper sx={{ p: 3 }}>
          <h2>Create New Survey</h2>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Survey Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />

              <TextField
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                required
              />

              <TextField
                label="Reward ($)"
                name="reward"
                type="number"
                value={formData.reward}
                onChange={handleChange}
                error={!!errors.reward}
                helperText={errors.reward}
                required
              />

              <TextField
                label="Number of Respondents"
                name="respondents"
                type="number"
                value={formData.respondents}
                onChange={handleChange}
                error={!!errors.respondents}
                helperText={errors.respondents}
                required
              />

              <TextField
                label="Time to Complete (minutes)"
                name="timeToComplete"
                type="number"
                value={formData.timeToComplete}
                onChange={handleChange}
                error={!!errors.timeToComplete}
                helperText={errors.timeToComplete}
                required
              />

              <TextField
                label="Expires In (days)"
                name="expiresIn"
                type="number"
                value={formData.expiresIn}
                onChange={handleChange}
                error={!!errors.expiresIn}
                helperText={errors.expiresIn}
                required
              />

              <Select
                value={formData.workerQualifications}
                name="workerQualifications"
                onChange={(e) =>
                  handleChange(
                    e as React.ChangeEvent<
                      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                    >,
                  )
                }
                label="Worker Qualifications"
              >
                <MenuItem value="basic">Basic</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="expert">Expert</MenuItem>
              </Select>

              <TextField
                label="Instructions"
                name="instructions"
                multiline
                rows={4}
                value={formData.instructions}
                onChange={handleChange}
                required
              />

              <Button type="submit" variant="contained" color="primary">
                Continue to Survey Builder
              </Button>
            </Box>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default SurveyBuilderSetup;
