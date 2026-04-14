import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { getSupabaseClient } from '../lib/supabase';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, getToken, getPermissions } = useKindeAuth();
  const [supabase, setSupabase] = useState<any>(null);
  const [orgCode, setOrgCode] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const getPermission = async (key: string) => {
    const permissions = await getPermissions();
    return permissions?.permissions?.includes(key) ?? false;
  };

  const getFeatureFlag = (key: string) => {
    // In a real app, feature flags would be in the JWT claims
    // For now, we simulate this based on the plan
    return true; // Placeholder
  };

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated && user) {
        const token = await getToken();
        if (token) {
          setSupabase(getSupabaseClient(token));
          
          // Extract org_code and role from JWT (simplified)
          // In a real app, decode the JWT properly
          const claims = JSON.parse(atob(token.split('.')[1]));
          setOrgCode(claims.org_code);
          setRole(claims.role);
        }
      }
    };
    init();
  }, [isAuthenticated, user, getToken]);

  return { user, isAuthenticated, orgCode, role, getAccessToken: getToken, supabase, getPermission, getFeatureFlag };
};
