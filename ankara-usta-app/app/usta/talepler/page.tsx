import Link from 'next/link';
import { prejobChatEnabled } from '../../lib/prejobChat';
import { redirect } from 'next/navigation';
import { requestTimingLabel } from '../../domain/requestTiming';
import { invitationState, type RequestInvitation } from '../../domain/requestInvitation';
import { services } from '../../data/serviceTaxonomy';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { directedRequestsEnabled } from '../../lib/directedRequests';
import RequestInvitationPanel from '../../components/RequestInvitationPanel';
import RealtimeRefresh from '../../components/RealtimeRefresh';
import RetryButton from '../../components/RetryButton';
import WorkspacePartialNotice from '../../components/WorkspacePartialNotice';
import { resolveTradespersonOpportunityAction } from '../../lib/requestStatusResolver';
import styles from '../../components/workspaceList.module.css';
import { U5VisualFixture, type U5VisualFixtureKind } from '../../components/U5VisualFixture';

function actionClass(variant: 'primary' | 'secondary' | 'neutral') {
  return variant === 'primary' ? styles.actionPrimary : variant === 'secondary' ? styles.actionSecondary : styles.actionNeutral;
}

export const dynamic = 'force-dynamic';

type Scope = {
  service_id: string;
  district: string;
  neighborhood: string;
  preferred_timing: string;
  status: string;
  routing_mode?: string;
};

type Opportunity = {
  request_id: string;
  score?: number;
  reasons?: string[];
  service_requests: Scope | null;
};

type InvitationRow = RequestInvitation & Opportunity;

type MyQuoteSummary = {
  id: string;
  request_id: string;
  version: number;
  status: string;
  labor_amount_kurus: number;
  material_amount_kurus: number;
};

function WorkspaceFailure({ title, message }: { title: string; message: string }) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.state} role="alert">
          <h1>{title}</h1>
          <p>{message}</p>
          <RetryButton />
        </div>
      </div>
    </main>
  );
}

