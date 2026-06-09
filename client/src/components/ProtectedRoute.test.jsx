import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// 1. Mock the react-router-dom Navigate component so we can check if it was called
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="mock-navigate">Navigated to: {to}</div>)
}));

// 2. Mock our custom useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('ProtectedRoute Component (Frontend Unit Test)', () => {
  
  it('should display a loading spinner when authentication is still loading', () => {
    // Arrange: Tell useAuth to return { loading: true }
    useAuth.mockReturnValue({ loading: true, user: null });

    // Act: Render the component
    render(
      <ProtectedRoute>
        <div>Private Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert: Verify the loading text is on the screen
    expect(screen.getByText(/verifying credentials/i)).toBeInTheDocument();
  });

  it('should redirect to /login if there is no authenticated user', () => {
    // Arrange: Tell useAuth that loading is finished, but no user exists
    useAuth.mockReturnValue({ loading: false, user: null });

    // Act
    render(
      <ProtectedRoute>
        <div>Private Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert: Verify the Navigate component was rendered pointing to /login
    expect(screen.getByTestId('mock-navigate')).toHaveTextContent('Navigated to: /login');
  });

  it('should redirect to /onboarding if user is logged in but has not completed onboarding', () => {
    // Arrange: user is logged in, but hasCompletedOnboarding is false
    useAuth.mockReturnValue({ 
      loading: false, 
      user: { id: '123', hasCompletedOnboarding: false } 
    });

    // Act
    render(
      <ProtectedRoute requireOnboarded={true}>
        <div>Private Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert
    expect(screen.getByTestId('mock-navigate')).toHaveTextContent('Navigated to: /onboarding');
  });

  it('should render the children (private content) if user is logged in and fully onboarded', () => {
    // Arrange: Perfect user
    useAuth.mockReturnValue({ 
      loading: false, 
      user: { id: '123', hasCompletedOnboarding: true } 
    });

    // Act
    render(
      <ProtectedRoute requireOnboarded={true}>
        <div data-testid="private-content">Private Dashboard Content</div>
      </ProtectedRoute>
    );

    // Assert: Verify the private content renders and there is no redirection
    expect(screen.getByTestId('private-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-navigate')).not.toBeInTheDocument();
  });

});
