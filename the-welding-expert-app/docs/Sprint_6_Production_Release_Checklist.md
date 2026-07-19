# Sprint 6 Production Release Checklist

Bu belge kontrollü yayın içindir. Tamamlanmamış kutular varken production deploy yapılmaz.

## 1. PO ve veri kararları

- [ ] `qualified`, `unqualified`, `outside_area`, `spam` tanımları ekipçe onaylandı.
- [ ] Veri kullanımı metni hukuk kontrolünden geçti.
- [ ] Test kayıtları arşivlendi.
- [ ] Yayın sorumlusu ve geri dönüş kararı verecek kişi belirlendi.

## 2. Veritabanı

- [ ] Supabase yedeği alındı.
- [ ] Sprint 5 migration'ı uygulandı ve smoke testi geçti.
- [x] `supabase/sprint_6_measurement_release.sql` uygulandı. (Kullanıcı onayı, 19 Temmuz 2026)
- [ ] Admin bir talebi dört kalite sınıfından biriyle güncelleyebiliyor.
- [ ] Analytics `operation_id` tekrarında unique index ikinci kaydı reddediyor.
- [ ] Dashboard kanal ve hizmet hunisini yükleyebiliyor.

## 3. Kod kalite kapıları

- [ ] `npm run lint`
- [ ] `npm test -- --run`
- [ ] `npm run build`
- [ ] `npm run test:e2e`
- [ ] `npm run perf:lighthouse`
- [ ] `git diff --check`

## 4. Preview smoke

- [ ] UTM parametreli `/appointment` ziyareti kaydediliyor.
- [ ] Hizmet → zaman → iletişim → başarı akışı tamamlanıyor.
- [ ] Telefon ve WhatsApp tıklamaları “iletişim başlangıcı” olarak raporlanıyor.
- [ ] Geçerli takip token'ı durum ve formu açıyor.
- [ ] İlk değişiklik, ilk iptal ve tekrar iptal doğru mesajları gösteriyor.
- [ ] Geçersiz token kişisel bilgi veya form göstermiyor.
- [ ] `/privacy`, `/gallery`, `/login` ve admin rotaları açılıyor.
- [ ] 390x844, 200% eşdeğer görünüm ve reduced-motion kontrolleri geçiyor.

## 5. Kontrollü yayın

1. Release adayı Vercel preview olarak oluşturulur.
2. PO preview URL'sinde smoke ve metin onayı verir.
3. Migration yedeği doğrulandıktan sonra production'a uygulanır.
4. Onaylanan aynı commit production'a promote edilir.
5. İlk 30 dakika hata oranı, talep RPC'si ve kritik rotalar izlenir.
6. İlk 24 saat kanal, form başarısı ve self-servis hata oranı kontrol edilir.

## 6. İzleme eşikleri

- Talep oluşturma RPC hata oranı: `%2` üstünde inceleme, `%5` üstünde rollback değerlendirmesi.
- Self-servis RPC hata oranı: `%2` üstünde inceleme.
- Beş dakikada iki veya daha fazla kritik frontend hata: rollback değerlendirmesi.
- Takip rotasında beklenmedik `404/500`: yayını durdur.
- Analytics kaybı müşteri işlemini engellemez; ayrı incident olarak ele alınır.

## 7. Rollback

1. Vercel'de son sağlıklı deployment production'a yeniden promote edilir.
2. Müşteri randevu ve takip rotaları smoke test edilir.
3. Sprint 6 migration'ı yalnız ek alan ve index içerdiği için kolonlar korunur; eski uygulamayla uyumludur.
4. Analytics unique index sorun çıkarıyorsa yalnız şu index kaldırılır:

```sql
drop index if exists public.analytics_events_operation_dedupe_idx;
```

5. Lead kalite constraint'i veri yazımını engelliyorsa sınıflandırma UI'si geri alınır; veri silinmez.
6. Incident zamanı, etkilenen sürüm, karar ve iyileştirme maddesi release kaydına yazılır.

## 8. Yayın sonrası kapanış

- [ ] Production smoke geçti.
- [ ] Lighthouse production sonucu kaydedildi.
- [ ] İlk 24 saat izleme tamamlandı.
- [ ] Dashboard verileri PO tarafından doğrulandı.
- [ ] Release ve rollback sonucu dokümante edildi.
