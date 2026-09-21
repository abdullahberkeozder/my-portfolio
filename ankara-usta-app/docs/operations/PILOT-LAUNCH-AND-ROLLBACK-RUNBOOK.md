# Orkestra Ankara Kontrollü Pilot ve Geri Alma (Launch & Rollback) El Kitabı

- **Sürüm / Aşama**: P6 — Katalog Kalitesi ve Kontrollü Pilot Hazırlığı
- **Tarih**: 21 Eylül 2026
- **Kapsam**: Çekirdek Hizmetler (5), Çekirdek İlçeler (5), Canlı Arz Sınırları, Operasyon Eşikleri, Devre Kesiciler ve Geri Alma
- **Temel İlke**: **Sıfır Sentetik Arz Politikası (Zero Synthetic Supply)**. Kullanıcıya asla sahte usta profili, uydurma usta sayısı veya simüle edilmiş talep hacmi gösterilmez. Gerçek usta yoksa durum dürüstçe bildirilir.

---

## 1. Pilot Kapsamı ve Hizmet Matrisi

Kontrollü pilot, Ankara genelinde kontrollü büyüme ve operasyonel kalite sağlamak için sınırlandırılmıştır.

### 1.1. Çekirdek Hizmetler ve Teslimat Modelleri

| Öncelik | Hizmet ID | Hizmet Adı | Teslimat Modeli | Kapsam Tipi | Güvenlik / Risk Protokolü |
|---|---|---|---|---|---|
| 1 | `musluk-degisimi` | Musluk Değişimi | `package` (Sabit Paket) | 3 Dahil / 3 Hariç | Standart sızdırmazlık ve debi kontrolü |
| 2 | `su-kacagi` | Su Kaçağı Tespiti | `inspection` (Keşif Odaklı) | 3 Dahil / 3 Hariç | Akustik/termal tarama; elektrik temasında ana şalter kapatma |
| 3 | `elektrik-arizasi` | Elektrik Arızası | `inspection` (Keşif Odaklı) | 3 Dahil / 3 Hariç | Kıvılcım/duman varlığında şalter kapatma, acil 112 yönlendirmesi |
| 4 | `mobilya-kurulumu` | Mobilya Kurulumu | `package` (Sabit Paket) | 3 Dahil / 3 Hariç | Şemaya uygun kurulum; duvara devrilme önleyici sabitleme |
| 5 | `tek-oda-boya` | Tek Oda Boya | `quote` (Teklif Usulü) | 3 Dahil / 3 Hariç | Maskeleme ve 2 kat boya; rutubet kazıma/malzeme hariç |

### 1.2. Bölge Kademeleri (District Tiers)

1. **Çekirdek Pilot Bölgeleri (`core`)**:
   - `Çankaya`, `Yenimahalle`, `Keçiören`, `Etimesgut`, `Mamak`
   - *Tanım*: Aktif saha operasyonu, yerinde denetim ve yeterli doğrulanmış usta havuzunun bulunduğu ilçeler.
2. **Genişletilmiş Pilot Bölgeleri (`extended`)**:
   - `Altındağ`, `Gölbaşı`, `Pursaklar`, `Sincan`
   - *Tanım*: Usta uygunluğuna bağlı olarak kontrollü teklif kabul edilen, talep yoğunluğuna göre çekirdeğe dahil edilecek ilçeler.
3. **Desteklenmeyen Bölgeler (`unsupported`)**:
   - Diğer Ankara ilçeleri (Polatlı, Beypazarı, Elmadağ, Çubuk vb.)
   - *Tanım*: Dürüst bilgilendirme mesajı verilir; müşteri sahte eşleşme ile oyalanmaz, canlı usta ağı genişletildikçe sırayla açılır.

---

## 2. Canlı Arz Sınırları ve Doğrulama Eşiği

Bir hizmet–ilçe ikilisinin canlı talep alabilmesi için aşağıdaki arz eşikleri karşılanmalıdır:

1. **Minimum Doğrulanmış Usta Sayısı**:
   - Her çekirdek hizmet–ilçe eşleşmesinde en az **2 aktif, mesleki belgesi doğrulanmış ve süresi dolmamış** usta bulunmalıdır.
   - Bu eşik sağlanamıyorsa, sistem ilgili bölgede talebi bloke etmez ancak kullanıcıya *"bölgenizde usta arzı sınırlıdır; yanıt süreleri uzayabilir"* uyarısı verir.
2. **Belge ve Kimlik Geçerliliği**:
   - Mesleki yeterlilik belgesi (MYK/Ustalık) süresi dolmuş veya idari incelemedeki ustalar havuzdan otomatik düşer.
3. **Sıfır Sentetik Profil Kuralı**:
   - Test veya simülasyon amaçlı usta profilleri canlı ortama yansıtılamaz.
   - UI üzerinde hiçbir koşulda *"Çevrenizde 12 usta var"* gibi tahmini/yapay sayaçlar gösterilmez.

---

## 3. Operasyonel Eşikler ve SLA Hedefleri

Pilot döneminde müşteri ve usta memnuniyetini korumak için izlenecek operasyonel eşikler:

| Metrik | Hedef (SLA) | Uyarı Eşiği (Warning) | Kritik Eşik (Critical) |
|---|---|---|---|
| Müşteri talebine ilk teklif süresi (Mesai 08:00–20:00) | ≤ 2 saat | > 4 saat | > 8 saat |
| Keşif talebine randevu onay süresi | ≤ 3 saat | > 6 saat | > 12 saat |
| Uyuşmazlık (Dispute) ilk operasyon incelemesi | ≤ 60 dakika | > 120 dakika | > 240 dakika |
| Teklifsiz kalan talep oranı (24 saatlik) | < %15 | %15 – %30 | > %30 |
| Teklif kabulü sonrası iptal oranı | < %5 | %5 – %8 | > %8 |
| Outbox bildirim teslim başarısızlığı (Dead-letter) | 0 | > 5 adet | > 25 adet |

