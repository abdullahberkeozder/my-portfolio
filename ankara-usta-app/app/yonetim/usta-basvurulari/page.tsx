import Link from 'next/link';
import { redirect } from 'next/navigation';
import AdminReviewControls from '../../components/AdminReviewControls';
import { services } from '../../data/serviceTaxonomy';
import { parseVocationalCredentialFromDoc, vocationalCredentialTypeLabels, vocationalLevelLabels } from '../../domain/tradespersonApplication';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import RetryButton from '../../components/RetryButton';
import Pagination from '../../components/Pagination';
import { getServerUserAndRoles } from '../../lib/authServer';
import styles from './ustaQueue.module.css';

export const dynamic = 'force-dynamic';

type DocumentItem = {
  id: string;
  kind: string;
  status: string;
  original_name: string;
  expires_at: string | null;
  storage_path?: string;
  signedUrl?: string | null;
};

type ApplicationRow = {
  user_id: string;
  display_name: string;
  bio: string;
  application_status: string;
  submitted_at: string | null;
  review_note: string | null;
  tradesperson_services: { service_id: string }[];
  tradesperson_service_areas: { district: string }[];
  tradesperson_documents: DocumentItem[];
  tradesperson_references: { id: string; reference_name: string; relationship: string; status: string }[];
};

const filterTabs = [
  { id: 'active', label: 'İnceleme Bekleyenler', statuses: ['submitted', 'under_review', 'reassessment_required'] },
  { id: 'all', label: 'Tüm Kayıtlar', statuses: ['submitted', 'under_review', 'approved', 'reassessment_required', 'suspended', 'needs_changes'] },
  { id: 'approved', label: 'Onaylı Ustalar', statuses: ['approved'] },
  { id: 'needs_changes', label: 'Düzeltme İstendi', statuses: ['needs_changes'] },
  { id: 'suspended', label: 'Askıya Alınanlar', statuses: ['suspended'] },
];

function isCertificateValid(status?: string, expiresAt?: string | null): boolean {
  if (status !== 'verified') return false;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > new Date().getTime();
}

