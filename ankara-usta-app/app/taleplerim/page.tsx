import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prejobChatEnabled } from '../lib/prejobChat';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import AppHeader from '../components/AppHeader';
import DraftActions from '../components/DraftActions';
import { getWizardDefinition } from '../data/wizardDefinitions';
import Pagination from '../components/Pagination';
import { directedRequestsEnabled } from '../lib/directedRequests';
import RequestInvitationPanel from '../components/RequestInvitationPanel';
import RealtimeRefresh from '../components/RealtimeRefresh';

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

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const rawPage = Number.parseInt((await searchParams).page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = 12;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/giris?next=/taleplerim');

  const {
    data: requests,
    error,
    count,
  } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact' })
    .eq('customer_id', user.id)
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const directIds = (requests ?? [])
    .filter((r) => r.routing_mode === 'direct' && r.status !== 'draft')
    .map((r) => r.id);
  const invitations =
    directedRequestsEnabled() && directIds.length
      ? await supabase
          .from('request_invitations')
          .select('*')
          .eq('customer_id', user.id)
          .in('request_id', directIds)
      : null;

  return (
    <main className="account-shell requests-page">
      <AppHeader role="customer" />
      {directedRequestsEnabled() && (
        <RealtimeRefresh
          channelName={`my-invitations-${user.id}`}
          subscriptions={[{ table: 'request_invitations', filter: `customer_id=eq.${user.id}` }]}
          label="Talep yanıtları"
        />
      )}
      <div style={{ maxWidth: '980px', margin: '32px auto 80px', padding: '0 16px' }}>
        {/* Page header */}
        <div className="requests-header">
          <div>
            <span style={{ color: 'var(--brand-cobalt)', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>MÜŞTERİ ALANI</span>
            <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-0.025em' }}>Taleplerim</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {prejobChatEnabled() && (
              <Link
                href="/gorusmeler"
                style={{ fontSize: '14px', fontWeight: 600, color: 'var(--brand-cobalt)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Görüşmelerim →
              </Link>
            )}
            <Link
              className="dialog-primary"
              href="/#services"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              + Yeni Talep
            </Link>
          </div>
        </div>

        {/* Error state */}
        {error ? (
          <div className="empty-state">
            <span className="empty-state-icon" role="img" aria-label="Hata">⚠️</span>
            <h2>Talepler yüklenemedi</h2>
            <p>Bir bağlantı sorunu oluştu. Sayfayı yenileyerek tekrar deneyin.</p>
            <button
              onClick={() => window.location.reload()}
              className="dialog-primary"
              style={{ background: 'var(--brand-cobalt)', color: 'white', border: 0, cursor: 'pointer' }}
            >
              Sayfayı Yenile
            </button>
          </div>
        ) : requests?.length ? (
          <>
            <div className="request-list" style={{ display: 'grid', gap: '10px' }}>
              {requests.map((request) => {
                const service = services.find((item) => item.id === request.service_id);
                const isDraft = request.status === 'draft';
                const definition = getWizardDefinition(request.service_id);
                const answerCount = Object.keys(
                  (request.answers as Record<string, string> | null) ?? {}
                ).length;
                const scopeComplete = answerCount >= definition.questions.length;
                const locationComplete = Boolean(request.district && request.neighborhood);
                const missing = [
                  !scopeComplete && 'kapsam soruları',
                  !locationComplete && 'konum',
                  !request.preferred_timing && 'zaman tercihi',
                ].filter(Boolean) as string[];
                const progressLabel = locationComplete
                  ? 'Konum adımında'
                  : scopeComplete
                  ? 'Kapsam tamamlandı'
                  : `${answerCount}/${definition.questions.length} soru yanıtlandı`;

                return (
                  <article
                    key={request.id}
                    className={`request-card ${isDraft ? 'request-card-draft' : ''}`}
                    style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'start', padding: '20px 24px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', background: isDraft ? 'var(--brand-lemonade-soft)' : 'white', boxShadow: 'var(--shadow-card)', borderColor: isDraft ? '#e8d980' : 'var(--border-default)' }}
                  >
                    <div>
                      {/* Status badge */}
                      <span className={`status-badge status-${request.status}`}>
                        {statusLabels[request.status] ?? request.status}
                      </span>

                      <p className="request-card-title">
                        {service?.name ?? request.service_id}
                      </p>

                      <div className="request-card-meta">
                        {request.neighborhood && request.district ? (
                          <span>{request.neighborhood}, {request.district}</span>
                        ) : (
                          <span style={{ color: '#d4a017' }}>📍 Konum henüz eklenmedi</span>
                        )}
                        {request.routing_mode === 'direct' && (
                          <>
                            <span className="request-card-meta-dot" />
                            <span>Ustaya özel talep</span>
                          </>
                        )}
                      </div>

                      {/* Invitation panels for direct requests */}
                      {invitations?.data
                        ?.filter((i) => i.request_id === request.id)
                        .map((i) => (
                          <RequestInvitationPanel
                            key={i.status}
                            invitation={i}
                            serviceId={request.service_id}
                            role="customer"
                            compact
                          />
                        ))}
                      {request.routing_mode === 'direct' && invitations?.error && (
                        <p role="alert" style={{ color: 'var(--status-danger)', fontSize: '13px', marginTop: '6px' }}>
                          Yanıt durumu yüklenemedi.
                        </p>
                      )}
                    </div>

                    {/* Actions column */}
                    <div className="request-card-actions-col">
                      <time className="request-card-time">
                        {new Intl.DateTimeFormat('tr-TR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }).format(new Date(request.updated_at))}
                      </time>
                      {isDraft ? (
                        <DraftActions
                          requestId={request.id}
                          serviceId={request.service_id}
                          progressLabel={progressLabel}
                          missingLabel={
                            missing.length ? `Eksik: ${missing.join(', ')}` : 'Göndermeye hazır'
                          }
                        />
                      ) : (
                        <Link
                          href={`/taleplerim/${request.id}/teklifler`}
                          className="request-card-action"
                        >
                          Eşleşme ve teklifler →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <Pagination page={page} total={count ?? 0} pageSize={pageSize} path="/taleplerim" />
          </>
        ) : (
          /* Empty state */
          <section className="empty-state" style={{ background: 'white', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)' }}>
            <span className="empty-state-icon" role="img" aria-label="Henüz talep yok">📋</span>
            <h2>Henüz talebiniz yok</h2>
            <p>
              Ev işleriniz için profesyonel yardım almaya hazır mısınız? Hizmeti seçin,
              kapsamı belirleyin, teklifleri karşılaştırın.
            </p>
            <Link
              className="dialog-primary"
              href="/#services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                background: 'var(--brand-cobalt)',
                color: 'white',
              }}
            >
              İlk Talebimi Oluştur →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
