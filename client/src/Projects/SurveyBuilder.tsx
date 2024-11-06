import React, { useState } from 'react';
import styles from './SurveyBuilder.module.css';

interface Question {
  id: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'checkbox';
  question: string;
  options?: string[];
  required: boolean;
}

interface SurveyData {
  title: string;
  description: string;
  reward: string;
  respondents: string;
  timeToComplete: string;
  expiresIn: string;
  workerQualifications: string;
  questions: Question[];
}

function SurveyBuilder() {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    title: '',
    description: '',
    reward: '',
    respondents: '',
    timeToComplete: '',
    expiresIn: '',
    workerQualifications: 'basic',
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: '',
    type: 'multiple_choice',
    question: '',
    options: [''],
    required: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleBasicInfoChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setSurveyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleQuestionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const { checked } = e.target as HTMLInputElement;
    const { type } = e.target;
    setCurrentQuestion((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)) || [],
    }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), ''],
    }));
  };

  return (
    <div className={styles.surveyBuilder}>
      {/* Render your survey components here */}
    </div>
  );
}

export default SurveyBuilder;
