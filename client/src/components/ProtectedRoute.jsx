import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route wrapper that prevents unauthorized users from accessing private views.
 * Handles automatic redirections depending on user onboarding completion flags.
 */
const ProtectedRoute = ({ children, requireOnboarded = true }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-slate-100 p-8">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary border-r-brand-secondary animate-spin"></div>
        </div>
        <span className="font-heading text-sm text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
          Verifying credentials...
        </span>
      </div>
    );
  }

  // 1. Redirect to login if user is not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Redirect to onboarding if dashboard requires it and user hasn't completed it
  if (requireOnboarded && !user.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Redirect back to dashboard if user has already completed onboarding but tries to load onboarding views
  if (!requireOnboarded && user.hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
