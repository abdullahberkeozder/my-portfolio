// NovaBlog Enterprise - High Quality Mock Data for Vitrin / Offline Demo

import { BlogDto, BlogCategoryDto, CommentResponseDto, BlogSemanticSearchResultDto } from '@/types/api';

export const MOCK_CATEGORIES: BlogCategoryDto[] = [
  { categoryId: 1, categoryName: 'Yapay Zeka & AI', categoryDescription: 'Spring AI, LLM Entegrasyonları ve Vektör Veritabanları' },
  { categoryId: 2, categoryName: 'Backend & Spring', categoryDescription: 'Spring Boot 4, Java 22, Virtual Threads ve Mikroservis Mimarisi' },
  { categoryId: 3, categoryName: 'Cloud & DevOps', categoryDescription: 'Docker, MinIO S3, Redis Cluster ve CI/CD Pipeline' },
  { categoryId: 4, categoryName: 'Veri & Batch ETL', categoryDescription: 'Spring Batch, PostgreSQL ve Yüksek Hacimli Veri İşleme' },
  { categoryId: 5, categoryName: 'Siber Güvenlik', categoryDescription: 'OAuth2, JWT, TOTP 2FA ve OWASP Savunmaları' },
];

export const MOCK_BLOGS: BlogDto[] = [
  {
    id: 1,
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
    header: 'Redis & Yüksek Trafik',
    title: 'Redis Write-Behind Tamponlama ile Veritabanı Yükünü Sıfırlama',
    content: `Yoğun trafik alan blog platformlarında her sayfa görüntülenmesi ve beğeni işleminde PostgreSQL'e anlık yazma sorgusu göndermek veritabanında disk darboğazlarına yol açar.

## 1. Write-Behind (Gecikmeli Yazma) Prensibi
NovaBlog üzerinde sayaçlar doğrudan diske yazılmaz; Redis RAM belleğinde atomik işlemlerle toplanır ve belirli aralıklarla veritabanına toplu aktarılır.

\`\`\`java
@Service
public class RedisMetricBufferService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void recordView(Long blogId) {
        // Redis RAM belleğinde milisaniyenin altında tamponlanır
        redisTemplate.opsForHash().increment("novablog:metrics:views:buffer", blogId.toString(), 1L);
    }
}
\`\`\`

## 2. Toplu Senkronizasyon (Scheduled Batch Flush)
Her 30 saniyede bir çalışan arka plan görevi Redis'teki sayaçları topluca çeker ve tek bir işlemle veritabanına yazar:
- Veritabanı disk I/O yükü %98 oranında azaltılır.
- Ani trafik dalgalanmalarında sunucu sıfır gecikmeyle yanıt verir.
- Güvenli kapanma (graceful shutdown) mekanizmasıyla bekleyen tüm sayaçlar korunur.`,
    author: 'Abdullah Berke Özder',
    views: 1890,
    likes: 165,
    isPublished: true,
    publishedAt: '2026-11-03T16:20:00Z',
    createdDate: '2026-11-03T15:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['redis', 'asenkron-tampon', 'performans', 'onbellek', 'toplu-islem'],
    aiSummary: 'Sayaç güncellemeleri doğrudan veritabanına yazılmak yerine Redis RAM üzerinde toplanır. 30 saniyelik toplu aktarım döngüsü ile veritabanı disk yükü %98 oranında azaltılmıştır.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 4,
    header: 'Veritabanı & Eşzamanlılık',
    title: 'JPA İyimser Kilitleme ile Eşzamanlı Veri Bütünlüğü',
    content: `Çok kullanıcılı kurumsal platformlarda birden fazla yöneticinin aynı anda aynı kaydı düzenlemesi durumunda veri kaybını (Lost Update) önlemek kritik önem taşır.

## 1. Neden İyimser Kilitleme (Optimistic Locking)?
Kötümser kilit satırları bloke ederek diğer kullanıcıları bekletirken, iyimser kilitleme versiyon kontrolü sayesinde kilit koymadan çalışır ve performansı düşürmez.

\`\`\`java
@Entity
@Table(name = "blogs")
public class BlogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long blogId;

    // Her güncellemede Hibernate otomatik olarak 1 artırır
    @Version
    private Long version;
}
\`\`\`

## 2. Çakışma Yönetimi (409 Conflict)
Eski bir versiyon ile güncelleme isteği geldiğinde:
- Hibernate çakışmayı tespit eder ve işlemi güvenle reddeder.
- Sistem 409 Conflict yanıtı ile kullanıcıyı bilgilendirir.
- Veri kaybı veya üzerine yazma riski tamamen ortadan kalkar.`,
    author: 'Abdullah Berke Özder',
    views: 1250,
    likes: 98,
    isPublished: true,
    publishedAt: '2026-11-02T11:45:00Z',
    createdDate: '2026-11-02T11:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['jpa', 'iyimser-kilitleme', 'veri-butunlugu', 'eszamanlilik', 'hibernate'],
    aiSummary: 'JPA @Version iyimser kilitleme mimarisi ile veri çakışmaları sistem bloke edilmeden yakalanır. Çok kullanıcılı operasyonlarda tam veri bütünlüğü sağlanmaktadır.',
    hasVectorEmbedding: true,
    version: 3,
  },
  {
    id: 5,
    header: 'Büyük Veri & Asenkron ETL',
    title: 'Spring Batch 5 ile Milyonluk Kayıtlarda Bellek Dostu Veri İşleme',
    content: `Büyük veri kümelerinde bellek yetersizliği (OutOfMemoryError) yaşamadan veri temizliği ve analitik raporlama gerçekleştirmek için parçalı (chunk-based) işlem mimarisi kullanılmaktadır.

## 1. Parçalı (Chunk) İşlem Deseni
İşlemler Okuma -> İşleme -> Yazma hattında küçük parçalar halinde (örneğin 50'şerli paketlerle) yürütülür:

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
    category: MOCK_CATEGORIES[3],
    tags: ['spring-batch', 'buyuk-veri', 'etl-mimarisi', 'postgresql', 'otomasyon'],
    aiSummary: 'Chunk tabanlı Spring Batch mimarisi ile milyonlarca satırlık veri RAM şişmesi olmadan işlenir. Otomatik hata yakalama ve tekrar deneme mekanizmaları devrededir.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 6,
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
    category: MOCK_CATEGORIES[4],
    tags: ['siber-guvenlik', 'totp-2fa', 'zero-trust', 'kriptografi', 'hesap-guvenligi'],
    aiSummary: 'RFC 6238 standardına uygun zaman tabanlı iki adımlı doğrulama (TOTP). Authenticator uygulamalarıyla uyumlu çalışan ve acil kurtarma kodlarıyla korunan sıfır güven mimarisi.',
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
];
