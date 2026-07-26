-- ============================================================================
-- Service Configs Table
-- Hizmet fiyat etiketleri, açıklamalar ve özellik listesi admin panelden
-- yönetilebilir. service_key değeri business.js::serviceTypes ile eşleşir.
-- ============================================================================

create table if not exists public.service_configs (
  id            uuid        primary key default gen_random_uuid(),
  created_at    timestamptz not null    default now(),
  updated_at    timestamptz not null    default now(),
  service_key   text        not null    unique,
  title         text        not null,
  description   text,
  price_tagline text,
  points        text[]      not null    default '{}',
  image_url     text,
  is_active     boolean     not null    default true,
  sort_order    integer     not null    default 0
);

create index if not exists service_configs_sort_order_idx
  on public.service_configs (sort_order asc);

create or replace trigger set_service_configs_updated_at
before update on public.service_configs
for each row execute function public.set_updated_at();

-- RLS
alter table public.service_configs enable row level security;

drop policy if exists "Anyone can read active service configs"
  on public.service_configs;

create policy "Anyone can read active service configs"
  on public.service_configs
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Admins can manage service configs"
  on public.service_configs;

create policy "Admins can manage service configs"
  on public.service_configs
  for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select on public.service_configs to anon, authenticated;
grant insert, update, delete on public.service_configs to authenticated;

-- ============================================================================
-- Seed — business.js::serviceOverview verileri ile ilk kayıtlar
-- ============================================================================

insert into public.service_configs
  (service_key, title, description, price_tagline, points, image_url, sort_order)
values
  (
    'Duvar boya ve badana',
    'Duvar boya ve badana',
    'Ev, ofis ve apartman içi/dışı duvarlarınız için pürüzsüz boya uygulaması, alçı sıva ve temiz işçilik.',
    'Oda başı: 950 TL''den başlayan fiyatlar',
    array['Pürüzsüz alçı sıva', 'Kaliteli marka boyalar', 'Sıfır kirlilik, temiz teslim'],
    '/images/painting.png',
    1
  ),
  (
    'Kapı, korkuluk ve kaynak',
    'Kapı, korkuluk ve kaynak',
    'Menteşe onarımı, apartman kapıları, bahçe ve balkon korkuluklarının demir kaynak işleri.',
    'Küçük tamirler: 750 TL''den başlayan fiyatlar',
    array['Yerinde sağlamlaştırma', 'Kopan menteşe kaynağı', 'Paslanmaz koruyucu boya'],
    '/images/railing_repair.png',
    2
  ),
  (
    'Bahçe peyzaj ve düzenleme',
    'Bahçe peyzaj ve düzenleme',
    'Bahçe tasarımı, çim biçme, ağaç budama, toprak havalandırma ve bahçe çit montajı.',
    'Metrekare başı veya günlük fiyatlandırma',
    array['Bahçe peyzaj planı', 'Ağaç ve çim budama', 'Çit ve sınır telleri montajı'],
    '/images/landscaping_after.png',
    3
  ),
  (
    'Küçük inşaat ve ev tadilatı',
    'Küçük inşaat ve ev tadilatı',
    'Lokal duvar örme, seramik/fayans döşeme, alçıpan montajı ve ev içi ufak tadilat işleri.',
    'Metrekare başı veya iş bazlı fiyatlandırma',
    array['Alçıpan ve ara bölme duvarlar', 'Fayans ve seramik döşeme', 'Lokal sıva ve harç tamirleri'],
    '/images/renovation.png',
    4
  ),
  (
    'Raylı kapı sistemleri',
    'Raylı kapı sistemleri',
    'Raylı garaj, site ve bahçe kapılarının demir iskelet imalatı, tekerlek değişimi, ray tamiri ve montajı.',
    'Metre başı veya proje bazlı fiyatlandırma',
    array['Sağlam metal ray montajı', 'Rulman ve tekerlek yenileme', 'Hassas terazi ve hizalama'],
    '/images/sliding_gate_after.png',
    5
  ),
  (
    'Otomatik kapı motorları',
    'Otomatik kapı motorları',
    'Yana kayar veya kanatlı kapılar için motor montajı, elektrik bağlantısı, kumanda kodlama ve fotosel kurulumu.',
    'Motor dahil veya montaj bazlı fiyatlandırma',
    array['Marka motor seçenekleri', 'Engel algılayıcı fotosel', 'Uzaktan kumanda tanımlama'],
    '/images/gate_motor_after.png',
    6
  ),
  (
    'Bina ve bahçe kapıları için akıllı kilit sistemleri',
    'Bina ve bahçe kapıları için akıllı kilit sistemleri',
    'Apartman, bina ve bahçe kapılarına şifreli, kartlı, manyetik veya parmak izli akıllı kilit ve geçiş sistemleri kurulumu.',
    'Sistem dahil veya montaj bazlı fiyatlandırma',
    array['Kartlı ve şifreli geçiş', 'Otomatik hidrolik kapatıcı', 'Kesintisiz güç kaynağı (UPS)'],
    '/images/smart_lock_after.png',
    7
  ),
  (
    'Yerinde keşif ve teklif',
    'Yerinde keşif ve teklif',
    'Yapılacak işlerin yerinde incelenmesi, malzeme seçimi, detaylı iş planı ve maliyet teklifi sunumu.',
    'Keşif randevusu: Ücretsiz',
    array['Ücretsiz ön inceleme seçeneği', 'Detaylı malzeme listesi', 'Yazılı fiyat ve süre teklifi'],
    '/images/estimate.png',
    8
  )
on conflict (service_key) do nothing;

notify pgrst, 'reload schema';
