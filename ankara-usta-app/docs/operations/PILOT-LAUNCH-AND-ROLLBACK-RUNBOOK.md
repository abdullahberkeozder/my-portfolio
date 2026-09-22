# Orkestra Ankara Kontrollü Pilot ve Geri Alma (Launch & Rollback) El Kitabı

- **Sürüm / Aşama**: P6 — Katalog Kalitesi ve Kontrollü Pilot Hazırlığı
- **Tarih**: 22 Eylül 2026
- **Kapsam**: Çekirdek Hizmetler (5), Çekirdek İlçeler (5), Canlı Arz Sınırları, Operasyon Eşikleri, Manuel/Planlanan Devre Kesiciler ve Geri Alma
- **Temel İlke**: **Sıfır Sentetik Arz Politikası (Zero Synthetic Supply)**. Kullanıcıya asla sahte usta profili, uydurma usta sayısı veya simüle edilmiş talep hacmi gösterilmez. Gerçek usta yoksa durum dürüstçe bildirilir.
- **Kanıt Notu**: Bu belgedeki adımlar `[UYGULANMIŞ]`, `[MANUEL PROSEDÜR]` ve `[PLANLANAN]` etiketleriyle gerçek kod/altyapı seviyesini yansıtır.

---

## 1. Pilot Kapsamı ve Hizmet Matrisi

Kontrollü pilot, Ankara genelinde kontrollü büyüme ve operasyonel kalite sağlamak için sınırlandırılmıştır.

### 1.1. Çekirdek Hizmetler ve Teslimat Modelleri [UYGULANMIŞ]

| Öncelik | Hizmet ID | Hizmet Adı | Teslimat Modeli | Kapsam Tipi | Güvenlik / Risk Protokolü |
|---|---|---|---|---|---|
| 1 | `musluk-degisimi` | Musluk Değişimi | `package` (Teklif Tabanlı Standart Kapsam) | 3 Dahil / 3 Hariç | Standart sızdırmazlık ve debi kontrolü |
| 2 | `su-kacagi` | Su Kaçağı Tespiti | `inspection` (Keşif Odaklı) | 3 Dahil / 3 Hariç | Akustik/termal tarama; elektrik temasında ana şalter kapatma |
| 3 | `elektrik-arizasi` | Elektrik Arızası | `inspection` (Keşif Odaklı) | 3 Dahil / 3 Hariç | Kıvılcım/duman varlığında şalter kapatma, acil 112 yönlendirmesi |
| 4 | `mobilya-kurulumu` | Mobilya Kurulumu | `package` (Teklif Tabanlı Standart Kapsam) | 3 Dahil / 3 Hariç | Şemaya uygun kurulum; duvara devrilme önleyici sabitleme |
| 5 | `tek-oda-boya` | Tek Oda Boya | `quote` (Teklif Usulü) | 3 Dahil / 3 Hariç | Maskeleme ve 2 kat boya; rutubet kazıma/malzeme hariç |

### 1.2. Bölge Kademeleri (District Tiers) [UYGULANMIŞ]

1. **Çekirdek Pilot Bölgeleri (`core`)**:
   - `Çankaya`, `Yenimahalle`, `Keçiören`, `Etimesgut`, `Mamak`
   - *Tanım*: Aktif saha operasyonu, yerinde denetim ve yeterli doğrulanmış usta havuzunun hedeflendiği ilçeler.
2. **Genişletilmiş Pilot Bölgeleri (`extended`)**:
   - `Altındağ`, `Gölbaşı`, `Pursaklar`, `Sincan`
   - *Tanım*: Usta uygunluğuna bağlı olarak kontrollü teklif kabul edilen, talep yoğunluğuna göre çekirdeğe dahil edilecek ilçeler.
3. **Desteklenmeyen Bölgeler (`unsupported`)**:
   - Diğer Ankara ilçeleri (Polatlı, Beypazarı, Elmadağ, Çubuk vb.)
   - *Tanım*: Dürüst bilgilendirme mesajı verilir; müşteri sahte eşleşme ile oyalanmaz, canlı usta ağı genişletildikçe sırayla açılır.

---

## 2. Canlı Arz Sınırları ve Doğrulama Eşiği

Bir hizmet–ilçe ikilisinin canlı talep alabilmesi için aşağıdaki arz eşikleri karşılanmalıdır:

