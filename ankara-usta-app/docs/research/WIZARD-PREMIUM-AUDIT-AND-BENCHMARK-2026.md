# Orkestra Talep Sihirbazı (RequestWizard) UX/UI Analizi, 15 Wizard Benchmark Kataloğu ve Premium Tasarım Stratejisi

**Tarih:** 22 Ekim 2026  
**Durum:** Analiz ve Karar Kaydı  
**Kapsam:** Mevcut 4 adımın ekran görüntüleriyle derinlemesine analizi, 15 sektör standardı wizard sisteminin ortak noktaları ve Orkestra'yı ultra-premium seviyeye taşıyacak somut tasarım fikirleri.

---

## 1. Mevcut Orkestra Sihirbazının Adım Adım Ekran Görüntüleri ve UX/UI Analizi

Mevcut sihirbaz, temiz ve odaklı bir modal diyalog mimarisine sahiptir. Aşağıda yerel ortamda (`http://localhost:3000`) adım adım alınan ekran görüntüleri ve bunların detaylı analizi yer almaktadır:

### Adım 0: Kapsam ve Teşhis Soruları (Step 0 - Soru 1 ve Soru 2)
- **Ekran Görüntüsü 1:** [01_step0_scope_q1.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/01_step0_scope_q1.png)
- **Ekran Görüntüsü 2:** [02_step0_scope_q2.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/02_step0_scope_q2.png)

* **Gözlem:**
  - Tek ekranda tek soru kuralı başarıyla uygulanıyor.
  - Seçenek kartları dikey olarak sıralanmış; seçim yapıldığında sağ tarafta yeşil onay ikonu beliriyor.
  - Soru sayacı `● Soru 1 / 3 - Kapsam` şeklinde üstte yer alıyor.
* **Geliştirme / Zayıf Noktalar:**
  1. **Aşırı Dikey Boşluk ve Sterillik:** Seçenekler sadece düz metin içeren beyaz kutulardan ibaret. Karar anında kullanıcıya görsel rehberlik sağlayacak minimal ikonlar (ör. lavabo bataryası çizimi, duş sembolü vb.) bulunmuyor.
  2. **Klavye Kısayolu Eksikliği:** Typeform veya Linear benzeri `[1]`, `[2]`, `[3]` klavye ipuçları arayüzde görünür değil.
  3. **Boşta Kalan Buton Hissi:** Seçim yapılmadan önce `Devam` butonu grileşmiş ve etkisiz duruyor; kart tıklandığı anda doğrudan akıcı bir geçişle bir sonraki soruya kayması deneyimi hızlandırabilir.

---

### Adım 1: Görsel ve Medya Yükleme (Step 1)
- **Ekran Görüntüsü 3:** [03_step1_media_upload.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/03_step1_media_upload.png)

* **Gözlem:**
  - Kesikli yeşil çizgili (`dashed`) sade bir sürükle-bırak alanı (`dropZone`) mevcut.
  - "İsteğe bağlıdır" açıklaması ile kullanıcının sürece takılıp vazgeçmesi önlenmiş.
  - Geriye dönmek için "Kapsama dön" butonu bulunuyor.
* **Geliştirme / Zayıf Noktalar:**
  1. **Pasif Alan Hissi:** Ortadaki kamera ikonu ve gri kutu biraz genel-geçer duruyor. Zanaat hissi veren ("Ustanın net teklif verebilmesi için arızalı parçayı yakından çekin") mikro yönlendirici örnek fotoğraflar eklenebilir.
  2. **Hızlı Önizleme Şeritleri:** Birden fazla fotoğraf seçildiğinde thumbnail kalitesi ve silme etkileşimi daha rafine bir galeri ızgarasına kavuşturulmalı.

---

### Adım 2: Konum ve Zaman Tercihi (Step 2)
- **Ekran Görüntüsü 4:** [04_step2_location_timing.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/04_step2_location_timing.png)

* **Gözlem:**
  - "Haritada seç / Listeden seç" iki yönlü seçim imkanı sunuyor.
  - Açık adres gizliliği güvencesi ("Açık adresiniz teklif onaylanana kadar gizli tutulur...") karar anında güven aşılıyor.
  - Zaman hapları (`Bu hafta içinde`, `Mümkün olan en kısa sürede` vb.) kolay tıklanabilir durumda.
* **Geliştirme / Zayıf Noktalar:**
  1. **Klasik Tarayıcı Select Kutuları:** İlçe ve Mahalle seçimleri standart HTML `<select>` elemanları olarak duruyor. Bu, modern minimalist bir web uygulamasında zayıf ve eski bir his yaratıyor. Arama destekli (`Typeahead / Combobox`) modern seçicilerle değiştirilmeli.
  2. **Zaman Kartlarının Hiyerarşisi:** Acil durumlar ile esnek durumlar aynı görsel ağırlıkta sunuluyor.

