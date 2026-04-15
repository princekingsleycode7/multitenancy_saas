import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionStore } from '../store/sessionStore';
import { useAuth } from '../hooks/useAuth';

export const OutletGuard = ({ children }: { children: ReactNode }) => {
  const { selectedOutletId, setSelectedOutletId } = useSessionStore();
  const { supabase, orgCode } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!supabase || !orgCode) return;

    const autoSelectOutlet = async () => {
      if (selectedOutletId) {
        setChecking(false);
        return;
      }
      // Auto-select if only one outlet exists
      const { data } = await supabase
        .from('outlet_settings')
        .select('id')
        .eq('org_id', orgCode);

      if (data && data.length === 1) {
        setSelectedOutletId(data[0].id);
      }
      setChecking(false);
    };

    autoSelectOutlet();
  }, [supabase, orgCode, selectedOutletId]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedOutletId) return <Navigate to="/app/select-outlet" />;
  return <>{children}</>;
};
