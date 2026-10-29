# Orkestra — UI stabilizasyon ve route iyileştirme uygulama yolu

Tarih: 21 Ekim 2026. Güncelleme: 23 Ekim 2026. Durum: U5, SplitView, modal, loading yüzeyi ve public responsive baseline uygulandı. Landing medyası 390/1440 px'te; usta başvuru formu 320/390/820/1440 px'te doğrulandı. Gerçek dizin verisi ve korumalı route kabulü bekliyor. Güncel kanıt: [01B ve modal sonuçları](UI-HARDENING-01B-MODAL-RESULT-2026-10-22.md).

Bu belge mevcut SRS/SDD konsolide yol haritasının UI yürütme ekidir; onun yerini almaz. Öncelik yeni özellik değil, mevcut deneyimin güvenilirliği ve görsel tutarlılığıdır. Codex kapsam, tasarım kararı ve kabul incelemesini; Gemini sınırlandırılmış uygulama ve hedefli testleri üstlenir.

## 1. Başlangıç ve kanıt disiplini

- Güncel checkout: `codex/worktree-preservation`. Çok sayıda modified ve untracked dosya var; tamamı korunacak. Temiz branch varsayılmayacak.
- Bu plan hazırlanırken paket komutları, route dosyaları, U5VisualFixture, DiscoveryWorkDetail ve mevcut modal hook'unun başlangıcı incelendi. Uygulama değiştirilmedi; testler yeniden çalıştırılmadı.
- Önceki `styles:check`, type-check, 63 hedefli test ve browser smoke sonuçları tarihsel kayıttır; bugünkü başarı sayılmaz.
- Lint bulgusu yeniden üretilecek. U5 fixture'da client direktifi olmadan event handler bulunduğu kaynakta görüldü; production hatası henüz yeniden üretilmedi.
- CSS sınıfının eksik olması tek başına tüm yüzeyin stilsiz olduğunu kanıtlamaz: tüketici sınıfları, global girişler ve computed style birlikte denetlenecek.
- Önceki ekran taraması tam route kabulü değildir: login'e yönlenen sayfa, çalışma alanı ekranının kanıtı olamaz. Kısa bekleme sonrası spinner, kalıcı yükleme hatası sayılmaz. Rastgele `demo` kimliğinin 404'ü ürün hatası değildir.
- Kök/proje AGENTS.md ve TASK_TEMPLATE.md bu checkout'ta bulunamadı. Önceki kurulumun mevcut olduğu varsayılmayacak.

Her kayıt: route + rol + veri durumu + viewport + kaynak revizyonu/dirty diff kimliği + beklenen/gerçek davranış + ekran yolu + test komutu/sonucu. Durumlar: Planlandı → Uygulandı → Yerelde doğrulandı → Yetkili test ortamında doğrulandı → Yayınlandı. Engelli ve uygulanamaz durumları ayrıca yazılır.

## 2. Bağımlılık sırası ve teslimler

