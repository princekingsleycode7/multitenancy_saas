import { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { useAuth } from '../hooks/useAuth';

export const OutletGuard = ({ children }: { children: ReactNode }) => {
  const { selectedOutletId } = useSessionStore();
  const { orgCode } = useAuth();

  if (!selectedOutletId) {
    return <Navigate to="/app/select-outlet" />;
  }

  return <>{children}</>;
};
