// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const ProtectedRoute = () => {
  // Get the isAuthenticated flag from our Zustand store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If the user is authenticated, render the child route content using <Outlet />.
  // Otherwise, redirect them to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
