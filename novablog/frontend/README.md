# 🚀 NovaBlog Enterprise - Next.js 16 & React 19 Frontend Showcase

Modern, interaktif ve kurumsal **Next.js 16 (App Router) & React 19 & Tailwind CSS v4** vitrin uygulaması.

Bu frontend, **NovaBlog Enterprise** arka yüz platformu (Spring Boot 4.1.1, Java 22 Virtual Threads, Spring AI Vektör Arama, PostgreSQL, Redis, MinIO S3) ile tam entegre çalışır.

---

## 🌟 Öne Çıkan Vitrin Yetenekleri

1. **🧠 Spring AI Vektör Stüdyosu (Semantic Vector Search)**:
   - 128 boyutlu yoğun gömme (Dense Vector Embeddings) ve Kosinüs Benzerliği `cos(θ) = (A · B) / (||A|| · ||B||)`.
   - Mod Seçici: **Anlamsal Vektör**, **Hibrit (RRF Füzyon)** ve **Klasik (SQL LIKE)**.
   - Gerçek zamanlı benzerlik yüzdesi (`%94.2 Benzerlik`) ve AI eşleşme gerekçesi açıklaması.
2. **🤖 Spring AI NLP & LLM Laboratuvarı**:
   - **Canlı TL;DR Yönetici Özeti**: Serbest metinlerden extractive/salience özetleme ve sıkıştırma oranı (`-%65 Sıkıştırma`).
   - **Akıllı Etiketleme & Kategori Önerisi**: Makale metninden otomatik kategori ve etiket tespiti.
   - **İçerik Moderasyonu & Duygu Analizi**: Yorumlarda nefret söylemi / toksisite denetimi ve duygu durumu (Pozitif / Nötr / Negatif) analizi.
3. **⚡ Spring Batch & Sistem Konsolu**:
   - `Chunk-based Soft-Delete Temizleme Job'ı` tetikleme.
   - `Yazar Etkileşim ve Analitik Raporlama Job'ı` tetikleme.
   - Vektör gömmelerini baştan hesaplama (Reindex).
   - PostgreSQL, Redis L2 önbellek, MinIO S3 ve WebSocket canlı mimari durum kartları.
4. **🛡️ Canlı Demo / Mock Dayanıklılığı**:
   - Backend `http://localhost:5555` açık olduğunda canlı REST API'lara bağlanır.
   - Backend kapalı olduğunda zengin mock verilerine yumuşak geçiş (graceful fallback) yaparak işe alımcılar ve ziyaretçiler için kesintisiz deneyim sunar.

---

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 20+
- npm 10+

### Geliştirme Ortamı
```bash
npm install
npm run dev
```
Uygulama `http://localhost:3000` adresinde açılır.

### Prodüksiyon Derlemesi
```bash
npm run build
npm run start
```

### Docker ile Çalıştırma
```bash
docker build -t novablog-frontend:latest .
docker run -p 3000:3000 novablog-frontend:latest
```

---

## 👨‍💻 Geliştirici
- **Abdullah Berke Özder**
- GitHub: [abdullahberkeozder](https://github.com/abdullahberkeozder)
- Portfolyo Repo: [my-portfolio](https://github.com/abdullahberkeozder/my-portfolio)
