-- =========================================================================
-- Umut Usta Gerçek Portföy Çalışmaları Seed SQL Sorgusu
-- =========================================================================
-- Adımlar:
-- 1. Öncelikle 'public/images/' klasöründeki şu görselleri Supabase 
--    Storage panelinden 'gallery' isimli bucket'ın içine (klasörsüz, en dışa) yükleyin:
--    - hinge_before.png, hinge_after.png
--    - railing_before.png, railing_after.png
--    - shelf_before.png, shelf_after.png
--    - landscaping.png
--    - painting.png
--    - renovation.png
-- 
-- 2. Aşağıdaki sorguda yer alan 'qhevdwblchkotttcqoou' ifadesini 
--    kendi Supabase proje referans kodunuzla (örneğin: abcdefghijklmnop) değiştirin.
-- 
-- 3. Düzenlediğiniz sorguyu Supabase SQL Editor panelinde çalıştırın.
-- =========================================================================

-- Mevcut örnek verileri temizleyelim (isteğe bağlı)
truncate table public.gallery_items restart identity;

insert into public.gallery_items 
  (title, description, category, location, image_url, before_image_url, before_label, after_label, points, price_tagline, sort_order, is_published)
values
  -- 1. Bahçe Kapısı Menteşe Onarımı (Kaynak)
  (
    'Apartman Bahçe Kapısı Menteşe Kaynağı ve Onarımı',
    'Zamanla paslanarak kopan demir menteşeler yerinden söküldü, kapı hizalandı ve yeni çelik mil menteşeler gazaltı kaynağı kullanılarak sağlam bir şekilde kaynaklandı.',
    'Kaynak ve metal',
    'Yenimahalle, Ankara',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/hinge_after.png',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/hinge_before.png',
    'Kopan Paslı Menteşe',
    'Yeni Kaynaklı Menteşe',
    array['Eski paslı kaynak kalıntılarının taşlanması', 'Kapının teraziye alınarak milimetrik konumlandırılması', 'Yüksek mukavemetli çelik menteşe kaynağı', 'Pas önleyici astar ve boya uygulaması'],
    '750 TL''den başlayan fiyatlar',
    1,
    true
  ),

  -- 2. Balkon Korkuluğu Yenileme (Kaynak)
  (
    'Balkon ve Pencere Korkuluğu Güçlendirme',
    'Eski yıpranmış korkuluk demirleri sökülerek güçlendirildi. Yeni destek profilleri kaynaklanıp paslanmaz siyah fırın boya ile estetik ve güvenli bir görünüme kavuşturuldu.',
    'Kaynak ve metal',
    'Çankaya, Ankara',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/railing_after.png',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/railing_before.png',
    'Paslı ve Çürük Korkuluk',
    'Yenilenmiş Korkuluk',
    array['Çürüyen profil demirlerinin tespiti ve kesimi', 'Yeni antipas boyalı demir kaynak montajı', 'Duvar sabitleme ankrajlarının güçlendirilmesi', 'Mat siyah dış cephe metal boyası'],
    '1.200 TL''den başlayan fiyatlar',
    2,
    true
  ),

  -- 3. Depo ve Garaj Demir Raf Yapımı (Kaynak)
  (
    'Özel Ölçü Demir Profil Raf İskeleti',
    'Duvar boyu özel ölçü 4 katlı demir raf yapıldı. Köşebentlerle desteklenen raflar ağır yüklere karşı test edilerek sabitlendi.',
    'Kaynak ve metal',
    'Etimesgut, Ankara',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/shelf_after.png',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/shelf_before.png',
    'Ölçülendirme Aşaması',
    'Kurulum ve Teslim',
    array['40x40 kutu profil kesimi ve hazırlık', 'Köşe gönye kaynak birleştirmeleri', 'Duvara çelik dübellerle ankraj sabitleme', 'Antipas boyama uygulaması'],
    'İş bazlı fiyatlandırma',
    3,
    true
  ),

  -- 4. Bahçe ve Peyzaj Düzenlemesi (Peyzaj)
  (
    'Villa Bahçe Peyzajı ve Çit Çevirme İşlemi',
    'Yabani ot temizliği, toprak havalandırma, ağaç budama yapıldı ve sınır belirleme amacıyla panel çitler çelik dübellerle beton zemine kaynaklanarak sabitlendi.',
    'Bahçe ve peyzaj',
    'Gölbaşı, Ankara',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/landscaping.png',
    null,
    'Öncesi',
    'Sonrası',
    array['Zemin temizliği ve tesviyesi', 'Panel çit direklerinin montajı ve kaynağı', 'Çim biçme ve ağaç budama', 'Toprak havalandırma'],
    'Günlük veya metrekare fiyatı',
    4,
    true
  ),

  -- 5. Ev İçi Duvar Boya Badana Uygulaması (Boya)
  (
    'Salon ve Koridor Alçı Sıva & Silinebilir Boya',
    'Çatlaklar ve delikler alçı sıva ile kapatıldı, zımpara sonrası astar çekildi ve 2 kat silinebilir yarı mat iç cephe boyası titizlikle uygulandı.',
    'Boya ve badana',
    'Keçiören, Ankara',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/painting.png',
    null,
    'Öncesi',
    'Sonrası',
    array['Duvar çatlaklarının alçı ile tamiri', 'Tozsuz zımpara ve astar kat uygulaması', 'Eşyaların maskelenerek korunması', '2 kat iç cephe boyası'],
    'Oda başı fiyatlandırma',
    5,
    true
  ),

  -- 6. Bina Giriş Kapısı ve Çevre Restorasyonu (Tadilat)
  (
    'Apartman Girişi Mermer ve Metal Restorasyonu',
    'Giriş kapısının paslı yüzeyleri temizlendi, menteşeler yağlanıp kaynakla güçlendirildi ve kapı kasasındaki lokal harç dökülmeleri tamir edildi.',
    'İnşaat ve tadilat',
    'Yenimahalle, Ankara',
    'https://qhevdwblchkotttcqoou.supabase.co/storage/v1/object/public/gallery/renovation.png',
    null,
    'Öncesi',
    'Sonrası',
    array['Kapı kasası harç dolguları', 'Metal kısımların antipas ile kaplanması', 'Kilit ve menteşe ayarlarının yapılması'],
    'Proje bazlı fiyatlandırma',
    6,
    true
  );
