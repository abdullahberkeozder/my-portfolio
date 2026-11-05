import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import AvailabilityForm from './AvailabilityForm';
import RetryButton from '../../components/RetryButton';
import styles from './availability.module.css';

export const dynamic = 'force-dynamic';

function LoadFailure({ title, description }: { title: string; description: string }) {
  return <main className={styles.page}><div className={styles.container} role="alert">
    <h1>{title}</h1><p>{description}</p><RetryButton />
  </div></main>;
}

function ankaraToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

// Server component guard: only authenticated tradespeople can access availability settings.
export default async function TradespersonAvailabilityPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError && authError.name !== 'AuthSessionMissingError') {
    return <LoadFailure title="Oturum doğrulanamadı" description="Müsaitlik bilgilerinizi güvenle açabilmek için yeniden deneyin." />;
  }
  if (!user) redirect('/usta/giris?next=/usta/musaitlik');

  // Verify tradesperson role — prevent customers from reaching this page
  const { data: role, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'tradesperson')
    .limit(1)
    .maybeSingle();
  if (roleError) return <LoadFailure title="Yetki bilgisi alınamadı" description="Usta hesabınızın erişimini doğrulamak için yeniden deneyin." />;
  if (!role) redirect('/usta-basvurusu');

  const { data: availability, error: availabilityError } = await supabase
    .from('tradesperson_availability')
    .select('available_from, available_to, accepts_urgent, active, updated_at')
    .eq('tradesperson_id', user.id)
    .maybeSingle();
  if (availabilityError) return <LoadFailure title="Müsaitlik bilgileri yüklenemedi" description="Kayıtlı tercihleriniz alınamadı. Yeni bir değer kaydetmeden önce yeniden deneyin." />;

  return <AvailabilityForm today={ankaraToday()} initialAvailability={availability} />;
}
