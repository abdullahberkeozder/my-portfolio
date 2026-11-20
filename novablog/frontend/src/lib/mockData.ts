// NovaBlog Enterprise - High Quality Mock Data for Vitrin / Offline Demo
// Hybrid Tech Publication: Deep Engineering Articles + Curated Dispatches (Haberler)

import { BlogDto, BlogCategoryDto, CommentResponseDto, BlogSemanticSearchResultDto } from '@/types/api';

export const MOCK_CATEGORIES: BlogCategoryDto[] = [
  { categoryId: 1, categoryName: 'Yapay Zeka & AI', categoryDescription: 'Spring AI, LLM Entegrasyonları, Model Context Protocol ve Vektör Veritabanları' },
  { categoryId: 2, categoryName: 'Backend & Dağıtık Sistemler', categoryDescription: 'Spring Boot 4, Java 22/23 Loom, Virtual Threads ve Mikroservis Mimarisi' },
  { categoryId: 3, categoryName: 'Teknoloji & Altyapı', categoryDescription: 'Bulut Mimarisi, Linux Çekirdeği, Ağ Protokolleri ve Dağıtık Sistemler' },
  { categoryId: 4, categoryName: 'React & Modern Frontend', categoryDescription: 'React 19, Next.js 15/16, Turbopack, Tailwind CSS ve Tarayıcı Standartları' },
  { categoryId: 5, categoryName: 'Veri & Batch ETL', categoryDescription: 'Spring Batch, PostgreSQL ve Yüksek Hacimli Veri İşleme' },
  { categoryId: 6, categoryName: 'Siber Güvenlik & 2FA', categoryDescription: 'OAuth2, JWT, TOTP 2FA ve OWASP Savunmaları' },
];