---

## 4. Güvenlik ve Acil Durum Protokolleri

Pilot kapsamındaki yüksek riskli arıza durumlarında (`elektrik-arizasi`, `su-kacagi`):

1. **Arayüz Güvenlik Kartı**:
   - Sihirbaz ve eşleşme ekranında kırmızı/turuncu güvenlik uyarıları gösterilir.
2. **Fiziksel Güvenlik Adımları**:
   - Elektrik: Yangın, duman, koku varsa müdahale edilmemesi, ana şalterin kapatılması ve 112 Aranması hatırlatılır.
   - Su: Sayaç veya kolon vanasının kapatılması, ASKİ (185) ve bina yönetimine haber verilmesi hatırlatılır.
3. **Usta Saha Güvenliği**:
   - Usta, keşif esnasında yetkisini aşan yapısal risk (ör. kolon patlağı, gaz kaçağı) tespit ettiğinde işi durdurup operasyona bildirmekle yükümlüdür.

---

## 5. Devre Kesiciler (Circuit Breakers) ve Kapatma / Geri Alma

Pilot sırasında operasyonel risk tespit edildiğinde aşağıdaki kademeli geri alma mekanizmaları devreye girer:

### 5.1. Otomatik ve Yarı-Otomatik Devre Kesiciler

1. **Hizmet–İlçe Bazlı Talep Durdurma**:
   - Bir hizmet–ilçede 7 günlük yuvarlanan uyuşmazlık oranı **> %5** ise veya teklif verilmeyen talep oranı **> %30** ise, o hizmet–ilçe eşleşmesi yeni taleplere geçici olarak kapatılır (`status: paused`).
2. **Outbox ve Bildirim Frenlemesi**:
   - Bildirim kuyruğunda `status = 'dead'` sayısı 50'yi aşarsa `NotificationWorker` log seviyesi `Debug`'a yükseltilir, operasyon ekibine PagerDuty/E-posta eskalasyonu açılır.
3. **Usta Ceza / Dondurma**:
   - Onaylanan sözleşme kapsamına uymayan veya izinsiz fiyat artıran ustanın hesabı incelemeye alınır (`status: suspended`); aktif olmayan ustaya yeni talep yönlendirilmez.

### 5.2. Geri Alma (Rollback) Prosedürü

Eğer pilot sürümünde kritik bir regresyon, veri bozulması veya uyuşmazlık krizi baş gösterirse:

1. **Aşama 1: Yeni Talep Girişini Kapat**:
   - `NEXT_PUBLIC_PILOT_INTAKE_ENABLED=false` çevre değişkenini güncelleyin veya giriş noktasını bakım moduna alın.
2. **Aşama 2: Devam Eden İşleri Güvenceye Al**:
   - Kabul edilmiş teklifler ve dondurulmuş sözleşmeler (`frozen_contract_terms`) geçerliliğini korur. Usta ve müşteriler mevcut işlerini U5 çalışma alanları üzerinden tamamlayabilir.
3. **Aşama 3: Bekleyen Talepleri Bildir**:
   - Henüz teklif aşamasında olan müşterilere operasyonel outbox üzerinden gecikme/iptal e-postası tetiklenir.
4. **Aşama 4: Kod / Migration Geri Alma**:
   - Veritabanı DDL geriye uyumludur; gerektiğinde son uygulama imajı bir önceki kararlı sürüme çekilir.

---

## 6. Genel Erişilebilirlik (R3 / GA) Hazırlık Kontrol Listesi

Pilot aşamasından Ankara genelinde tam yayına (R3) geçebilmek için aşağıdaki 10 şartın tamamlanması zorunludur:

- [ ] **1. Katı Sıfır Sentetik Arz Kanıtı**: Hiçbir ilçe veya hizmette yapay veri üretilmediği kod denetimiyle onaylandı.
- [ ] **2. 5x5 Çekirdek Matriste Arz**: 5 çekirdek ilçenin tamamında 5 hizmet için doğrulanmış usta sayısı ≥ 2.
- [ ] **3. Uyuşmazlık Oranı Eşiği**: Tamamlanan ilk 100 pilot işinde uyuşmazlık oranı < %3.
- [ ] **4. SLA Başarısı**: Mesai içi ilk teklif süresi ortalaması < 2 saat.
- [ ] **5. Outbox Güvenilirliği**: 1000 ardışık e-posta gönderiminde sıfır mükerrer gönderim ve dead-letter oranı < %0.5.
- [ ] **6. Sözleşme Dondurma Bütünlüğü**: Kabul edilen teklif koşullarının (fiyat, malzeme, tarih) değişmeden kilitlendiği teyit edildi.
- [ ] **7. İdari Kuyruk Performansı**: Admin panelinde usta inceleme ve uyuşmazlık filtreleme süresi < 200 ms.
- [ ] **8. UI Erişilebilirlik ve Debt**: WCAG AA standartları ve sıfır satır içi stil (`inlineStyles <= 47`) korundu.
- [ ] **9. Otomatik Test Güvencesi**: Tüm unit, component ve remote E2E testleri kesintisiz yeşil.
- [ ] **10. Operasyonel Nöbetçi Onayı**: Saha destek ve müşteri uyuşmazlık ekibinin el kitapları eğitimi tamamlandı.
