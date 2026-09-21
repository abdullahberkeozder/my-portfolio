import { redirect } from 'next/navigation';
import Link from 'next/link';
import RetryButton from '../components/RetryButton';
import { prejobChatEnabled } from '../lib/prejobChat';
import { services } from '../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../lib/supabase/server';
import DraftActions from '../components/DraftActions';
import { getWizardDefinition } from '../data/wizardDefinitions';
import Pagination from '../components/Pagination';
import { directedRequestsEnabled } from '../lib/directedRequests';
import RequestInvitationPanel from '../components/RequestInvitationPanel';
import RealtimeRefresh from '../components/RealtimeRefresh';
import PilotCityMap from '../components/PilotCityMap';
import { pilotCityState } from '../lib/pilotCity';
import RequestStatusBadge from '../components/RequestStatusBadge';

export const dynamic = 'force-dynamic';

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

  // Defensive queries for quote counts and jobs associated with requests
  const requestIds = (requests ?? []).map((r) => r.id);
  const quotesCountMap = new Map<string, number>();
  const jobsMap = new Map<string, string>();

  if (requestIds.length > 0) {
    try {
      const quotesQuery = supabase
        .from('quotes')
        .select('request_id, status');
      if (typeof quotesQuery.in === 'function') {
        const { data: quotesData } = await quotesQuery
          .in('request_id', requestIds)
          .in('status', ['submitted', 'accepted']);
        for (const q of quotesData ?? []) {
          quotesCountMap.set(q.request_id, (quotesCountMap.get(q.request_id) ?? 0) + 1);
        }
      }
    } catch {
      // Non-blocking in mock environments
    }

    try {
      const jobsQuery = supabase
        .from('jobs')
        .select('id, request_id')
        .eq('customer_id', user.id);
      if (typeof jobsQuery.in === 'function') {
        const { data: jobsData } = await jobsQuery.in('request_id', requestIds);
        for (const j of jobsData ?? []) {
          jobsMap.set(j.request_id, j.id);
        }
      }
    } catch {
      // Non-blocking in mock environments
    }
  }

  return (
    <main className="account-shell requests-page">
      {directedRequestsEnabled() && (
        <RealtimeRefresh
          channelName={`my-invitations-${user.id}`}
          subscriptions={[{ table: 'request_invitations', filter: `customer_id=eq.${user.id}` }]}
          label="Talep yanıtları"
        />
      )}
      <div className="page-body">
        {/* Workspace header */}
        <div className="workspace-header">
          <div>
            <span className="workspace-eyebrow">MÜŞTERİ ÇALIŞMA ALANI</span>
            <h1 className="workspace-title">Taleplerim</h1>
          </div>
          <div className="workspace-actions">
            {prejobChatEnabled() && (
              <Link
                href="/gorusmeler"
                className="cta-action-neutral"
              >
                Görüşmelerim →
              </Link>
            )}
            <Link
              className="cta-action-primary"
              href="/#services"
            >
              + Yeni Talep
            </Link>
          </div>
        </div>

        {/* Error state */}
        {error ? (
          <div className="empty-state" role="alert">
            <span className="empty-state-icon" role="img" aria-label="Hata">⚠️</span>
            <h2>Talepler yüklenemedi</h2>
            <p>Bir bağlantı sorunu oluştu. Sayfayı yenileyerek tekrar deneyin.</p>
            <RetryButton />
          </div>
        ) : requests?.length ? (
          <>
            <div className="request-list" style={{ display: 'grid', gap: '14px' }}>
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

                const quoteCount = quotesCountMap.get(request.id);
                const jobId = jobsMap.get(request.id);

                return (
                  <article
                    key={request.id}
                    className={`workspace-card ${isDraft ? 'workspace-card-draft' : ''}`}
                    data-testid={`request-card-${request.id}`}
                  >
                    <div>
                      {/* Header with status badge & service */}
                      <div className="workspace-card-header">
                        <RequestStatusBadge status={request.status} quoteCount={quoteCount} />
                        {request.routing_mode === 'direct' && (
                          <span className="match-score-badge" style={{ background: '#f5f0fc', color: '#5d25b0' }}>
                            Ustaya özel talep
                          </span>
                        )}
                      </div>

                      <h2 className="workspace-card-title">
                        {service?.name ?? request.service_id}
                      </h2>

                      <div className="workspace-card-meta">
                        {request.neighborhood && request.district ? (
                          <span>📍 {request.neighborhood}, {request.district}</span>
                        ) : (
                          <span style={{ color: 'var(--status-warning)' }}>📍 Konum henüz eklenmedi</span>
                        )}
                        {request.preferred_timing && (
                          <>
                            <span className="workspace-card-meta-dot" />
                            <span>Zaman tercihi eklendi</span>
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
                    <div className="workspace-card-actions-col">
                      <time className="workspace-card-time">
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
                      ) : request.status === 'quotes_received' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', width: '100%' }}>
                          <Link
                            href={`/taleplerim/${request.id}/teklifler`}
                            className="cta-action-primary"
                          >
                            Teklifleri Karşılaştır {quoteCount ? `(${quoteCount})` : ''} →
                          </Link>
                          <Link
                            href={`/taleplerim/${request.id}/teklifler`}
                            className="cta-action-neutral"
                            style={{ fontSize: '12px' }}
                          >
                            Eşleşme ve teklifler →
                          </Link>
                        </div>
                      ) : request.status === 'provider_selected' && jobId ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', width: '100%' }}>
                          <Link
                            href={`/islerim/${jobId}`}
                            className="cta-action-primary"
                          >
                            İş Ekranına Git →
                          </Link>
                          <Link
                            href={`/taleplerim/${request.id}/teklifler`}
                            className="cta-action-neutral"
                            style={{ fontSize: '12px' }}
                          >
                            Eşleşme ve teklifler →
                          </Link>
                        </div>
                      ) : (
                        <Link
                          href={`/taleplerim/${request.id}/teklifler`}
                          className="cta-action-secondary"
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
          <section className="account-card empty-requests" style={{ textAlign: 'center' }}>
            <h2>Henüz talebiniz yok</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '12px 0 24px' }}>
              Ev işleriniz için profesyonel yardım almaya hazır mısınız? Hizmeti seçin,
              kapsamı belirleyin, teklifleri karşılaştırın.
            </p>
            <Link
              className="cta-action-primary"
              href="/#services"
            >
              İlk Talebimi Oluştur
            </Link>
          </section>
        )}
        <PilotCityMap cityState={pilotCityState(user.user_metadata)} initiallyExpanded={false} />
      </div>
    </main>
  );
}