1. **Minimum Doğrulanmış Usta Eşiği [MANUEL PROSEDÜR]**:
   - Her çekirdek hizmet–ilçe eşleşmesinde en az **2 aktif, mesleki belgesi doğrulanmış ve süresi dolmamış** usta bulunması hedeflenir.
   - Bu eşik sağlanamadığında, arayüz kullanıcıya bölgedeki sınırlı arz durumunu dürüstçe bildirir.
2. **Belge ve Kimlik Geçerliliği [UYGULANMIŞ]**:
   - Mesleki yeterlilik belgesi süresi dolmuş veya idari incelemedeki ustalar havuzdan otomatik düşer; doğrulama rozeti veritabanı kurallarıyla senkronizedir.
3. **Sıfır Sentetik Profil Kuralı [UYGULANMIŞ]**:
   - Test veya simülasyon amaçlı usta profilleri canlı ürün yüzeyine yansıtılamaz.
   - Kamu yüzeyinde ve navigasyonda tahmini, yapay veya uydurma usta sayaçları gösterilmez.

---

## 3. Operasyonel Eşikler ve Hedefler [HEDEF / PİLOT METRİKLERİ]

Pilot döneminde müşteri ve usta memnuniyetini korumak için takip edilecek operasyonel hedefler:

| Metrik | Hedef | Uyarı Eşiği (Warning) | Kritik Eşik (Critical) | Takip Yöntemi |
|---|---|---|---|---|
| Müşteri talebine ilk teklif süresi (Mesai 08:00–20:00) | ≤ 2 saat | > 4 saat | > 8 saat | [MANUEL / RAPOR] Veritabanı sorgusu |
| Keşif talebine randevu onay süresi | ≤ 3 saat | > 6 saat | > 12 saat | [MANUEL / RAPOR] Veritabanı sorgusu |
| Uyuşmazlık ilk operasyon incelemesi | ≤ 60 dakika | > 120 dakika | > 240 dakika | [MANUEL] Admin paneli |
| Teklifsiz kalan talep oranı (24 saatlik) | < %15 | %15 – %30 | > %30 | [MANUEL / RAPOR] Günlük analiz |
| Teklif kabulü sonrası iptal oranı | < %5 | %5 – %8 | > %8 | [MANUEL / RAPOR] Günlük analiz |
| Outbox bildirim teslim başarısızlığı (Dead-letter) | 0 | > 5 adet | > 25 adet | [MANUEL] `notification_outbox` SQL |

---

## 4. Güvenlik ve Acil Durum Protokolleri [UYGULANMIŞ]

Pilot kapsamındaki yüksek riskli arıza durumlarında (`elektrik-arizasi`, `su-kacagi`):

1. **Arayüz Güvenlik Kartı**:
   - Sihirbaz ve eşleşme ekranında kırmızı/turuncu güvenlik uyarıları gösterilir.
2. **Fiziksel Güvenlik Adımları**:
   - Elektrik: Yangın, duman, koku varsa müdahale edilmemesi, ana şalterin kapatılması ve 112 Aranması hatırlatılır.
   - Su: Sayaç veya kolon vanasının kapatılması, ASKİ (185) ve bina yönetimine haber verilmesi hatırlatılır.
3. **Usta Saha Güvenliği**:
   - Usta, keşif esnasında yetkisini aşan yapısal risk (ör. kolon patlağı, gaz kaçağı) tespit ettiğinde işi durdurup operasyona bildirmekle yükümlüdür.

---

## 5. Devre Kesiciler ve Geri Alma (Rollback) Prosedürü

Pilot sırasında operasyonel risk tespit edildiğinde kademeli müdahale mekanizmaları işletilir:

### 5.1. Devre Kesici ve Müdahale Mekanizmaları

1. **Hizmet–İlçe Bazlı Talep Sınırlandırma [MANUEL PROSEDÜR]**:
   - Bir hizmet–ilçede uyuşmazlık oranı veya teklifsiz talep oranı kritik eşiği aşarsa, ilgili bölge/hizmet eşleşmesi yönetici tarafından manuel olarak pasife alınır.
   - *Not*: Kod düzeyinde otomatik kural motoru devre kesicisi `ROLLBACK-01` kapsamında planlanmıştır [PLANLANAN].
2. **Outbox Bildirim İzleme ve İnceleme [MANUEL PROSEDÜR]**:
   - Veritabanı sorgusu ile `status = 'dead'` durumu kontrol edilir:
     ```sql
     select count(*) from public.notification_outbox where status = 'dead';
     ```
   - Hata sayısı 10'u aşarsa bildirim şablonları, alıcı e-posta adresleri ve Resend API kota durumları operasyon tarafından incelenir.
