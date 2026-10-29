# SplitView ve iş detayı: uygulama ve kabul kaydı

22 Ekim 2026. Medya doğrulama güncellemesi: 23 Ekim 2026. Tam yol haritasının tamamlandığı anlamına gelmez. Commit/push yapılmadı; mevcut kullanıcı değişiklikleri korundu.

## Gerçek görev dağılımı

Codex kapsamı ve tasarım kararını belirledi. Gemini 3.8 Flash High yalnız sınırlı kaynak metni üzerinden patch/kod önerdi. Dosyalara entegrasyon ve test çalıştırma Codex tarafından yapıldı; Gemini doğrudan depoda kod değiştirmiş veya test çalıştırmış gibi raporlanmıyor.

- SplitView: Gemini koşullu render zamanı state sıfırlaması önerdi. Filtre ve sonuç bağlamı değiştiğinde hizmet bölgesi paneli kapanır. Eski effect içi state güncellemesi kaldırıldı. URL davranışı değiştirilmedi.
- Modal görüşmesi `b0e6c5b6-da59-4fe8-a2e2-1c839968ef11`: mevcut useModalDialog kullanımı. Codex yanlış göreli import yolunu düzeltti, bağlı tetikleyici kontrolü ve tabIndex ekledi; testleri mevcut dizine ve temizleme altyapısına uyarladı.
- Görsel görüşme `96fa5f51-7695-4d8e-a99a-416b4169e338`: Gemini home-1440.png ve home-390.png tarihsel ekranlarını incelediğini bildirdi. Başlık/arama hiyerarşisini olumlu; mobil hızlı etiket sarımını ve boş görsel alanlarını sorunlu buldu. Bu, bugünkü responsive kabul yerine geçmez.
- CSS görüşmesi `9fede08e-3c59-42d0-8ecc-288d3236268b`: Gemini scoped modal CSS üretti. Codex mevcut modal katmanını kullandı, overscroll sınırı ve hover-capability koşulu ekledi. Yeni animasyon/tema eklenmedi.

## Önce / sonra / neden

| Önce | Sonra | Neden |
| --- | --- | --- |
| Effect gövdesinde panel state sıfırlama, lint hatası | Bağlam değişimine bağlı koşullu state düzenlemesi | Filtre davranışını koruyarak cascading effect kaldırıldı |
| Yalnız ilk odak ve odak iadesi | Ortak hook ile Escape, Tab döngüsü, scroll kilidi | Paylaşılan davranışı yeniden kullanma |
| Detay paneli normal sayfa akışında | Sabit backdrop, sınırlı genişlik/yükseklik, kaydırılabilir panel | Tarayıcıda kanıtlanan eksik CSS'yi giderme |
| SurfaceCard sınıfı yok, tüm kartlar stilsiz varsayımı | Profil tüketicilerinin kendi CSS modülleri olduğu doğrulandı | Gereksiz global CSS ve cascade değişikliğinden kaçınma |

## Test kanıtı

- UstalarSplitView.test.tsx: 35/35 başarılı.
- DiscoveryWorkDetail.test.tsx: 4/4 başarılı. İlk iki sandbox çalıştırması Vitest geçici dosya rename EPERM nedeniyle teste ulaşamadı; izinli çalıştırma exit 0.
- Type-check ve tam lint: exit 0, TSX değişikliklerinden sonra.
- Build: exit 0. `/images/auth-bg.jpg` çözümleme uyarısı var; başarılı build görsel varlığı kanıtlamaz.
- styles:check: modal CSS eklendikten sonra exit 0.
- Gerçek yerel tarayıcı: `/` açıldı. İş detayına tıklamada odak Kapat'a geçti; Escape ile panel kapandı ve odak aynı iş kartına döndü. CSS sonrası panel ekran üzerinde açılıyor.
- 320/390/820/1440 matrisi bu güncellemede tamamlanmadı. Nested modal, arka planın bütün odak yollarıyla izolasyonu ve authenticated U5 ekranı kabul edilmedi.

## Çözülen engel: medya varlıkları

23 Ekim'de `public/images` içindeki gerçek varlıklar yeniden bağlandı. Landing hero'su `hero-glass-materials-v3.png` dosyasını; keşif vitrini ise altı görev görselini kullanıyor. Auth yüzeyi `auth-bg.jpg` ile eşleşiyor.

