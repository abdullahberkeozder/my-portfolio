import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import AvailabilityForm from './AvailabilityForm';

export const dynamic = 'force-dynamic';

// Server component guard: only authenticated tradespeople can access availability settings.
export default async function TradespersonAvailabilityPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/usta/giris?next=/usta/musaitlik');

  // Verify tradesperson role — prevent customers from reaching this page
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'tradesperson')
    .limit(1)
    .maybeSingle();
  if (!role) redirect('/usta-basvurusu');

  return <AvailabilityForm />;
}