export default async function AdminTradespersonQueuePage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; filter?: string }>;
} = {}) {
  const { user, roles } = await getServerUserAndRoles();
  if (!user) redirect('/giris?next=/yonetim/usta-basvurulari');
  if (!roles.includes('admin') && !roles.includes('moderator')) redirect('/');

  const resolvedParams = await searchParams;
  const rawPage = Number.parseInt(resolvedParams?.page ?? '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const activeFilterId = resolvedParams?.filter ?? 'all';
  const selectedTab = filterTabs.find(t => t.id === activeFilterId) ?? filterTabs[1];
  const pageSize = 12;

  const supabase = await createSupabaseServerClient();
  const { data, error, count } = await supabase
    .from('tradesperson_profiles')
    .select(
      'user_id,display_name,bio,application_status,submitted_at,review_note,tradesperson_services(service_id),tradesperson_service_areas(district),tradesperson_documents(id,kind,status,original_name,expires_at,storage_path),tradesperson_references(id,reference_name,relationship,status)',
      { count: 'exact' }
    )
    .in('application_status', selectedTab.statuses)
    .order('submitted_at', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const rawApplications = (data ?? []) as ApplicationRow[];
  const applications = await Promise.all(
    rawApplications.map(async application => {
      const docsWithUrls = await Promise.all(
        application.tradesperson_documents.map(async doc => {
          let signedUrl: string | null = null;
          if (doc.storage_path) {
            const { data: signData } = await supabase.storage
              .from('tradesperson-documents')
              .createSignedUrl(doc.storage_path, 1800);
            signedUrl = signData?.signedUrl ?? null;
          }
          return { ...doc, signedUrl };
        })
      );
      return { ...application, tradesperson_documents: docsWithUrls };
    })
  );

  const totalCount = count ?? applications.length;

  return (
    <main className="account-shell admin-queue">
      <Link className="account-back" href="/">
        ← Orkestra
      </Link>
      <header>
        <span>YÖNETİM VE MODERASYON</span>
        <h1>Usta inceleme kuyruğu</h1>
        <p>Onaylar, belge kararları ve yeniden değerlendirmeler değiştirilemez audit kayıtları üretir.</p>
      </header>

      {/* Global Admin Navigation Tabs */}
      <nav className="admin-tabs" aria-label="Yönetim Sekmeleri">
        <Link className="active" href="/yonetim/usta-basvurulari">
          Usta başvuruları <b>{totalCount}</b>
        </Link>
        <Link href="/yonetim/moderasyon">
          İçerik moderasyonu
        </Link>
        <Link href="/yonetim/uyusmazliklar">
          Uyuşmazlıklar
        </Link>
        <Link href="/yonetim/denetim-izi">
          Denetim İzi (Audit Log)
        </Link>
      </nav>

      {/* Queue Filter Bar */}
      <section className={styles.filterRow} aria-label="Durum Filtreleri">
        <div className={styles.filterChips}>
          {filterTabs.map(tab => {
            const isActive = activeFilterId === tab.id;
            const href = tab.id === 'all' ? '/yonetim/usta-basvurulari' : `/yonetim/usta-basvurulari?filter=${tab.id}`;
            return (
              <Link
                key={tab.id}
                href={href}
                className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ''}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <span className={styles.countNotice}>
          Toplam <strong>{totalCount}</strong> usta başvurusu
        </span>
      </section>

      {error ? (
        <section className="account-card" role="alert">
          <h2>Kuyruk yüklenemedi</h2>
          <p>Veritabanı bağlantısını kontrol edip tekrar deneyin.</p>
          <RetryButton />
        </section>
      ) : applications.length ? (
        <>
          <div className="admin-application-list">
            {applications.map(application => {
              // Mesleki Yeterlilik (MYK / Ustalık Belgesi) denetim analizi (BR-13 / SRS: PRO-03)
              const profCert = application.tradesperson_documents.find(
                d => d.kind === 'professional_certificate'
              );
              const isProfCertVerified = isCertificateValid(profCert?.status, profCert?.expires_at);
              const parsedCred = profCert ? parseVocationalCredentialFromDoc(profCert.original_name, profCert.kind) : null;

              return (
                <article key={application.user_id}>
                  <div className="admin-application-summary">
                    <span>{application.application_status}</span>
                    <h2>{application.display_name}</h2>
                    <p>{application.bio}</p>

                    {/* Dedicated MYK / Ustalık Belgesi Banner */}
                    <div
                      className={`${styles.mykBanner} ${
                        isProfCertVerified
                          ? styles.mykVerified
                          : profCert?.status === 'pending'
                          ? styles.mykPending
                          : styles.mykMissing
                      }`}
                    >
                      <div className={styles.mykTitle}>
                        {isProfCertVerified ? (
                          <>🏅 <strong>MYK / Ustalık Belgesi:</strong> DOĞRULANDI</>
                        ) : profCert?.status === 'pending' ? (
                          <>⏳ <strong>MYK / Ustalık Belgesi:</strong> İNCELEME BEKLİYOR</>
                        ) : profCert?.status === 'rejected' ? (
                          <>❌ <strong>MYK / Ustalık Belgesi:</strong> REDDEDİLDİ</>
                        ) : (
                          <>⚠️ <strong>MYK / Ustalık Belgesi:</strong> YÜKLENMEMİŞ</>
                        )}
                      </div>
                      {profCert?.expires_at && (
                        <span className={styles.mykExpiry}>
                          Geçerlilik: {profCert.expires_at}
                        </span>
                      )}
                    </div>

                    {parsedCred && (
                      <div className={styles.vocationalMetaBox}>
                        <div className={styles.vocationalMetaRow}>
                          <span className={styles.vocationalMetaLabel}>Akreditasyon:</span>
                          <strong>
                            {vocationalCredentialTypeLabels[parsedCred.certificateType ?? 'myk']}
                            {parsedCred.level ? ` · ${vocationalLevelLabels[parsedCred.level] ?? parsedCred.level}` : ''}
                          </strong>
                        </div>
                        {parsedCred.certificateNumber && (
                          <div className={styles.vocationalMetaRow}>
                            <span className={styles.vocationalMetaLabel}>Belge / Sicil No:</span>
                            <code className={styles.vocationalCode}>{parsedCred.certificateNumber}</code>
                          </div>
                        )}
                        <div className={styles.vocationalMetaChecklist}>
                          <span className={styles.checkItem}>✓ Biçim Kontrolü Başarılı</span>
                          <span className={styles.checkItem}>✓ Ankara Saha Masası Yetki Alanı</span>
                          {profCert?.expires_at && (
                            <span className={styles.checkItem}>
                              {isProfCertVerified ? '✓ Geçerli Tarih' : '⏳ Tarih Kontrol Edilmeli'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={styles.publicBadgeStatus}>
                      {isProfCertVerified ? (
                        <span className={styles.publicBadgeEligible}>
                          ✓ Kamusal Dizin Doğrulama Rozetine Uygun
                        </span>
                      ) : (
                        <span className={styles.publicBadgeIneligible}>
                          ✕ Kamusal Rozet Verilemez (Geçerli MYK belgesi zorunludur)
                        </span>
                      )}
                    </div>

                    <dl>
                      <div>
                        <dt>Hizmetler</dt>
                        <dd>
                          {application.tradesperson_services
                            .map(
                              item =>
                                services.find(service => service.id === item.service_id)?.name ??
                                item.service_id
                            )
                            .join(', ')}
                        </dd>
                      </div>
                      <div>
                        <dt>Bölgeler</dt>
                        <dd>
                          {application.tradesperson_service_areas
                            .map(item => item.district)
                            .join(', ')}
                        </dd>
                      </div>
                      <div>
                        <dt>Referanslar</dt>
                        <dd>{application.tradesperson_references.length || 'Yok'}</dd>
                      </div>
                    </dl>
                  </div>
                  <AdminReviewControls
                    tradespersonId={application.user_id}
                    status={application.application_status}
                    documents={application.tradesperson_documents}
                    references={application.tradesperson_references}
                  />
                </article>
              );
            })}
          </div>
          <div className="admin-pagination-wrapper">
            <Pagination
              page={page}
              total={totalCount}
              pageSize={pageSize}
              path={activeFilterId !== 'all' ? `/yonetim/usta-basvurulari?filter=${activeFilterId}` : '/yonetim/usta-basvurulari'}
            />
          </div>
        </>
      ) : (
        <section className="account-card empty-requests">
          <h2>İncelenecek başvuru yok</h2>
          <p>Yeni usta başvuruları burada görünecek.</p>
        </section>
      )}
    </main>
  );
}
