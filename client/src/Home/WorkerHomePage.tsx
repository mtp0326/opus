import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Typography, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks.ts';
import {
  logout as logoutAction,
  toggleAdmin,
  selectUser,
} from '../util/redux/userSlice.ts';
import { logout as logoutApi } from './api.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import Navigation2 from '../components/Navigation2.tsx';
import { getData } from '../util/api';

// Add font styles
const fontStyles = `
  @font-face {
    font-family: 'Feather Bold';
    src: url('/fonts/Feather-Bold.woff2') format('woff2'),
         url('/fonts/Feather-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
  }
  @font-face {
    font-family: 'DIN Next Rounded LT W01 Regular';
    src: url('/fonts/DINNextRoundedLTW01-Regular.woff2') format('woff2'),
         url('/fonts/DINNextRoundedLTW01-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }
`;

interface PromoteButtonProps {
  admin: boolean | null;
  navigator: NavigateFunction;
}

/**
 * A button which, when clicked, will promote the user to admin. If the user is already admin, the button will be a link to the admin dashboard.
 * @param admin - a boolean indicating whether the user is an admin
 * @param navigator - a function which navigates to a new page (passed in from parent function)
 */
function PromoteButton({ admin, navigator }: PromoteButtonProps) {
  if (admin === null) {
    return null;
  }
  return admin ? (
    <PrimaryButton
      variant="contained"
      onClick={() => navigator('/users', { replace: true })}
      sx={{
        backgroundColor: '#58CC02',
        '&:hover': { backgroundColor: '#45a501' },
        fontFamily: 'Feather Bold',
      }}
    >
      View all users
    </PrimaryButton>
  ) : null;
}
/**
 * The HomePage of the user dashboard. Displays a welcome message, a logout button and a button to promote the user to admin if they are not already an admin. If the user is an admin, the button will navigate them to the admin dashboard. This utilizes redux to access the current user's information.
 */
function WorkerHomePage() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigator = useNavigate();
  const [admin, setAdmin] = useState(user.admin);
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
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    const fetchOutcomes = async () => {
      try {
        // commenting out onboarding for now cause it wasn't working
        // if (!user.email) return;
        // const workerInfo = await getData(`worker/${user.email}`);
        // console.log(workerInfo);
        // if (workerInfo.data[0].onboarded === false) {
        //   navigator('/wonboard', { replace: true });
        // }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchOutcomes();

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const message = `Welcome to the Opus, ${user.firstName} ${user.lastName}!`;
  return (
    <>
      <Navigation2 />
      <ScreenGrid>
        <Typography
          variant="h2"
          sx={{
            color: '#58CC02',
            fontFamily: 'Feather Bold',
            textAlign: 'center',
            mb: 4,
          }}
        >
          {message}
        </Typography>
        <Grid item container justifyContent="center">
          <PromoteButton
            admin={admin}
            // handleSelfPromote={handleSelfPromote}
            navigator={navigator}
          />
        </Grid>
        <Grid item container justifyContent="center">
          <Button
            onClick={handleLogout}
            sx={{
              color: '#58CC02',
              fontFamily: 'DIN Next Rounded LT W01 Regular',
              '&:hover': { backgroundColor: '#f0f9f0' },
            }}
          >
            Logout
          </Button>
        </Grid>
      </ScreenGrid>
    </>
  );
}

export default WorkerHomePage;