| Dilim | İş ve sınır | Kabul / çıkış kapısı |
|---|---|---|
| P0 — Baseline | Git envanteri; hedef dosyaların mevcut diff/hash kaydı; Node ve mevcut runner doğrulaması; güvenli Gemini paketi | Kullanıcı değişiklikleri ayrıştırılmış; izinli dosya listesi belli; sekret/üretim verisi pakette yok |
| P1a-1 — U5 boundary | U5 retry handler için en küçük client sınırı | Dört fixture korunmuş; hydration/build sınırı güvenli; retry busy/tek tetikleme kanıtlı |
| P1a-2 — SplitView lifecycle | Hizmet bölgesi popover state yaşam döngüsü ve lint | Filtre/sonuç bağlamı değiştiğinde açık panel kapanır; URL ve sağlayıcı seçim sözleşmesi değiştirilmez |
| P1b — Modal davranışı | DiscoveryWorkDetail; mevcut useModalDialog uygunluk incelemesi; gerekirse yalnız yerel adaptasyon | Escape, Tab/Shift+Tab, ilk odak, odak iadesi, scroll kilidi, arka plan etkileşim sınırı ve üst üste modal davranışı kanıtlı |
| P1c — Eksik yüzeyler | directory-loading, surface-card, u5-visual-fixture, discovery-detail stilleri ve tüketicileri | Skeleton gerçek yerleşime uyumlu; modal mobilde taşmıyor; mevcut SurfaceCard tüketicilerinde regresyon yok |
| P2A — Public baseline | Aşağıdaki 42 kalıptan erişimi kaynakta doğrulanan public route'lar için 390/1440 görsel kanıt | Shared primitive değişmeden önce gerçek baseline; viewport + full-page çekim; eksik veri başarı sayılmıyor |
| P2B — Korumalı route audit | Kalan authenticated, operations ve concept route'lar | Fixture/auth sözleşmesiyle gerçek kanıt veya açık engel; concept lab non-blocking; önceki 14/16 tier sayıları doğrulanmış envanter değildir |
| P3 — Keşif deneyimi | Landing, dizin, harita, profil, yerel hizmet, talep başlangıcı; ayrı küçük görevler | Arama → filtre → profil → talep akışı; görsel hiyerarşi ve mobil davranış karşılaştırmalı kabul |
| P4 — İşlem alanları | Auth/hesap, müşteri, usta, görüşme/iş/uyuşmazlık; ayrı rol dilimleri | Başarı/boş/hata/yeniden dene/yetkisiz/süre doldu durumları; bağlam ve geri dönüş kaybolmuyor |
| P5 — Destek ve operasyon | Yardım/yasal, yönetim, tasarım laboratuvarlarının sınıflandırılması | Operasyonel yoğunluk korunmuş; ürün dışı konseptler yanlışlıkla yayına taşınmamış |
| P6 — Entegrasyon | Tam kalite kapısı, tam kritik yol regresyonu, erişilebilirlik ve ekran karşılaştırması | Yeni regresyon yok; önceden var olan hatalar ayrılmış; kalan riskler açık |
| P7 — Checkpoint ve teslim | Yalnız doğrulanmış bağımlılık bütünlüğüne sahip dilimleri commit önerisine hazırlama | Commit/push/deploy kapsamı ayrıca doğrulanır; `git add .` veya toplu temizlik yok |

İlk geniş “hardening” önerisi U5 sınırı, SplitView lifecycle, modal ve görsel baseline dilimlerine bölündü. Bir hata düzeltmesiyle ortak CSS ve modal altyapısını aynı anda değiştirmek sonuçların nedenini belirsizleştirir. P2A baseline, shared yüzey stillerinden önce gelir. Bir dilim kabul edilmeden bağımlı dilime geçilmez; bağımsız planlama devam edebilir.

### Gemini ile kesinleştirilen sıra

`P0 → P1a-1 U5 client sınırı → P1a-2 SplitView lifecycle → P1b modal erişilebilirliği → P2A Tier 1 public baseline → P1c shared surface/skeleton stilleri → P2B authenticated/operations/concept audit → P3 kritik akışlar → P6 kalite kapısı → P7 checkpoint`.

P2A, ortak yüzey stillerinden önce gelir; böylece CSS değişikliğinin public discovery üzerindeki etkisi ölçülebilir. Tier 2 ve Tier 3 için deterministic fixture ve yetkili session sözleşmesi P0’da hazır değilse bu dilimler engelli olarak raporlanır; sahte kimliklerle başarı üretilmez.

## 3. Tasarım sözleşmesi

Mevcut mavi marka işareti, yeşil birincil eylem, koyu metin ve açık yüzey dili korunur. Premium hedef: görev hiyerarşisi, fotoğraf kalitesi, okunabilirlik, boşluk ritmi ve tutarlı etkileşim. Yeni gradient, rozet, güven bandı veya promosyon eklemek bu çalışmanın varsayılanı değildir.

