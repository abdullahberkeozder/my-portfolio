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
import RequestStatusBadge from '../components/RequestStatusBadge';
import { resolveCustomerRequestAction } from '../lib/requestStatusResolver';
import WorkspacePartialNotice from '../components/WorkspacePartialNotice';
import styles from '../components/workspaceList.module.css';
import { U5VisualFixture, type U5VisualFixtureKind } from '../components/U5VisualFixture';

function actionClass(variant: 'primary' | 'secondary' | 'neutral') {
  return variant === 'primary' ? styles.actionPrimary : variant === 'secondary' ? styles.actionSecondary : styles.actionNeutral;
}

export const dynamic = 'force-dynamic';

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; fixture?: string; view?: string }>;
}) {
  const params = await searchParams;
  const rawPage = Number.parseInt(params.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = 12;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError && authError.name !== 'AuthSessionMissingError') {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.state} role="alert">
            <h1>Oturum bilgisi doğrulanamadı</h1>
            <p>Hesabınızı ve taleplerinizi güvenle gösterebilmek için bağlantıyı yeniden deneyin.</p>
            <RetryButton />
          </div>
        </div>
      </main>
    );
  }
  if (!user) redirect('/giris?next=/taleplerim');

  const visualFixture = process.env.ORKESTRA_U5_VISUAL_FIXTURES === 'true'
    ? params.fixture
    : undefined;
  if (visualFixture && ['empty', 'partial-error', 'expired', 'direct-link'].includes(visualFixture)) {
    return <U5VisualFixture audience="customer" kind={visualFixture as U5VisualFixtureKind} view={params.view === 'direct' ? 'direct' : 'open'} />;
  }

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
  let quotesSummaryFailed = false;
  let jobsSummaryFailed = false;

  if (requestIds.length > 0) {
    try {
      const quotesQuery = supabase
        .from('quotes')
        .select('request_id, status');
      if (typeof quotesQuery.in === 'function') {
        const { data: quotesData, error: quotesError } = await quotesQuery
          .in('request_id', requestIds)
          .in('status', ['submitted', 'accepted']);
        if (quotesError) quotesSummaryFailed = true;
        for (const q of quotesData ?? []) {
          quotesCountMap.set(q.request_id, (quotesCountMap.get(q.request_id) ?? 0) + 1);
        }
      }
    } catch {
      quotesSummaryFailed = true;
    }

    try {
      const jobsQuery = supabase
        .from('jobs')
        .select('id, request_id')
        .eq('customer_id', user.id);
      if (typeof jobsQuery.in === 'function') {
        const { data: jobsData, error: jobsError } = await jobsQuery.in('request_id', requestIds);
        if (jobsError) jobsSummaryFailed = true;
        for (const j of jobsData ?? []) {
          jobsMap.set(j.request_id, j.id);
        }
      }
    } catch {
      jobsSummaryFailed = true;
    }
  }

  return (
    <main className={styles.page}>
      {directedRequestsEnabled() && (
        <RealtimeRefresh
          channelName={`my-invitations-${user.id}`}
          subscriptions={[{ table: 'request_invitations', filter: `customer_id=eq.${user.id}` }]}
          label="Talep yanıtları"
        />
      )}
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>Taleplerim</h1>
            <p>Taleplerinizin durumunu ve sonraki adımı buradan takip edin.</p>
          </div>
          <div className={styles.headerActions}>
            {prejobChatEnabled() && (
              <Link
                href="/gorusmeler"
                className={styles.headerLink}
              >
                Görüşmelerim
              </Link>
            )}
            <Link
              className={`${styles.headerPrimary} ${styles.customerNew}`}
              href="/#services"
            >
              Yeni talep
            </Link>
          </div>
        </header>

        {/* Error state */}
        {error ? (
          <div className={styles.state} role="alert">
            <h2>Talepler yüklenemedi</h2>
            <p>Bir bağlantı sorunu oluştu. Sayfayı yenileyerek tekrar deneyin.</p>
            <RetryButton />
          </div>
        ) : requests?.length ? (
          <>
            {(quotesSummaryFailed || jobsSummaryFailed || invitations?.error) && (
              <WorkspacePartialNotice message="Talepleriniz gösteriliyor, ancak teklif sayıları, davet yanıtları veya iş bağlantıları güncel olmayabilir. İşlem yapmadan önce yeniden deneyin." />
            )}
            <div className={styles.list}>
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
                const actionRes = resolveCustomerRequestAction({
                  requestId: request.id,
                  status: request.status,
                  quoteCount,
                  jobId,
                  isDraft,
                });

                return (
                  <article
                    key={request.id}
                    className={styles.item}
                    data-testid={`request-card-${request.id}`}
                  >
                    <div className={styles.itemMain}>
                      <div className={styles.itemTop}>
                        <RequestStatusBadge status={request.status} quoteCount={quoteCount} />
                        {request.routing_mode === 'direct' && (
                          <span className={styles.itemKind}>Ustaya özel</span>
                        )}
                      </div>

                      <h2>
                        {service?.name ?? request.service_id}
                      </h2>

                      <div className={styles.meta}>
                        {request.neighborhood && request.district ? (
                          <span>{request.neighborhood}, {request.district}</span>
                        ) : (
                          <span className={styles.metaWarning}>Konum henüz eklenmedi</span>
                        )}
                        {request.preferred_timing && (
                          <>
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
                        <p role="alert" className={styles.supporting}>
                          Yanıt durumu yüklenemedi.
                        </p>
                      )}
                    </div>

                    <div className={styles.itemActions}>
                      <time dateTime={request.updated_at}>
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
                        <div className={styles.actionGroup}>
                          {actionRes.primaryAction && (
                            <Link
                              href={actionRes.primaryAction.href}
                              className={actionClass(actionRes.primaryAction.variant)}
                            >
                              {actionRes.primaryAction.label}
                            </Link>
                          )}
                          {actionRes.secondaryAction && (
                            <Link
                              href={actionRes.secondaryAction.href}
                              className={actionClass(actionRes.secondaryAction.variant)}
                            >
                              {actionRes.secondaryAction.label}
                            </Link>
                          )}
                          {actionRes.helperText && <span>{actionRes.helperText}</span>}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <Pagination page={page} total={count ?? 0} pageSize={pageSize} path="/taleplerim" />
          </>
        ) : (
          <section className={styles.state}>
            <h2>Henüz talebiniz yok</h2>
            <p>
              Ev işleriniz için profesyonel yardım almaya hazır mısınız? Hizmeti seçin,
              kapsamı belirleyin, teklifleri karşılaştırın.
            </p>
            <Link
              className={styles.headerPrimary}
              href="/#services"
            >
              İlk Talebimi Oluştur
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
