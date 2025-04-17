import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import {
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks.ts';
import {
  logout as logoutAction,
  toggleAdmin,
  selectUser,
} from '../util/redux/userSlice.ts';
import { logout as logoutApi } from './api.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import Navigation from '../components/Navigation.tsx';
import {
  getPublishedSurveys,
  getLeaderboard,
  getSurveyResponses,
  SurveyData,
  IUser,
} from '../Projects/api';

// interface PromoteButtonProps {
//   admin: boolean | null;
//   handleSelfPromote?: () => void;
//   navigator: NavigateFunction;
// }

/**
 * A button which, when clicked, will promote the user to admin. If the user is already admin, the button will be a link to the admin dashboard.
 * @param admin - a boolean indicating whether the user is an admin
 * @param handleSelfPromote - a function which promotes the user to admin
 * @param navigator - a function which navigates to a new page (passed in from parent function)
 */
// function PromoteButton({
//   admin,
//   handleSelfPromote,
//   navigator,
// }: PromoteButtonProps) {
//   if (admin === null) {
//     return null;
//   }
//   return admin ? (
//     <PrimaryButton
//       variant="contained"
//       onClick={() => navigator('/users', { replace: true })}
//     >
//       View all users
//     </PrimaryButton>
//   ) : null;
// }

interface QuickActionCardProps {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickActionCard = ({ title, icon, onClick }: QuickActionCardProps) => (
  <Card
    sx={{
      cursor: 'pointer',
      '&:hover': { transform: 'scale(1.02)', transition: 'transform 0.2s' },
    }}
    onClick={onClick}
  >
    <CardContent sx={{ textAlign: 'center', p: 2 }}>
      <IconButton sx={{ mb: 1 }}>{icon}</IconButton>
      <Typography variant="h6">{title}</Typography>
    </CardContent>
  </Card>
);

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton sx={{ mr: 1 }}>{icon}</IconButton>
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);

/**
 * The HomePage of the user dashboard. Displays a welcome message, a logout button and a button to promote the user to admin if they are not already an admin. If the user is an admin, the button will navigate them to the admin dashboard. This utilizes redux to access the current user's information.
 */
function ResearcherHomePage() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigator = useNavigate();
  const [admin, setAdmin] = useState(user.admin);
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [leaderboard, setLeaderboard] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeSurveys: 0,
    totalResponses: 0,
    totalRewards: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveysData, leaderboardData] = await Promise.all([
          getPublishedSurveys(),
          getLeaderboard(),
        ]);
        setSurveys(surveysData);
        setLeaderboard(leaderboardData);

        console.log(
          '📊 Fetched surveys:',
          surveysData.map((s) => ({
            id: s._id,
            title: s.title,
            status: s.status,
            respondents: s.respondents,
            reward: s.reward,
          })),
        );

        // Calculate stats
        const activeSurveys = surveysData.filter(
          (s) => s.status === 'active',
        ).length;
        console.log('📊 Active surveys:', activeSurveys);

        // Get total responses for each survey
        console.log(
          '📊 Fetching responses for surveys:',
          surveysData.map((s) => ({ id: s._id, title: s.title })),
        );
        const responsePromises = surveysData.map((survey) =>
          getSurveyResponses(survey._id),
        );
        const responses = await Promise.all(responsePromises);
        console.log('📊 Individual survey responses:', responses);
        const totalResponses = responses.reduce((acc, count) => acc + count, 0);
        console.log('📊 Total responses:', totalResponses);

        // Calculate total rewards and completion rate
        const totalRewards = surveysData.reduce(
          (acc, s) => acc + (s.reward || 0),
          0,
        );

        // Calculate completion rate based on responses vs target respondents
        const totalTargetRespondents = surveysData.reduce(
          (acc, s) => acc + (s.respondents || 0),
          0,
        );
        console.log('📊 Total target respondents:', totalTargetRespondents);
        const completionRate =
          totalTargetRespondents > 0
            ? (totalResponses / totalTargetRespondents) * 100
            : 0;

        console.log('📊 Stats calculated:', {
          activeSurveys,
          totalResponses,
          totalRewards,
          completionRate,
          totalTargetRespondents,
        });

        setStats({
          activeSurveys,
          totalResponses,
          totalRewards,
          completionRate,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const logoutDispatch = () => dispatch(logoutAction());
  const handleLogout = async () => {
    if (await logoutApi()) {
      logoutDispatch();
      navigator('/wlogin', { replace: true });
    }
  };
  // Idt we need selfpromote for a worker account/nonadmin account
  // const handleSelfPromote = async () => {
  //   const newAdminStatus = await selfUpgrade(user.email as string);
  //   if (newAdminStatus) {
  //     dispatch(toggleAdmin());
  //     setAdmin(true);
  //   }
  // };

  const message = `Welcome to Opus, ${user.firstName} ${user.lastName}!`;

  if (loading) {
    return (
      <>
        <Navigation />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <Box sx={{ background: '#FFFAED', minHeight: '100vh', p: 3 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Typography
              variant="h2"
              sx={{
                color: '#285943',
                fontFamily: 'Feather Bold, sans-serif',
                mb: 3,
              }}
            >
              {message}
            </Typography>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2, color: '#285943' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Create Survey"
                  icon={<AddIcon />}
                  onClick={() => navigator('/create-project')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="View Results"
                  icon={<AssessmentIcon />}
                  onClick={() => navigator('/survey-results')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Manage Tasks"
                  icon={<PeopleIcon />}
                  onClick={() => navigator('/manage-tasks')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Leaderboard"
                  icon={<TrendingUpIcon />}
                  onClick={() => navigator('/rleaderboard')}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2, color: '#285943' }}>
              Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Surveys"
                  value={stats.activeSurveys}
                  icon={<AssessmentIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Responses"
                  value={stats.totalResponses}
                  icon={<PeopleIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Rewards"
                  value={`$${stats.totalRewards.toLocaleString()}`}
                  icon={<TrendingUpIcon />}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Completion Rate"
                  value={`${stats.completionRate.toFixed(1)}%`}
                  icon={<BarChartIcon />}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2, color: '#285943' }}>
              Recent Activity
            </Typography>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  {surveys.slice(0, 5).map((survey) => (
                    <Grid item xs={12} key={survey._id}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                      >
                        <Typography>{survey.title}</Typography>
                        <Typography color="textSecondary">
                          {survey.status === 'active' ? 'Active' : 'Completed'}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Admin Section */}
          {/* <Grid item xs={12} container justifyContent="center">
            <PromoteButton admin={admin} navigator={navigator} />
          </Grid> */}
        </Grid>
      </Box>
    </>
  );
}

export default ResearcherHomePage;
