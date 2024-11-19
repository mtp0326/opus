// Uncomment the following line if you are using Next.js:
// 'use client'

import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import { slk } from "survey-core";
import Navigation from '../components/Navigation';
import styles from './SurveyBuilder.module.css';


<<<<<<< HEAD
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
=======
const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true,
  haveCommercialLicense: true
};

slk(
     "M2ZlMjI3N2UtOTM4ZS00YWM1LTgxNjgtNjlhMjM3MTMzY2JiOzE9MjAyNS0xMS0xNA=="
);


export function SurveyBuilder() {
  const creator = new SurveyCreator(creatorOptions);
  return (
    <>
      <Navigation />
      <div className={styles.container}>
        <SurveyCreatorComponent creator={creator} />
      </div>
    </>
  )
}
>>>>>>> origin/main