export const MOCK_BLOGS: BlogDto[] = [
  // --- 1. DERİN TEKNİK MAKALELER (Long-Form Articles) ---
  {
    id: 1,
    publicationType: 'article',
    header: 'Spring AI & Anlamsal Arama',
    title: 'Spring AI ve Akıllı Vektör Veritabanı Mimarisi',
    content: `Kurumsal bilgi sistemlerinde geleneksel kelime bazlı aramalar, kullanıcıların aramak istediği kavramın niyetini ve bağlamını yakalamakta yetersiz kalmaktadır.

## 1. Neden Anlamsal Vektör Araması?
Doğal dil metinleri çok boyutlu matematiksel anlam uzayına aktarıldığında, eş anlamlı sözcükler veya kavramsal akrabalıklar uzaysal olarak birbirine yakın konumlanır. Örneğin "bellek optimizasyonu" araması, içeriğinde bu tam tabir geçmese bile "JVM Garbage Collector ayarları" ile anlamsal olarak eşleşir.

\`\`\`java
@Component
public class VectorEmbeddingService {
    private final EmbeddingClient embeddingClient;

    public float[] generateEmbedding(String documentText) {
        // Metni anlamsal koordinat vektörüne dönüştürür
        return embeddingClient.embed(documentText);
    }
}
\`\`\`

## 2. Hibrit Arama ve Akıllı Skorlama
Arama motorumuzda Reciprocal Rank Fusion (RRF) prensibi uygulanmaktadır:
- Klasik anahtar kelime eşleşmesi
- Anlamsal vektör benzerliği
- Birleştirilmiş hibrit alaka skoru

Bu mimari sayesinde kullanıcı doğal bir dille arama yaptığında dahi en doğru teknik dokümantasyon milisaniyeler içinde sunulmaktadır.`,
    author: 'Abdullah Berke Özder',
    views: 1420,
    likes: 189,
    isPublished: true,
    publishedAt: '2026-11-05T10:00:00Z',
    createdDate: '2026-11-05T09:30:00Z',
    category: MOCK_CATEGORIES[0],
    tags: ['yapay-zeka', 'anlamsal-arama', 'vektor-veritabani', 'spring-ai', 'akilli-filtre'],
    aiSummary: 'Kullanıcı niyetini anlayan Spring AI ve vektör veritabanı mimarisi. Geleneksel SQL aramalarını aşan anlamsal eşleşme motoruyla %94 doğruluk ve milisaniyelik yanıt süresi sağlanmaktadır.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 2,
    publicationType: 'article',
    header: 'Java 22 & Eşzamanlılık',
    title: 'Java 22 Virtual Threads ve Yüksek İşlem Kapasitesi',
    content: `Java platformunun en köklü dönüşümlerinden biri olan Project Loom (Sanal İş Parçacıkları), geleneksel 1:1 işletim sistemi iş parçacığı modelini hafif kullanıcı seviyesi iş parçacıklarıyla değiştirmiştir.

## 1. Sanal Thread Devrimi
Geleneksel Spring Boot uygulamalarında Tomcat thread havuzu 200 iş parçacığıyla sınırlandırılırken, veritabanı veya REST çağrısı sırasında işletim sistemi thread'i bloke olur. Sanal iş parçacıkları ise bloke olduğunda işletim sistemi thread'ini serbest bırakır.

\`\`\`java
// Virtual Thread ile hafif iş parçacığı oluşturma
Thread.ofVirtual()
      .name("virtual-worker-", 0)
      .start(() -> {
          // Bloke eden I/O işlemi carrier thread'i askıya almaz
          fetchRemoteEnterpriseData();
      });
\`\`\`

## 2. Spring Boot 4 Entegrasyonu
Spring Boot 4 üzerinde \`spring.threads.virtual.enabled=true\` parametresi ile:
- Tüm HTTP istekleri otomatik olarak sanal iş parçacıklarına devredilir.
- Thread geçiş (context-switch) maliyeti %90 düşürülür.
- 10.000 eşzamanlı bağlantıda dahi bellek tüketimi minimum seviyede kalır.`,
    author: 'Abdullah Berke Özder',
    views: 2840,
    likes: 312,
    isPublished: true,
    publishedAt: '2026-11-04T14:15:00Z',
    createdDate: '2026-11-04T13:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['java-22', 'sanal-threadler', 'yuksek-trafik', 'spring-boot-4', 'performans'],
    aiSummary: 'Java 22 Virtual Threads ile thread havuzu darboğazları ortadan kaldırıldı. Eşzamanlı istek işleme kapasitesi 10 katına çıkarılırken bellek kullanımı %90 oranında düşürüldü.',
    hasVectorEmbedding: true,
    version: 2,
  },
  {
    id: 3,
    publicationType: 'article',
    header: 'Redis & Yüksek Trafik',
    title: 'Redis Write-Behind Tamponlama ile Veritabanı Yükünü Sıfırlama',
    content: `Yoğun trafik alan blog platformlarında her sayfa görüntülenmesi ve beğeni işleminde PostgreSQL'e anlık yazma sorgusu göndermek veritabanında disk darboğazlarına yol açar.

## 1. Write-Behind (Gecikmeli Yazma) Prensibi
NovaBlog üzerinde sayaçlar doğrudan diske yazılmaz; Redis RAM belleğinde atomik işlemlerle toplanır ve belirli aralıklarla veritabanına toplu aktarılır.

\`\`\`java
@Service
public class RedisWriteBehindBuffer {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void incrementViewCount(Long blogId) {
        // RAM üzerinde nanosaniyeler içinde sayaç artışı
        redisTemplate.opsForValue().increment("blog:views:" + blogId);
    }
}
\`\`\`

## 2. Zamanlanmış Toplu Yazma (Batch Sync)
Arka planda çalışan zamanlanmış görev, biriken verileri 5 saniyede bir tek bir toplu SQL sorgusuyla diske kalıcı olarak yazar. Bu sayede veritabanı I/O yükü %85 oranında azalır.`,
    author: 'Abdullah Berke Özder',
    views: 2150,
    likes: 245,
    isPublished: true,
    publishedAt: '2026-11-03T11:20:00Z',
    createdDate: '2026-11-03T10:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['redis', 'write-behind', 'onbellek-tamponu', 'yuksek-olcek', 'performans'],
    aiSummary: 'Redis RAM önbelleği ile disk yazma yükü %85 azaltıldı. Atomik sayaç tamponu sayesinde binlerce anlık kullanıcıda veritabanı kilitlenmeleri önlenmektedir.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 4,
    publicationType: 'article',
    header: 'Veri Bütünlüğü & JPA',
    title: 'İyimser Kilitleme (Optimistic Locking) ile Veri Kaybını Önleme',
    content: `Çok kullanıcılı sistemlerde iki yazarın veya yöneticinin aynı blog kaydını aynı anda güncellemesi durumunda "Son Yazan Kazanır" problemi ortaya çıkar ve ilk kullanıcının yaptığı değişiklikler sessizce silinir.

## 1. JPA @Version ile Çakışma Denetimi
Entity sınıfına eklenen sürüm alanı sayesinde Hibernate, güncelleme sırasında kaydın başka bir işlem tarafından değiştirilip değiştirilmediğini doğrular.

\`\`\`java
@Entity
public class BlogEntity {
    @Id
    @GeneratedValue
    private Long id;

    @Version
    private Integer version; // Hibernate sürüm takip alanı
}
\`\`\`

## 2. Çakışma Yönetimi
Eğer iki istek aynı sürüm numarasıyla güncelleme yapmaya çalışırsa, Hibernate \`OptimisticLockException\` fırlatır ve sistem kullanıcıya form içeriğini kaybettirmeden uyarır.`,
    author: 'Abdullah Berke Özder',
    views: 980,
    likes: 88,
    isPublished: true,
    publishedAt: '2026-11-02T16:45:00Z',
    createdDate: '2026-11-02T15:30:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['jpa-hibernate', 'iyimser-kilitleme', 'veri-butunlugu', 'es-zamanlilik', 'guvenlik'],
    aiSummary: 'JPA @Version denetimi ile eşzamanlı çakışmalar engellendi. Veri kaybı riski ortadan kaldırıldı ve lock-free optimistik mimari kuruldu.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 5,
    publicationType: 'article',
    header: 'Spring Batch & Büyük Veri',
    title: 'Büyük Ölçekli Veri İşleme ve Otomatik Arşiv Temizliği',
    content: `Sistemde biriken silinmiş kayıtlar ve yazar analitik verileri, klasik web sunucusu istekleri içinde işlenemeyecek kadar büyük hacimlere ulaşabilir.

## 1. Chunk Tabanlı Toplu İş Mimarisi
Spring Batch ile veriler 50'şerli paketler halinde okunur, doğrulanır ve transaction sınırları içinde güvenle işlenir.

\`\`\`java
@Bean
public Step softDeleteCleanupStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
    return new StepBuilder("cleanupStep", jobRepository)
        .<BlogEntity, BlogEntity>chunk(50, txManager)
        .reader(softDeletedBlogItemReader())
        .processor(expiredBlogItemProcessor())
        .writer(permanentDeleteBlogItemWriter())
        .faultTolerant()
        .retryLimit(3)
        .build();
}
\`\`\`

## 2. Hataya Dayanıklılık ve Yeniden Deneme
- Geçici bağlantı aksamalarında otomatik tekrar deneme (Retry) politikası.
- Hatalı kayıtların loglanarak sağlam verilerin kesintisiz işlenmesi.
- İş akışının durumunun veritabanında adım adım saklanması.`,
    author: 'Abdullah Berke Özder',
    views: 1190,
    likes: 95,
    isPublished: true,
    publishedAt: '2026-11-01T14:00:00Z',
    createdDate: '2026-11-01T13:30:00Z',
    category: MOCK_CATEGORIES[4],
    tags: ['spring-batch', 'buyuk-veri', 'etl-mimarisi', 'postgresql', 'otomasyon'],
    aiSummary: 'Chunk tabanlı Spring Batch mimarisi ile milyonlarca satırlık veri RAM şişmesi olmadan işlenir. Otomatik hata yakalama ve tekrar deneme mekanizmaları devrededir.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 6,
    publicationType: 'article',
    header: 'Siber Güvenlik & 2FA',
    title: 'RFC 6238 TOTP ile Güvenli İki Adımlı Kimlik Doğrulama',
    content: `Şifre sızıntılarına karşı kurumsal hesaplarda zaman tabanlı iki adımlı kimlik doğrulama (2FA) vazgeçilmez bir güvenlik standardıdır.

## 1. RFC 6238 Zaman Tabanlı Tek Kullanımlık Şifre (TOTP)
TOTP mekanizması gizli bir anahtar ile 30 saniyelik zaman pencerelerini kriptografik olarak harmanlayarak 6 haneli doğrulama kodları üretir.

\`\`\`java
public boolean verifyTotpCode(String base32Secret, int userCode) {
    long currentWindow = System.currentTimeMillis() / 1000L / 30L;
    // Saat sapmalarını tolere etmek için [-1, 0, +1] pencereleri kontrol edilir
    for (int i = -1; i <= 1; i++) {
        if (generateTotp(base32Secret, currentWindow + i) == userCode) {
            return true;
        }
    }
    return false;
}
\`\`\`

## 2. Tek Kullanımlık Acil Kurtarma Kodları
Cihaz kaybı durumunda hesabın kilitlenmesini önlemek için:
- 8 haneli tek kullanımlık 5 adet acil kurtarma kodu oluşturulur.
- Kodlar veritabanında güvenli hash algoritmalarıyla korunur.
- Kullanılan kod güvenlik nedeniyle otomatik olarak geçersiz kılınır.`,
    author: 'Abdullah Berke Özder',
    views: 1750,
    likes: 144,
    isPublished: true,
    publishedAt: '2026-10-31T09:15:00Z',
    createdDate: '2026-10-31T08:45:00Z',
    category: MOCK_CATEGORIES[5],
    tags: ['siber-guvenlik', 'totp-2fa', 'zero-trust', 'kriptografi', 'hesap-guvenligi'],
    aiSummary: 'RFC 6238 standardına uygun zaman tabanlı iki adımlı doğrulama (TOTP). Authenticator uygulamalarıyla uyumlu çalışan ve acil kurtarma kodlarıyla korunan sıfır güven mimarisi.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // --- 2. GÜNCEL HABERLER & DİSPAÇLAR (20 Curated Dispatches via Top Tech Media) ---

  // === KATEGORİ 1: TEKNOLOJİ & ALTYAPI (5 HABER) ===
  {
    id: 1001,
    publicationType: 'dispatch',
    header: 'BULUT ALTYAPISI & VERİ GEÇİŞİ',
    title: 'AWS ve Cloudflare Arasında Sıfır Egress Ücretli Veri Köprüsü Standardı',
    content: `Çoklu bulut (multi-cloud) mimarisi kuran kurumların en büyük maliyet kalemi olan dışa aktarım (egress) ücretlerinde tarihi bir uzlaşma sağlandı. Cloudflare ve AWS ortak fiber altyapı protokolü duyuruldu.

Bu entegrasyon sayesinde AWS S3 üzerinde barındırılan büyük veri kümeleri, Cloudflare Workers ve R2 depolama katmanına herhangi bir bant genişliği cezası ödemeden doğrudan özel omurga (private backbone) üzerinden taşınabilecek.

### Mimari Kazanımlar:
- Veri kilitlenmesi (vendor lock-in) riski tamamen ortadan kalktı.
- Dağıtık analitik motorları işlem gücünü AWS üzerinde, statik medya önbelleğini ise dünya genelindeki Cloudflare edge düğümlerinde konumlandırabiliyor.
- P99 medya dağıtım gecikmesinde %40 azalma ölçüldü.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Cloud Infrastructure Bureau',
    views: 3120,
    likes: 420,
    clapsCount: 420,
    isPublished: true,
    publishedAt: '2026-11-19T08:30:00Z',
    createdDate: '2026-11-19T08:00:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'The Cloudflare Blog',
    viaUrl: 'https://blog.cloudflare.com',
    editorialTake: 'Dağıtık mimarilerde buluta kilitlenme riskini kırarak, analitik iş yüklerini AWS üzerinde, statik medya ve edge önbelleği Cloudflare üzerinde çalıştırma esnekliği sağlıyor.',
    isBreaking: true,
    readTimeMinutes: 3,
    tags: ['cloud', 'aws', 'cloudflare', 'egress', 'edge-computing'],
    aiSummary: 'AWS ve Cloudflare arasındaki sıfır egress ücret anlaşmasıyla çoklu bulut veri transferi bariyeri kalktı. Edge önbellek ve merkezi depolama hibritleşti.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1002,
    publicationType: 'dispatch',
    header: 'ÇEKİRDEK MİMARİSİ & GERÇEK ZAMAN',
    title: 'Linux Kernel 6.12 Gerçek Zamanlı (PREEMPT_RT) Desteğiyle Resmen Yayınlandı',
    content: `Yıllardır harici bir çekirdek yaması olarak geliştirilen ve yüksek frekanslı finansal sistemler ile telekomünikasyon omurgasında kullanılan Real-Time Linux (PREEMPT_RT), 6.12 çekirdeği ile birlikte ana gövdeye (mainline) kabul edildi.

Yeni çekirdek ile birlikte tüm standart Linux dağıtımları, derleme anında deterministik kesme (interrupt) işleme ve mikro-saniye hassasiyetinde iş parçacığı zamanlama yeteneğine kavuşuyor.

### Öne Çıkan Gelişmeler:
- Çekirdek içi kilitlenme gecikmeleri (lock latency) 5 mikro-saniyenin altına indi.
- Finansal emir defteri işleme motorlarında çöp toplama ve context switch dalgalanmaları sıfırlandı.
- Standart LTS sunucu donanımlarında ekstra bir RTOS katmanına gerek kalmadı.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Systems & OS Reporter',
    views: 2450,
    likes: 310,
    clapsCount: 310,
    isPublished: true,
    publishedAt: '2026-11-18T14:10:00Z',
    createdDate: '2026-11-18T13:40:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'Phoronix & Kernel.org',
    viaUrl: 'https://www.phoronix.com',
    editorialTake: 'Finansal işlem motorları, telekom gateway\'leri ve endüstriyel IoT sistemlerinde mikro-saniye seviyesinde deterministik gecikme garantisi sunuyor.',
    isBreaking: false,
    readTimeMinutes: 4,
    tags: ['linux', 'kernel-6-12', 'preempt-rt', 'low-latency', 'systems'],
    aiSummary: 'Linux 6.12 ile PREEMPT_RT yamaları ana çekirdeğe dahil edildi. İşletim sistemi seviyesinde deterministik gecikme ve gerçek zamanlı işlem garantisi standartlaştı.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1003,
    publicationType: 'dispatch',
    header: 'GÖZLEMLENEBİLİRLİK & eBPF',
    title: 'OpenTelemetry ve eBPF Standartlaşması: Sıfır Enstrümantasyon ile Dağıtık İzleme',
    content: `Cloud Native Computing Foundation (CNCF), OpenTelemetry çatısı altında eBPF (Extended Berkeley Packet Filter) profilleme ve dağıtık izleme standartlarını onayladı.

Geliştiricilerin servis kodlarına manuel SDK, byte-code manipülasyonu veya harici agent yerleştirmesine gerek kalmadan, Linux çekirdek seviyesinde tüm TCP soketleri, HTTP çağrıları ve veritabanı sorguları otomatik olarak izlenebiliyor.

### Sistem Mimarisine Etkileri:
- CPU ve bellek üzerindeki telemetri ek yükü (overhead) %12\'den %0.4 seviyesine geriledi.
- Mikroservisler arası P99 gecikme anomalileri uygulama koduna dokunmadan anında haritalanabiliyor.
- Dağıtık izleme konfigürasyon hataları tamamen elendi.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Observability Architect',
    views: 1890,
    likes: 275,
    clapsCount: 275,
    isPublished: true,
    publishedAt: '2026-11-17T11:45:00Z',
    createdDate: '2026-11-17T11:15:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'The New Stack',
    viaUrl: 'https://thenewstack.io',
    editorialTake: 'Uygulama koduna tek bir satır SDK veya agent eklemeden, tüm HTTP, gRPC ve veritabanı sorgularının P99 gecikmelerini sıfır CPU ek yüküyle haritalandırabiliyoruz.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['opentelemetry', 'ebpf', 'observability', 'distributed-systems', 'cncf'],
    aiSummary: 'CNCF destekli eBPF ve OpenTelemetry entegrasyonu ile mikroservis izleme süreçleri çekirdek katmanına indi; kod enstrümantasyonu gereksinimi bitti.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1004,
    publicationType: 'dispatch',
    header: 'DONANIM & BAĞIMSIZ BULUT',
    title: 'Hetzner ve Avrupa Bağımsız Bulutlarında NVMe-over-Fabrics ve ARM Neoverse Yayılımı',
    content: `Avrupa veri egemenliği yasaları ve enerji verimliliği arayışları doğrultusunda, bağımsız veri merkezlerinde ARM Neoverse v2 işlemciler ile NVMe-over-Fabrics (NVMe-oF) ağ depolama mimarisi hızla yayılıyor.

Hetzner ve OVHcloud\'un yeni sunucu serilerinde x86 mimarisine kıyasla %45 daha yüksek watt-başına-performans elde edilirken, doğrudan RoCEv2 (RDMA over Converged Ethernet) ile disk erişim gecikmesi 8 mikro-saniyeye indirildi.

### Veri Tabanı Mimarisine Yansıması:
- PostgreSQL ve Redis kümelemelerinde disk I/O darboğazı ortadan kalktı.
- Veri merkezi elektrik tüketimi ve soğutma giderleri üçte birine düştü.
- Kurumsal bulut barındırma bütçelerinde %60 tasarruf sağlandı.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Infrastructure Analyst',
    views: 1650,
    likes: 210,
    clapsCount: 210,
    isPublished: true,
    publishedAt: '2026-11-16T16:20:00Z',
    createdDate: '2026-11-16T15:50:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'Ars Technica',
    viaUrl: 'https://arstechnica.com',
    editorialTake: 'Büyük ölçekli PostgreSQL kümelemelerinde disk I/O darboğazı ortadan kalkarken watt başına işlem gücü %45 artıyor, barındırma maliyetleri üçte bire iniyor.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['arm-neoverse', 'hetzner', 'nvme-of', 'hardware', 'sovereign-cloud'],
    aiSummary: 'Avrupa veri merkezlerinde ARM Neoverse v2 ve RDMA tabanlı NVMe-oF mimarisi enerji verimliliğini artırırken I/O gecikmelerini mikro-saniyelere çekti.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1005,
    publicationType: 'dispatch',
    header: 'AĞ PROTOKOLLERİ & QUIC',
    title: 'HTTP/3 ve QUIC Protokolü Küresel İnternet Trafiğinin %35\'ini Aştı',
    content: `Cloudflare Radar verilerine göre, UDP tabanlı HTTP/3 ve QUIC protokolü küresel web trafiğinin üçte birinden fazlasını taşır hale geldi. Mobil ve yüksek paket kayıplı ağlarda TCP\'nin yerini hızla alıyor.

Eski HTTP/2 mimarisindeki Head-of-line blocking (paket sırası kilitlenmesi) problemini tamamen çözen QUIC, tek bir bağlantı içinde bağımsız akışlar (streams) oluşturarak veri iletimini sürdürüyor.

### Başlıca Kıyaslamalar:
- Mobil bağlantı değişimlerinde (Wi-Fi\'dan 5G\'ye geçiş) bağlantı kopması sıfıra indi (Connection Migration).
- 0-RTT handshake ile ilk sayfa yükleme gecikmesi 120 ms kısalttı.
- Dağıtık API gateway\'lerimizde jitter ve gecikme sapmaları minimize edildi.`,
    author: 'Nova Tech Wire',
    authorTitle: 'Network Protocol Specialist',
    views: 2100,
    likes: 290,
    clapsCount: 290,
    isPublished: true,
    publishedAt: '2026-11-15T09:00:00Z',
    createdDate: '2026-11-15T08:30:00Z',
    category: MOCK_CATEGORIES[2],
    viaSource: 'Cloudflare Radar',
    viaUrl: 'https://radar.cloudflare.com',
    editorialTake: 'Head-of-line blocking sorununu tamamen çözen HTTP/3, dağıtık API gateway\'lerimizde gecikme dalgalanmalarını minimize ederek mobil tepki hızını katlıyor.',
    isBreaking: false,
    readTimeMinutes: 2,
    tags: ['http3', 'quic', 'networking', 'latency', 'web-protocols'],
    aiSummary: 'HTTP/3 küresel trafiğin üçte birine ulaştı. 0-RTT el sıkışması ve bağımsız stream yapısıyla mobil gecikmelerde %60 iyileşme kaydedildi.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // === KATEGORİ 2: AI GELİŞİMİ & AJANLAR (5 HABER) ===
  {
    id: 1006,
    publicationType: 'dispatch',
    header: 'AJAN STANDARTLARI & MCP',
    title: 'Anthropic Model Context Protocol (MCP) Açık Kaynak Standartlaşması',
    content: `Anthropic, yapay zeka ajanları ile veri kaynakları (veritabanları, IDE\'ler, dosya sistemleri, GitHub) arasındaki iki yönlü iletişimi standardize eden açık kaynak Model Context Protocol (MCP) mimarisini duyurdu.

Geliştiricilerin her LLM veya arayüz için özel REST bağlayıcıları yazması yerine, standartlaştırılmış JSON-RPC 2.0 tabanlı bir protokol üzerinden araçlar (tools), bağlam kaynakları (resources) ve prompt şablonları sunulabiliyor.

### Mimarimizin Entegrasyonu:
- NovaBlog\'un PostgreSQL ve Redis verileri tek bir yerel MCP sunucusuyla Claude, ChatGPT ve lokal Llama ajanlarına bağlandı.
- Ajanların veri şemalarını dinamik olarak keşfetmesi sağlandı.
- Kod analizi ve otomatik makale özetleme süreçlerinde bağlam kirliliği %80 azaldı.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 4520,
    likes: 680,
    clapsCount: 680,
    isPublished: true,
    publishedAt: '2026-11-20T10:15:00Z',
    createdDate: '2026-11-20T09:45:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'Anthropic Engineering',
    viaUrl: 'https://www.anthropic.com/news/model-context-protocol',
    editorialTake: 'Özel API adaptörleri yazmak yerine tek bir MCP sunucusu ile PostgreSQL, Redis, GitHub ve dosya sistemlerini ajanlara doğrudan güvenli araç olarak sunabiliyoruz.',
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['mcp', 'anthropic', 'agentic-ai', 'developer-tools', 'llm-standards'],
    aiSummary: 'Model Context Protocol (MCP) yapay zeka ajanlarının kurumsal veri tabanları ve geliştirici araçlarıyla tip güvenli iletişim kurmasını sağlayan açık endüstri standardı oldu.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1007,
    publicationType: 'dispatch',
    header: 'ENTERPRISE AI & SPRING',
    title: 'Spring AI 1.0 Milestone: Structured Outputs ve Çoklu Ajan Danışmanları',
    content: `Spring ekibi, kurumsal Java geliştiricilerinin üretken yapay zeka modelleriyle güvenilir çalışmasını sağlayan Spring AI 1.0 Milestone sürümünü yayınladı.

Yeni sürümle birlikte, LLM\'lerden serbest metin almak yerine doğrudan Java Bean ve DTO nesnelerine dönüşen Structured Outputs garantisi getirildi. Ayrıca birden fazla ajanın birbirini denetlediği Advisor API duyuruldu.

### Çözülen Kurumsal Sorunlar:
- JSON dönüşüm hataları ve regex ayıklama zahmeti sıfırlandı.
- Spring Boot konfigürasyonlarıyla OpenAI, Anthropic, Ollama ve Azure modelleri arasında tek satır kod değiştirmeden geçiş yapılabiliyor.
- Vektör arama sonuçları otomatik olarak RAG pipeline\'ına enjekte ediliyor.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 3100,
    likes: 415,
    clapsCount: 415,
    isPublished: true,
    publishedAt: '2026-11-19T13:00:00Z',
    createdDate: '2026-11-19T12:30:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'Spring.io Blog',
    viaUrl: 'https://spring.io/blog',
    editorialTake: 'Java nesnelerini doğrudan LLM yanıtlarına bağlayarak tip güvenli yapay zeka servisleri üretmeyi ve prompt sızıntılarını önlemeyi mümkün kılıyor.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['spring-ai', 'java', 'structured-outputs', 'rag', 'enterprise-ai'],
    aiSummary: 'Spring AI 1.0 Milestone ile tip güvenli Structured Outputs ve RAG danışman zincirleri Java ekosistemine kurumsal kararlılık getirdi.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1008,
    publicationType: 'dispatch',
    header: 'VEKTÖR VERİTABANI & SIMD',
    title: 'PostgreSQL pgvector 0.8: AVX-512 SIMD ile 10 Kat Daha Hızlı HNSW İndeksleme',
    content: `PostgreSQL topluluğunun popüler vektör arama eklentisi pgvector 0.8 sürümü, modern Intel ve AMD işlemcilerin AVX-512 ve ARM SVE vektör hızlandırma yeteneklerini tam destekle devreye aldı.

Kosinüs mesafesi, L2 ve iç çarpım benzerlik hesaplamaları doğrudan işlemci vektör yazmaçlarında tek döngüde paralel hesaplanıyor. Bu sayede 128 boyutlu gömme vektörlerinde sorgu throughput\'u 10 kat arttı.

### Mimari Karşılaştırma:
- Ayrı bir vektör veritabanı (Pinecone, Weaviate) kümesi çalıştırma maliyeti sıfırlandı.
- ACID garantisi ve ilişkisel SQL JOIN işlemleri vektör aramalarıyla aynı transaction içinde korunuyor.
- 100 milyon vektör üzerinde P99 yanıt süresi 4 milisaniyenin altında tutuluyor.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 2950,
    likes: 380,
    clapsCount: 380,
    isPublished: true,
    publishedAt: '2026-11-18T10:30:00Z',
    createdDate: '2026-11-18T10:00:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'PostgreSQL News',
    viaUrl: 'https://www.postgresql.org',
    editorialTake: 'Ayrı bir Pinecone veya Milvus kümesi yönetme zorunluluğunu ortadan kaldırarak ACID garantili tek bir PostgreSQL üzerinde 100 milyon vektöre kadar anlık anlamsal arama imkanı veriyor.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['pgvector', 'hnsw', 'postgresql', 'vector-search', 'simd'],
    aiSummary: 'pgvector 0.8 AVX-512 SIMD desteğiyle vektör mesafe hesaplamalarını 10 kat hızlandırdı; harici vektör veritabanı gereksinimini ortadan kaldırdı.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1009,
    publicationType: 'dispatch',
    header: 'AÇIK MODEL MİMARİSİ & LLAMA',
    title: 'Meta Llama 3.3 70B: Açık Kaynakta GPT-4 Seviyesi Mantıksal Çıkarım',
    content: `Meta AI, en yeni açık kaynak modeli Llama 3.3 70B\'yi genel kullanıma sundu. Model, daha önce 405 milyar parametreli modellerin ulaştığı mantıksal akıl yürütme ve kod üretim kıyaslamalarını 70B ağırlıklarına sıkıştırmayı başarıyor.

Yeni mimari, geliştirilmiş Grouped-Query Attention (GQA) ve 128K token bağlam penceresi ile tek bir 80GB VRAM GPU sunucusunda (NVIDIA H100 veya A100) tam kapasite çalışabiliyor.

### Kurumsal Veri Güvenliği:
- Kullanıcı teknik verileri ve özel kod tabanları üçüncü parti bulutlara gönderilmeden lokalde işlenebiliyor.
- Çıkarım (inference) maliyetleri tescilli modellere kıyasla %85 ucuzladı.
- Türkçe teknik dokümantasyon anlama ve özetleme doğruluğu belirgin şekilde arttı.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 3800,
    likes: 540,
    clapsCount: 540,
    isPublished: true,
    publishedAt: '2026-11-17T15:45:00Z',
    createdDate: '2026-11-17T15:15:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'Hugging Face & Meta AI',
    viaUrl: 'https://huggingface.co/blog',
    editorialTake: 'Kendi veri merkezlerimizde veri gizliliğinden ödün vermeden kurumsal RAG ve kod asistanı modelleri çalıştırmanın GPU maliyetini tek karta sığdırarak %70 düşürdü.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['llama-3-3', 'meta-ai', 'open-weights', 'inference', 'huggingface'],
    aiSummary: 'Llama 3.3 70B, GPT-4 seviyesindeki mantıksal çıkarımı tek bir 80GB GPU sunucusuna sığdırarak kurum içi açık yapay zeka dağıtımını erişilebilir kıldı.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1010,
    publicationType: 'dispatch',
    header: 'AJAN ÇERÇEVELERİ ANALİZİ',
    title: 'LangChain vs Semantic Kernel vs Spring AI: 2026 Kurumsal Ajan Karşılaştırması',
    content: `InfoQ tarafından yayınlanan kapsamlı mimari raporda, kurumsal yapay zeka ajan projelerinde en çok tercih edilen üç çerçeve yüksek eşzamanlılık, bellek sızıntısı ve hata toleransı testlerine tabi tutuldu.

Sonuçlara göre Python tabanlı çözümler hızlı prototiplemede liderliğini korurken, uzun soluklu kurumsal mikroservislerde Java tabanlı Spring AI ve C# tabanlı Semantic Kernel\'in deterministik thread yönetimi sayesinde açık ara öne geçtiği tespit edildi.

### Temel Kıyaslama Metrikleri:
- 10.000 eşzamanlı ajan oturumunda Spring AI (Virtual Threads ile) 480 MB RAM tüketti; LangChain Python process\'leri 4.2 GB bellek harcadı.
- Hata durumunda kurtarma (circuit breaking) kurumsal Java ekosisteminde %99.8 başarıya ulaştı.
- Kurumsal entegrasyonda tip güvenliği (type-safety) en kritik başarı faktörü olarak vurgulandı.`,
    author: 'Dr. Selin Demir',
    authorTitle: 'Principal AI Researcher',
    views: 2600,
    likes: 340,
    clapsCount: 340,
    isPublished: true,
    publishedAt: '2026-11-16T12:00:00Z',
    createdDate: '2026-11-16T11:30:00Z',
    category: MOCK_CATEGORIES[0],
    viaSource: 'InfoQ Architecture',
    viaUrl: 'https://www.infoq.com',
    editorialTake: 'Bellek sızıntısı ve thread güvenliği açısından Spring AI + Virtual Threads ikilisinin yüksek hacimli kurumsal yüklerde en kararlı verimi sunduğu bağımsız olarak belgelendi.',
    isBreaking: false,
    readTimeMinutes: 4,
    tags: ['agentic-ai', 'infoq', 'spring-ai', 'semantic-kernel', 'benchmarks'],
    aiSummary: 'InfoQ testlerine göre yüksek eşzamanlı kurumsal yapay zeka ajanlarında Spring AI ve sanal iş parçacıkları bellek tasarrufu ve kararlılıkta lider oldu.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // === KATEGORİ 3: REACT & MODERN FRONTEND (5 HABER) ===
  {
    id: 1011,
    publicationType: 'dispatch',
    header: 'FRONTEND ÇEKİRDEĞİ & REACT 19',
    title: 'React 19 Kararlı Sürüm: useActionState, useOptimistic ve Otomatik Memoization',
    content: `Meta React çekirdek ekibi, React 19\'un genel kullanıma hazır kararlı sürümünü duyurdu. Yıllardır geliştiricilerin zihinsel yükünü artıran useMemo ve useCallback hook\'ları, React Compiler motorunun otomatik memoization yapmasıyla birlikte artık gereksiz hale geldi.

Form durumları ve asenkron sunucu mutasyonları için sunulan useActionState ve anlık kullanıcı etkileşimlerinde sıfır gecikme hissi yaratan useOptimistic hook\'ları kütüphanenin merkezine oturdu.

### NovaBlog Arayüzündeki Etkisi:
- Alkış (claps), yer imi (bookmark) ve beğeni butonlarında useOptimistic ile sunucu cevabı beklenmeden 0 ms tepki veriliyor.
- Gereksiz DOM yeniden render döngüleri %65 oranında azaltıldı.
- Kod tabanımızdaki karmaşık hook bağımlılık dizileri (deps array) tamamen temizlendi.`,
    author: 'Caner Aydın',
    authorTitle: 'Staff Frontend Architect',
    views: 5200,
    likes: 790,
    clapsCount: 790,
    isPublished: true,
    publishedAt: '2026-11-19T11:00:00Z',
    createdDate: '2026-11-19T10:30:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'React Dev Blog',
    viaUrl: 'https://react.dev/blog',
    editorialTake: 'NovaBlog\'un beğeni, alkış ve yer imi gibi anlık taktil kullanıcı etkileşimlerinde useOptimistic ile sıfır gecikmeli UI tepkileri standartlaştı; useMemo yazımı tamamen tarihe karıştı.',
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['react-19', 'actions', 'useoptimistic', 'react-compiler', 'web-perf'],
    aiSummary: 'React 19 kararlı kanala ulaştı. React Compiler otomatik memoization sağlarken, useOptimistic ve useActionState ile asenkron UI mutasyonları pürüzsüzleşti.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1012,
    publicationType: 'dispatch',
    header: 'DERLEME MİMARİSİ & TURBOPACK',
    title: 'Next.js 15/16 ve Turbopack Varsayılan Oldu: HMR Sürelerinde %76 Hızlanma',
    content: `Vercel, Rust tabanlı paketleme motoru Turbopack\'in tüm testleri başarıyla tamamladığını ve Next.js derleyicisi olarak Webpack\'in yerini resmen aldığını açıkladı.

Özellikle yüzlerce skeuomorphic CSS efekti, dinamik cam filtreleri ve analog göstergeler içeren zengin frontend projelerinde Hot Module Replacement (HMR) süresi 15 milisaniyeye kadar geriledi.

### Performans ve Ergonomi Verileri:
- İlk geliştirme sunucusu başlangıç süresi %53 hızlandı.
- Bellek tüketimi Webpack\'e kıyasla %60 daha düşük seyrediyor.
- TypeScript tip kontrolü ve statik sayfa derlemesi (SSG) paralel iş parçacıklarına dağıtıldı.`,
    author: 'Caner Aydın',
    authorTitle: 'Staff Frontend Architect',
    views: 3400,
    likes: 470,
    clapsCount: 470,
    isPublished: true,
    publishedAt: '2026-11-18T17:15:00Z',
    createdDate: '2026-11-18T16:45:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Vercel News',
    viaUrl: 'https://vercel.com/blog',
    editorialTake: 'Binlerce bileşene sahip devasa skeuomorphic frontend mimarimizde bile kod değişikliğinin tarayıcıya yansıma süresi 15 milisaniyenin altına inerek geliştirici ergonomisini zirveye taşıdı.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['nextjs-15', 'turbopack', 'rust', 'hmr', 'vercel'],
    aiSummary: 'Turbopack Next.js üzerinde varsayılan derleyici haline geldi. Rust tabanlı mimariyle anlık kod yenileme (HMR) süresi 15 ms seviyesine indirildi.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1013,
    publicationType: 'dispatch',
    header: 'STİL MOTORU & TAILWIND V4',
    title: 'Tailwind CSS v4 Oxide Motoru ile CSS-First Mimarisine Geçiş Yaptı',
    content: `Tailwind Labs, Tailwind CSS 4.0 kararlı sürümünü yayınladı. Kütüphane, geçmişteki JavaScript tabanlı yapılandırma dosyasını (tailwind.config.js) tamamen terk ederek doğrudan saf CSS içinde çalışan Rust tabanlı Oxide motoruna geçti.

Yeni mimaride renk paletleri, fontlar ve cam efektleri doğrudan \`@theme\` yönergeleriyle modern CSS değişkenleri (CSS variables) üzerinden tanımlanıyor.

### Tasarım Sistemimizdeki İyileşmeler:
- Mac OS X alüminyum ve retro iOS 6 cam gölgeleri harici eklenti olmadan doğrudan saf CSS token\'larıyla inşa edildi.
- Stil derleme süresi 10 kat hızlanarak 8 ms bandına indi.
- Paket boyutu sıfır JS çalışma zamanı (zero-runtime) ile küçüldü.`,
    author: 'Caner Aydın',
    authorTitle: 'Staff Frontend Architect',
    views: 2800,
    likes: 390,
    clapsCount: 390,
    isPublished: true,
    publishedAt: '2026-11-17T09:30:00Z',
    createdDate: '2026-11-17T09:00:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Tailwind Labs',
    viaUrl: 'https://tailwindcss.com/blog',
    editorialTake: 'Yapı derleme süresi 10 kat hızlanırken dinamik Apple cam ve alüminyum efektlerimizin saf CSS değişkenleriyle (@theme) harmanlanması çok daha temiz ve hafif hale geldi.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['tailwindcss', 'oxide', 'css4', 'frontend-build', 'ui-performance'],
    aiSummary: 'Tailwind CSS v4 Oxide motoruyla JavaScript bağımlılığını sonlandırdı; saf CSS @theme sistemiyle derleme hızını 10 kat artırdı.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1014,
    publicationType: 'dispatch',
    header: 'WEB STANDARTLARI & BASELINE 2026',
    title: 'Web Platformunda Baseline 2026: CSS Subgrid, Popover API ve View Transitions',
    content: `W3C, Google, Apple ve Mozilla ortaklığındaki WebDX konsorsiyumu, Baseline 2026 standartlarını açıkladı. Uzun süredir beklenen Popover API, CSS Subgrid ve yerel View Transitions API artık istisnasız tüm modern masaüstü ve mobil tarayıcılarda destekleniyor.

Bu konsensüs sayesinde geliştiriciler, karmaşık modal pencereleri ve sayfalar arası akıcı animasyonları harici JavaScript kütüphanelerine ihtiyaç duymadan tarayıcının yerel donanım hızlandırmasıyla gerçekleştirebiliyor.

### Mimari Kazanımlar:
- Sayfa geçiş animasyonları 60 FPS akıcılıkta GPU üzerinde çalışıyor.
- Erişilebilirlik (WCAG / ARIA) ve klavye odağı (focus-trap) tarayıcı tarafından otomatik yönetiliyor.
- Harici modal ve animasyon kütüphanelerinden arınan bundle boyutu 85 KB hafifledi.`,
    author: 'Caner Aydın',
    authorTitle: 'Staff Frontend Architect',
    views: 2150,
    likes: 310,
    clapsCount: 310,
    isPublished: true,
    publishedAt: '2026-11-16T14:40:00Z',
    createdDate: '2026-11-16T14:10:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Web.dev & Google Chrome',
    viaUrl: 'https://web.dev',
    editorialTake: 'Modal, menü ve sayfa geçiş animasyonlarında harici JavaScript kütüphanelerine duyulan ihtiyaç kalktı; tarayıcı yerel donanım hızlandırmasından tam güç alabiliyoruz.',
    isBreaking: false,
    readTimeMinutes: 2,
    tags: ['baseline-2026', 'view-transitions', 'popover-api', 'css-subgrid', 'standards'],
    aiSummary: 'Baseline 2026 ile Popover API ve View Transitions tüm tarayıcılarda evrensel hale geldi; harici animasyon JS kütüphaneleri gereksizleşti.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1015,
    publicationType: 'dispatch',
    header: 'VERİ AKIŞI & TANSTACK',
    title: 'TanStack Query v5 ve Server-Sent Events (SSE) ile Gerçek Zamanlı Akışlar',
    content: `TanStack Query (React Query) ekibi, geleneksel anketleme (polling) ve ağır WebSocket altyapıları yerine HTTP/2 ve HTTP/3 üzerinden Server-Sent Events (SSE) akışlarını önbelleğe alma desenlerini paylaştı.

Tek yönlü telemetri akışlarında ve haber güncellemelerinde SSE\'nin son derece az kaynak tükettiği ve TanStack Query\'nin cache invalidation mekanizmalarıyla kusursuz entegre olduğu gösterildi.

### Nova Sistemindeki Uygulama:
- Dağıtık çekirdek telemetri göstergeleri (VU-metreler, osiloskop) sunucuya fazladan yük bindirmeden canlı akıyor.
- Yeni eklenen haber dispaçları anında okuyucu ekranına düşüyor.
- Bağlantı koptuğunda otomatik geri çekilme (exponential backoff) kusursuz işliyor.`,
    author: 'Caner Aydın',
    authorTitle: 'Staff Frontend Architect',
    views: 1980,
    likes: 260,
    clapsCount: 260,
    isPublished: true,
    publishedAt: '2026-11-15T13:10:00Z',
    createdDate: '2026-11-15T12:40:00Z',
    category: MOCK_CATEGORIES[3],
    viaSource: 'Medium Frontend Engineering',
    viaUrl: 'https://medium.com',
    editorialTake: 'Nova Dağıtık Çekirdek telemetri verilerinin ve yeni haber akışlarının WebSocket sunucu yükü bindirmeden HTTP/3 SSE üzerinden ultra hafif bir kanaldan akması sağlandı.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['tanstack-query', 'sse', 'realtime-data', 'react-state', 'medium'],
    aiSummary: 'TanStack Query v5 ve SSE birleşimi, WebSocket karmaşası olmadan tek yönlü telemetri ve canlı haber akışlarını yüksek önbellek verimiyle sunuyor.',
    hasVectorEmbedding: true,
    version: 1,
  },

  // === KATEGORİ 4: BACKEND & DAĞITIK SİSTEMLER (5 HABER) ===
  {
    id: 1016,
    publicationType: 'dispatch',
    header: 'JAVA EVRİMİ & AMBER',
    title: 'Java 23 ve Amber Projesi: Primitive Tiplerde Pattern Matching ve Stream Gatherers',
    content: `Oracle Java Platform Grubu, Java 23\'ü genel kullanıma sundu. Project Amber kapsamında geliştirilen Stream Gatherers özelliği, Java Stream API\'sine son 10 yılda yapılan en büyük fonksiyonel genişletme olarak kayıtlara geçti.

Geliştiriciler artık pencereleme (windowing), katlama (folding) ve eşzamanlı sınırlı dönüştürme (rate-limiting) gibi karmaşık boru hattı algoritmalarını özel ara operatörler ile tek satırda ifade edebiliyor.

### Backend Mimarisine Katkıları:
- Yüksek hacimli batch ETL akışlarında ara koleksiyon oluşturma ihtiyacı kalktı; Garbage Collection baskısı %40 azaldı.
- Primitive tiplerde (int, double, boolean) pattern matching desteği ile switch blokları tip güvenli hale geldi.
- Kod okunabilirliği ve derleyici optimizasyonu en üst düzeye çıktı.`,
    author: 'Abdullah Berke Özder',
    authorTitle: 'Senior Systems Architect',
    views: 4100,
    likes: 580,
    clapsCount: 580,
    isPublished: true,
    publishedAt: '2026-11-20T08:00:00Z',
    createdDate: '2026-11-20T07:30:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'Oracle Java Magazine',
    viaUrl: 'https://blogs.oracle.com/java',
    editorialTake: 'Yüksek hacimli batch ETL işlemlerinde bellek ayırma baskısını minimize eden zarif fonksiyonel yapılar kurarak JVM Garbage Collection duraklamalarını önlüyor.',
    isBreaking: true,
    readTimeMinutes: 4,
    tags: ['java-23', 'stream-gatherers', 'pattern-matching', 'jvm', 'amber'],
    aiSummary: 'Java 23 ile Stream Gatherers ve primitive pattern matching devreye girdi; karmaşık veri boru hatlarında bellek ayrımı ve GC baskısı minimize edildi.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1017,
    publicationType: 'dispatch',
    header: 'NATIVE IMAGE & SPRING BOOT 3.4',
    title: 'Spring Boot 3.4 ve GraalVM Native Image: 80 Milisaniyelik Soğuk Başlangıç',
    content: `Spring Boot 3.4 sürümü, GraalVM Ahead-of-Time (AOT) motoruyla tam uyumlu olarak yayınlandı. Yeni derleyici optimizasyonları sayesinde mikroservis uygulamaları sadece 80 milisaniye içinde ayağa kalkıyor.

Ayrıca bellek ayak izi geleneksel JVM\'in 400 MB seviyelerinden 45 MB\'a inerek, Kubernetes pod ölçeklenmelerinde ve sunucusuz (serverless) ortamlarda anlık trafik patlamalarını karşılamayı mümkün kılıyor.

### Üretim Ortamı Sonuçları:
- Soğuk başlangıç (cold start) gecikmesi mikro-servislerimizde hissedilmez hale geldi.
- Bulut RAM kiralama maliyetlerinde dört kat tasarruf sağlandı.
- Spring Data JPA ve Hibernate 6.6 optimizasyonları ile ilk SQL sorgu süresi sıfırlandı.`,
    author: 'Abdullah Berke Özder',
    authorTitle: 'Senior Systems Architect',
    views: 3350,
    likes: 460,
    clapsCount: 460,
    isPublished: true,
    publishedAt: '2026-11-19T15:20:00Z',
    createdDate: '2026-11-19T14:50:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'Spring.io Release',
    viaUrl: 'https://spring.io/blog',
    editorialTake: 'Serverless ve Kubernetes Pod ölçeklenmelerinde anlık trafik patlamalarına karşı sıfır gecikmeli yanıt verilebiliyor; RAM tüketimi 45 MB\'a inerek bulut faturasını üçe bölüyor.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['spring-boot-3-4', 'graalvm', 'native-image', 'aot', 'microservices'],
    aiSummary: 'Spring Boot 3.4 GraalVM Native Image desteğiyle 80 ms soğuk başlangıç ve 45 MB RAM ayak izine ulaştı; Kubernetes pod ölçeklenmesini hızlandırdı.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1018,
    publicationType: 'dispatch',
    header: 'VERİTABANI PERFORMANSI & POSTGRESQL 17',
    title: 'PostgreSQL 17 Yayınlandı: Gelişmiş Bellek Yönetimi ve Optimize Edilmiş Vacuum',
    content: `Dünyanın en gelişmiş açık kaynak ilişkisel veritabanı PostgreSQL 17 genel kullanıma sunuldu. Yeni sürümün en çarpıcı yönü, veritabanı yöneticilerinin en büyük kabusu olan \`vacuum\` operasyonlarının bellek tüketimini 20 kata kadar azaltması oldu.

Ayrıca yeni eklenen \`JSON_TABLE\` fonksiyonu sayesinde, JSON belgeleri standart ilişkisel tablolar gibi sorgulanıp doğrudan SQL JOIN işlemlerine dahil edilebiliyor.

### NovaBlog Veritabanına Yansıması:
- Sürekli güncellenen sayaçlar ve yorum tablolarında disk şişmesi (table bloat) tamamen bertaraf edildi.
- Yüksek eşzamanlı yazma operasyonlarında kilit bekleme süreleri %35 kısaldı.
- Büyük indeks yeniden yapılandırma (reindex) süreleri yarıya indi.`,
    author: 'Abdullah Berke Özder',
    authorTitle: 'Senior Systems Architect',
    views: 2900,
    likes: 385,
    clapsCount: 385,
    isPublished: true,
    publishedAt: '2026-11-18T12:00:00Z',
    createdDate: '2026-11-18T11:30:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'PostgreSQL Community',
    viaUrl: 'https://www.postgresql.org/about/news',
    editorialTake: 'Blog yazıları ve yorumlar gibi yüksek güncelleme alan tablolarda disk şişmesi sorunu tamamen çözülürken, JSON_TABLE desteğiyle ilişkisel-belge hibrit sorguları 3 kat hızlandı.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['postgresql-17', 'vacuum-optimization', 'json-table', 'sql-tuning', 'database'],
    aiSummary: 'PostgreSQL 17 bellek dostu vacuum motoru ve JSON_TABLE desteğiyle yayınlandı; yüksek yazma alan tablolarda disk şişmesi engellendi.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1019,
    publicationType: 'dispatch',
    header: 'ÖNBELLEK MİMARİSİ & REDIS 7.4',
    title: 'Redis 7.4 ve Topluluk Sürümü: Hash Field Expiration ve Çoklu Vektör İndeksi',
    content: `Redis 7.4 sürümü, geliştiricilerin yıllardır beklediği en önemli özelliklerden biri olan "Hash Alanı Seviyesinde Yaşam Süresi" (Hash Field Expiration) desteğini resmen sundu.

Artık tek bir Redis Hash anahtarı içinde yer alan farklı alanlara bağımsız TTL süreleri atanabiliyor. Bu sayede her bir oturum değişkeni veya sayaç için ayrı anahtarlar oluşturma zorunluluğu ortadan kalktı.

### Dağıtık Tampon Verimliliği:
- Redis anahtar alanı (keyspace) bellek tüketimi %40 oranında azaldı.
- NovaBlog Write-Behind tamponunda sayaç güncelleme atomikliği tek bir Hash üzerinde konsolide edildi.
- İkincil indeksleme ve vektör arama yetenekleri çekirdeğe gömüldü.`,
    author: 'Abdullah Berke Özder',
    authorTitle: 'Senior Systems Architect',
    views: 2450,
    likes: 320,
    clapsCount: 320,
    isPublished: true,
    publishedAt: '2026-11-17T14:15:00Z',
    createdDate: '2026-11-17T13:45:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'Redis Ltd & Hacker News',
    viaUrl: 'https://news.ycombinator.com',
    editorialTake: 'Kullanıcı oturumları ve anlık sayaç tamponlarında gereksiz anahtar çoğalmasını önleyerek Redis RAM verimliliğini %40 artırıyor, write-behind gecikmelerini sıfırlıyor.',
    isBreaking: false,
    readTimeMinutes: 3,
    tags: ['redis-7-4', 'hash-field-expiration', 'in-memory', 'caching', 'hacker-news'],
    aiSummary: 'Redis 7.4 Hash Field Expiration ile bağımsız hash alanlarına TTL atama imkanı verdi; anahtar çoğalmasını önleyerek bellek kullanımını %40 düşürdü.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 1020,
    publicationType: 'dispatch',
    header: 'DAĞITIK TUTARLILIK & OUTBOX',
    title: 'Dağıtık Transaction Çıkmazı: 2PC Yerine Outbox Deseni ve Debezium CDC Kullanımı',
    content: `InfoQ Dağıtık Mimari Zirvesi\'nde sunulan vaka analizinde, mikroservisler arasında veri tutarlılığı sağlamak için kullanılan iki fazlı kilitleme (Two-Phase Commit / XA) mekanizmalarının modern yüksek hacimli sistemlerde veritabanını felç ettiği belgelendi.

Uzmanlar, PostgreSQL üzerinde Transactional Outbox deseni ve Debezium CDC (Change Data Capture) motorunun kullanılmasını önerdi. Bu yaklaşımda veri tabanına yazılan işlem ile dış dünyaya gönderilecek olay (event) aynı yerel ACID transaction içinde tutuluyor.

### Çarpıcı Kıyaslama:
- Two-Phase Commit kullanan mimarilerde P99 gecikme 650 ms olurken, Outbox + Debezium yaklaşımında gecikme 18 ms\'ye indi.
- Throughput 4 katına çıktı ve ağ bölünmelerinde (network partition) kilitlenme riski sıfırlandı.
- Nova mimarisinde PostgreSQL ile Redis tamponu arasındaki tutarlılık bu desene emanet edildi.`,
    author: 'Abdullah Berke Özder',
    authorTitle: 'Senior Systems Architect',
    views: 3600,
    likes: 495,
    clapsCount: 495,
    isPublished: true,
    publishedAt: '2026-11-16T10:45:00Z',
    createdDate: '2026-11-16T10:15:00Z',
    category: MOCK_CATEGORIES[1],
    viaSource: 'InfoQ Software Architecture',
    viaUrl: 'https://www.infoq.com',
    editorialTake: 'Nova mimarisinde PostgreSQL ile Redis tamponu arasındaki veri tutarlılığını kilitsiz ve sıfır veri kaybıyla korumanın altın kurumsal standardı belgelendi.',
    isBreaking: false,
    readTimeMinutes: 4,
    tags: ['transactional-outbox', 'debezium', 'event-driven', 'cdc', 'infoq'],
    aiSummary: 'Mikroservislerde Two-Phase Commit yerine Transactional Outbox ve Debezium CDC kullanımı P99 gecikmeyi 650 ms\'den 18 ms\'ye indirdi.',
    hasVectorEmbedding: true,
    version: 1,
  },
];

export const MOCK_COMMENTS: Record<number, CommentResponseDto[]> = {
  1: [
    {
      id: 101,
      blogId: 1,
      content: 'Vektör arama ve kosinüs benzerliği yaklaşımı gerçekten harika uygulanmış! Hibrit RRF sıralaması harika sonuçlar veriyor.',
      authorName: 'Caner Aydın (Senior AI Engineer)',
      createdAt: '2026-11-05T12:30:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
    {
      id: 102,
      blogId: 1,
      content: 'Spring AI ile pgvector entegrasyonu modern enterprise mimariler için tam bir cankurtaran.',
      authorName: 'Elif Yılmaz (Tech Lead)',
      createdAt: '2026-11-05T14:10:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  2: [
    {
      id: 201,
      blogId: 2,
      content: 'Virtual Threads ile Spring Boot 4 performansı inanılmaz seviyeye çıkmış, Loom carrier thread unpinning detayları çok öğretici.',
      authorName: 'Mehmet Kaya (DevOps Lead)',
      createdAt: '2026-11-04T16:00:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  1006: [
    {
      id: 601,
      blogId: 1006,
      content: 'Model Context Protocol (MCP) gerçekten tüm endüstriyi tek bir açık protokolde birleştirebilecek güçte. Claude Desktop ile test ettik, olağanüstü çalışıyor.',
      authorName: 'Arda Güler (DevOps Lead)',
      createdAt: '2026-11-20T11:00:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
  1011: [
    {
      id: 701,
      blogId: 1011,
      content: 'React 19 useOptimistic gerçekten skeuomorphic butonlarda aradığımız o anlık fiziksel geri bildirim hissini kod karmaşası olmadan verdi.',
      authorName: 'Zeynep Ak (Frontend Specialist)',
      createdAt: '2026-11-19T12:45:00Z',
      isApproved: true,
      sentiment: 'POSITIVE',
    },
  ],
};

export const MOCK_SEMANTIC_RESULTS: BlogSemanticSearchResultDto[] = [
  {
    blog: MOCK_BLOGS[0],
    similarityScore: 0.942,
    matchedKeywords: ['spring-ai', 'vektor-arama', 'anlamsal-arama', 'yapay-zeka'],
    searchMode: 'SEMANTIC',
    explanation: 'Sorgudaki yapay zeka ve anlamsal arama konsepti ile içerik arasında %94.2 anlamsal örtüşme yakalandı.',
  },
  {
    blog: MOCK_BLOGS[1],
    similarityScore: 0.815,
    matchedKeywords: ['spring-boot-4', 'concurrency', 'threads'],
    searchMode: 'HYBRID',
    explanation: 'Modern backend mimarisi ve yüksek ölçeklenebilirlik bağlamında hibrit sıralamada üst sırada yer aldı.',
  },
  {
    blog: MOCK_BLOGS[2],
    similarityScore: 0.768,
    matchedKeywords: ['redis', 'write-behind', 'performance'],
    searchMode: 'SEMANTIC',
    explanation: 'Önbellekleme ve dağıtık sayaç yönetimi kavramları ile anlamsal yakınlık tespit edildi.',
  },
  {
    blog: MOCK_BLOGS[6], // 1001 (AWS & Cloudflare Egress)
    similarityScore: 0.890,
    matchedKeywords: ['cloud', 'egress', 'cloudflare', 'aws'],
    searchMode: 'SEMANTIC',
    explanation: 'Bulut depolama maliyetleri ve dağıtık veri transferi konularında yüksek alaka saptandı.',
  },
  {
    blog: MOCK_BLOGS[11], // 1006 (Anthropic MCP)
    similarityScore: 0.965,
    matchedKeywords: ['mcp', 'anthropic', 'agentic-ai'],
    searchMode: 'SEMANTIC',
    explanation: 'Model Context Protocol ve yapay zeka araç kullanımı bağlamında kusursuz eşleşme.',
  },
];
