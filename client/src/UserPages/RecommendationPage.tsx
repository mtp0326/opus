import React, { useState, useEffect } from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScreenGrid from '../components/ScreenGrid';
import Navigation2 from '../components/Navigation2';
import ScrollBar from './ScrollBar';
import { useAppSelector } from '../util/redux/hooks.ts';
import { selectUser } from '../util/redux/userSlice.ts';
import { getData } from '../util/api';

interface SurveyData {
  id: number;
  title: string;
  description: string;
  surveyUrl: string;
  submitterList: string[];
  status: 'active' | 'inactive'; // Added status property
}

function RecommendationPage() {
  const navigate = useNavigate();
  const [surveyData, setSurveyData] = useState<SurveyData[]>([]);
  const [filledSurveyData, setFilledSurveyData] = useState<SurveyData[]>([]);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        if (!user.email) return;
        const response = await getData(`surveys/all-surveys`);
        const allSurveys: SurveyData[] = response.data;
        const activeSurveys: SurveyData[] = allSurveys.filter(
          (survey) => survey.status === 'active',
        );
        setSurveyData(activeSurveys);

        const filledSurveys: SurveyData[] = allSurveys.filter(
          (survey) =>
            user.email &&
            survey.submitterList &&
            survey.submitterList.includes(user.email),
        );
        setFilledSurveyData(filledSurveys);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchOutcomes();
  }, []);

  //   useEffect(() => {
  //     const fetchOutcomes = async () => {
  //       if (!user.email) return;
  //       try {
  //         const response = await getData(`surveys/${user.email}/surveys`);
  //         setFilledSurveyData(response.data);
  //         console.log('Survey data:', response.data);
  //       } catch (error) {
  //         console.error('Error fetching data:', error);
  //       }
  //     };
  //     fetchOutcomes();
  //   }, []);

  return (
    <>
      <Navigation2 />
      <ScreenGrid>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 'calc(100vh - 64px)', // 64px is default MUI AppBar height
            padding: 2,
            width: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}
        >
          <Stack spacing={3} direction="column" sx={{ width: '100%' }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
              Recommended For You
            </Typography>
            <Typography variant="h4" sx={{ mb: 4 }}>
              Top Recommendations
            </Typography>
            <ScrollBar recommendations={surveyData} />

            <Typography variant="h4" sx={{ mb: 4 }}>
              Recent Activity
            </Typography>
            <ScrollBar recommendations={filledSurveyData} />

            {/* <Typography variant="h4" sx={{ mb: 4 }}>
              Statistics
            </Typography> */}
          </Stack>
        </Box>
      </ScreenGrid>
    </>
  );
}

export default RecommendationPage;
