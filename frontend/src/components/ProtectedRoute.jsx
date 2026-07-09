import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // Demoted user or user trying to access admin dashboard
    return <Navigate to="/" replace />;
  }

  return children;
}
