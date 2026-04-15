import { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { provisionTenant } from '../lib/provisionTenant';

export const OnboardingGuard = ({ children }: { children: ReactNode }) => {
  const { supabase, orgCode, user, isAuthenticated, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    // Wait until auth is fully ready
    if (isLoading) return;
    
    // Not authenticated at all
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    // Auth ready but supabase/orgCode not yet set — wait one more render
    if (!supabase || !orgCode || !user) return;

    const checkTenant = async () => {
      try {
        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('onboarding_complete')
          .eq('org_id', orgCode)
          .maybeSingle(); // use maybeSingle so missing row returns null not error

        if (!tenant) {
          // New merchant — provision their tenant record
          await provisionTenant(supabase, orgCode, user);
          setOnboarded(false);
        } else {
          setOnboarded(tenant.onboarding_complete === true);
        }
      } catch (err) {
        console.error('OnboardingGuard error:', err);
        setOnboarded(false);
      } finally {
        setChecking(false);
      }
    };

    checkTenant();
  }, [supabase, orgCode, user, isAuthenticated, isLoading]);

  // Still waiting for auth or tenant check
  if (isLoading || checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!onboarded) return <Navigate to="/onboarding" />;
  return <>{children}</>;
};