| Önce / denetlenecek durum | Sonra hedefi | Neden |
|---|---|---|
| Eksik veya tüketiciye göre değişen yüzey stilleri | Sınırlı ve belgeli yüzey sözleşmesi | Tutarlılık; global cascade sürprizlerini önleme |
| Modal görünümü var, klavye davranışı eksik | Görsel + davranışsal modal bütünlüğü | Görünen panelin gerçekten kullanılabilir olması |
| Yükleme görüntüsü gerçek karttan kopuk olabilir | Gerçek kart ölçülerini izleyen skeleton | Yerleşim sıçramasını azaltma; yapay bekleme eklememe |
| Her route'a aynı pazarlama düzeni uygulanması riski | Keşifte görsel, iş alanında bilgi odaklı hiyerarşi | Ürün rolüne uygun yoğunluk |

Her görsel görev için Codex mevcut ekranı ve arşivden ilgili referansı seçer; Gemini alternatif ve karşı argüman sunar; Codex uygulanacak kararı kısa gerekçeyle kaydeder. İki tarafın gerçekten verdiği görüşler ayrılır. Referanslarda renk veya süs değil, görev çözümü karşılaştırılır. Gerçek tasarım/model üretimi gerekirse kullanıcının Astra tercihi uygulanır; bu aşama yeni raster görsel üretimi gerektirmez.

## 4. Tam route kapsamı

Kaynak envanteri: 42 `page.tsx` kalıbı. Dinamik kalıplar yetkili test kimlikleriyle çözülür; üretim verisi veya uydurma kimliklerle başarı kanıtı üretilmez.

| Grup | Route kalıpları |
|---|---|
| Keşif (7) | `/`, `/ustalar`, `/ustalar/[id]`, `/ustalar/[id]/talep`, `/harita`, `/ankara/[district]/[service]`, `/usta-basvurusu` |
| Kimlik/hesap (7) | `/giris`, `/kayit`, `/parola-yenile`, `/hesap`, `/usta/giris`, `/usta/kayit`, `/usta/basvuru` |
| Müşteri/ortak işlem (9) | `/taleplerim`, `/taleplerim/[id]/teklifler`, `/teklifler/[id]`, `/islerim`, `/islerim/[id]`, `/gorusmeler`, `/gorusmeler/[requestId]/[professionalId]`, `/uyusmazliklar`, `/uyusmazliklar/[id]` |
| Usta (3) | `/usta/talepler`, `/usta/teklifler/[requestId]`, `/usta/musaitlik` |
| Destek (4) | `/yardim`, `/nasil-calisir`, `/gizlilik`, `/kullanim-kosullari` |
| Yönetim (7) | `/yonetim/basvurular`, `/yonetim/usta-basvurulari`, `/yonetim/ustalar`, `/yonetim/moderasyon`, `/yonetim/denetim-izi`, `/yonetim/uyusmazliklar`, `/yonetim/uyusmazliklar/[id]` |
| Konsept (5) | `/concepts`, `/concepts/harita`, `/concepts/harita/usta/[id]`, `/inspiration`, `/motif-lab` |

Her route için 390 ve 1440 px baseline; değiştirilen ortak bileşenler ve riskli sayfalarda ayrıca 320 ve 820 px. Yetki/redirect/feature flag sözleşmesi önceden kaydedilir. Auth gerektiren sayfada login ekranına ulaşmak yalnız auth guard kontrolüdür.

Çekim: route'a özel hazır olma koşulu, font/görsel yüklenmesi, gerçek naturalWidth kontrolü; sonsuz network-idle beklemesi yok. Loading ayrıca kontrollü ağ/veri gecikmesiyle çekilir. Console/network hataları ve tam sayfa taşması kaydedilir. Kullanıcı görüntülerindeki kişisel bilgiler dış servise gönderilmeden maskelenir.

## 5. On kritik kullanıcı senaryosu

