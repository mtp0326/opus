import { useState, useEffect } from 'react';
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
import { getPublishedSurveys, getLeaderboard } from '../Projects/api';
import { SurveyData, IUser } from '../Projects/api';
import AddIcon from '@mui/icons-material/Add';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';

interface PromoteButtonProps {
  admin: boolean | null;
  handleSelfPromote?: () => void;
  navigator: NavigateFunction;
}

// // Inject custom fonts similar to WorkerHomePage
// const fontStyles = `
//   @font-face {
//     font-family: 'Feather Bold';
//     src: url('/fonts/Feather-Bold.woff2') format('woff2'),
//          url('/fonts/Feather-Bold.woff') format('woff');
//     font-weight: bold;
//     font-style: normal;
//   }
//   @font-face {
//     font-family: 'DIN Next Rounded LT W01 Regular';
//     src: url('/fonts/DINNextRoundedLTW01-Regular.woff2') format('woff2'),
//          url('/fonts/DINNextRoundedLTW01-Regular.woff') format('woff');
//     font-weight: normal;
//     font-style: normal;
//   }
// `;

/**
 * A button which, when clicked, will promote the user to admin. If the user is already admin, the button will be a link to the admin dashboard.
 * @param admin - a boolean indicating whether the user is an admin
 * @param handleSelfPromote - a function which promotes the user to admin
 * @param navigator - a function which navigates to a new page (passed in from parent function)
 */
function PromoteButton({
  admin,
  handleSelfPromote,
  navigator,
}: PromoteButtonProps) {
  if (admin === null) {
    return null;
  }
  return admin ? (
    <PrimaryButton
      variant="contained"
      onClick={() => navigator('/users', { replace: true })}
    >
      View all users
    </PrimaryButton>
  ) : null;
}

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveysData, leaderboardData] = await Promise.all([
          getPublishedSurveys(),
          getLeaderboard(),
        ]);
        setSurveys(surveysData);
        setLeaderboard(leaderboardData);
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

  const stats = {
    activeSurveys: surveys.filter((s) => s.status === 'active').length,
    totalResponses: surveys.reduce((acc, s) => acc + (s.respondents || 0), 0),
    totalRewards: surveys.reduce((acc, s) => acc + (s.reward || 0), 0),
    completionRate:
      surveys.length > 0
        ? (surveys.filter((s) => s.status === 'completed').length /
            surveys.length) *
          100
        : 0,
  };

  const QuickActionCard = ({
    title,
    icon,
    onClick,
  }: {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
  }) => (
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

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }) => (
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
                  title="Manage Workers"
                  icon={<PeopleIcon />}
                  onClick={() => navigator('/manage-tasks')}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <QuickActionCard
                  title="Leaderboard"
                  icon={<TrendingUpIcon />}
                  onClick={() => navigator('/leaderboard')}
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
          <Grid item xs={12} container justifyContent="center">
            <PromoteButton admin={admin} navigator={navigator} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

export default ResearcherHomePage;
