// Uncomment the following line if you are using Next.js:
// 'use client'

import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react';
import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';
import { slk } from "survey-core";
import Navigation from '../components/Navigation';
import styles from './SurveyBuilder.module.css';


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
