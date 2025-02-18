import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Typography, Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../util/redux/hooks.ts';
import {
  logout as logoutAction,
  toggleAdmin,
  selectUser,
} from '../util/redux/userSlice.ts';
import { logout as logoutApi, selfUpgrade } from './api.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import Navigation from '../components/Navigation.tsx';

interface PromoteButtonProps {
  admin: boolean | null;
  handleSelfPromote?: () => void;
  navigator: NavigateFunction;
}

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

  const message = `Welcome to the Opus, ${user.firstName} ${user.lastName}!`;
  return (
    <>
      <Navigation />
      <ScreenGrid>
        <Typography
          variant="h2"
          sx={{
            color: '#58CC02',
          }}
        >
          {message}
        </Typography>
        <Grid item container justifyContent="center">
          <PromoteButton admin={admin} navigator={navigator} />
        </Grid>
        <Grid item container justifyContent="center">
          <Button
            onClick={handleLogout}
            sx={{
              color: '#58CC02',
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
