# PUX-0 Mevcut Durum ve Karar Envanteri

**Proje:** `the-welding-expert-app`  
**Tarih:** 19 Temmuz 2026  
**Kapsam:** Müşteri giriş sayfası ve randevu deneyimi  
**Denetim boyutları:** 390x844, 768x1024, 1440x900; açık/koyu tema

## 1. Amaç

Bu envanter, premium UX/UI dönüşümünden önce mevcut müşteri deneyimini sabitler. Her unsur için kaynak, görünür tekrar, karar ve hedef sprint kaydedilir. Böylece sonraki sprintlerde yapılan kaldırma veya birleştirmeler rastlantısal değil izlenebilir olur.

## 2. Görsel baseline manifesti

Yeni baseline'lar `e2e/pux-baseline.spec.js-snapshots/` altında tutulur.

| Snapshot | Boyut/tema | Kapsam | Sonraki ana değişim |
| --- | --- | --- | --- |
| `pux-customer-mobile-light-win32.png` | 390x844 açık | Nav, hero, trust başlangıcı, sticky | PUX-1/2 |
| `pux-customer-mobile-dark-win32.png` | 390x844 koyu | Koyu tema logo, hero ve CTA | PUX-1/2 |
| `pux-customer-tablet-light-win32.png` | 768x1024 açık | Tablet nav, hero, trust, wizard başlangıcı | PUX-2/7 |
| `pux-customer-desktop-light-win32.png` | 1440x900 açık | Masaüstü ilk viewport | PUX-2 |
| `pux-wizard-service-win32.png` | 390 px açık | Hizmet grubu seçimi | PUX-3 |
| `pux-wizard-time-win32.png` | 390 px açık | Tarih/saat seçimi | PUX-3 |
| `pux-wizard-contact-win32.png` | 390 px açık | İletişim formu | PUX-3 |
| `pux-wizard-success-win32.png` | 390 px açık | Başarı ve takip geçişi | PUX-3/6 |
| `pux-tracking-invalid-dark-win32.png` | 390 px koyu | Self-servis hata durumu | PUX-1/7 |

Önceden var olan `appointment-wizard` ve `tracking-invalid-token` snapshot'ları silinmez. PUX baseline'ları daha geniş tasarım programının sabit referansıdır.

## 3. İlk viewport dikkat envanteri

### 3.1 Marka tekrarları

| Yüzey | Mevcut içerik | Görünürlük | Karar | Sprint |
| --- | --- | --- | --- | --- |
| Navigasyon | U işareti + Umut Usta + Ankara bakım ve metal işleri | Mobil/desktop ilk viewport | **Koru ve kompaktlaştır** | PUX-1/2 |
| Hero | İkinci U işareti + Umut Usta + Randevu ve hizmet talebi | Mobil/desktop ilk viewport | **Kaldır** | PUX-2 |
| Footer | U işareti + Umut Usta + uzun açıklama | Sayfa sonu | **Koru, sadeleştir** | PUX-4 |

**Baseline:** İlk viewport'ta 2 görünür logo.  
**Hedef:** İlk viewport'ta 1 görünür logo.

### 3.2 CTA tekrarları

| Yüzey | Ana eylemler | Sorun | Karar | Sprint |
| --- | --- | --- | --- | --- |
| Desktop nav | `Randevu Al` | Doğru ana navigasyon eylemi | Koru | PUX-2 |
| Mobil menü | `Randevu Al` | Menü açıkken görünür | Koru | PUX-2 |
| Hero | `Talep Oluştur`, `Fotoğrafla Danış` | İki dolu ve iki ayrı vurgu rengi | `Randevu Al` primary + sakin secondary | PUX-2 |
| Hero utility | `Telefonla ara`, `İş örnekleri` | Aynı karar kümesinde üçüncü/dördüncü yol | Alt bağlama taşı | PUX-2/4 |
| Mobil sticky | `Talep Oluştur`, `Fotoğrafla Danış` | Hero ile aynı viewport'ta tekrar | Hero görünürken gizle; sonra primary + utility | PUX-2 |

**Baseline:** Mobil ilk viewport'ta 4 buton görünümü, 2 farklı karar.  
**Hedef:** Mobil ilk viewport'ta 2 karar, 1 dolu ana CTA.

### 3.3 Güven ve iletişim tekrarları

