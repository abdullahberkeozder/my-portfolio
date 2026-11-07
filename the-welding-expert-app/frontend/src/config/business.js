export const BUSINESS_WHATSAPP_NUMBER = "905455199916";
export const BUSINESS_TELEPHONE = "+90 545 519 99 16";
export const BUSINESS_EMAIL = ""; // E-posta hizmeti şu an aktif değil
export const BUSINESS_ADDRESS = "Gazi Mahallesi, Şenol Caddesi No:42, Yenimahalle/Ankara";
export const MAP_QUERY = encodeURIComponent(BUSINESS_ADDRESS);

export const BUSINESS_GEO_LATITUDE = 39.9310;
export const BUSINESS_GEO_LONGITUDE = 32.8115;
export const BUSINESS_URL = "https://umut-usta.vercel.app";

export const OPENING_HOUR = 9;
export const CLOSING_HOUR = 21;
export const SLOT_DURATION_HOURS = 2;

export const serviceTypes = [
  "Duvar boya ve badana",
  "Kapı, korkuluk ve kaynak",
  "Bahçe peyzaj ve düzenleme",
  "Küçük inşaat ve ev tadilatı",
  "Raylı kapı sistemleri",
  "Otomatik kapı motorları",
  "Bina ve bahçe kapıları için akıllı kilit sistemleri",
  "Yerinde keşif ve teklif",
];

export const aboutHighlights = [
  "Yerinde keşif ve kapsamı netleştiren teklif",
  "Boya, kaynak, montaj ve onarım işleri",
  "Randevulu çalışma ve teslim öncesi teyit",
];

export const serviceOverview = [
  {
    title: "Duvar boya ve badana",
    featured: true,
    problem: "Duvarlarda kir, çatlak, kabarma veya eski boya görünümü",
    text: "Ev, ofis ve apartman içi/dışı duvarlarınız için pürüzsüz boya uygulaması, alçı sıva ve temiz işçilik.",
    serviceType: "Duvar boya ve badana",
    points: ["Pürüzsüz alçı sıva", "Uygun boya seçimi", "Çalışma alanını koruyan temiz teslim"],
    imageUrl: "/images/painting.png",
    priceTagline: "Başlangıç fiyatı: 950 TL; kapsam keşif sonrası netleşir",
    priceFactors: ["Alan büyüklüğü", "Yüzey onarımı", "Boya ve kat sayısı"],
  },
  {
    title: "Kapı, korkuluk ve kaynak",
    featured: true,
    problem: "Kopan menteşe, sallanan korkuluk veya güçsüz metal bağlantı",
    text: "Menteşe onarımı, apartman kapıları, bahçe ve balkon korkuluklarının demir kaynak işleri.",
    serviceType: "Kapı, korkuluk ve kaynak",
    points: ["Yerinde sağlamlaştırma", "Kopan menteşe kaynağı", "Paslanmaz koruyucu boya"],
    imageUrl: "/images/railing_repair.png",
    priceTagline: "Küçük tamirlerde başlangıç: 750 TL; işin durumuna göre netleşir",
    priceFactors: ["Hasarın boyutu", "Profil ve kaynak miktarı", "Yerinde çalışma koşulu"],
  },
  {
    title: "Bahçe peyzaj ve düzenleme",
    featured: true,
    problem: "Bakımı gecikmiş, kullanımı zorlaşmış veya sınırları belirsiz bahçe",
    text: "Bahçe tasarımı, çim biçme, ağaç budama, toprak havalandırma ve bahçe çit montajı.",
    serviceType: "Bahçe peyzaj ve düzenleme",
    points: ["Bahçe peyzaj planı", "Ağaç ve çim budama", "Çit ve sınır telleri montajı"],
    imageUrl: "/images/landscaping_after.png",
    priceTagline: "Metrekare veya günlük fiyat; iş kapsamına göre netleşir",
    priceFactors: ["Bahçe alanı", "Bitki ve zemin durumu", "Çit veya malzeme ihtiyacı"],
  },
  {
    title: "Küçük inşaat ve ev tadilatı",
    featured: true,
    problem: "Lokal kırık, dökülme veya küçük alan yenileme ihtiyacı",
    text: "Lokal duvar örme, seramik/fayans döşeme, alçıpan montajı ve ev içi ufak tadilat işleri.",
    serviceType: "Küçük inşaat ve ev tadilatı",
    points: ["Alçıpan ve ara bölme duvarlar", "Fayans ve seramik döşeme", "Lokal sıva ve harç tamirleri"],
    imageUrl: "/images/renovation.png",
    priceTagline: "Metrekare veya iş bazlı fiyat; keşif sonrası netleşir",
    priceFactors: ["Uygulama alanı", "Söküm ve hazırlık", "Malzeme türü"],
  },
  {
    title: "Raylı kapı sistemleri",
    problem: "Zor kayan, raydan çıkan veya yeni imalat gereken sürgülü kapı",
    text: "Raylı garaj, site ve bahçe kapılarının demir iskelet imalatı, tekerlek değişimi, ray tamiri ve montajı.",
    serviceType: "Raylı kapı sistemleri",
    points: ["Sağlam metal ray montajı", "Rulman ve tekerlek yenileme", "Hassas terazi ve hizalama"],
    imageUrl: "/images/sliding_gate_after.png",
    priceTagline: "Metre veya proje bazlı fiyat; ölçüye göre netleşir",
    priceFactors: ["Kapı ölçüsü ve ağırlığı", "Ray zemini", "Tekerlek ve profil ihtiyacı"],
  },
  {
    title: "Otomatik kapı motorları",
    problem: "Manuel kapıyı otomatikleştirme veya arızalı motoru yenileme ihtiyacı",
    text: "Yana kayar veya kanatlı kapılar için motor montajı, elektrik bağlantısı, kumanda kodlama ve fotosel kurulumu.",
    serviceType: "Otomatik kapı motorları",
    points: ["Marka motor seçenekleri", "Engel algılayıcı fotosel", "Uzaktan kumanda tanımlama"],
    imageUrl: "/images/gate_motor_after.png",
    priceTagline: "Motor dahil veya montaj fiyatı; ihtiyaçla birlikte netleşir",
    priceFactors: ["Kapı tipi ve ağırlığı", "Motor kapasitesi", "Fotosel ve kumanda sayısı"],
  },
  {
    title: "Bina ve bahçe kapıları için akıllı kilit sistemleri",
    problem: "Kontrolsüz geçiş, anahtar takibi veya güvenli kapanma sorunu",
    text: "Apartman, bina ve bahçe kapılarına şifreli, kartlı, manyetik veya parmak izli akıllı kilit ve geçiş sistemleri kurulumu.",
    serviceType: "Bina ve bahçe kapıları için akıllı kilit sistemleri",
    points: ["Kartlı ve şifreli geçiş", "Otomatik hidrolik kapatıcı", "Kesintisiz güç kaynağı (UPS)"],
    imageUrl: "/images/smart_lock_after.png",
    priceTagline: "Sistem dahil veya montaj fiyatı; keşif sonrası netleşir",
    priceFactors: ["Geçiş yöntemi", "Kapı ve kilit uyumu", "Güç kaynağı ve aksesuarlar"],
  },
  {
    title: "Yerinde keşif ve teklif",
    problem: "İşin kapsamını, malzemesini veya uygulanabilirliğini uzaktan netleştirememe",
    text: "Yapılacak işlerin yerinde incelenmesi, malzeme seçimi, detaylı iş planı ve maliyet teklifi sunumu.",
    serviceType: "Yerinde keşif ve teklif",
    points: ["Ücretsiz ön inceleme seçeneği", "Detaylı malzeme listesi", "Yazılı fiyat ve süre teklifi"],
    imageUrl: "/images/estimate.png",
    priceTagline: "Keşif randevusu: Ücretsiz",
    priceFactors: ["Konum ve ulaşım", "İncelenecek iş sayısı", "Teknik ölçüm ihtiyacı"],
  },
];