3. **Usta İnceleme ve Askıya Alma [UYGULANMIŞ]**:
   - Onaylanan teklif kapsamına uymayan veya izinsiz fiyat artıran ustanın onay durumu admin paneli üzerinden `suspended` veya `rejected` durumuna çekilir; askıdaki ustaya yeni talep gitmez.

### 5.2. Geri Alma (Rollback) Prosedürü

Eğer pilot sürümünde kritik bir regresyon, veri bozulması veya operasyonel kriz baş gösterirse:

1. **Aşama 1: Yeni Talep Girişini Kapat / Bakım Moduna Al [MANUEL PROSEDÜR]**:
   - Edge / Cloudflare veya reverse proxy yönlendirmesiyle talep oluşturma sayfaları (`/talep`) ve talep API uç noktaları (`/api/requests`) bakım sayfasına yönlendirilir.
   - *Not: Uygulama seviyesinde merkezi `NEXT_PUBLIC_PILOT_INTAKE_ENABLED` server-side kontrolü sonraki sürümde (TRUTH/ROLLBACK paketi) eklenecektir [PLANLANAN].*
2. **Aşama 2: Devam Eden İşleri Güvenceye Al [UYGULANMIŞ]**:
   - Kabul edilmiş teklifler (`quotes.status = 'accepted'`) ve oluşturulmuş iş kayıtları (`jobs`) atomik veritabanı RPC'si ile korunur.
   - Teklif tutarları, malzeme detayları, süre ve kapsam maddeleri append-only teklif geçmişinde kilitli kalır. Müşteri ve ustalar devam eden işlerini `/islerim/[id]` çalışma alanı üzerinden sürdürebilir.
3. **Aşama 3: Açık Talepleri ve Kullanıcıları Bilgilendir [MANUEL PROSEDÜR]**:
   - Henüz teklif aşamasında olan müşterilere platform duyurusu veya operasyonel e-posta yoluyla bakım/gecikme bilgisi iletilir.
4. **Aşama 4: Kod ve Versiyon Geri Alma [MANUEL PROSEDÜR]**:
   - Veritabanı DDL migration'ları geriye uyumlu tasarlandığından, gerektiğinde web uygulaması imajı önceki kararlı sürüme çekilir.

---

## 6. Pilot Çıkış ve Genel Yayına Geçiş (GA) Kontrol Listesi

- [ ] **1. Katı Sıfır Sentetik Arz Kanıtı [UYGULANMIŞ]**: Kamusal ürün yüzeyinde ve talep akışında yapay usta, sahte sayaç veya simüle edilmiş harita bulunmuyor.
- [ ] **2. 5x5 Çekirdek Matriste Gerçek Arz [HEDEF]**: 5 çekirdek ilçenin tamamında 5 hizmet için doğrulanmış usta sayısı ≥ 2.
- [ ] **3. Uyuşmazlık Oranı Eşiği [HEDEF]**: Tamamlanan ilk 100 pilot işinde uyuşmazlık oranı < %3.
- [ ] **4. SLA Başarısı [HEDEF]**: Mesai içi ilk teklif süresi ortalaması < 2 saat.
- [ ] **5. Outbox Güvenilirliği [STAGING DOĞRULAMASI BEKLİYOR]**: Canlı e-posta gönderiminde sıfır mükerrer gönderim ve dead-letter oranı < %0.5.
- [ ] **6. Sözleşme ve Kapsam Kilit Bütünlüğü [UYGULANMIŞ]**: Kabul edilen teklif koşullarının (fiyat, malzeme, tarih) değişmeden kilitlendiği teyit edildi.
- [ ] **7. İdari Kuyruk Performansı [UYGULANMIŞ]**: Admin panelinde usta inceleme ve uyuşmazlık filtreleme süresi < 200 ms.
- [ ] **8. UI Erişilebilirlik ve Debt [UYGULANMIŞ]**: WCAG standartları gözetildi, inline style bütçesi (`inlineStyles <= 47`) korundu.
- [ ] **9. Otomatik Test Güvencesi [UYGULANMIŞ]**: Tüm birim, bileşen ve sözleşme testleri kesintisiz yeşil.
- [ ] **10. Operasyonel Sorumlu Eğitimi [MANUEL PROSEDÜR]**: Saha destek ve müşteri uyuşmazlık süreçlerinin sorumlusu belirlendi.
