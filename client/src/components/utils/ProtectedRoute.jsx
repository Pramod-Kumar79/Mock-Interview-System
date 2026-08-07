import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { GlobalContext } from './GlobalState';

// Wrap any route that requires the user to be logged in.
// Optionally restrict it to a specific role (e.g. 'recruiter').
export function ProtectedRoute({ children, role }) {
  const { gUser, gToken } = useContext(GlobalContext);

  if (!gUser || !gToken) {
    return <Navigate to="/login" replace />;
  }

  if (role && gUser.role !== role) {
    // Logged in, but wrong role for this page -> send them somewhere sensible
    return <Navigate to={gUser.role === 'recruiter' ? '/recruiter' : '/'} replace />;
  }

  return children;
}

export default ProtectedRoute;
