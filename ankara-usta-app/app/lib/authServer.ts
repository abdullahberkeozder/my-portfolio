import { createSupabaseServerClient } from './supabase/server';
import type { UserRole } from '../domain/models';

export async function getServerUserAndRoles(): Promise<{
  user: { id: string; email?: string } | null;
  roles: UserRole[];
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: roleRows } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      const dbRoles = (roleRows ?? []).map(r => r.role as UserRole);

      return {
        user: { id: user.id, email: user.email },
        roles: dbRoles.length ? dbRoles : ['customer'],
      };
    }
  } catch {}

  return { user: null, roles: [] };
}