---

### Adım 3: Kapsam Özeti ve Gönderim Onayı (Step 3)
- **Ekran Görüntüsü 5:** [05_step3_summary_confirm.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/05_step3_summary_confirm.png)

* **Gözlem:**
  - GOV.UK "Check Answers" modeline uygun satır bazlı düzenleme butonları (`Kalem ikonu`).
  - Güvenli havuz koruması ve ücretsiz teklif rozeti en üstte yer alıyor.
  - Gönderim için yanlışlıkla dokunmayı önleyen `Basılı tutun` mekanizması bulunuyor.
* **Geliştirme / Zayıf Noktalar:**
  1. **Dikey Kaydırma İhtiyacı:** Modal içinde kaydırma çubuğu beliriyor; butonlar altta sticky kalsa da özet kartlarının aralıkları daha kompakt ve zarif hale getirilebilir.
  2. **Fiyat / Süre Beklentisi:** Kullanıcı özet ekranında "Bu iş için ortalama usta yanıt süresi: ~15 dakika" ve "Piyasa fiyat beklentisi: 300 - 800 ₺" gibi rehber metinler görerek tam bir iç huzuruyla butona basabilmeli.

---

## 2. Platform İçi 10 Farklı Hizmet Sihirbazının Ekran Kataloğu

Platformumuzdaki 10 farklı hizmetin soru yapıları ve ekran görüntüleri `docs/research/wizard-audit-screenshots/` dizinine kaydedilmiştir:

| # | Hizmet | Ekran Görüntüsü Dosyası | Teşhis Karakteri |
|---|---|---|---|
| **06** | Mobilya Kurulumu | [06_mobilya_kurulumu.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/06_mobilya_kurulumu.png) | Parça tipi (Gardırop, Karyola vb.) ve kutu durumu analizi |
| **07** | TV Duvar Montajı | [07_tv_duvar_montaji.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/07_tv_duvar_montaji.png) | Ekran boyutu, duvar cinsi (beton/alçıpan) ve askı aparatı kontrolü |
| **08** | Korniş Montajı | [08_kornis_montaji.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/08_kornis_montaji.png) | Pencere sayısı, metre ölçüsü ve evde merdiven varlığı |
| **09** | Raf & Tablo Montajı | [09_raf_tablo_montaji.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/09_raf_tablo_montaji.png) | Parça adedi, duvar materyali ve dübel/vida tedarik durumu |
| **10** | Avize Montajı | [10_avize_montaji.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/10_avize_montaji.png) | Aydınlatma adedi, tavan yüksekliği ve eski avize söküm ihtiyacı |
| **11** | Elektrik Arızası | [11_elektrik_arizasi.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/11_elektrik_arizasi.png) | Güvenlik riski tespiti (kıvılcım/koku) ve risk kesinti uyarısı |
| **12** | Priz & Anahtar | [12_priz_anahtar_degisimi.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/12_priz_anahtar_degisimi.png) | Değişecek mekanizma adedi ve malzeme temini |
| **13** | Su Kaçağı Tespiti | [13_su_kacagi_tespiti.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/13_su_kacagi_tespiti.png) | Kaçağın belirtisi (ıslaklık, damlama, sayaç dönmesi) - Keşif modeli |
| **14** | Tek Oda Boya | [14_tek_oda_boya.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/14_tek_oda_boya.png) | Oda metrekaresi, tavan dahil mi, boş/dolu daire durumu - Teklif modeli |
| **15** | Ev Temizliği | [15_ev_temizligi.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/15_ev_temizligi.png) | Oda sayısı, banyo sayısı ve temizlik malzemesi ihtiyacı - Paket modeli |

---

## 3. Dünyanın En İyi 15 Wizard Sisteminin Benchmark Analizi ve Ortak Paydaları

