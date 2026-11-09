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
    header: 'Spring AI & Vektör Arama',
    title: 'Spring AI ve 128D Vektör Veritabanı Mimarisi',
    content: `Enterprise seviyedeki modern bilgi yönetim platformlarında geleneksel SQL \`LIKE '%sorgu%'\` veya trigram indekslemeleri kullanıcıların doğal dil bağlamını yakalamakta yetersiz kalmaktadır.

## 1. Neden Vektör Gömmeleri (Embeddings)?
Doğal dil metinleri çok boyutlu bir vektör uzayına projekte edildiğinde (örneğin 128 boyutlu yoğun vektörler), eş anlamlı sözcükler veya kavramsal akrabalıklar uzaysal olarak birbirine yakın konumlanır.

\`\`\`java
@Component
public class VectorEmbeddingService {
    private final EmbeddingClient embeddingClient;

    public float[] generateEmbedding(String documentText) {
        // Metni 128 boyutlu normalize vektöre dönüştürür
        return embeddingClient.embed(documentText);
    }
}
\`\`\`

## 2. Kosinüs Benzerliği ile Hibrit Skorlama
Arama motorumuzda Reciprocal Rank Fusion (RRF) prensibi uygulanmaktadır:
- Klasik anahtar kelime skoru (TF-IDF / BM25)
- Vektör kosinüs benzerliği skoru (Cosine Similarity)
- Birleştirilmiş hibrit benzerlik metriği

Bu mimari sayesinde kullanıcı "bellek yönetimi ve performans" araması yaptığında "JVM Garbage Collector tuning" konulu makale de üst sıralarda listelenmektedir.`,
    author: 'Abdullah Berke Özder',
    views: 1420,
    likes: 189,
    isPublished: true,
    publishedAt: '2026-11-05T10:00:00Z',
    createdDate: '2026-11-05T09:30:00Z',
    category: MOCK_CATEGORIES[0],
    tags: ['spring-ai', 'vector-search', 'embeddings', 'cosine-similarity', 'nlp'],
    aiSummary: 'Spring AI ve 128D yoğun vektör gömmeleri ile enterprise seviyede anlamsal ve hibrit arama motoru mimarisi kuruldu. Kosinüs benzerliği sayesinde semantik eşleşmeler milisaniyeler mertebesinde sunulmaktadır.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 2,
    header: 'Java 22 & Concurrency',
    title: 'Java 22 Virtual Threads Devrimi ve Throughput Mimarisi',
    content: `Java platformunun en köklü dönüşümlerinden biri olan Project Loom (Virtual Threads), geleneksel 1:1 işletim sistemi thread modelini geride bırakarak kullanıcı seviyesinde (user-mode) hafif iş parçacıkları sunmaktadır.

## 1. Platform Thread vs Sanal Thread Darboğazı
Geleneksel Spring Boot uygulamalarında Tomcat thread havuzu varsayılan olarak 200 iş parçacığıyla sınırlandırılır. Bir veritabanı sorgusu veya HTTP REST çağrısı sırasında işletim sistemi thread'i bloke olur.

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
- Tüm HTTP istekleri otomatik olarak sanal thread'lere devredilir.
- Thread context switching maliyeti %90 düşürülür.
- 10.000 eşzamanlı bağlantıda dahi bellek tüketimi minimum seviyede kalır.`,
    author: 'Abdullah Berke Özder',
    views: 2840,
    likes: 312,
    isPublished: true,
    publishedAt: '2026-11-04T14:15:00Z',
    createdDate: '2026-11-04T13:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['java-22', 'virtual-threads', 'loom', 'concurrency', 'spring-boot-4'],
    aiSummary: 'Java 22 Virtual Threads entegrasyonu ile Spring Boot platformunda thread havuzu darboğazları giderildi. Eşzamanlı istek işleme kapasitesi 10 katına çıkarıldı.',
    hasVectorEmbedding: true,
    version: 2,
  },
  {
    id: 3,
    header: 'Redis & Yüksek Trafik',
    title: 'Redis Write-Behind Buffer ile Yüksek Hacimli Sayaç Mimarisi',
    content: `Yüksek trafik alan blog ve medya sistemlerinde her görüntülenme ve beğeni tıklamasında PostgreSQL'e \`UPDATE blogs SET views_count = views_count + 1\` sorgusu atmak veritabanını felç edebilir.

## 1. Write-Behind (Write-Back) Deseni
NovaBlog üzerinde görüntülenme ve beğeni metrikleri Redis Hash tamponunda atomik \`HINCRBY\` komutlarıyla toplanır.

\`\`\`java
@Service
public class RedisMetricBufferService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void recordView(Long blogId) {
        // Redis Hash içinde tamponlanır (O(1) kompleksite)
        redisTemplate.opsForHash().increment("novablog:metrics:views:buffer", blogId.toString(), 1L);
    }
}
\`\`\`

## 2. Scheduled Batch Flush & Eventual Consistency
Her 30 saniyede bir çalışan arka plan görevi Redis'teki deltaları toplu olarak çeker ve tek bir transaction içinde veritabanına yazar:

- Veritabanı disk I/O yükü %98 oranında azaltılır.
- Ani trafik dalgalanmalarında (spikes) sistem sıfır gecikmeyle yanıt verir.
- Graceful shutdown mekanizması ile sunucu kapanırken bekleyen tüm sayaçlar güvenle DB'ye kaydedilir.`,
    author: 'Abdullah Berke Özder',
    views: 1890,
    likes: 165,
    isPublished: true,
    publishedAt: '2026-11-03T16:20:00Z',
    createdDate: '2026-11-03T15:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['redis', 'write-behind', 'performance', 'batching', 'caching'],
    aiSummary: 'Write-Behind Redis önbellekleme deseni sayesinde anlık veritabanı UPDATE yükü engellenerek sayaçlar atomik toplanıp periyodik flush mekanizmasıyla kalıcı hale getirilmektedir.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 4,
    header: 'JPA & Concurrency',
    title: 'JPA @Version ile Optimistic Locking ve Race Condition Koruması',
    content: `Çok kullanıcılı kurumsal sistemlerde iki farklı yöneticinin aynı anda aynı makaleyi güncellemeye çalışması durumunda "Kayıp Güncelleme" (Lost Update) problemi ortaya çıkar.

## 1. Neden Kötümser Kilit (Pessimistic) Değil?
Kötümser kilit veritabanı satırını \`SELECT FOR UPDATE\` ile bloke eder ve diğer tüm okuma/yazma işlemlerini kuyruğa sokar. Bu durum yüksek eşzamanlılıkta kilitlenmelere (deadlock) yol açar.

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
Eğer istemci eski bir versiyon numarası ile güncelleme isteği gönderirse:
- Hibernate \`OptimisticLockingFailureException\` fırlatır.
- REST API standart \`409 Conflict\` yanıtı üretir.
- Frontend TanStack Query katmanı kullanıcının verisini ezmeden uyarır.`,
    author: 'Abdullah Berke Özder',
    views: 1250,
    likes: 98,
    isPublished: true,
    publishedAt: '2026-11-02T11:45:00Z',
    createdDate: '2026-11-02T11:00:00Z',
    category: MOCK_CATEGORIES[1],
    tags: ['jpa', 'optimistic-locking', 'concurrency', 'hibernate', 'spring-data'],
    aiSummary: 'JPA @Version Optimistic Locking ile lock-free eşzamanlılık sağlanarak çakışmalar 409 Conflict olarak yakalanmakta ve veri bütünlüğü korunmaktadır.',
    hasVectorEmbedding: true,
    version: 3,
  },
  {
    id: 5,
    header: 'Spring Batch ETL',
    title: 'Milyonluk Verilerde Spring Batch 5 ve Chunk Tabanlı ETL',
    content: `Büyük veri kümelerinde bellek yetersizliği (OutOfMemoryError) yaşamadan veri temizliği ve analitik raporlama gerçekleştirmek için chunk tabanlı Spring Batch mimarisi kullanılmaktadır.

## 1. Chunk Odaklı İşlem Deseni
İşlemler \`Reader -> Processor -> Writer\` hattında küçük parçalar halinde (örneğin 50'şerli) yürütülür:

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

## 2. Hataya Dayanıklılık (Fault Tolerance)
- Geçici ağ veya veritabanı hatalarında otomatik tekrar deneme (Retry) politikası.
- Bozuk kayıtların atlanması (Skip) ve loglanması.
- Job execution durumunun PostgreSQL üzerinde transaction bazlı kaydedilmesi.`,
    author: 'Abdullah Berke Özder',
    views: 1190,
    likes: 95,
    isPublished: true,
    publishedAt: '2026-11-01T14:00:00Z',
    createdDate: '2026-11-01T13:30:00Z',
    category: MOCK_CATEGORIES[3],
    tags: ['spring-batch', 'etl', 'chunk-processing', 'postgresql', 'cron'],
    aiSummary: 'Chunk tabanlı Spring Batch ETL mimarisi ile yüksek hacimli veri temizliği ve analitik raporlama sıfır kesintiyle asenkron olarak tamamlanmaktadır.',
    hasVectorEmbedding: true,
    version: 1,
  },
  {
    id: 6,
    header: 'Siber Güvenlik & 2FA',
    title: 'RFC 6238 TOTP Multi-Factor Authentication & Zero-Trust Güvenlik',
    content: `Kullanıcı şifrelerinin sızdırılması riskine karşı kurumsal hesaplarda iki faktörlü doğrulama (2FA) zorunlu güvenlik standardıdır.

## 1. RFC 6238 Zaman Tabanlı Tek Kullanımlık Şifre (TOTP)
TOTP mekanizması paylaşılan gizli anahtar (Base32 secret) ve 30 saniyelik zaman pencerelerini HMAC-SHA1 fonksiyonu ile birleştirerek 6 haneli kodlar üretir.

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

## 2. Kurtarma Kodları (Scratch Codes)
Cihaz kaybı durumunda hesabın kilitlenmesini önlemek için:
- 8 haneli rastgele 5 adet tek kullanımlık kurtarma kodu üretilir.
- Kodlar veritabanında BCrypt hash'lenmiş olarak saklanır.
- Kullanılan kod anında silinir.`,
    author: 'Abdullah Berke Özder',
    views: 1750,
    likes: 144,
    isPublished: true,
    publishedAt: '2026-10-31T09:15:00Z',
    createdDate: '2026-10-31T08:45:00Z',
    category: MOCK_CATEGORIES[4],
    tags: ['2fa', 'totp', 'security', 'zero-trust', 'cryptography'],
    aiSummary: 'RFC 6238 standardına uygun TOTP 2FA sistemi ile kullanıcı hesapları iki adımlı doğrulama ve kurtarma kodlarıyla koruma altına alınmıştır.',
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
    matchedKeywords: ['spring-ai', 'vector', 'embeddings', 'cosine'],
    searchMode: 'SEMANTIC',
    explanation: 'Sorgudaki yapay zeka ve anlamsal arama konsepti 128D uzayda %94.2 kosinüs benzerliği yakaladı.',
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