export const processSteps = [
  {
    title: "Talep",
    text: "Hizmet, gün ve saat tercihinizi iletin.",
  },
  {
    title: "Teyit",
    text: "Ekip kapsamı ve uygunluğu sizinle netleştirir.",
  },
  {
    title: "Uygulama",
    text: "Onaylanan zamanda alan korunarak çalışma yapılır.",
  },
  {
    title: "Teslim",
    text: "Son kontrol birlikte yapılır ve iş teslim edilir.",
  },
];

export const faqItems = [
  {
    question: "Randevu talebi oluşturduktan sonra ne zaman dönüş yapılır?",
    answer: "Talebinizi çalışma saatleri içinde mümkün olan en kısa sürede inceliyoruz. Uygunluğu ve işin detaylarını teyit etmek için seçtiğiniz telefon numarasından veya WhatsApp'tan size ulaşıyoruz.",
  },
  {
    question: "Talep ettiğim tarih veya saati nasıl değiştirebilir ya da iptal edebilirim?",
    answer: "Talep oluşturduktan sonra gösterilen “Randevumu yönet” bağlantısından değişiklik veya iptal isteği gönderebilirsiniz. İstek ekibe iletilir; yeni tarih ve saat uygunluk kontrolünden sonra teyit edilir.",
  },
  {
    question: "Malzemeleri siz mi getiriyorsunuz?",
    answer: "Genellikle kullanılacak ana malzemeleri kaliteli markalardan biz temin ediyoruz. Dilerseniz malzemeyi siz alabilir, sadece işçilik hizmeti talep edebilirsiniz.",
  },
  {
    question: "Acil kaynak ve onarım hizmeti veriyor musunuz?",
    answer: "Aynı gün servis yalnızca takvim ve ekip uygunluğuna göre planlanabilir. Acil bir durum için WhatsApp'tan fotoğraf ve konum paylaşın; en uygun yönlendirmeyi birlikte değerlendirelim.",
  },
];

export const DAY_STATUS_OPTIONS = [
  {
    value: "available",
    label: "Müsait",
    tone: "green",
  },
  {
    value: "limited",
    label: "Kısıtlı",
    tone: "amber",
  },
  {
    value: "closed",
    label: "Kapalı",
    tone: "red",
  },
];

