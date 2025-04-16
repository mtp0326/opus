import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useData } from './api.tsx';

interface IDynamicRedirectProps {
  unAuthElement: React.ReactElement;
  authPath: string;
}

interface User {
  userType: string;
}

interface AuthResponse {
  error: boolean;
  user?: {
    userType: string;
  };
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is not authenticated.
 */
function UnauthenticatedRoutesWrapper() {
  const data = useData('auth/authstatus');
  if (data === null) return null;
  return !data.error ? <Navigate to="/" /> : <Outlet />;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is authenticated.
 */
function ProtectedRoutesWrapper() {
  const data = useData('auth/authstatus');
  if (data === null) return null;
  return !data.error ? <Outlet /> : <Navigate to="/" />;
}

/**
 * A wrapper component whose children routes which can only be navigated to if the user is an admin.
 */
function AdminRoutesWrapper() {
  const data = useData('admin/adminstatus');
  if (data === null) return null;
  return !data.error ? <Outlet /> : <Navigate to="/" />;
}

/**
 * A wrapper which either renders the unauth element or redirects to auth path depending on authentication status.
 * @param unAuthElement - The React element to render if the user is not authenticated
 * @param authPath - The path to navigate to if the user is authenticated. Should be of the form "/path"
 */
function DynamicRedirect({ unAuthElement, authPath }: IDynamicRedirectProps) {
  const data = useData('auth/authstatus');
  if (data === null) return null;
  return !data.error ? <Navigate to={authPath} /> : unAuthElement;
}

/**
 * A wrapper component whose children routes can only be accessed by researchers
 */
function ResearcherRoutesWrapper() {
  const response = useData('auth/authstatus') as {
    data: AuthResponse;
    error: null;
  } | null;

  if (response === null) {
    return null;
  }

  const { data } = response;
  if (!data.error && data.user?.userType === 'researcher') {
    console.log('User is researcher, allowing access');
    return <Outlet />;
  }

  console.log('User is not researcher, redirecting');
  return <Navigate to="/" />;
}

/**
 * A wrapper component whose children routes can only be accessed by workers
 */
function WorkerRoutesWrapper() {
  const response = useData('auth/authstatus');
  if (response === null) {
    return null;
  }

  if (response.error) {
    console.log('Authentication error:', response.error);
    return <Navigate to="/" />;
  }

  if (response.data?.user?.userType === 'worker') {
    console.log('User is worker, allowing access');
    return <Outlet />;
  }

  console.log('User is not worker, redirecting');
  return <Navigate to="/" />;
}

export {
  UnauthenticatedRoutesWrapper,
  ProtectedRoutesWrapper,
  AdminRoutesWrapper,
  DynamicRedirect,
  ResearcherRoutesWrapper,
  WorkerRoutesWrapper,
};
