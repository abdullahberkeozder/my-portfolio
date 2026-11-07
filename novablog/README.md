# 🚀 NovaBlog Enterprise - Full-Stack Architecture

> **Kurumsal Seviye Spring Boot 4 & Spring AI & Next.js 16 Blog ve Akıllı Arama Platformu**  
> Geliştirici: **Abdullah Berke Özder**

---

## 🏛️ Mimari Yapı (Monorepo)

NovaBlog, backend ve frontend katmanlarını modern kurumsal monorepo standartlarına uygun olarak tek bir çatı altında birleştirir:

```
novablog/
├── docker-compose.yml          # PostgreSQL, Redis, MinIO S3, Mailpit ve Prometheus altyapısı
├── README.md                   # Bu dokümantasyon
│
├── backend/                    # ☕ Spring Boot 4.1.1 & Java 22 Enterprise Backend
│   ├── src/                    # Controllers, Services, Entities, AI Clients, Batch Jobs, Security
│   ├── pom.xml                 # Maven bağımlılıkları (Spring AI, Spring Batch, Flyway, pgvector vb.)
│   └── README.md               # 22 Mimari Adım, 184/184 Test Kapsamı ve Detaylı API Sözleşmesi
│
└── frontend/                   # ⚡ Next.js 16 & React 19 & Tailwind CSS v4 Vitrin
    ├── src/                    # App Router, Semantic Search Studio, AI Lab, Batch Console
    ├── Dockerfile              # Prodüksiyon Docker imajı
    ├── package.json            # Bağımlılıklar (Next.js 16, React 19, Lucide, Tailwind v4)
    └── README.md               # Vitrin Özellikleri, Ekran Görüntüleri ve Kurulum Kılavuzu
```

---

## 🌟 Öne Çıkan Yetenekler

### 1. 🧠 Spring AI & 128D Vektör Anlamsal Arama (Semantic Studio)
- Makaleler ve serbest sorgular 128 boyutlu yoğun vektör gömmelerine (Dense Vector Embeddings) dönüştürülür.
- **Kosinüs Benzerliği Formülü**:
  $$\cos(\theta) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
- **3 Arama Modu**:
  1. *Anlamsal Vektör*: Kavramsal örtüşmeye dayalı kosinüs eşleşmesi.
  2. *Hibrit (RRF Füzyon)*: SQL anahtar kelime eşleşmesi ile vektör benzerlik puanının birleşimi.
  3. *Klasik (SQL)*: Geleneksel LIKE ve metin eşleşmesi.

### 2. 🤖 Spring AI NLP Laboratuvarı
- **Otomatik TL;DR Yönetici Özeti**: Serbest metin veya makalelerden anlık extractive/salience özet çıkarma ve sıkıştırma oranı (`-%65 Sıkıştırma`).
- **Akıllı Etiketleme & Kategori Önerisi**: Makale metninden NLP analizi ile otomatik etiket ve kategori tayini.
- **Pre-Moderasyon & Duygu Durum (Sentiment)**: Yorumlarda toksisite, sakıncalı dil denetimi ve duygu (Pozitif/Nötr/Negatif) analizi.

### 3. ⚡ Java 22 Virtual Threads & Spring Boot 4
- Project Loom Virtual Threads entegrasyonu ile thread havuzu darboğazları ortadan kaldırıldı; yüksek eşzamanlı istek işleme sağlandı.

### 4. 📦 Spring Batch 5 ETL & Otomasyon
- Chunk-based soft-delete temizliği ve yazar etkileşim analitiği raporlama işleri.

### 5. 🛡️ Kurumsal Güvenlik & 2FA
- RFC 6238 uyumlu TOTP iki faktörlü kimlik doğrulama (Google Authenticator), JWT çift katmanlı token yenileme, OAuth2 ve Role-based erişim denetimi.

### 6. ✅ 184 / 184 Test (%100 Başarı)
- Unit, Entegrasyon, AI Vektör, Batch ve Güvenlik testlerinin tamamı sıfır hata ile geçmektedir (`mvn test`).

---

## 🚀 Hızlı Başlangıç

### 1. Altyapı Servislerini Başlatın (Docker Compose)
```bash
cd novablog
docker compose up -d
```
Bu komut PostgreSQL (`5432`), Redis (`6379`), MinIO S3 (`9000`/`9001`), Mailpit (`8025`) ve Prometheus (`9090`) servislerini ayağa kaldırır.

### 2. Backend'i Başlatın (Port 5555)
```bash
cd novablog/backend
.\mvnw.cmd spring-boot:run
```
Swagger UI: `http://localhost:5555/swagger-ui/index.html`

### 3. Frontend'i Başlatın (Port 3000)
```bash
cd novablog/frontend
npm install
npm run dev
```
Vitrin Arayüzü: `http://localhost:3000`

---

## 👨‍💻 Geliştirici & Telif
- **Abdullah Berke Özder**
- GitHub: [@abdullahberkeozder](https://github.com/abdullahberkeozder)
- Portfolyo Repo: [my-portfolio](https://github.com/abdullahberkeozder/my-portfolio)