| # | Referans Sistem | Gözlemlenen Kritik Desen | Ortak Payda & Karar |
|---|---|---|---|
| **1** | **Typeform** | Tek ekranda tek karar, klavye kısayoluyla (`1, 2, Enter`) ışık hızında akış, konuşma dili | Bilişsel yük sıfırlanır, terk oranı düşer |
| **2** | **Taskrabbit** | Hizmet kapsamı netleşmeden usta eşleştirilmez; kategori → kapsam → adres → tarih adımları | Karar sırası kullanıcının zihnindeki önceliklerle tam örtüşür |
| **3** | **Stripe Checkout** | Formdan çok "resmi sözleşme tamamlama" güveni; her adımda taslak ve oturum korunur | Kullanıcı sayfayı yenilese bile kaldığı adımı kaybetmez |
| **4** | **Airbnb** | Fotoğraflı seçim kartları, güven sinyalleri karar noktasına bitişik konumlandırılır | Seçim anında kararsızlık minimuma iner |
| **5** | **Thumbtack** | Teknik terim sormadan semptom teşhisi ("Su nereden geliyor?", "Sigorta atıyor mu?") | Kullanıcı usta olmasa bile doğru teşhisi kolayca koyar |
| **6** | **Lemonade** | Acil durumlarda sakinleştirici, empati odaklı dil; risk anında akışı kesme | Güvenlik ve ciddiyet gerektiren elektrik/su işlerinde kullanıcıyı sakinleştirir |
| **7** | **GOV.UK Question Pages** | Tam erişilebilirlik (A11y), net hata mesajı odağı, gereksiz süslemelerden arınmışlık | Hata anında kullanıcının nereyi düzelteceğini net gösterme |
| **8** | **GOV.UK Check Answers** | Son adımda her kalemin yanında "Değiştir" bağlantısıyla düzenlenebilir özet | Geri tuşuyla tüm formu bozma riskini ortadan kaldırır |
| **9** | **TurboTax** | Karmaşık resmi işlemleri küçük mikro-adımlara bölme, yerinde bağlamsal yardım balonları | Korkutucu görünen tadilat kapsamını çocuk oyuncağına çevirir |
| **10** | **Angi** | Teslim modellerini (Paket Fiyat vs. Keşif vs. Özel Teklif) açıkça ilan etme | Beklenti uyuşmazlığını ve fiyat tartışmalarını baştan önler |
| **11** | **Jotform Cards** | Kart tabanlı dinamik soru ilerlemesi, pürüzsüz kaydırma efektleri | Uygulamanın modern ve canlı hissettirmesini sağlar |
| **12** | **Tally** | Koşullu mantık (Progressive Disclosure); cevap verilmedikçe alt sorular açılmaz | Ekranda görsel kalabalık oluşmaz |
| **13** | **ServiceTitan** | Konumun sadece harita pini değil, semt ve erişim şartları (kat/asansör) ile tanımlanması | Ustanın park ve merdiven sorununu iş öncesi çözer |
| **14** | **Google & Microsoft Forms** | Yalnızca ileriye doğru dallanma grafı (Branch Graph integrity) | Geri dönüşlerde döngüye girme veya veri çakışması yaşanmaz |
| **15** | **Baymard Institute** | Form sürtünmesini azaltma, gereksiz alanları kaldırma, oturum açmayı en sona bırakma | Ziyaretçiyi kayıt olmadan önce talep oluşturmaya teşvik eder |

---

## 4. Orkestra Wizard'ı Yeni Mimari Kimliği: Sunlit Mediterranean Japandi Atelier

Kullanıcının paylaştığı mimari referans görseli (traverten mermer basamaklar, doğal bal rengi meşe ahşap kemer, yivli kristal cam sütunlar, fırçalanmış şampanya pirinç halkalar ve yaprak gölgeli sıcak kireç sıvalı duvarlar) doğrultusunda sihirbazın **tüm renk dağılımı, buton hiyerarşisi, tipografik iskeleti ve dokunsal estetiği baştan aşağı yeniden yapılandırılmıştır.**

---

### Görsel Referansından Türetilen Mimari Renk ve Malzeme Paleti

| Malzeme / Öğe | HEX / CSS Kodu | Kullanım Alanı ve Rolü |
|---|---|---|
| **Alabaster & Traverten Cam** | `rgba(253, 251, 248, 0.96)` | Modal diyalog gövdesi (`.dialog`), sıcak ve ferah kireçtaşı hissi |
| **Doğal Meşe Ağacı (Honey Oak)** | `#9C724A`, `#B88E65` | Kategori başlıkları (`.serviceContext span`), seçili kart konturu ve onay rozetleri |
| **Fırçalanmış Şampanya Pirinç** | `#C5A059`, `#B8934A`, `#D4AF37` | 3px Mikro ilerleme dolgusu ve süzülen gün ışığı hüzmesi |
| **Derin Espresso Ahşap (Atelier)** | `#2A231D`, `#3D332B` | **Birincil Eylem Butonları** (`Devam`, `Talebi Gönder`), ana soru başlıkları |
| **Sıcak Kireçtaşı Kemik (Bone)** | `#FBF8F3`, `#F6F0E6` | Seçili kart zemini ve adımlama rozeti (`.progress`) |
| **Taş Grisi & Taupe** | `#6E6458`, `#7A7065` | Açıklama metinleri, ikincil etiketler |
| **Traverten İnce Çizgi** | `rgba(228, 220, 208, 0.9)` | Kart sınırları, diyalog kenar hattı ve bölücü çizgiler |

