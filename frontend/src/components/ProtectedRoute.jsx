import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the user is authenticated (e.g., by checking for a token in localStorage)
  const token = localStorage.getItem('token');

  // If the user is not authenticated, redirect to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If the user is authenticated, render the children (protected component)
  return children;
};

export default ProtectedRoute;