1. İlk ziyaretçi hizmet arar; tek baskın başlangıcı anlayıp doğru talep akışına ulaşır.
2. Mobil kullanıcı kategori değiştirir; başlık, destek düğmesi ve liste üst üste binmez.
3. Dizin filtresi açık rozet panelinin hedefini kaldırır; eski ustaya ait panel kalmaz.
4. Klavye kullanıcısı iş detayını açar; odağı kaybetmeden kapatır ve tetikleyiciye döner.
5. Yavaş ağda dizin açılır; skeleton → içerik geçişi, boş ve hata durumları karışmaz.
6. Hizmet bölgesinde sonuç yoktur; filtreyi temizleyerek veya farklı kapsamla devam edilir.
7. Profil üzerinden talep başlatan kişi giriş yapar; usta/hizmet bağlamı korunur.
8. Müşteri teklif/iş alanında kısmi hata görür; retry sağlam içeriği gereksiz kaybettirmez.
9. Usta talep/uygunluk ekranını mobilde kullanır; işlem durumu anlaşılır, çift gönderim olmaz.
10. Yetkisiz/expired bağlantı veya yönetim adresi açılır; veri sızmadan anlaşılır dönüş sunulur.

Bunlar test planıdır, yapılmış kullanıcı araştırması veya başarılı test sonucu değildir.

## 6. Optimal Codex–Gemini çalışma döngüsü

1. Codex tek teslimlik görev: amaç, izinli dosyalar, yasak alanlar, kabul ve test listesi.
2. Gemini önce kısa çözüm önerisi ve risklerini sunar. Görsel görevde referans/ekran eleştirisi ekler.
3. Codex çelişki varsa tek düzeltme turuyla kapsamı kesinleştirir; Gemini uygular.
4. Gemini yalnız hedefli testleri çalıştırır; komut, exit code, değişen dosyalar ve kalan riskleri teslim eder.
5. Codex başlangıç snapshot'ına göre yeni diff'i inceler. Aynı test, kaynak değişmemiş ve kanıt güvenilir ise gereksiz yere tekrarlanmaz. Ortak altyapı değişikliği daha geniş regresyon gerektirir.
6. En fazla iki düzeltme turu; aynı sorun sürerse görev bölünür veya neden analizi yapılır. Başarı uydurulmaz.

Pilot metrikleri: görev başına toplam süre, Gemini süresi, ilk geçiş kabulü (evet/hayır), düzeltme turu, test süresi, gerekçesiz tekrar sayısı, kapsam dışı dosya sayısı. Hedef hızdan önce sıfır kapsam dışı değişikliktir; sayısal hız hedefi birkaç görevden sonra belirlenir.

## 7. Kalite kapıları ve izin sınırları

- Dilim kapısı: ilgili testler, styles:check ve type-check; değişiklikle ilgili lint. P1a sonunda tam lint sonucu da kaydedilir.
- P1 sonunda build ve ilgili gerçek route smoke; P6'da `npm run quality` ve kritik browser yolları. Paket scriptinin bulunması test dosyasının var olduğunu garanti etmez; eksik runner/test ayrı blocker'dır.
- React lint kuralını kapatma, timeout ile hatayı gizleme, üretim auth/flag gevşetme, yeni dependency ve geniş formatlama yok.
- Yeni local uygulama görevleri bu plan kapsamında ilerleyebilir. Commit/push/deploy, remote veri yazımı, migration, kimlik bilgisi kullanımı veya kapsam genişlemesi ayrı yetki kontrolü gerektirir.
- Gemini erişimi bu turda doğrulanmadı. Önceki geniş repo aktarımı güvenlik engeliyle karşılaştı. Tüm çalışma ağacını harici servise açarak veya permission bypass ile aşılmayacak. Yalnız izinli, sır içermeyen kaynak/ekran paketiyle yürütme hazırlanır. Gerçek erişim sağlanmadan Gemini incelemesi yapılmış gibi raporlanmaz.

## 8. Şimdi başlayacak iş

P0 ve P1a-1 görev tanımı: [GEMINI-UI-HARDENING-01A.md](GEMINI-UI-HARDENING-01A.md). Gemini tartışma kaydı: [GEMINI-UI-STABILIZATION-REVIEW-2026-10-21.md](GEMINI-UI-STABILIZATION-REVIEW-2026-10-21.md).

Bu planın hazırlanması uygulama kabulü değildir. Sonraki teslim P1a diff'i + doğrulama kanıtıdır; sonra modal ve yüzey dilimleri, ardından gerçek route ekran matrisi gelir.