export default async function TradespersonRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; page?: string; fixture?: string }>;
}) {
  const params = await searchParams;
  const enabled = directedRequestsEnabled();
  const view = enabled && params.view !== 'open' ? 'direct' : 'open';
  const page = Math.min(1000, Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1));
  const pageSize = 12;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError && authError.name !== 'AuthSessionMissingError') {
    return <WorkspaceFailure title="Oturum bilgisi doğrulanamadı" message="Usta çalışma alanını güvenle açabilmek için bağlantıyı yeniden deneyin." />;
  }
  if (!user) redirect('/giris?next=/usta/talepler');

  const { data: tradespersonRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'tradesperson')
    .maybeSingle();
  if (roleError) {
    return <WorkspaceFailure title="Yetki bilgisi doğrulanamadı" message="Usta hesabınızın erişim durumu alınamadı. Lütfen yeniden deneyin." />;
  }
  if (!tradespersonRole) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.state} role="alert">
            <h1>Usta alanına erişiminiz yok</h1>
            <p>Bu alan yalnız usta rolü etkinleştirilmiş hesaplar tarafından kullanılabilir.</p>
            <Link className={styles.headerPrimary} href="/taleplerim">Müşteri alanına dön</Link>
          </section>
        </div>
      </main>
    );
  }

  const visualFixture = process.env.ORKESTRA_U5_VISUAL_FIXTURES === 'true'
    ? params.fixture
    : undefined;
  if (visualFixture && ['empty', 'partial-error', 'expired', 'direct-link'].includes(visualFixture)) {
    return <U5VisualFixture audience="tradesperson" kind={visualFixture as U5VisualFixtureKind} view={view} />;
  }

  let rows: Opportunity[] = [];
  let invitations: InvitationRow[] = [];
  let failed = false;
  let count = 0;

  if (view === 'direct') {
    const result = await supabase
      .from('request_invitations')
      .select(
        '*,service_requests!request_invitations_request_id_fkey(service_id,district,neighborhood,preferred_timing,status)',
        { count: 'exact' }
      )
      .eq('professional_id', user.id)
      .order('created_at', { ascending: false })
      .order('request_id')
      .range((page - 1) * pageSize, page * pageSize - 1);

    invitations = (result.data ?? []) as unknown as InvitationRow[];
    rows = invitations;
    failed = Boolean(result.error);
    count = result.count ?? 0;
  } else {
    let query = supabase
      .from('request_matches')
      .select('request_id,score,reasons,service_requests!inner(*)', { count: 'exact' })
      .eq('tradesperson_id', user.id);

    if (enabled) query = query.eq('service_requests.routing_mode', 'open');

    const result = await query
      .order('score', { ascending: false })
      .order('request_id')
      .range((page - 1) * pageSize, page * pageSize - 1);

    rows = (result.data ?? []) as unknown as Opportunity[];
    failed = Boolean(result.error);
    count = result.count ?? 0;
  }

  // Load existing quotes submitted by this tradesperson for these requests
  const requestIds = rows.map((r) => r.request_id);
  const myQuotesMap = new Map<string, MyQuoteSummary>();
  const jobsMap = new Map<string, string>();
  let quotesSummaryFailed = false;
  let jobsSummaryFailed = false;

  if (requestIds.length > 0) {
    try {
      const quotesQuery = supabase
        .from('quotes')
        .select('id, request_id, version, status, labor_amount_kurus, material_amount_kurus')
        .eq('tradesperson_id', user.id);
      if (typeof quotesQuery.in === 'function') {
        const { data: myQuotes, error: quotesError } = await quotesQuery.in('request_id', requestIds);
        if (quotesError) quotesSummaryFailed = true;
        for (const q of (myQuotes ?? []) as unknown as MyQuoteSummary[]) {
          myQuotesMap.set(q.request_id, q);
        }
      }
    } catch {
      quotesSummaryFailed = true;
    }

    try {
      const jobsQuery = supabase
        .from('jobs')
        .select('id, request_id')
        .eq('tradesperson_id', user.id);
      if (typeof jobsQuery.in === 'function') {
        const { data: jobs, error: jobsError } = await jobsQuery.in('request_id', requestIds);
        if (jobsError) jobsSummaryFailed = true;
        for (const job of jobs ?? []) jobsMap.set(job.request_id, job.id);
      }
    } catch {
      jobsSummaryFailed = true;
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1>İş fırsatları</h1>
            <p>Size özel ve uygun açık talepleri inceleyin, sonraki adıma karar verin.</p>
          </div>
          <div className={styles.headerActions}>
            {prejobChatEnabled() && (
              <Link className={styles.headerLink} href="/gorusmeler">
                Görüşmelerim
              </Link>
            )}
            <Link className={styles.headerLink} href="/usta/musaitlik">
              Müsaitliğimi güncelle
            </Link>
          </div>
        </header>

        {/* Realtime Subscription */}
        {enabled && (
          <RealtimeRefresh
            channelName={`opportunities-${user.id}`}
            subscriptions={[
              { table: 'request_invitations', filter: `professional_id=eq.${user.id}` },
              { table: 'request_matches', filter: `tradesperson_id=eq.${user.id}` },
            ]}
            label="İş fırsatları"
          />
        )}

        {/* Navigation Tabs */}
        <nav className={styles.tabs} aria-label="Talep türü">
          {enabled && (
            <Link
              href="/usta/talepler?view=direct"
              aria-current={view === 'direct' ? 'page' : undefined}
            >
              Bana özel talepler
            </Link>
          )}
          <Link
            href="/usta/talepler?view=open"
            aria-current={view === 'open' ? 'page' : undefined}
          >
            Uygun açık talepler
          </Link>
        </nav>

        {/* Error State */}
        {failed ? (
          <div className={styles.state} role="alert">
            <h2>Talepler yüklenemedi</h2>
            <p>Bağlantıyı yeniden deneyin. Bu sırada hiçbir fırsat kaybolmaz.</p>
            <RetryButton />
          </div>
        ) : rows.length ? (
          <>
          {(quotesSummaryFailed || jobsSummaryFailed) && (
            <WorkspacePartialNotice message="Fırsatlarınız gösteriliyor, ancak teklif veya iş bağlantıları güncel olmayabilir. İşlem yapmadan önce yeniden deneyin." />
          )}
          <div className={styles.list}>
            {rows.map((row) => {
              const request = row.service_requests;
              if (!request) return null;
              const invitation = invitations.find((i) => i.request_id === row.request_id);
              const myQuote = myQuotesMap.get(row.request_id);
              const jobId = jobsMap.get(row.request_id);
              const service = services.find((s) => s.id === request.service_id);
              const directState = invitation ? invitationState(invitation, Date.now()) : null;
              const opportunityClosed =
                request.status === 'provider_selected' ||
                request.status === 'expired' ||
                request.status === 'cancelled' ||
                directState === 'expired' ||
                directState === 'declined' ||
                directState === 'broadened';
              const actionRes = resolveTradespersonOpportunityAction({
                requestId: row.request_id,
                opportunityClosed,
                myQuote,
                jobId,
              });

              return (
                <article key={row.request_id} className={styles.item} data-testid={`opportunity-card-${row.request_id}`}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemTop}>
                      {invitation ? (
                        <span className={styles.itemKind}>Size özel</span>
                      ) : null}

                      {myQuote?.status === 'accepted' ? (
                          <span className="req-status-badge req-status-success">
                            Teklifiniz kabul edildi
                          </span>
                      ) : opportunityClosed ? (
                          <span className="req-status-badge req-status-neutral">
                            {directState === 'expired' || request.status === 'expired' ? 'Yanıt süresi doldu' : 'Fırsat kapandı'}
                          </span>
                      ) : myQuote ? (
                          <span className="req-status-badge req-status-info">
                            Teklifiniz iletildi
                          </span>
                      ) : (
                        <span className="req-status-badge req-status-warning">
                          Yeni fırsat
                        </span>
                      )}
                    </div>

                    <h2>
                      {service?.name ?? request.service_id}
                    </h2>
                    {myQuote && <p className={styles.supporting}>Teklif v{myQuote.version} · {Math.round((myQuote.labor_amount_kurus + myQuote.material_amount_kurus) / 100).toLocaleString('tr-TR')} ₺</p>}

                    <div className={styles.meta}>
                      <span>{[request.neighborhood, request.district].filter(Boolean).join(', ') || 'Konum paylaşılmadı'}</span>
                      <span>{requestTimingLabel(request.preferred_timing)}</span>
                    </div>

                    {/* Invitation Panel or Match Reasons */}
                    {invitation ? (
                      <div className={styles.invitation}>
                        <RequestInvitationPanel
                          key={invitation.status}
                          invitation={invitation}
                          serviceId={request.service_id}
                          role="professional"
                          compact
                        />
                      </div>
                    ) : row.reasons?.length ? (
                      <details className={styles.reasons}>
                        <summary>Neden uygun?</summary>
                        <ul>{row.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
                      </details>
                    ) : null}
                  </div>

                  <div className={styles.itemActions}>
                    <div className={styles.actionGroup}>
                      {actionRes.primaryAction && (
                        <Link
                          className={actionClass(actionRes.primaryAction.variant)}
                          href={actionRes.primaryAction.href}
                        >
                          {actionRes.primaryAction.label}
                        </Link>
                      )}
                      {actionRes.secondaryAction && (
                        <Link
                          className={actionClass(actionRes.secondaryAction.variant)}
                          href={actionRes.secondaryAction.href}
                        >
                          {actionRes.secondaryAction.label}
                        </Link>
                      )}
                      {actionRes.helperText && <span>{actionRes.helperText}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          </>
        ) : (
          <section className={styles.state}>
            <h2>{view === 'direct' ? 'Henüz size özel talep yok' : 'Uygun açık talep bulunamadı'}</h2>
            <p>
              {view === 'direct'
                ? 'Müşterilerin doğrudan profilinizi seçerek gönderdiği talepler burada listelenir.'
                : 'Hizmet, bölge, doğrulama ve müsaitlik koşullarınıza uygun açık havuz talepleri burada listelenir.'}
            </p>
            <Link href="/usta/musaitlik" className={styles.headerLink}>
              Müsaitlik ve bölgeleri incele
            </Link>
          </section>
        )}

        {/* Pagination */}
        <nav className="pagination" aria-label="Talep sayfaları" style={{ marginTop: '24px' }}>
          {page > 1 && (
            <Link href={`/usta/talepler?view=${view}&page=${page - 1}`}>
              ← Önceki
            </Link>
          )}
          <span>Sayfa {page}</span>
          {page * pageSize < count && (
            <Link href={`/usta/talepler?view=${view}&page=${page + 1}`}>
              Sonraki →
            </Link>
          )}
        </nav>

      </div>
    </main>
  );
}
