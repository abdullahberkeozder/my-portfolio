'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { serviceCategories, services } from '../data/serviceTaxonomy';
import { ankaraDistricts } from '../domain/tradespersonApplication';
import { createSupabaseBrowserClient } from '../lib/supabase/browser';
import Button from '../components/Button';

const documentKinds = {
  professional_certificate: 'Mesleki Yeterlilik Belgesi / Ustalık Belgesi',
  identity: 'Kimlik / Ehliyet Belgesi',
  address: 'İkametgah / Faaliyet Belgesi',
  reference_evidence: 'Referans İş / Uygulama Kanıtı',
} as const;

const applicationSteps = ['Profil & Uzmanlık', 'Hizmet Alanları', 'Çalışma Bölgeleri', 'Belge Yükleme', 'Önizleme & Onay'] as const;
const draftKey = 'ankara-usta:tradesperson-application-full';

// District Regional Clusters
const districtClusters: Record<string, typeof ankaraDistricts[number][]> = {
  merkez: ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Altındağ'],
  bati: ['Etimesgut', 'Sincan'],
  cevre: ['Gölbaşı', 'Pursaklar'],
};

export default function TradespersonApplicationPage() {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [referenceName, setReferenceName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [referencePhone, setReferencePhone] = useState('');
  const [documentKind, setDocumentKind] = useState<keyof typeof documentKinds>('professional_certificate');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [draftReady, setDraftReady] = useState(false);

  // Filters for Step 1 (Services)
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedServiceCat, setSelectedServiceCat] = useState<string>('all');

  // Load Full Draft on Mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(draftKey);
        if (raw) {
          const draft = JSON.parse(raw) as {
            updatedAt?: number;
            displayName?: string;
            bio?: string;
            serviceIds?: string[];
            districts?: string[];
            referenceName?: string;
            relationship?: string;
            referencePhone?: string;
            documentKind?: keyof typeof documentKinds;
            expiresAt?: string;
          };
          if (!draft.updatedAt || Date.now() - draft.updatedAt > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(draftKey);
            return;
          }
          if (draft.displayName) setDisplayName(draft.displayName);
          if (draft.bio) setBio(draft.bio);
          if (draft.serviceIds) setServiceIds(draft.serviceIds);
          if (draft.districts) setDistricts(draft.districts);
          if (draft.referenceName) setReferenceName(draft.referenceName);
          if (draft.relationship) setRelationship(draft.relationship);
          if (draft.referencePhone) setReferencePhone(draft.referencePhone);
          if (draft.documentKind) setDocumentKind(draft.documentKind);
          if (draft.expiresAt) setExpiresAt(draft.expiresAt);
        }
      } catch {
        /* Bozuk yerel taslak yeni başvuruyu engellemez. */
      } finally {
        setDraftReady(true);
      }
    });
  }, []);

  // Save Full Draft on Change
  useEffect(() => {
    if (draftReady) {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          updatedAt: Date.now(),
          displayName,
          bio,
          serviceIds,
          districts,
          referenceName,
          relationship,
          referencePhone,
          documentKind,
          expiresAt,
        })
      );
    }
  }, [draftReady, displayName, bio, serviceIds, districts, referenceName, relationship, referencePhone, documentKind, expiresAt]);

  function toggle(value: string, current: string[], setter: (value: string[]) => void) {
    setter(current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  }

  function applyDistrictCluster(clusterKeys: (typeof ankaraDistricts[number])[]) {
    const next = Array.from(new Set([...districts, ...clusterKeys]));
    setDistricts(next);
  }

  function nextStep() {
    const valid =
      step === 0
        ? displayName.trim().length >= 2 && bio.trim().length >= 20
        : step === 1
        ? serviceIds.length > 0
        : step === 2
        ? districts.length > 0
        : step === 3
        ? Boolean(file)
        : true;

    if (!valid) {
      setMessage(
        step === 0
          ? 'Adınızı/işletmenizi ve en az 20 karakterlik uzmanlık açıklamanızı tamamlayın.'
          : step === 1
          ? 'Lütfen sunabileceğiniz en az bir hizmet seçin.'
          : step === 2
          ? 'En az bir çalışma bölgesi/ilçe seçin.'
          : 'Devam etmek için bir mesleki veya kimlik belgesi yükleyin.'
      );
      return;
    }
    setMessage('');
    setStep(value => Math.min(value + 1, applicationSteps.length - 1));
  }

  async function uploadDocument() {
    if (!file) throw new Error('Devam etmek için bir belge yükleyin.');
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Belge yüklemek için giriş yapın.');
    const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const storagePath = `${user.id}/${documentKind}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from('tradesperson-verification')
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (error) throw error;
    return {
      kind: documentKind,
      storagePath,
      originalName: file.name,
      contentType: file.type,
      byteSize: file.size,
      expiresAt: expiresAt || undefined,
    };
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const reference =
        referenceName && relationship
          ? { name: referenceName, relationship, phone: referencePhone || undefined }
          : undefined;
      const document = await uploadDocument();
      const response = await fetch('/api/tradespeople/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, serviceIds, districts, reference, document }),
      });
      const body = (await response.json()) as { error?: string };
      if (response.status === 401) {
        setMessage('Başvuru için önce kullanıcı hesabınızla giriş yapın.');
        return;
      }
      if (!response.ok) {
        await createSupabaseBrowserClient()
          .storage.from('tradesperson-verification')
          .remove([document.storagePath]);
        throw new Error(body.error ?? 'Başvuru gönderilemedi.');
      }
      localStorage.removeItem(draftKey);
      setMessage('Başvurunuz ve belgeniz inceleme masasına alındı. Moderatör onayının ardından doğrulama rozetiniz aktifleşecektir.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Başvuru gönderilemedi.');
    } finally {
      setBusy(false);
    }
  }

  const progressPercent = Math.round(((step + 1) / applicationSteps.length) * 100);

  // Filtered services for Step 1
  const filteredServices = services.filter(service => {
    const matchesCat = selectedServiceCat === 'all' || service.categoryId === selectedServiceCat;
    const matchesQuery = !serviceSearch.trim() || service.name.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <main className="account-shell tradesperson-application">
      <Link className="account-back" href="/">← Ankara Usta Ana Sayfa</Link>
      <form className="application-card" onSubmit={submit}>
        <span className="application-kicker">ZANAATKAR & USTA AĞI</span>
        <h1>Ankara Usta Ağına Katılın</h1>
        <p>Uzmanlığınızı ve hizmet bölgelerinizi tanımlayın. Formdaki tüm tercihleriniz bu cihazda otomatik taslak olarak saklanır.</p>

        <div className="application-progress-wrapper">
          <div className="wizard-progress" role="progressbar" aria-label="Başvuru ilerleme durumu" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <nav className="application-progress" aria-label="Başvuru adımları">
            {applicationSteps.map((label, index) => (
              <button
                key={label}
                type="button"
                className={index === step ? 'active' : index < step ? 'complete' : ''}
                disabled={index > step}
                onClick={() => index < step && setStep(index)}
                aria-current={index === step ? 'step' : undefined}
                aria-label={`${index + 1}. Adım: ${label}`}
              >
                <i>{index < step ? '✓' : index + 1}</i>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="application-step-heading">
          <span>ADIM {step + 1} / {applicationSteps.length} · %{progressPercent} Tamamlandı</span>
          <b>{applicationSteps[step]}</b>
        </div>

        {/* Step 0: Profile */}
        {step === 0 && (
          <div className="application-fields">
            <label>
              Usta / İşletme Adınız
              <input
                autoFocus
                required
                minLength={2}
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                placeholder="Örn: Ahmet Usta / Başkent Tesisat"
              />
            </label>
            <label>
              Deneyim ve Uzmanlık Açıklaması
              <textarea
                required
                minLength={20}
                rows={5}
                value={bio}
                onChange={event => setBio(event.target.value)}
                placeholder="Kaç yıldır Ankara'da hizmet verdiğinizi, uzman olduğunuz alanları ve çalışma prensiplerinizi en az 20 karakterle açıklayın."
              />
            </label>
          </div>
        )}

        {/* Step 1: Searchable Services */}
        {step === 1 && (
          <fieldset className="services-step-fieldset">
            <legend className="sr-only">Vereceğiniz hizmetler</legend>
            <div className="services-filter-bar">
              <div className="search-filter-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={serviceSearch}
                  onChange={e => setServiceSearch(e.target.value)}
                  placeholder="26 hizmet içinde ara (örn: musluk, montaj, boya)..."
                />
              </div>
              <div className="category-filter-pills" role="tablist">
                <button
                  type="button"
                  className={`filter-pill ${selectedServiceCat === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedServiceCat('all')}
                >
                  Tümü (26)
                </button>
                {serviceCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`filter-pill ${selectedServiceCat === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedServiceCat(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="choice-grid services-selection-grid">
              {filteredServices.map(service => {
                const isChecked = serviceIds.includes(service.id);
                return (
                  <label className={`service-choice-card ${isChecked ? 'checked' : ''}`} key={service.id}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(service.id, serviceIds, setServiceIds)}
                    />
                    <div className="choice-card-text">
                      <strong>{service.name}</strong>
                      <small>{serviceCategories.find(c => c.id === service.categoryId)?.name}</small>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="selected-summary-line">
              <span>Seçilen Hizmet Sayısı: <strong>{serviceIds.length}</strong></span>
              {serviceIds.length > 0 && (
                <button type="button" className="text-action-link" onClick={() => setServiceIds([])}>
                  Tümünü Temizle
                </button>
              )}
            </div>
          </fieldset>
        )}

        {/* Step 2: District Clusters */}
        {step === 2 && (
          <fieldset className="districts-step-fieldset">
            <legend className="sr-only">Çalışma bölgeleri</legend>
            <div className="district-clusters-bar">
              <span className="cluster-label">Hızlı Bölge Seçimi:</span>
              <button type="button" className="cluster-chip-btn" onClick={() => applyDistrictCluster(districtClusters.merkez)}>
                + Merkez İlçeler (5 İlçe)
              </button>
              <button type="button" className="cluster-chip-btn" onClick={() => applyDistrictCluster(districtClusters.bati)}>
                + Batı İlçeleri (2 İlçe)
              </button>
              <button type="button" className="cluster-chip-btn" onClick={() => applyDistrictCluster(districtClusters.cevre)}>
                + Çevre İlçeler (2 İlçe)
              </button>
              <button type="button" className="cluster-chip-btn select-all-chip" onClick={() => setDistricts([...ankaraDistricts])}>
                ✓ Tüm Ankara (9 İlçe)
              </button>
              {districts.length > 0 && (
                <button type="button" className="cluster-chip-btn clear-chip" onClick={() => setDistricts([])}>
                  Temizle
                </button>
              )}
            </div>

            <div className="choice-grid districts-selection-grid">
              {ankaraDistricts.map(district => {
                const isChecked = districts.includes(district);
                return (
                  <label className={`district-choice-card ${isChecked ? 'checked' : ''}`} key={district}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(district, districts, setDistricts)}
                    />
                    <span>{district}</span>
                  </label>
                );
              })}
            </div>
            <div className="selected-summary-line">
              <span>Seçilen İlçe Sayısı: <strong>{districts.length} / {ankaraDistricts.length}</strong></span>
            </div>
          </fieldset>
        )}

        {/* Step 3: Document Upload with Browser Sandboxing Notice */}
        {step === 3 && (
          <fieldset className="document-step-fieldset">
            <legend className="sr-only">Doğrulama belgesi</legend>
            <div className="security-notice-box">
              <span className="notice-icon">🛡️</span>
              <div className="notice-content">
                <strong>Belge Güvenliği ve Doğrulama</strong>
                <p>
                  Yükleyeceğiniz belge yalnızca platform moderatörleri tarafından incelenir; müşterilerle paylaşılmaz.
                  Tarayıcı güvenlik kuralları gereği sayfa yenilenirse dosyanızı tekrar seçmeniz gerekir (diğer tüm bilgileriniz taslak olarak saklanmaktadır).
                </p>
              </div>
            </div>

            <div className="application-fields columns">
              <label>
                Belge Türü
                <select value={documentKind} onChange={event => setDocumentKind(event.target.value as keyof typeof documentKinds)}>
                  {Object.entries(documentKinds).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                Son Kullanma Tarihi (Varsa)
                <input type="date" value={expiresAt} onChange={event => setExpiresAt(event.target.value)} />
              </label>
              <label>
                PDF, JPG veya PNG Dosyası
                <input
                  required
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={event => setFile(event.target.files?.[0])}
                />
              </label>
            </div>
            {file && (
              <div className="selected-file-badge">
                <span>📎 Seçilen dosya: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </fieldset>
        )}

        {/* Step 4: Preview & Review */}
        {step === 4 && (
          <>
            <section className="application-review-card" aria-label="Başvuru özeti">
              <div className="review-block">
                <span>Profil & Uzmanlık</span>
                <strong>{displayName}</strong>
                <p>{bio}</p>
              </div>
              <div className="review-block">
                <span>Hizmet Alanları ({serviceIds.length})</span>
                <p>{services.filter(item => serviceIds.includes(item.id)).map(item => item.name).join(', ')}</p>
              </div>
              <div className="review-block">
                <span>Çalışma Bölgeleri ({districts.length})</span>
                <p>{districts.join(', ')}</p>
              </div>
              <div className="review-block">
                <span>Doğrulama Belgesi</span>
                <strong>{documentKinds[documentKind]}</strong>
                <small>{file?.name} ({(file ? file.size / 1024 / 1024 : 0).toFixed(2)} MB)</small>
              </div>
            </section>

            <fieldset className="reference-optional-fieldset">
              <legend>Referans Bilgisi (İsteğe Bağlı)</legend>
              <div className="application-fields columns">
                <label>
                  Referans Kişi / Kurum
                  <input
                    value={referenceName}
                    onChange={event => setReferenceName(event.target.value)}
                    placeholder="Örn: Mehmet Bey (Tadilat Projesi)"
                  />
                </label>
                <label>
                  İlişki / Proje Tanımı
                  <input
                    value={relationship}
                    onChange={event => setRelationship(event.target.value)}
                    placeholder="Örn: Ev sahibi / Mimar"
                  />
                </label>
                <label>
                  İletişim Telefonu
                  <input
                    value={referencePhone}
                    onChange={event => setReferencePhone(event.target.value)}
                    placeholder="05XX XXX XX XX"
                  />
                </label>
              </div>
            </fieldset>
          </>
        )}

        {message && (
          <p className="account-message" role="alert" aria-live="assertive">
            {message} {message.includes('giriş') && <Link href="/giris">Giriş yap</Link>}
          </p>
        )}

        <div className="application-actions">
          {step > 0 && (
            <Button variant="outline" type="button" onClick={() => { setMessage(''); setStep(value => value - 1); }}>
              ← Geri
            </Button>
          )}
          {step < applicationSteps.length - 1 ? (
            <Button variant="primary" type="button" onClick={nextStep}>
              Devam Et →
            </Button>
          ) : (
            <Button variant="primary" loading={busy} type="submit">
              Başvuruyu Tamamla ve Gönder ✓
            </Button>
          )}
        </div>
      </form>
    </main>
  );
}
