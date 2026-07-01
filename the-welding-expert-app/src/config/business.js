export const BUSINESS_WHATSAPP_NUMBER = "905455199916";
export const BUSINESS_TELEPHONE = "+90 545 519 99 16";
export const BUSINESS_EMAIL = ""; // E-posta hizmeti şu an aktif değil
export const BUSINESS_ADDRESS = "Gazi Mahallesi, Şenol Caddesi No:42, Yenimahalle/Ankara";
export const MAP_QUERY = encodeURIComponent(BUSINESS_ADDRESS);

export const BUSINESS_GEO_LATITUDE = 39.931234; // TODO: gerçek koordinatla güncelle
export const BUSINESS_GEO_LONGITUDE = 32.812345; // TODO: gerçek koordinatla güncelle
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
  "Yerinde keşif ve net teklif",
  "Boya, kaynak, montaj ve onarım işleri",
  "Randevulu çalışma ve zamanında teslim",
];

export const serviceOverview = [
  {
    title: "Duvar boya ve badana",
    text: "Ev, ofis ve apartman içi/dışı duvarlarınız için pürüzsüz boya uygulaması, alçı sıva ve temiz işçilik.",
    serviceType: "Duvar boya ve badana",
    points: ["Pürüzsüz alçı sıva", "Kaliteli marka boyalar", "Sıfır kirlilik, temiz teslim"],
    imageUrl: "/images/painting.png",
    priceTagline: "Oda başı: 950 TL'den başlayan fiyatlar",
  },
  {
    title: "Kapı, korkuluk ve kaynak",
    text: "Menteşe onarımı, apartman kapıları, bahçe ve balkon korkuluklarının demir kaynak işleri.",
    serviceType: "Kapı, korkuluk ve kaynak",
    points: ["Yerinde sağlamlaştırma", "Kopan menteşe kaynağı", "Paslanmaz koruyucu boya"],
    imageUrl: "/images/railing_repair.png",
    priceTagline: "Küçük tamirler: 750 TL'den başlayan fiyatlar",
  },
  {
    title: "Bahçe peyzaj ve düzenleme",
    text: "Bahçe tasarımı, çim biçme, ağaç budama, toprak havalandırma ve bahçe çit montajı.",
    serviceType: "Bahçe peyzaj ve düzenleme",
    points: ["Bahçe peyzaj planı", "Ağaç ve çim budama", "Çit ve sınır telleri montajı"],
    imageUrl: "/images/landscaping.png",
    priceTagline: "Metrekare başı veya günlük fiyatlandırma",
  },
  {
    title: "Küçük inşaat ve ev tadilatı",
    text: "Lokal duvar örme, seramik/fayans döşeme, alçıpan montajı ve ev içi ufak tadilat işleri.",
    serviceType: "Küçük inşaat ve ev tadilatı",
    points: ["Alçıpan ve ara bölme duvarlar", "Fayans ve seramik döşeme", "Lokal sıva ve harç tamirleri"],
    imageUrl: "/images/renovation.png",
    priceTagline: "Metrekare başı veya iş bazlı fiyatlandırma",
  },
  {
    title: "Raylı kapı sistemleri",
    text: "Raylı garaj, site ve bahçe kapılarının demir iskelet imalatı, tekerlek değişimi, ray tamiri ve montajı.",
    serviceType: "Raylı kapı sistemleri",
    points: ["Sağlam metal ray montajı", "Rulman ve tekerlek yenileme", "Hassas terazi ve hizalama"],
    imageUrl: "/images/sliding_gate_after.png",
    priceTagline: "Metre başı veya proje bazlı fiyatlandırma",
  },
  {
    title: "Otomatik kapı motorları",
    text: "Yana kayar veya kanatlı kapılar için motor montajı, elektrik bağlantısı, kumanda kodlama ve fotosel kurulumu.",
    serviceType: "Otomatik kapı motorları",
    points: ["Marka motor seçenekleri", "Engel algılayıcı fotosel", "Uzaktan kumanda tanımlama"],
    imageUrl: "/images/gate_motor_after.png",
    priceTagline: "Motor dahil veya montaj bazlı fiyatlandırma",
  },
  {
    title: "Bina ve bahçe kapıları için akıllı kilit sistemleri",
    text: "Apartman, bina ve bahçe kapılarına şifreli, kartlı, manyetik veya parmak izli akıllı kilit ve geçiş sistemleri kurulumu.",
    serviceType: "Bina ve bahçe kapıları için akıllı kilit sistemleri",
    points: ["Kartlı ve şifreli geçiş", "Otomatik hidrolik kapatıcı", "Kesintisiz güç kaynağı (UPS)"],
    imageUrl: "/images/smart_lock_after.png",
    priceTagline: "Sistem dahil veya montaj bazlı fiyatlandırma",
  },
  {
    title: "Yerinde keşif ve teklif",
    text: "Yapılacak işlerin yerinde incelenmesi, malzeme seçimi, detaylı iş planı ve maliyet teklifi sunumu.",
    serviceType: "Yerinde keşif ve teklif",
    points: ["Ücretsiz ön inceleme seçeneği", "Detaylı malzeme listesi", "Yazılı fiyat ve süre teklifi"],
    imageUrl: "/images/estimate.png",
    priceTagline: "Keşif randevusu: Ücretsiz",
  },
];

export const processSteps = [
  {
    title: "Talep ve Randevu",
    text: "Hizmeti seçin, takvimden uygun gün ve saati belirleyerek randevu talebi bırakın.",
  },
  {
    title: "İletişim ve Keşif",
    text: "Atölyemiz talebi onaylamadan önce telefonla veya WhatsApp'tan detayları netleştirir.",
  },
  {
    title: "Uygulama ve İmalat",
    text: "Belirlenen tarih ve saatte adreste çalışmaya başlanır; temiz ve dikkatli uygulama yapılır.",
  },
  {
    title: "Kontrol ve Teslim",
    text: "Çalışma bittiğinde kullanım testleri yapılır ve iş sahibine temiz bir şekilde teslim edilir.",
  },
];

export const faqItems = [
  {
    question: "Randevu talebi oluşturduktan sonra ne zaman dönüş yapılır?",
    answer: "Randevu taleplerinizi genellikle 1-2 saat içerisinde inceliyor ve seçtiğiniz telefon numarası üzerinden onay için size ulaşıyoruz.",
  },
  {
    question: "Randevu saatini ertelemek veya iptal etmek mümkün mü?",
    answer: "Evet, randevu saatinize en geç 24 saat kalana kadar bizi telefonla arayarak veya WhatsApp üzerinden randevunuzu güncelleyebilirsiniz.",
  },
  {
    question: "Malzemeleri siz mi getiriyorsunuz?",
    answer: "Genellikle kullanılacak ana malzemeleri kaliteli markalardan biz temin ediyoruz. Dilerseniz malzemeyi siz alabilir, sadece işçilik hizmeti talep edebilirsiniz.",
  },
  {
    question: "Acil kaynak ve onarım hizmeti veriyor musunuz?",
    answer: "Takvimimizin müsaitlik durumuna göre aynı gün içinde acil menteşe veya demir kapı kaynak onarımları için servis yönlendirmesi yapabiliyoruz. Hızlı yanıt için WhatsApp seçeneğini kullanabilirsiniz.",
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