Dosya ölçüleri kaynakta doğrulandı: hero 1672×941, auth 1376×768, keşif görsellerinin her biri 1200×896. Yerel tarayıcıda 390 ve 1440 px çekimlerinde hero ve altı keşif görselinin `complete=true`, `naturalWidth>0` olduğu ve başarısız medya yanıtı bulunmadığı kaydedildi. Rastgele stok görsel eklenmedi.

`hero-glass-materials-v2.jpg` dosyasının içeriği PNG biçiminde ve aynı görselin `.png` kopyası da bulunuyor. Uygulama bunların yerine `v3.png` kullandığı için bu bir runtime engeli değildir; kullanıcı onayı alınmadan arşiv kopyaları silinmeyecek.

P1c modal yüzeyi dar kapsamda öne alındı. Medya engeli kalktığı için P2A public baseline kanıtı alınabildi; auth/operations route'ları için gerçek test oturumu ve fixture kapsamı ayrıca doğrulanmalı.

## Devam sırası

1. Directory loading/U5 stillerini doğrula; hedefli screenshot karşılaştırmasını tamamla.
2. Public route baseline matrisini keşif rotaları boyunca genişlet.
3. Yetkili müşteri/usta/yönetim fixture ekranları; ardından route bazlı iyileştirmeler.
4. Tam kalite kapısı ve ayrı checkpoint önerisi. Yetkili ekran kanıtı alınmadan tüm dilimler tamamlandı denmeyecek.

## 23 Ekim — P1c ve public responsive bulguları

Directory loading ve U5 fixture yüzeyleri mevcut token sistemiyle tamamlandı. Skeleton gerçek split-view geometrisini koruyor; hareket azaltma tercihi animasyonu kapatıyor. U5 hata/boş durum yüzeyi 44 px eylem hedefleri ve görünür klavye odağı kullanıyor. Gemini'nin ilk CSS önerisindeki geçersiz birleşik animasyon zamanlaması ve sabit renkler Codex incelemesinde düzeltilerek ürün tokenlarına bağlandı.

Public baseline 390 ve 1440 px'te `/`, `/ustalar`, `/harita`, `/ankara/cankaya/musluk-batarya-degisimi`, `/usta-basvurusu`, `/nasil-calisir`, `/yardim` ve `/giris` için alındı. `/usta-basvurusu` mobilde intrinsic genişlik nedeniyle viewport dışına taşıyordu. Route kabuğuna ve kendi kartına `width: 100%` ile `min-width: 0` verildi. 320/390/820/1440 tekrarında `documentElement.scrollWidth === window.innerWidth`; kart ve ilk input her viewport içinde kaldı.

820 px kanıtında sabit Saha Destek kapsülü birincil `Devam Et` eylemini kapatıyordu. Başvuru rotasında 900 px ve altında kapsül gizlendi; destek footer bağlantısında erişilebilir kalıyor. Tekrar çekiminde birincil eylem bütünüyle görünür.

| Önce | Sonra | Neden |
| --- | --- | --- |
| Loading sınıfları işlevsel yüzey üretmiyordu | Split-view ölçüsünü koruyan kart + harita skeleton'ı | Yükleme ile sonuç yerleşimi arasındaki sıçramayı azaltma |
| U5 kontrollü durumları çıplak akış görünümündeydi | Token tabanlı, odak görünür, 44 px eylem yüzeyi | Fixture'ın gerçek hata/boş durum sözleşmesini temsil etmesi |
| Usta başvuru formu 390 px'te soldan kırpılıyordu | 320–1440 px boyunca yatay taşma yok | Formu tüm mobil kullanıcılar için okunur ve tamamlanabilir kılma |
| Tablet destek kapsülü ana CTA'yı örtüyordu | Form süresince kapsül gizli; footer desteği korunuyor | Birincil göreve müdahaleyi kaldırma |

Kalite kanıtı: styles:check, type-check, tam lint ve production build exit 0. U5VisualFixture, ProfessionalDirectory ve UstalarSplitView hedefli paketi 44/44 başarılı; ilk sandbox denemesi test başlamadan Windows geçici dizin `EPERM` hatası verdi, izinli tekrar başarılı oldu.

Kalan engel: `/ustalar` ve `/harita` gerçek yerel veri çağrısı başarısız olduğu için hata yüzeyine düşüyor. Hata yüzeyindeki `Tekrar dene` ve `Ana sayfaya dön` eylemleri eklendi ve tarayıcıda görünür. Gerçek sonuç kartı/veri kalitesi kabulü deterministic fixture veya yetkili staging oturumu gerektiriyor.
