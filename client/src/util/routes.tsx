import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useData } from './api.tsx';

interface IDynamicRedirectProps {
  unAuthElement: React.ReactElement;
  authPath: string;
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
  return !data.error ? (
    <Navigate to={authPath} />
  ) : (
    unAuthElement
  );
}

export {
  UnauthenticatedRoutesWrapper,
  ProtectedRoutesWrapper,
  AdminRoutesWrapper,
  DynamicRedirect,
};
