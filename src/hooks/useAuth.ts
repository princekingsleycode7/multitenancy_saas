import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { getSupabaseClient } from '../lib/supabase';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading: kindeLoading, getToken, getClaim, getPermissions, logout } = useKindeAuth();
  const [supabase, setSupabase] = useState<any>(null);
  const [orgCode, setOrgCode] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const getPermission = async (key: string) => {
    const permissions = await getPermissions();
    return permissions?.permissions?.includes(key) ?? false;
  };

  const getFeatureFlag = (_key: string) => true;

  useEffect(() => {
    const init = async () => {
      if (kindeLoading) return;
      
      if (isAuthenticated && user) {
        try {
          const token = await getToken();
          if (token) {
            setSupabase(getSupabaseClient(token));

            // Kinde stores org_code as a top-level claim
            // Try getClaim first (most reliable), fallback to manual decode
            const orgClaim = await getClaim('org_code');
            if (orgClaim?.value) {
              setOrgCode(orgClaim.value as string);
            } else {
              // Manual JWT decode fallback
              try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setOrgCode(payload.org_code || payload.organization_code || null);
              } catch {
                console.warn('Could not extract org_code from JWT');
              }
            }

            // Get role from Kinde roles claim
            const rolesClaim = await getClaim('roles');
            if (rolesClaim?.value && Array.isArray(rolesClaim.value)) {
              const roles = rolesClaim.value as unknown as Array<{ key: string }>;
              const userRole = roles[0]?.key || 'cashier';
              setRole(userRole);
            } else {
              // fallback: check permissions
              const perms = await getPermissions();
              if (perms?.permissions?.includes('manage:staff')) setRole('owner');
              else if (perms?.permissions?.includes('manage:inventory')) setRole('manager');
              else setRole('cashier');
            }
          }
        } catch (err) {
          console.error('Auth init error:', err);
        }
      }
      setAuthReady(true);
    };

    init();
  }, [isAuthenticated, kindeLoading, user]);

  return {
    user,
    isAuthenticated,
    isLoading: kindeLoading || !authReady,
    orgCode,
    role,
    getAccessToken: getToken,
    supabase,
    getPermission,
    getFeatureFlag,
    logout,
  };
};
