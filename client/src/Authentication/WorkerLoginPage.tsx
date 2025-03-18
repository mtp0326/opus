import React, { useState } from 'react';
import { TextField, Link, Typography, Grid } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch } from '../util/redux/hooks.ts';
import { login as loginRedux } from '../util/redux/userSlice.ts';
import FormGrid from '../components/form/FormGrid.tsx';
import FormCol from '../components/form/FormCol.tsx';
import FormRow from '../components/form/FormRow.tsx';
import { emailRegex, InputErrorMessage } from '../util/inputvalidation.ts';
import { loginUser } from './api.ts';
import AlertDialog from '../components/AlertDialog.tsx';
import PrimaryButton from '../components/buttons/PrimaryButton.tsx';
import ScreenGrid from '../components/ScreenGrid.tsx';

/**
 * A page allowing users to input their email and password to login. The default
 * starting page of the application
 */
function WorkerLoginPage() {
  const navigate = useNavigate();

  // Default values for state
  const defaultValues = {
    email: '',
    password: '',
    userType: 'worker',
  };
  const defaultShowErrors = {
    email: false,
    password: false,
    alert: false,
  };
  const defaultErrorMessages = {
    email: '',
    password: '',
    alert: '',
  };
  type ValueType = keyof typeof values;

  // State values and hooks
  const [values, setValueState] = useState(defaultValues);
  const [showError, setShowErrorState] = useState(defaultShowErrors);
  const [errorMessage, setErrorMessageState] = useState(defaultErrorMessages);

  // Helper functions for changing only one field in a state object
  const setValue = (field: string, value: string) => {
    setValueState((prevState) => ({
      ...prevState,
      ...{ [field]: value },
    }));
  };
  const setShowError = (field: string, show: boolean) => {
    setShowErrorState((prevState) => ({
      ...prevState,
      ...{ [field]: show },
    }));
  };
  const setErrorMessage = (field: string, msg: string) => {
    setErrorMessageState((prevState) => ({
      ...prevState,
      ...{ [field]: msg },
    }));
  };

  const alertTitle = 'Error';
  const handleAlertClose = () => {
    setShowError('alert', false);
  };

  const dispatch = useAppDispatch();
  function dispatchUser(
    userEmail: string,
    firstName: string,
    lastName: string,
    admin: boolean,
    userType: string,
    league: 'Wood' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond',
    cashBalance: number,
    points: number,
    surveysCompleted: number,
    verified: boolean,
    onboarded: boolean,
  ) {
    dispatch(
      loginRedux({
        email: userEmail,
        firstName,
        lastName,
        admin,
        userType: 'worker',
        league,
        cashBalance,
        points,
        surveysCompleted,
        verified,
        onboarded,
      }),
    );
  }

  const clearErrorMessages = () => {
    setShowErrorState(defaultShowErrors);
    setErrorMessageState(defaultErrorMessages);
  };

  const validateInputs = () => {
    clearErrorMessages();
    let isValid = true;

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const valueTypeString in values) {
      const valueType = valueTypeString as ValueType;
      if (!values[valueType]) {
        setErrorMessage(valueTypeString, InputErrorMessage.MISSING_INPUT);
        setShowError(valueTypeString, true);
        isValid = false;
      }
    }

    if (!values.email.match(emailRegex)) {
      setErrorMessage('email', InputErrorMessage.INVALID_EMAIL);
      setShowError('email', true);
      isValid = false;
    }
    if (!values.password) {
      setErrorMessage('password', InputErrorMessage.MISSING_INPUT);
      setShowError('password', true);
      isValid = false;
    }

    return isValid;
  };

  async function handleSubmit() {
    if (validateInputs()) {
      loginUser(values.email, values.password, 'worker')
        .then((user) => {
          if (user.userType !== 'worker') {
            throw new Error('No worker account found');
          }
          console.log('navigating to home!');
          dispatchUser(
            user.email!,
            user.firstName!,
            user.lastName!,
            user.admin!,
            user.userType!,
            user.league!,
            user.cashBalance!,
            user.points!,
            user.surveysCompleted!,
            user.verified!,
            user.onboarded!,
          );
          navigate('/whome');
        })
        .catch((e) => {
          console.log('failed to login...');
          setShowError('alert', true);
          setErrorMessage('alert', e.message);
        });
    }
  }

  return (
    <ScreenGrid> 
      <Grid
        container
        justifyContent="flex-start"
        sx={{backgroundColor: '#102622', color: 'white', position: 'absolute', top: 0, left: 0, p: 2 }}
      >
        <PrimaryButton
          onClick={() => navigate('/')}
          sx={{
            color: 'black',
            backgroundColor: '#66c8b9',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#aff8e5',
              boxShadow: 'none',
            },
          }}
        >
          Home
        </PrimaryButton>
      </Grid>
      <FormGrid>
        <FormCol>
          <Grid item container justifyContent="center">
            <Typography variant="h2" textAlign="center">
              Welcome to Opus User
            </Typography>
          </Grid>
          <Grid item width="1">
            <TextField
              fullWidth
              error={showError.email}
              helperText={errorMessage.email}
              type="email"
              required
              label="Email"
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#66c8b9',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#66c8b9',
                  },
                },
                '& label': {
                  color: 'white',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
          </Grid>
          <Grid item width="1">
            <TextField
              fullWidth
              error={showError.password}
              helperText={errorMessage.password}
              type="password"
              required
              label="Password"
              value={values.password}
              onChange={(e) => setValue('password', e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#66c8b9',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#66c8b9',
                  },
                },
                '& label': {
                  color: 'white',
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                },
              }}
            />
          </Grid>
          <Grid item container justifyContent="center">
            <PrimaryButton
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#66c8b9',
                color: 'black',
                '&:hover': {
                  backgroundColor: '#aff8e5',
                },
              }}
              onClick={() => handleSubmit()}
            >
              Login
            </PrimaryButton>
          </Grid>
          <FormRow>
            <Grid item>
              <Link component={RouterLink} to="/email-reset" sx={{ color: 'white' }}>
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/wregister" sx={{ color: 'white' }}>
                Sign up
              </Link>
            </Grid>
          </FormRow>
        </FormCol>
      </FormGrid>
      {/* The alert that pops up */}
      <Grid item>
        <AlertDialog
          showAlert={showError.alert}
          title={alertTitle}
          message={errorMessage.alert}
          onClose={handleAlertClose}
        />
      </Grid>
    </ScreenGrid>
  );
}

export default WorkerLoginPage;
