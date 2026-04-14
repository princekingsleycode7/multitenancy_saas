import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { provisionTenant } from '../lib/provisionTenant';

export const OnboardingGuard = ({ children }: { children: ReactNode }) => {
  const { supabase, orgCode, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    const checkTenant = async () => {
      if (!supabase || !orgCode || !user) return;

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select('onboarding_complete')
        .eq('org_id', orgCode)
        .single();

      if (error || !tenant) {
        // Missing tenant, provision it
        await provisionTenant(supabase, orgCode, user);
        setOnboarded(false);
      } else {
        setOnboarded(tenant.onboarding_complete);
      }
      setLoading(false);
    };

    if (isAuthenticated) {
      checkTenant();
    }
  }, [supabase, orgCode, user, isAuthenticated]);

  if (loading) return <div>Loading...</div>;
  if (!onboarded) return <Navigate to="/onboarding" />;
  return children;
};
