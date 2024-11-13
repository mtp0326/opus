// Uncomment the following line if you are using Next.js:
// 'use client'

import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true
};

export function SurveyBuilder() {
  const creator = new SurveyCreator(creatorOptions);
  return (
    <SurveyCreatorComponent creator={creator} />
  )
}
