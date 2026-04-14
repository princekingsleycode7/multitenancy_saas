import { SupabaseClient } from '@supabase/supabase-js';

export const provisionTenant = async (
  supabase: SupabaseClient,
  orgCode: string,
  user: any
) => {
  // 1. Upsert tenant
  const { error: tenantError } = await supabase.from('tenants').upsert({
    org_id: orgCode,
    business_name: 'My Business',
    plan: 'starter',
  });

  if (tenantError) throw tenantError;

  // 2. Upsert owner staff profile
  const { error: staffError } = await supabase.from('staff_profiles').upsert({
    org_id: orgCode,
    kinde_user_id: user.id,
    email: user.email,
    full_name: `${user.given_name} ${user.family_name}`,
    role: 'owner',
  });

  if (staffError) throw staffError;
};
