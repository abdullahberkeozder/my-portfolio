# Gemini–Codex path incelemesi — 21 Ekim 2026

Bu kayıt Gemini 3.8 Flash High ile yalnızca iki sır içermeyen plan belgesi üzerinden yapılan plan tartışmasının özetidir. Kod yazılmadı ve çalışma ağacına erişilmedi.

## Korunacak kararlar

- Kirli çalışma ağacını koruma; reset/clean/toplu formatlama yasağı.
- Her kanıtı route + rol + veri durumu + viewport + diff kimliği + exit code ile kaydetme.
- Orkestra’nın mevcut mavi işareti, yeşil birincil eylem, koyu metin ve açık yüzey dilini koruma.
- İki Codex–Gemini düzeltme turundan sonra görevi bölme veya kök neden incelemesine dönme.

## Path üzerinde yapılan değişiklikler

1. U5 client sınırı ile SplitView state/lint düzeltmesi iki ayrı göreve ayrıldı.
2. 42 route’luk denetim dört katmana ayrıldı: Tier 1 public discovery (14), Tier 2 müşteri/usta authenticated (16), Tier 3 yönetim/operasyon (7), Tier 4 concept lab (5, non-blocking).
3. Public discovery baseline’ı ortak `SurfaceCard`/skeleton stil değişikliğinden önce çekilecek.
4. P1a görevinden CSS kontrolü çıkarıldı; CSS değişmeyen görevde yalnız hedefli test, type-check ve gerekli build çalışacak.
5. SplitView kabulüne açık state invalidation eklenecek: aktif filtre seçili sağlayıcıyı kaldırırsa seçili kimlik ve ilgili URL durumu orphan panel bırakmadan sıfırlanmalı.
6. Retry kabulüne görünür busy state eklenecek: işlem sırasında `aria-busy="true"` ve disabled davranışıyla hızlı çift tetikleme engellenmeli.

## Engeller

- Gemini’ye tüm repo aktarılmamalı; yalnız allowlist ve sır izolasyonu doğrulanmalı.
- Dinamik route’lar için deterministic fixture ID ve authenticated session fixture olmadan Tier 2/3 ölçülemez.
- `SurfaceCard` ve ortak skeleton’lar Tier 1 baseline’dan önce değiştirilmemeli.

## Gemini’nin önerdiği ilk görev

`UI-HARDENING-01A — U5 Visual Fixture Client Boundary Isolation`.

İzinli dosyalar yalnızca `app/components/U5VisualFixture.tsx` ve yeni `tests/component/U5VisualFixture.test.tsx`. Kabul: server/client hydration hatası yok, dört fixture varyantı korunuyor, retry tek tetikleniyor ve işlem sırasında disabled/`aria-busy` oluyor, CSS/global config değişmiyor, mevcut dirty dosyalar korunuyor. Kapılar: hedefli test, type-check, build.
