# Sprint 5 Supabase Test Raporu

**Tarih:** 19 Temmuz 2026  
**Ortam:** Yerel arayüz + gerçek Supabase projesi  
**Amaç:** `sprint_5_customer_followup.sql` migration'ı sonrasında public takip ve self-servis davranışlarını doğrulamak

## 1. Test verisi

Gerçek Supabase üzerinde aşağıdaki işaretli test talebi oluşturuldu:

- Müşteri adı: `TEST Sprint 5`
- Telefon: `05550000000`
- Takip kodu: `UU-27CE55DA`
- Hizmet: Duvar boya ve badana
- Zaman tercihi: 19 Temmuz 2026, 19:00 - 21:00
- Müşteri notu: `TEST - Sprint 5 gerçek Supabase smoke kaydı; test sonrası arşivlenebilir.`

Bu kayıt üretim müşterisi değildir ve test sonrasında admin randevu ekranından arşivlenmelidir.

## 2. Otomasyon sonuçları

| Senaryo | Sonuç | Kanıt |
| --- | --- | --- |
| Tam birim/entegrasyon regresyonu | Geçti | 17 dosyada 51 test |
| Mobil randevu E2E | Geçti | Playwright |
| İlk değişiklik E2E | Geçti | Playwright |
| Tekrar iptal E2E | Geçti | Playwright |
| Geçersiz token E2E | Geçti | Playwright |

Toplam dört Playwright E2E senaryosu geçti.

## 3. Gerçek Supabase senaryoları

| ID | Senaryo | Beklenen | Gerçek sonuç | Durum |
| --- | --- | --- | --- | --- |
| DB-01 | Müsait slotları public API'den yükleme | Gün ve saatler görünür | Altı müsait saat aralığı yüklendi | Geçti |
| DB-02 | Test randevusu oluşturma | Public takip anahtarı döner | `UU-27CE55DA` ve takip bağlantısı oluştu | Geçti |
| DB-03 | Public takip kaydını açma | Durum, hizmet, zaman ve sonraki adım görünür | Talep başarıyla yüklendi | Geçti |
| DB-04 | İlk değişiklik isteği | İlk talep olarak bildirilir | `İsteğiniz ilk kez alındı` gösterildi | Geçti |
| DB-05 | İlk iptal isteği | Tekrar uyarısı gösterilmez | Uyarı sayısı `0`, ilk talep mesajı gösterildi | Geçti |
| DB-06 | Tekrar iptal isteği | Önceki talep uyarısı ve güncel talep sonucu görünür | Uyarı sayısı `1`, `Güncel isteğiniz alındı` gösterildi | Geçti |
| DB-07 | İptal nedeni değişimi | Son gönderim en güncel değer olur | `Diğer` nedeni ve güncel test notu kabul edildi | Geçti |
| DB-08 | Geçersiz public token | Hata görünür, işlem formu açılmaz | Bir alert, sıfır self-servis formu | Geçti |
| DB-09 | Mesai dışı beklenti | Sonraki inceleme saati açıklanır | `09:00'dan sonra` mesajı gösterildi | Geçti |
| DB-10 | Veri kullanımı bağlantısı | Ayrı bilgilendirme sayfasına gider | `/privacy` bağlantısı görünür | Geçti |

## 4. Migration doğrulaması

Gerçek RPC çağrıları yeni JSON sonuç sözleşmesiyle başarılı oldu. Değişiklik ve iptal işlemleri aynı veritabanı fonksiyonunda geçmiş kaydı, güncel projection ve outbox olayını tek transaction içinde yazar. RPC başarıyla döndüğü için bu transaction geri alınmadan tamamlandı.

İşlem sırası:

1. `change_requested` - not: `TEST ilk değişiklik isteği`
2. `cancel_requested` - neden: `Planım değişti`, geri bildirim: `TEST migration doğrulaması`
3. `cancel_requested` - neden: `Diğer`, not: `TEST tekrar iptal - en güncel not`

## 5. Test verisi temizliği

Tercih edilen yöntem: Admin > Randevular ekranında `TEST Sprint 5` araması yapıp kaydı arşivlemek.

SQL ile temizlenecekse yalnız test kaydını hedefleyen sorgu:

```sql
update public.appointment_requests
set archived_at = now()
where customer_name = 'TEST Sprint 5'
  and customer_phone = '05550000000'
  and archived_at is null;
```

Eklemeli işlem geçmişi ve outbox kayıtları denetim kanıtı olarak kalabilir. Tam silme gerekiyorsa önce saklama politikası belirlenmelidir.

## 6. Sonuç

Sprint 5 migration'ı gerçek Supabase üzerinde beklenen public takip, ilk/tekrar işlem ve geçersiz token davranışlarını karşılıyor. Test sırasında uygulama kodu, migration veya canlı site üzerinde ek değişiklik yapılmadı.
