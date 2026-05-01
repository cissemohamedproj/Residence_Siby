import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();

  if (!auth) return <Navigate to='/login' />;
  if (!allowedRoles.includes(auth?.user?.role)) {
    if (auth?.user?.role === 'admin') return <Navigate to='/home' />;
  }

  // Sinon l'utilisateur est authentifié et a le rôle autorisé, afficher les pages
  return children;
};

export default PrivateRoute;
