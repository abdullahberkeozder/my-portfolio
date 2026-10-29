# Landing CSS stabilizasyonu

Tamamlama tarihi: 24 Ekim 2026.

## Kapsam

Uygulamada yalnız `app/home.module.css` değişti. Route, TSX, wizard, consent davranışı, veri veya ortak buton bileşeni değiştirilmedi. Önceden var olan çalışma ağacı korunmuştur. Commit/push yapılmadı.

| Önce | Sonra | Neden |
| --- | --- | --- |
| Aynı üst düzey seçici/özellik için 61 önceki bildirim | Sonraki koşulsuz aynı seçici tarafından ezilen bildirimler kaldırıldı | CSS cascade sırasını koruyarak ölü kodu azaltma |
| Renk sabitleri kurallara dağılmıştı | `.home` kapsamında 24 renk token'ı | Diğer route'lara sızmadan renk bakımını merkezileştirme |
| Font listesi doğrudan kullanılıyordu | Yerel `--home-font-body` token'ı | Aynı font sonucunu koruma |

Bu tam CSS yeniden düzenlemesi değildir. Responsive ve state kuralları farklı koşullara sahip olduğundan birleştirilmedi. Shorthand/longhand ve farklı seçici etkileşimleri körlemesine silinmedi. Global marka beyazı veya mevcut cam etkisi değiştirilmedi.

## Kanıt

- `before.css`: bu dilimin başlangıcındaki gerçek dosya kopyası; HEAD karşılaştırması yerine kullanıldı çünkü çalışma ağacı zaten kirliydi.
- `before.json`: 320 / 390 / 820 / 1440 px, reduced-motion açıkken main altındaki elemanların konum/boyut ve seçili hesaplanan CSS özellikleri.
- `differences.json`: boş liste. Aynı örneklemde karşılaştırılan özellikler: color, backgroundColor, fontSize, borderRadius, padding, margin, display, gap ve bounding rect. Bu tüm CSS özelliklerinde veya tüm etkileşim durumlarında piksel eşitliği iddiası değildir.
- `before-*.png`, `after-*.png`: dört genişlikte gerçek tarayıcı kayıtları. İlk ziyaret consent paneli gizlenmedi.
- `styles:check` ve yeni production build başarılı. CSS dosyası için `git diff --check` başarılı; yalnız Git CRLF uyarısı mevcut.
- Yeni production derlemesinde landing E2E: 16/16 başarılı (20.1 saniye); arama etiketi/boyutu, ilçe bağlantıları, klavyeyle hizmet dizini, tanınmayan arama kurtarma ve harita geçişi.

## Gemini ve kontrol sınırları

İstenen model gemini-3.8-flash-high kullanıldı. İlk uygulama çağrısı headless araç `command` izin isteğinin otomatik reddiyle durdu. İzin atlatma bayrağı kullanılmadı. İkinci, CSS metni üzerinden araçsız token üretme çağrısı 90 saniyede çıktı vermedi. Gemini kod üretmiş veya doğrulamış sayılmadı. Dönüşüm Codex tarafından mekanik olarak hazırlanıp apply_patch ile uygulandı.

Hallmark component-scope taraması 24 FAIL, 20 REFLEX, 1 WARN bildiriyor. 24 FAIL, `.home` içindeki custom property tanımlarını token bloğu olarak tanımayan tarayıcı kuralından geliyor; gerçek literal kullanımlar `.home` token bloğunda toplanmış durumda. Global :root'a taşıyarak yalnız tarayıcıyı susturmak için kapsam genişletilmedi. Spacing ve hover önerileri bu görünümü-koruma diliminde uygulanmadı. Önceki iki dosyalı page-scope sonuçla doğrudan puan karşılaştırması yapılmamalı.

## Sonraki sınırlı çalışma

Wizard seçenek kartları, ana/ikincil buton ayrımı ve odak/hata durumlarını gerçek ekranlarla incelemek. Yeni renk veya route eklemek yerine mevcut Orkestra kontrol sistemini uygulamak. Landing consent panelinin içerik örtmesi ayrıca çözülmeli; burada gizlenerek sonuç iyileştirilmedi.
