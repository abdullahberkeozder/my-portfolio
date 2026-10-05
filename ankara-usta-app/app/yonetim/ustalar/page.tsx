import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';

// Legacy redirect alias: /yonetim/ustalar → /yonetim/usta-basvurulari
// Auth guard required before redirect to prevent anonymous URL enumeration.
export default async function UstalarRedirectPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/yonetim/usta-basvurulari');
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'moderator'])
    .limit(1)
    .maybeSingle();
  if (!role) redirect('/');
  redirect('/yonetim/usta-basvurulari');
}
