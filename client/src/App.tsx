import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import theme from './assets/theme.ts';
import { store, persistor } from './util/redux/store.ts';
import NotFoundPage from './NotFound/NotFoundPage.tsx';
import ResearcherHomePage from './Home/ResearcherHomePage.tsx';
import WorkerHomePage from './Home/WorkerHomePage.tsx';
import AdminDashboardPage from './AdminDashboard/AdminDashboardPage.tsx';
import {
  UnauthenticatedRoutesWrapper,
  ProtectedRoutesWrapper,
  DynamicRedirect,
  AdminRoutesWrapper,
  ResearcherRoutesWrapper,
  WorkerRoutesWrapper,
} from './util/routes.tsx';
import VerifyAccountPage from './Authentication/VerifyAccountPage.tsx';
import EmailResetPasswordPage from './Authentication/EmailResetPasswordPage.tsx';
import ResetPasswordPage from './Authentication/ResetPasswordPage.tsx';
import AlertPopup from './components/AlertPopup.tsx';
import InviteRegisterPage from './Authentication/InviteRegisterPage.tsx';
import CreateProject from './Projects/CreateProject.tsx';
import SurveyLink from './Projects/SurveyLink.tsx';
import SurveyBuilder from './Projects/SurveyBuilder.tsx';
import SurveyPreview from './Projects/SurveyPreview';
import CreatePublishTest from './Projects/PublishSurvey.tsx';
import ManageTasks from './Projects/ManageTasks.tsx';
import WorkerLoginPage from './Authentication/WorkerLoginPage.tsx';
import ResearcherLoginPage from './Authentication/ResearcherLoginPage.tsx';
import WorkerRegisterPage from './Authentication/WorkerRegisterPage.tsx';
import ResearcherRegisterPage from './Authentication/ResearcherRegisterPage.tsx';
import HomePage from './Home/HomePage.tsx';
import SurveyCompletion from './Projects/SurveyCompletion.tsx';
// import LabelData from './Projects/LabelData';
import Leaderboard from './Projects/Leaderboard.tsx';
// import LabelData from './Projects/LabelData';
import SurveyBuilderSetup from './Projects/SurveyBuilderSetup.tsx';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider theme={theme}>
              <CssBaseline>
                <AlertPopup />
                <Routes>
                  {/* Other unauthenticated routes */}
                  <Route element={<UnauthenticatedRoutesWrapper />}>
                    <Route path="/wregister" element={<WorkerRegisterPage />} />
                    <Route
                      path="/rregister"
                      element={<ResearcherRegisterPage />}
                    />
                    <Route
                      path="/verify-account/:token"
                      element={<VerifyAccountPage />}
                    />
                    <Route
                      path="/email-reset"
                      element={<EmailResetPasswordPage />}
                    />
                    <Route
                      path="/reset-password/:token"
                      element={<ResetPasswordPage />}
                    />
                  </Route>
                  <Route
                    path="/invite/:token"
                    element={<InviteRegisterPage />}
                  />
                  {/* Routes accessed only if user is authenticated and researcher */}
                  <Route element={<ResearcherRoutesWrapper />}>
                    <Route path="/rhome" element={<ResearcherHomePage />} />
                    <Route path="/create-project" element={<CreateProject />} />
                    <Route path="/survey-link" element={<SurveyLink />} />
                    <Route path="/survey-builder" element={<SurveyBuilder />} />
                    <Route path="/manage-tasks" element={<ManageTasks />} />
                    <Route path="/survey-preview" element={<SurveyPreview />} />
                    <Route
                      path="/create-publish-test"
                      element={<CreatePublishTest />}
                    />
                    <Route
                      path="/survey-builder-setup"
                      element={<SurveyBuilderSetup />}
                    />
                    {/* Add other researcher-specific routes here */}
                  </Route>

                  <Route element={<AdminRoutesWrapper />}>
                    <Route path="/users" element={<AdminDashboardPage />} />
                  </Route>

                  {/* Routes accessed only if user is authenticated and researcher */}
                  <Route element={<WorkerRoutesWrapper />}>
                    <Route path="/whome" element={<WorkerHomePage />} />
                    <Route
                      path="/surveys/:surveyId/complete"
                      element={<SurveyCompletion />}
                    />

                    {/* Add other worker-specific routes here */}
                  </Route>

                  {/* Route which redirects to a different page depending on if the user is an authenticated or not by utilizing the DynamicRedirect component */}
                  <Route path="/" element={<HomePage />} />
                  <Route
                    path="/wlogin"
                    element={
                      <DynamicRedirect
                        unAuthElement={<WorkerLoginPage />}
                        authPath="/whome"
                      />
                    }
                  />
                  <Route
                    path="/rlogin"
                    element={
                      <DynamicRedirect
                        unAuthElement={<ResearcherLoginPage />}
                        authPath="/rhome"
                      />
                    }
                  />
                  {/* Login routes - accessible to unauthenticated users
                  <Route path="/wlogin" element={<WorkerLoginPage />} />
                  <Route path="/rlogin" element={<ResearcherLoginPage />} /> */}
                  {/* Route which is accessed if no other route is matched */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </CssBaseline>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
