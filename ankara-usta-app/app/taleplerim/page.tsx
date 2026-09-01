import { redirect } from 'next/navigation';
import Link from 'next/link';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import AppHeader from '../components/AppHeader';
import DraftActions from '../components/DraftActions';
import { getWizardDefinition } from '../data/wizardDefinitions';
import Pagination from '../components/Pagination';

export const dynamic = 'force-dynamic';

const statusLabels: Record<string, string> = {
  draft: 'Taslak',
  submitted: 'Gönderildi',
  matching: 'Ustalar aranıyor',
  quotes_received: 'Teklifler geldi',
  provider_selected: 'Usta seçildi',
  cancelled: 'İptal edildi',
  expired: 'Süresi doldu',
};

export default async function MyRequestsPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
  const rawPage=Number.parseInt((await searchParams).page??'1',10);
  const page=Number.isFinite(rawPage)&&rawPage>0?rawPage:1;
  const pageSize=12;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/taleplerim');

  const { data: requests, error, count } = await supabase
    .from('service_requests')
    .select('id,service_id,status,district,neighborhood,preferred_timing,answers,updated_at,submitted_at',{count:'exact'})
    .order('updated_at', { ascending: false })
    .range((page-1)*pageSize,page*pageSize-1);


  return (
    <main className="account-shell requests-page">
      <AppHeader role="customer" />
      <div style={{ maxWidth: '1140px', margin: '32px auto', padding: '0 16px' }}>
        <div className="requests-header">
          <Link className="account-back" href="/">← Ana Sayfa</Link>
          <div>
            <span>MÜŞTERİ ALANI</span>
            <h1>Taleplerim</h1>
          </div>
        </div>

        {error ? (
          <p className="account-message">Talepler yüklenemedi.</p>
        ) : requests?.length ? (
          <>
          <div className="request-list">
            {requests.map(request => {
              const service = services.find(item => item.id === request.service_id);
              const isDraft = request.status === 'draft';
              const definition = getWizardDefinition(request.service_id);
              const answerCount = Object.keys((request.answers as Record<string,string> | null) ?? {}).length;
              const scopeComplete = answerCount >= definition.questions.length;
              const locationComplete = Boolean(request.district && request.neighborhood);
              const missing = [!scopeComplete && 'kapsam soruları', !locationComplete && 'konum', !request.preferred_timing && 'zaman tercihi'].filter(Boolean) as string[];
              const progressLabel = locationComplete ? 'Konum adımında' : scopeComplete ? 'Kapsam tamamlandı' : `${answerCount}/${definition.questions.length} soru yanıtlandı`;
              return (
                <article key={request.id} className={isDraft ? 'request-card-draft' : ''}>
                  <div>
                    <span className={`status-badge status-${request.status}`}>{statusLabels[request.status] ?? request.status}</span>
                    <h2>{service?.name ?? request.service_id}</h2>
                    <p>{request.neighborhood && request.district ? `${request.neighborhood}, ${request.district}` : 'Konum henüz eklenmedi'}</p>
                  </div>
                  <div className="request-card-actions">
                    <time>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(request.updated_at))}</time>
                    {isDraft ? (
                      <DraftActions requestId={request.id} serviceId={request.service_id} progressLabel={progressLabel} missingLabel={missing.length ? `Eksik: ${missing.join(', ')}` : 'Göndermeye hazır'} />
                    ) : (
                      <Link href={`/taleplerim/${request.id}/teklifler`}>Eşleşme ve teklifler →</Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination page={page} total={count??0} pageSize={pageSize} path="/taleplerim" />
          </>
        ) : (

          <section className="account-card empty-requests">
            <h2>Henüz talebiniz yok</h2>
            <p>Ana sayfada ihtiyacınızı yazarak ilk talebinizi oluşturabilirsiniz.</p>
            <Link className="dialog-primary" href="/#services">Hizmet Ara</Link>
          </section>
        )}
      </div>
    </main>
  );
}