| Bilgi | Mevcut yüzeyler | Karar |
| --- | --- | --- |
| Ankara/yerinde hizmet | Hero trust, hero badge, trust bar, location, footer | Hero'da tek utility; trust bar veya location'da ayrıntı |
| Planlama saati | Trust bar, location, footer | Proof strip + contact bağlamı; footer tekrarı kaldırılabilir |
| Telefon | Trust bar, hero utility, location, footer | Utility ve contact; trust kartı olmaktan çıkar |
| WhatsApp | Hero, sticky, trust metni, footer | Hero secondary ve contact; sticky yalnız hero sonrası |
| Ekip teyidi | Hero lead, hero trust, process, location, success, footer | Hero'da kısa açıklama; success'te durum; diğer tekrarları azalt |
| İş örnekleri | Hero utility, trust bar, portfolio, footer | Proof strip + portfolio; hero/footer tekrarını azalt |

## 4. İçerik ve karar envanteri

### 4.1 Randevu aracı

| Unsur | Mevcut durum | Karar |
| --- | --- | --- |
| 3 adımlı yapı | Hizmet -> Zaman Tercihi -> İletişim | Koru |
| Varsayılan seçim | Yok | Koru |
| İhtiyaç grupları | 4 ana grup + Emin değilim | 4 ana grup korunur; kaçış ayrı görsel seviyeye alınır |
| Alt hizmet | Grup sonrası 1-3 radio | Koru ve sadeleştir |
| Hızlı tarih | Önce gösteriliyor | Koru |
| Tam takvim | Disclosure içinde | Koru |
| İletişim alanları | Ad/telefon ana, diğerleri optional | Koru |
| Teyit açıklaması | Birkaç durumda tekrar ediyor | Tek bağlamsal açıklamaya indir |
| Başarı | Takip kodu, süreç, telefon, takip, WhatsApp, reset | Bilgi doğru; görsel ve içerik hiyerarşisi sadeleştir |

### 4.2 Wizard sonrası sayfa

| Bölüm | Mevcut yük | Karar | Sprint |
| --- | --- | --- | --- |
| İş örnekleri | 3 kart, uzun açıklama | Problem/uygulama/sonuç standardına geçir | PUX-4/5 |
| Hizmetler | 4 görünür + 4 disclosure; kart içinde tekrar disclosure | 4 kompakt kategoriye indir | PUX-4 |
| Süreç | 4 kart ve uzun teyit anlatısı | Metni kısalt, yapıyı koru | PUX-4 |
| Konum | 2 kapsam maddesi + 4 contact + harita | Kompaktlaştır, işlevsiz e-postayı kaldır | PUX-4/7 |
| SSS | 4 soru | En kritik 3 + diğerleri disclosure | PUX-4 |
| Footer | Marka, 4 hızlı link, 4 contact, teyit | Temel linkler ve iletişimle sadeleştir | PUX-4 |

## 5. Tasarım token envanteri

### 5.1 Sayısal özet

`GlobalStyles`, `CustomerBooking.styles` ve `booking.styles` birlikte incelendi.

| Ölçüm | Baseline |
| --- | ---: |
| Benzersiz `--color-*` adı | 63 |
| Benzersiz hex değeri | 59 |
| `border-radius:` bildirimi | 45 |
| `box-shadow:` bildirimi | 23 |
| `transition:` bildirimi | 17 |
| `animation:` bildirimi | 7 |

`ThemeToggle.jsx` ayrıca 15 benzersiz hardcoded hex, 2 radius, 2 shadow ve 4 transition bildirimi içerir. Bu değerler ana semantic token sisteminin dışında kalmaktadır.

### 5.2 Mevcut token katmanları

#### Tipografi

- Plus Jakarta Sans Variable doğru ana aile.
- 13 font-size token'ı bulunuyor.
- 5 weight ve 2 line-height token'ı bulunuyor.
- Korunacak; PUX-1'de kullanım rolleri daraltılacak.

#### Motion

- `140ms`, `200ms`, `320ms` çekirdekleri zaten mevcut.
- Tema geçişi GlobalStyles'ta `420ms`, ThemeToggle içinde `1.5s` hardcoded.
- PUX-1/6 çekirdek token'lara tam geçiş yapacak.

#### Marka rengi

- 8 seviyeli brand/copper scale bulunuyor.
- Accent/rust token'ları aynı renk ailesini tekrar ediyor.
- PUX-1 semantic alias ve kullanım bütçesi tanımlayacak.

#### Nötr renk

- 10 seviyeli warm grey scale bulunuyor.
- Açık temel Quiet Craft'a yakın.
- Dark mode slate/lacivert ailesine kayıyor; marka karakteri ayrışıyor.

#### Semantik renk

- Action, selection, focus, success, warning, danger ve WhatsApp rolleri var.
- Doğru temel; doğrudan green/yellow/red kullanımından semantic role geçilecek.

#### Radius ve shadow

