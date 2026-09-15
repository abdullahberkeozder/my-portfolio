# Umut Usta: Üretime Geçiş Kontrolleri ve Geri Dönüş Planı

**Tarih:** 14 Eylül 2026
**Durum:** Depodaki yapılandırmayla eşleştirilmiş plan; üretime geçiş onayı değildir.

## Kapsam ve Değişmezler

Spring okuma, oluşturma, onay, iptal, taşıma ve geri alma paketini önce izole CI
ortamında doğrularız. Bekleyen talep slot ayırmaz; yarışan işlemler çift aktif
rezervasyon oluşturamaz; başarısız işlem kısmi değişiklik bırakmaz.
PostgreSQL kilitleri Spring transaction'ı içinde korunur.

Bu belge canlı SQL, yetki, bayrak veya dağıtım değişikliği yetkisi vermez.
Sıfır kesinti, anlık geri dönüş veya sıfır veri kaybı garantisi sunmaz.

## Gerçek Yapılandırma

Kaynaklar: [application.properties](../backend/src/main/resources/application.properties),
[CommandDatabase.java](../backend/src/main/java/com/umutusta/CommandDatabase.java),
[Spring adapter](../src/services/springAdmin.js), [staging](../playwright.spring.config.js).

| Bileşen | Kodda bulunan davranış |
|---|---|
| Reader | BOOKING_DATABASE_URL/USER/PASSWORD; havuz en fazla 5; read-only; Hibernate validate |
| Reader connection timeout | Uygulamada özel değer yok; dağıtım override'ları ayrıca incelenmeli |
| Writer | BOOKING_WRITER_DATABASE_URL/USER/PASSWORD; ayrı havuz en fazla 4 |
| Writer timeout | Bağlantı edinme 10 sn; JDBC sorgusu 15 sn; transaction 20 sn |
| Writer saat dilimi | Europe/Istanbul |
| SQL statement_timeout | Kodda oturum için özel 5 sn ayarı yok |
| Backend yazma | BOOKING_WRITES_ENABLED=true; varsayılan kapalı, başlangıçta değerlendirilir |
| Public okumalar | VITE_BOOKING_READ_BACKEND=spring |
| Public oluşturma | VITE_BOOKING_WRITE_BACKEND=spring |
| Yönetici adapter | VITE_BOOKING_ADMIN_BACKEND=spring; diğer bayraklardan bağımsız |
| JWT | BOOKING_JWT_ISSUER, BOOKING_JWKS_URI; RS256/ES256; audience authenticated |

Writer havuz ayarları Java kodundadır; booking.writer.hikari.* adlı bağlı bir ayar
yoktur. Vite bayrakları build sırasında derlenir: değişiklik için yeniden build ve
dağıtım gerekir. Backend yazma bayrağı yeniden başlatma gerektirir. Bu işlemler,
çalışmakta olan transaction'ı otomatik geri almaz.

Yönetici entegrasyonu hibrittir: Spring liste üyeliğini, sırasını ve toplamı belirler;
kart detayları yetkili Supabase oturumuyla RLS üzerinden okunur. Not/nitelik güncelleme
ve arşivleme mevcut Supabase yolundadır. Spring hatasında otomatik Supabase yazma
fallback'i veya komut retry'ı yoktur. Aynı istek iki backend'e yazılmaz.

Depodaki [vercel.json](../vercel.json) yalnızca SPA index.html rewrite'ı içerir;
Spring /api/v1 yönlendirmesi tanımlı değildir. [vite.config.js](../vite.config.js)
proxy'si yalnızca CI_SPRING_ORIGIN sağlanan geliştirme sunucusunda çalışır, üretim
build'ine taşınmaz. Bu nedenle sadece Vite bayraklarını açmak üretimde yeterli değildir.
Vercel panelindeki gerçek env/override değerleri bu çalışmada okunmadı; depodaki
yapılandırma denetimi, dağıtılmış ortamın doğrulandığı anlamına gelmez.

## İzole Staging Kabul Kapısı

[CI workflow](../../.github/workflows/umut-database-contract.yml) Java 17,
disposable PostgreSQL 17.6 ve Chromium kullanır. Yerel Docker veya ücretli staging
servisi gerekmez. Fixture'lar sentetiktir; üretim bağlantısı/secrets kullanılmaz.

- SQL kontrat paketi: rezervasyon geçişleri, paralel işlemler ve rollback.
- Spring PostgreSQL paketi: gerçek sorgular, JWT/rol denetimi, reader/writer sınırları,
  oluşturma/onay/iptal/taşıma/geri alma; dolu hedefte 409 ve eski durumun korunması.
- Browser: 390x844 ve 1280x900'de hizmet/saat seçiminden gerçek 201 talep sonucuna
  ve takip bağlantısına kadar. Veritabanında iki bekleyen kayıt doğrulanır.
- Yönetici: filtre/sayfalama ve komutlar HTTP entegrasyon testleriyle; ekran yenileme,
  taşıma ve 409 mesajları component/adapter testleriyle doğrulanır.

Bu kapsam yönetici ekranının gerçek Supabase Auth/RLS ile browser uçtan uca testini,
fotoğraf yüklemeyi veya müşteri self-servis SQL akışını doğrulamış sayılmaz.
CI kanıtı yeni commit SHA, run URL, test/hata/skip sayılarıyla kaydedilmeli.
Eski yeşil CI sonucu yeni paketin kanıtı değildir.

