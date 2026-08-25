# Ankara Usta

Ankara Usta, Ankara'daki müşterileri doğrulanmış yerel ustalarla buluşturmak için geliştirilen hizmet pazaryeri prototipidir. Proje; müşterinin kategori bilmesini beklemek yerine sorununu doğal dille anlatmasını, doğru hizmete yönlendirilmesini ve hizmete özel talep akışını tamamlamasını hedefler.

Canlı sürüm: [ankara-usta.sevvaltuhafiye154322.chatgpt.site](https://ankara-usta.sevvaltuhafiye154322.chatgpt.site)

## Mevcut Ürün Kapsamı

- Ankara odaklı hizmet keşfi ve yerel eşleştirme yaklaşımı
- Doğal dil girdisini hizmet adaylarına dönüştüren sınıflandırma ekranı
- Altı ana kategori ve 26 hizmetten oluşan merkezi hizmet taksonomisi
- Paket hizmet, teklif karşılaştırma ve keşif teslim modelleri
- Altı örnek hizmet için çalışan kapsam soru sihirbazı
- Görsel yükleme, konum ve kapsam özeti adımları
- Popüler hizmetlerin ve kategori sekmelerinin taksonomi verisinden üretilmesi
- Güven, doğrulama, iş günlüğü ve kapsam şeffaflığına odaklanan ana sayfa
- Masaüstü ve mobil uyumlu arayüz

## Tasarım Sistemi

Arayüz, Taskrabbit'in sade görev oluşturma yaklaşımından ilham alan fakat Ankara Usta'ya özgü hale getirilen bir sistem kullanır.

- Petrol yeşili, güven mavisi ve kırık beyaz renk paleti
- Figma `10:749` frame'inden alınan özgün **Mahalle Bağı** marka motifi
- Müşteri, usta ve mahalle bağlantısını temsil eden iki renkli halka
- Ev, Tetris ve LEGO dilini birleştiren modüler karo yapısı
- Sayfa boyunca kenarlarda devam eden düşük yoğunluklu modüler ritim
- İçeriğin önüne geçmeyen, kontrollü tekrar ve sade yüzeyler

## Teknoloji

- Next.js 16
- React 19
- TypeScript
- Vinext ve Vite
- Tailwind CSS 4
- Cloudflare Workers uyumlu OpenAI Sites dağıtımı

## Projeyi Çalıştırma

Gereksinim: Node.js `22.13.0` veya daha yeni bir sürüm.

```bash
npm install
npm run dev
```

Üretim derlemesi:

```bash
npm run build
npm run start
```

Kod kalite kontrolü:

```bash
npm run lint
```

## Temel Proje Yapısı

```text
app/
  components/          Talep sihirbazı ve marka bileşenleri
  data/                Hizmet taksonomisi ve soru tanımları
  lib/                 Hizmet sınıflandırma mantığı
  page.tsx             Ana ürün yüzeyi
  globals.css          Tasarım sistemi ve responsive kurallar
public/
  mahalle-bagi-figma-frame.png
docs/
```

## Sonraki Aşamalar

- Müşteri, usta ve yönetici hesapları
- Usta başvurusu, belge doğrulama ve bölge seçimi
- Gerçek teklif oluşturma ve karşılaştırma
- Mesajlaşma ve iş durumu takibi
- Değerlendirme, şikâyet ve uyuşmazlık yönetimi
- Kalıcı veritabanı, kimlik doğrulama ve dosya depolama

Bu sürüm ürün akışını ve görsel sistemi doğrulayan çalışan frontend prototipidir. Hesaplar, kalıcı veri ve yönetim işlevleri eklendiğinde proje tam full-stack pazaryeri yapısına geçecektir.