---

### Canlı Sistem Ekran Görüntüleri (`http://localhost:3000`)

| Görsel Dosyası | Durum | Gözlemlenen Mimari Estetik |
|---|---|---|
| [atelier_wizard_q1_idle.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/atelier_wizard_q1_idle.png) | Soru 1 (Boşta) | Traverten alabaster zemin, bal rengi meşe `TESİSAT` başlığı, yumuşak kireçtaşı adımlama hapı ve dinlendirici kemik buton. |
| [atelier_wizard_q1_selected.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/atelier_wizard_q1_selected.png) | Seçim Yapıldı | Seçilen seçenekte sıcak meşe çerçevesi (`#9C724A`) ve pirinç onay rozeti; altta güçlü, otoriter **Derin Espresso Meşe (`#2A231D`) Devam butonu**. |
| [atelier_wizard_q2_advance.png](file:///c:/Users/a-ber/Documents/Git/my-portfolio/ankara-usta-app/docs/research/wizard-audit-screenshots/atelier_wizard_q2_advance.png) | Soru 2 (İlerleme) | Üstteki 3px saç teli çubuğun %33'e süzülerek uzaması; solda traverten çerçeveli `Geri` butonu, sağda bekleyen `Devam` butonu. |

---

### Tipografi ve İskelet Hiyerarşisi

1. **Kategori ve Kicker Başlığı:**  
   `color: #9C724A; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;`
2. **Ana Soru Başlığı (`.step-main-title`):**  
   `color: #26201B; font-size: clamp(1.45rem, 2.8vw, 1.95rem); font-weight: 800; letter-spacing: -0.035em; line-height: 1.25;`
3. **Alt Açıklama (`.step-sub-desc`):**  
   `color: #6E6458; font-size: 0.95rem; line-height: 1.55;`
4. **Seçenek Kartları (`.choice`):**  
   18px kavisli köşe, 1.5px traverten sınır çizgisi (`#E4DCD0`), 18px iç boşluk, seçildiğinde sıcak meşe aurası (`rgba(156, 114, 74, 0.16)`).

---

### Buton Renk ve Etkileşim Dağılımı

- **Birincil Butonlar (`Devam`, `Talebi gönder`, `Kaydet`):**  
  Mevcut görseldeki derin gölgelerden ve masif ahşap ayaklardan ilham alan **Derin Espresso Masif Ahşap** degrade:
  ```css
  background: linear-gradient(135deg, #2A231D 0%, #3D332B 100%);
  color: #FAF7F2;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(42, 35, 29, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.18);
  ```
- **İkincil / Outline Butonlar (`Geri`, `Özete dön`, `Kapsama dön`):**  
  Traverten mermer dokusunu tamamlayan açık krem/kemik çerçeveli buton:
  ```css
  border: 1.5px solid #D8CFC1;
  background: rgba(255, 255, 255, 0.85);
  color: #3A322C;
  ```
- **Devre Dışı (Disabled) Durumu:**  
  Sert gri yerine traverten taşıyla eriyen yumuşak açık kum rengi (`#E5DFD5`, yazı `#A69D90`).

---

## 5. Uygulama ve Kod Entegrasyonu (Component Mapping)

| Bileşen Dosyası | Yapılan Entegrasyon |
|---|---|
| `app/components/requestWizard.module.css` | - Tüm renkler (#0E6F47 orman yeşili vb.) görseldeki Traverten, Doğal Meşe, Şampanya Pirinç ve Derin Espresso paletine uyarlandı.<br>- Birincil ve ikincil buton stilleri, tipografi aralıkları ve gölgeler yeniden yapılandırıldı.<br>- 3px mikro ilerleme çubuğu ve yivli camdan süzülen altın gün ışığı hüzmesi bağlandı. |
| `app/components/RequestWizard.tsx` | - Dinamik `progressPercent` hesaplaması bağlandı.<br>- `<section className={styles.dialog}>` tepesine `.hairlineTrack` eklendi. |

---

## 6. Kalite ve Kabul Kriterleri (Doğrulama Sonuçları)

1. **Doğal ve Zanaatkar Görsel Uyum:** Koyu tema yapaylığı ve parlak yeşil lazerler ortadan kalktı; görseldeki mimari sakinlik doğrudan arayüze yansıdı.
2. **Performans:** Animasyonlar reflow üretmez; yalnızca GPU hızlandırmalı `transform` ve `opacity` çalışır.
3. **Proje Test Standartları:**
   - `npm run styles:check`: **BAŞARILI** (0 hata)
   - `npm run repository:check`: **BAŞARILI** (1363 dosya doğrulandı)
   - `vitest tests/component/RequestWizard.test.tsx`: **18/18 test BAŞARILI**