## Canlı Uyumluluk Kapısı (Henüz Tamamlanmadı)

[10 Eylül karşılaştırması](../backend-contract/live-comparison-2026-09-10.md)
tarihsel kanıttır; bugünkü canlı şemanın doğrulandığı anlamına gelmez.
[Salt-okunur envanter](../backend-contract/inventory.sql) ile fonksiyon gövdeleri,
trigger olayları, indeksler ve yetkiler tekrar karşılaştırılmalıdır.
[Geçiş kontratı](Appointment_Transition_Contract.md) ve
[hedef migration](../supabase/migrations/20260910150437_appointment_reservation_transitions.sql)
referanstır; bu çalışma kapsamında canlıya migration uygulanmaz.

Çift aktif rezervasyon veya slotu eksik/açık kalmış aktif onay varsa geçiş durur.
Kapalı fakat rezervasyonsuz slot tek başına hata kanıtı değildir; yönetici tarafından
kapatılmış olabilir. Deterministik slot sırası deadlock riskini azaltır; bütün
transaction kombinasyonlarında deadlock olmayacağı garantisi vermez.

Fixture reader beş tabloda SELECT; writer profil/talep SELECT, talepte yalnızca
status, requested_date, requested_time, archived_at UPDATE ve oluşturma RPC EXECUTE
kullanır. Doğrudan INSERT/DELETE, müşteri alanı ve rol düzenleme yasaktır.
Fixture grant/policy'leri üretim provisioning betiği değildir.

Üretimde rol üyelikleri, PUBLIC üzerinden etkili izinler, fonksiyon EXECUTE,
SECURITY DEFINER sahipleri/search_path ve RLS WITH CHECK ayrıca incelenmeli.
Yalnızca doğrudan grant listesi yeterli değildir. Fixture'daki toplu PUBLIC EXECUTE
revocation canlıya kopyalanmamalı; mevcut PostgREST istemcilerini bozabilir.
Gerçek JWT imza modu/key rotation, TLS/pooler uyumu ve bağlantı bütçesi ayrı
doğrulanmalı. Secrets veya müşteri verisi rapora eklenmemeli.

## Kontrollü Geçiş ve Geri Dönüş

1. Yeni SHA için CI kapısını tamamla. Gerçek dağıtımın /api/v1 proxy yönlendirmesini,
   gerekli env değerlerinin varlığını (değerleri loglamadan) ve canlı şema uyumunu denetle.
2. Ayrı onay sonrası gerekli şema/yetki değişikliklerini planla. Önce public okumaları,
   sonra yönetici komutlarını, ardından public oluşturmayı sınırlı kabul grubuyla aç.
3. Son çalışan frontend build'ini ve backend sürümünü sakla. Önceki istemcinin güncel
   şemayla uyumunu izole ortamda sınamadan geri dönüşe hazır kabul etme.
4. Sorunda yeni yazmaları kontrollü durdur; sürmekte olan işlemlerin sonucunu belirle.
   Belirsiz oluşturma sonucunu otomatik tekrar etme (oluşturmada idempotency yok).
5. İlgili frontend bayraklarını kapsayan önceki build'i dağıt: yönetici için ADMIN,
   oluşturma için WRITE, okuma için READ. Backend yazmayı kapatma sırasını istemci
   geçişiyle koordine et; eski açık sekmelerin hata alabileceğini hesaba kat.
6. Veri bütünlüğünü salt-okunur sorgularla yeniden denetle ve kabul testini tekrarla.

Eski trigger'a otomatik downgrade yoktur: taşıma/geri alma korumasını kaldırabilir.
Şema sorunu varsa yazmaları durdurup ileri düzeltme veya ayrıca incelenmiş geri dönüş
migration'ı gerekir. Hiçbir trigger körlemesine kaldırılmaz.

## İzleme ve Açık Kapılar

Bu backend'de Actuator bağımlılığı veya /actuator/health tanımı yoktur; iki havuzun
sağlığını bildiren endpoint varmış gibi dağıtım kontrolü yapılamaz. P95, 5xx,
iş kuralı 409 ile retry-required 409 ayrımı, havuz beklemesi ve SQL lock wait
ölçümleri üretim öncesi kurulmalı. Eşikler yük testiyle belirlenmeli; ölçülmüş SLO
veya otomatik rollback mekanizması yoktur. JWT/takip token'ı ve müşteri verisi loglanmaz.

- [ ] Yeni paketin PostgreSQL CI ve izole browser staging sonucu kaydedildi.
- [ ] Gerçek Auth/RLS ile hibrit yönetici browser kabulü tamamlandı.
- [ ] Güncel canlı şema, etkili yetkiler ve tutarlılık salt-okunur karşılaştırıldı.
- [ ] Gerçek proxy, JWT, TLS/pooler ve bağlantı bütçesi doğrulandı.
- [ ] Sağlık/izleme, rate limit, anti-abuse ve belirsiz oluşturma retry politikası hazır.
- [ ] Önceki build ile geri dönüş provası ve dağıtım onayı tamamlandı.