- Global token'lar: 4, 8, 12, 16 px.
- Customer ve booking bileşenlerinde toplam 44 ek radius bildirimi var.
- Kart yoğunluğu ve 12/16 px kullanımı premium Quiet Craft hedefinden daha yumuşak/SaaS görünümü oluşturuyor.

## 6. Tema envanteri

| Alan | Açık tema | Koyu tema | Karar |
| --- | --- | --- | --- |
| Zemin | Sıcak beyaz | Lacivert/slate | Koyu temayı obsidian/graphite'a taşı |
| Marka accent | Bakır | Daha parlak turuncu | Quiet Craft copper kontrastını doğrula |
| Logo | Okunur | Nav içinde düşük ayrışma | Monochrome/dark asset varyantı |
| Toggle | Mavi + sarı | Mor + mavi/gri | Utility menüsüne taşı, token'laştır |
| Geçiş | 420ms global + 1.5s component | Aynı | 200-320ms; reduced motion 0ms |

## 7. Asset envanteri

| Asset | Mevcut rol | Bulgular | Karar |
| --- | --- | --- | --- |
| `umut-usta-logo.png` | 4K/master raster | Forged U karakteri güçlü | Master referans olarak koru |
| `umut-usta-logo.svg` | Nav, hero, footer | Master ile optik fark; küçük boyutta genel U | PUX-1'de yeniden çiz/rafine et |
| `umut-usta-logo-horizontal.svg` | Yatay lockup adayı | Runtime nav'da kullanılmıyor | Path ve oran kontrolü sonrası compact nav |
| `umut-usta-favicon.svg/png` | Browser/app ikonu | Küçük boyut kontrolü gerekli | Seam-free varyant değerlendirilir |
| `images/hero.png` + optimize set | Hero LCP | Konu uygun; açık overlay kanıtı siliyor | PUX-2 kadraj, PUX-5 gerçek çekim/pipeline |

## 8. Test koruma ağı

### Eklenen PUX-0 sözleşmeleri

1. Açık/koyu navigasyon logo asset'i görünür ve gerçek boyutla yüklenir.
2. İlk viewport'taki mevcut iki logo baseline olarak kaydedilir.
3. Hero ile sticky'nin eşzamanlı görünmesi mevcut durum olarak kaydedilir.
4. PUX-2 hedefi olan “hero görünürken sticky gizli” assertion'ı expected-failure sözleşmesidir.
5. API, tarih, font ve görünür image yükleri deterministik hale getirilmiştir.

Expected-failure sözleşmesi PUX-2'de davranış düzeltildiğinde normal geçen teste çevrilmelidir. Böylece hedef unutulmaz ve beklenmedik erken değişim görünür olur.

## 9. Karar kaydı

| ID | Karar | Durum | Gerekçe |
| --- | --- | --- | --- |
| ADR-PUX-001 | Quiet Craft ana tasarım yönüdür | Kabul | Premium + görev + sektör dengesi |
| ADR-PUX-002 | İlk viewport'ta tek marka imzası | Kabul | Tekrar ve dikey alan maliyeti |
| ADR-PUX-003 | Tek dolu ana CTA | Kabul | Dikkat ve karar hiyerarşisi |
| ADR-PUX-004 | 3 adımlı booking mantığı korunur | Kabul | Mevcut düşük bilişsel yük temeli |
| ADR-PUX-005 | Tema özelliği korunur, utility'ye taşınır | Önerilen | Özellik kaybı olmadan dikkat azaltımı |
| ADR-PUX-006 | Yeni tasarım için DB migration yapılmaz | Kabul | API ve analytics sözleşmesi yeterli |
| ADR-PUX-007 | Wizard sonrası içerik silinmez, katmanlanır | Kabul | Güven ve SEO bilgisini koruma |
| ADR-PUX-008 | Gerçek fotoğraf dekor değil kanıttır | Kabul | Premium zanaat vaadi |

## 10. PUX-1 giriş kriterleri

PUX-1 şu koşullarda başlayabilir:

- PUX snapshot'ları iki ardışık çalışmada kararlı.
- Unit, lint ve tüm E2E paketi başarılı.
- Mevcut tekrar ve token sayıları kayıtlı.
- Forged U master PNG referans asset olarak mevcut.
- PUX-1'in üretim kapsamı logo + token + tema ile sınırlı.
- Nav/hero bilgi mimarisi PUX-2'ye bırakılıyor.
- Git push/deployment yapılmıyor.

---

**Yerel çalışma notu:** Bu envanter PUX-0 baseline'ıdır. Üretim arayüzü veya Supabase şeması değiştirilmemiştir.
