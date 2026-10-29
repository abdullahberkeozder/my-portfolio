'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { trackFunnel } from '../lib/analytics';
import resultStyles from './professionalResult.module.css';
import { discoveryHref, serializeDiscoveryFilters, updateDiscoveryParams } from '../lib/discoveryContract';
import type { DirectoryAvailability } from '../lib/directoryAvailability';
import AnkaraInteractiveMap from '../components/map/AnkaraInteractiveMap';
import { generateUstaMapMarkers, type TradespersonMetrics } from './ustaCoordinates';
import styles from './ustalarSplitView.module.css';
import dirStyles from './directory.module.css';
import { IconClose, IconLocation, IconShield } from '../components/WizardSummaryIcons';

export interface UstalarSplitViewProps {
  profiles: {
    user_id: string;
    display_name: string;
    bio: string | null;
    city: string | null;
    total_count: number;
  }[];
  serviceMap: Record<string, string[]>;
  areaMap: Record<string, string[]>;
  neighborhoodMap?: Record<string, string[]>;
  metricsMap?: Record<string, TradespersonMetrics>;
  selectedService?: string;
  selectedDistrict?: string;
  servicesList: { id: string; name: string }[];
  districtsList: string[];
  count: number;
  page: number;
  pageSize: number;
  hasFilters: boolean;
  baseHref: string;
  initialView?: 'split' | 'list' | 'map';
  initialSortMode?: 'recommended' | 'rating' | 'jobs';
  hasDbError?: boolean;
  /** Server-evidenced supply state for the current service/district filters. */
  availability?: DirectoryAvailability;
  /** Optional detail route prefix for non-production directory concepts. */
  profileHrefBase?: string;
  verificationConfirmed?: boolean;
}

export const VIRTUAL_BATCH_SIZE = 24;

const DISTRICT_SLA_MAP: Record<string, string> = {
  altındağ: '~12–18 dk',
  çankaya: '~15–20 dk',
  yenimahalle: '~18–25 dk',
  keçiören: '~16–22 dk',
  etimesgut: '~22–30 dk',
  mamak: '~15–22 dk',
  sincan: '~25–35 dk',
  gölbaşı: '~28–38 dk',
  pursaklar: '~20–28 dk',
  akyurt: '~30–42 dk',
  kahramankazan: '~32–45 dk',
};

export function getDistrictSlaText(districtName?: string): string {
  if (!districtName) return '~15–25 dk Sevk';
  const norm = districtName.toLowerCase().trim();
  const sla = DISTRICT_SLA_MAP[norm] || '~18–28 dk';
  return `${sla} Sevk`;
}

export function getServiceAreaSummary(
  districts: string[],
  neighborhoods: string[],
  fallbackDistrict?: string | null
): string {
  const cleanDistricts = districts.filter(Boolean);
  const cleanNeighborhoods = neighborhoods.filter(Boolean);
  const primaryDistrict = cleanDistricts[0] || (fallbackDistrict && fallbackDistrict.toLowerCase() !== 'ankara' ? fallbackDistrict : '');

  if (cleanNeighborhoods.length > 0) {
    const districtLabel = primaryDistrict || 'Ankara';
    return `${districtLabel} · ${cleanNeighborhoods.length} mahalle`;
  }

  if (cleanDistricts.length > 1) {
    return `${primaryDistrict} ve ${cleanDistricts.length - 1} ilçe`;
  }

  if (primaryDistrict && primaryDistrict.toLowerCase() !== 'ankara') {
    return `${primaryDistrict} geneli`;
  }

  return 'Ankara geneli';
}

export function formatTurkishPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const normalized = digits.startsWith('0') ? digits : '0' + digits;
  const trimmed = normalized.slice(0, 11);
  if (trimmed.length <= 4) return trimmed;
  if (trimmed.length <= 7) return `${trimmed.slice(0, 4)} ${trimmed.slice(4)}`;
  if (trimmed.length <= 9) return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7)}`;
  return `${trimmed.slice(0, 4)} ${trimmed.slice(4, 7)} ${trimmed.slice(7, 9)} ${trimmed.slice(9, 11)}`;
}

export function generateLeadReference(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ANK-${rand}`;
}

export function parseCraftsmanName(rawName: string) {
  if (rawName.includes(' · ')) {
    const parts = rawName.split(' · ');
    return {
      craftsman: parts[0]?.trim() || rawName,
      workshop: parts.slice(1).join(' · ').trim(),
      tagline: '',
    };
  }

  const parenMatches = Array.from(rawName.matchAll(/\(([^)]+)\)/g)).map(m => m[1]);
  const cleanName = rawName.replace(/\s*\([^)]*\)/g, '').trim();

  let workshop = '';
  let tagline = '';

  if (parenMatches.length >= 2) {
    tagline = parenMatches[0];
    workshop = parenMatches[1];
  } else if (parenMatches.length === 1) {
    if (
      parenMatches[0].includes('Yıllık') ||
      parenMatches[0].includes('Belgeli') ||
      parenMatches[0].includes('MYK') ||
      parenMatches[0].includes('Deneyim')
    ) {
      tagline = parenMatches[0];
    } else {
      workshop = parenMatches[0];
    }
  }

  return {
    craftsman: cleanName || rawName,
    workshop,
    tagline,
  };
}

export function getServiceIcon(categoryName: string): string {
  const c = (categoryName || '').toLowerCase();
  if (c.includes('tesisat') || c.includes('musluk')) return 'tesisat';
  if (c.includes('elektrik')) return 'elektrik';
  if (c.includes('ahşap') || c.includes('mobilya') || c.includes('marangoz')) return 'ahşap';
  if (c.includes('boya') || c.includes('badana')) return 'boya';
  if (c.includes('mekanik') || c.includes('metal') || c.includes('kaynak') || c.includes('montaj')) return 'montaj';
  if (c.includes('temizlik')) return 'temizlik';
  return 'hizmet';
}

export function getServiceAvatarClass(categoryName: string, cssStyles: Record<string, string>): string {
  const c = (categoryName || '').toLowerCase();
  if (c.includes('tesisat') || c.includes('musluk')) return cssStyles.avatarPlumbing || '';
  if (c.includes('elektrik')) return cssStyles.avatarElectric || '';
  if (c.includes('ahşap') || c.includes('mobilya') || c.includes('marangoz')) return cssStyles.avatarCarpentry || '';
  if (c.includes('boya') || c.includes('badana')) return cssStyles.avatarPaint || '';
  if (c.includes('mekanik') || c.includes('metal') || c.includes('kaynak') || c.includes('montaj')) return cssStyles.avatarRepair || '';
  return cssStyles.avatarDefault || '';
}

function getAvailabilityCopy(availability?: DirectoryAvailability) {
  switch (availability) {
    case 'limited':
      return {
        title: 'Bu filtrede henüz eşleşen usta yok',
        description: 'Bu hizmet ve ilçe birleşiminde sonuç bulunamadı. Ankara’daki doğrulanmış ustaları genişletilmiş görünümde inceleyebilirsiniz.',
      };
    case 'waitlist':
      return {
        title: 'Bu alanda henüz doğrulanmış usta yok',
        description: 'Şu anda bu kapsamda yayınlanmış bir profil bulunmuyor. İhtiyacınızı anlatarak talep akışından başlayabilirsiniz.',
      };
    case 'unavailable':
      return {
        title: 'Bu bölge pilot kapsamımızda değil',
        description: 'Orkestra’nın mevcut hizmet alanı Ankara’daki pilot ilçelerle sınırlı.',
      };
    default:
      return {
        title: 'Bu kriterlere uygun doğrulanmış usta bulunamadı',
        description: 'Filtre tercihlerinizi genişletmeyi deneyebilir veya tüm ustaları görmek için filtreleri temizleyebilirsiniz.',
      };
  }
}

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return { push: () => {}, replace: () => {}, refresh: () => {} };
  }
}

function useSafePathname() {
  try {
    return usePathname() || '/ustalar';
  } catch {
    return '/ustalar';
  }
}

export default function UstalarSplitView({
  profiles,
  serviceMap,
  areaMap,
  neighborhoodMap,
  metricsMap,
  selectedService,
  selectedDistrict,
  servicesList,
  districtsList,
  count,
  page,
  pageSize,
  hasFilters,
  baseHref,
  initialView = 'split',
  initialSortMode = 'recommended',
  hasDbError = false,
  availability,
  profileHrefBase = '/ustalar',
  verificationConfirmed = false,
}: UstalarSplitViewProps) {
  const router = useSafeRouter();
  const pathname = useSafePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>(initialView);
  const displayedViewMode = viewMode;
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [activeUstaId, setActiveUstaId] = useState<string | null>(null);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);
  const [visibleUstaIds, setVisibleUstaIds] = useState<string[] | null>(null);
  const [spatialResetTrigger, setSpatialResetTrigger] = useState(0);
  const [panToUstaId, setPanToUstaId] = useState<string | null>(null);
  const [isDrawerCollapsed, setIsDrawerCollapsed] = useState(false);
  const [drawerSnap, setDrawerSnap] = useState<'peek' | 'half' | 'full'>('half');
  const touchStartYRef = useRef<number | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const [virtualLimit, setVirtualLimit] = useState(VIRTUAL_BATCH_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [sortMode, setSortMode] = useState<'recommended' | 'rating' | 'jobs'>(initialSortMode);
  const [trustModalOpen, setTrustModalOpen] = useState(false);
  const [openServiceAreaKey, setOpenServiceAreaKey] = useState<string | null>(null);
  const [previousServiceAreaContext, setPreviousServiceAreaContext] = useState({
    selectedService, selectedDistrict, searchQuery, visibleUstaIds,
  });
  if (
    previousServiceAreaContext.selectedService !== selectedService ||
    previousServiceAreaContext.selectedDistrict !== selectedDistrict ||
    previousServiceAreaContext.searchQuery !== searchQuery ||
    previousServiceAreaContext.visibleUstaIds !== visibleUstaIds
  ) {
    setPreviousServiceAreaContext({ selectedService, selectedDistrict, searchQuery, visibleUstaIds });
    if (openServiceAreaKey !== null) setOpenServiceAreaKey(null);
  }
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement | null>(null);

  const closeServiceAreaPanel = useCallback((cardKey?: string, returnFocus = true) => {
    const targetKey = cardKey || openServiceAreaKey;
    setOpenServiceAreaKey(null);
    if (returnFocus && targetKey) {
      setTimeout(() => {
        triggerRefs.current[targetKey]?.focus();
      }, 0);
    }
  }, [openServiceAreaKey]);

  const toggleServiceAreaPanel = useCallback((cardKey: string) => {
    setOpenServiceAreaKey((prev) => (prev === cardKey ? null : cardKey));
  }, []);

  useEffect(() => {
    if (!openServiceAreaKey) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeServiceAreaPanel(openServiceAreaKey, true);
      }
    };

    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const panelEl = panelRef.current;
      const triggerEl = triggerRefs.current[openServiceAreaKey];
      if (panelEl && !panelEl.contains(target) && triggerEl && !triggerEl.contains(target)) {
        closeServiceAreaPanel(openServiceAreaKey, false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openServiceAreaKey, closeServiceAreaPanel]);

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const prevVisibleRef = useRef<string[] | null>(null);
  const availabilityEventKeyRef = useRef<string | null>(null);
  const activeFilterCount = Number(Boolean(selectedService)) + Number(Boolean(selectedDistrict)) + Number(Boolean(searchQuery));
  const clearDiscoveryHref = discoveryHref({ view: 'split', sort: 'recommended' });

  useEffect(() => {
    if (!availability) return;
    const eventKey = `${availability}:${hasFilters ? 'filtered' : 'all'}`;
    if (availabilityEventKeyRef.current === eventKey) return;
    availabilityEventKeyRef.current = eventKey;
    trackFunnel('directory_availability_viewed', {
      availability,
      hasFilters,
    });
  }, [availability, hasFilters]);

  // Quick Quote Modal state (Plerdy WML-011 / WML-017 / WML-018 / WML-022 / WML-023)
  interface QuoteModalState {
    id: string;
    craftsman: string;
    workshop: string;
    service: string;
    district: string;
    sla: string;
    price: string;
  }
  const [quoteModal, setQuoteModal] = useState<QuoteModalState | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const filterSelectionRef = useRef({
    service: selectedService ?? '',
    district: selectedDistrict ?? '',
  });
  const [quoteReference, setQuoteReference] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    problem: '',
    phone: '',
    addressDetail: '',
    urgency: 'Hemen (Acil Sevk)',
  });

  // Emergency Dispatch & Direct Calling Modal state (Plerdy WML-002 / WML-004 / WML-045)
  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingQuote(true);

    let finalRefCode = generateLeadReference();

    try {
      const response = await fetch('/api/requests/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ustaId: quoteModal?.id,
          craftsman: quoteModal?.craftsman,
          district: quoteModal?.district,
          service: quoteModal?.service,
          sla: quoteModal?.sla,
          ...quoteForm,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { leadRef?: string } | null;
        if (data?.leadRef) {
          finalRefCode = data.leadRef;
        }
      }
    } catch {
      // Offline fallback: keep finalRefCode generated locally
    }

    setQuoteReference(finalRefCode);

    try {
      const existingLeads = JSON.parse(localStorage.getItem('ankara_quick_quotes') || '[]');
      existingLeads.unshift({
        refCode: finalRefCode,
        createdAt: new Date().toISOString(),
        ustaId: quoteModal?.id,
        craftsman: quoteModal?.craftsman,
        district: quoteModal?.district,
        service: quoteModal?.service,
        sla: quoteModal?.sla,
        ...quoteForm,
      });
      localStorage.setItem('ankara_quick_quotes', JSON.stringify(existingLeads.slice(0, 20)));
    } catch {}

    setIsSubmittingQuote(false);
    setQuoteSubmitted(true);
    setLiveAnnouncement(
      `Teklif talebiniz alındı. Referans: ${finalRefCode}. ${quoteModal?.craftsman} ortalama ${quoteModal?.sla} içinde arayacaktır.`
    );
  };

  // Chip filter navigation helper
  const navigateWithFilter = useCallback((key: 'service' | 'district', value: string) => {
    // Read the current URL at event time so a rapid service → district change
    // cannot overwrite the first filter with a stale server-prop snapshot.
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const nextSelection = {
      ...filterSelectionRef.current,
      [key]: value,
    };
    filterSelectionRef.current = nextSelection;
    trackFunnel('filter_applied', {
      filterKey: key,
      hasValue: Boolean(value),
    });
    const next = updateDiscoveryParams(
      params,
      { [key]: value || undefined, view: displayedViewMode },
      { serviceIds: servicesList.map((service) => service.id), districts: districtsList }
    );
    router.replace(discoveryHref(next, pathname));
  }, [router, pathname, displayedViewMode, servicesList, districtsList]);

  // Keep browser history and the mounted client view in sync. Next's router
  // updates the query string without changing pathname, so the reactive
  // searchParams signal is the source of truth; popstate remains as a native
  // history fallback for direct browser navigation.
  useEffect(() => {
    const syncViewFromUrl = (requestedView: string | null) => {
      const nextView: 'split' | 'list' | 'map' =
        requestedView === 'list' || requestedView === 'map' || requestedView === 'split'
          ? requestedView
          : 'split';
      setViewMode((current) => (current === nextView ? current : nextView));
    };

    syncViewFromUrl(searchParams?.get('view') ?? null);
    const handlePopState = () => syncViewFromUrl(new URLSearchParams(window.location.search).get('view'));
    const handlePageShow = () => syncViewFromUrl(new URLSearchParams(window.location.search).get('view'));
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handlePageShow();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [searchParams]);

  useEffect(() => {
    filterSelectionRef.current = {
      service: selectedService ?? '',
      district: selectedDistrict ?? '',
    };
  }, [selectedService, selectedDistrict]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartYRef.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartYRef.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;
    touchStartYRef.current = null;

    if (deltaY < -35) {
      // Swiped UP
      if (isDrawerCollapsed || drawerSnap === 'peek') {
        setIsDrawerCollapsed(false);
        setDrawerSnap('half');
        trackFunnel('mobile_drawer_changed', { snap: 'half' });
        setLiveAnnouncement('Usta çekmecesi açıldı. Usta kartları görüntülenebilir.');
      } else if (drawerSnap === 'half') {
        setDrawerSnap('full');
        trackFunnel('mobile_drawer_changed', { snap: 'full' });
        setLiveAnnouncement('Usta çekmecesi tam ekran listeye genişletildi.');
      }
    } else if (deltaY > 35) {
      // Swiped DOWN
      if (drawerSnap === 'full') {
        setDrawerSnap('half');
        trackFunnel('mobile_drawer_changed', { snap: 'half' });
        setLiveAnnouncement('Usta çekmecesi yarı boyuta getirildi.');
      } else if (drawerSnap === 'half') {
        setIsDrawerCollapsed(true);
        setDrawerSnap('peek');
        trackFunnel('mobile_drawer_changed', { snap: 'peek' });
        setLiveAnnouncement('Usta çekmecesi daraltıldı. Harita tam ekranda görüntülenebilir.');
      }
    }
  }

  function toggleDrawerCollapse() {
    if (isDrawerCollapsed) {
      setIsDrawerCollapsed(false);
      setDrawerSnap('half');
      trackFunnel('mobile_drawer_changed', { snap: 'half' });
      setLiveAnnouncement('Usta çekmecesi açıldı.');
    } else {
      setIsDrawerCollapsed(true);
      setDrawerSnap('peek');
      trackFunnel('mobile_drawer_changed', { snap: 'peek' });
      setLiveAnnouncement('Usta çekmecesi daraltıldı.');
    }
  }

  // Screen Reader Live Announcements (WCAG 2.1 AA)
  useEffect(() => {
    if (visibleUstaIds !== prevVisibleRef.current) {
      prevVisibleRef.current = visibleUstaIds;
      const msg =
        visibleUstaIds !== null
          ? `Harita görünümü güncellendi: Görünür alanda ${visibleUstaIds.length} doğrulanmış usta listelendi.`
          : `Tüm Ankara görünümü geri yüklendi: Toplam ${profiles.length} doğrulanmış usta listeleniyor.`;
      setLiveAnnouncement(msg);
    }
  }, [visibleUstaIds, profiles.length]);

  // Generate deterministic markers on the Ankara map
  const mapMarkers = useMemo(() => {
    const profileQuery = serializeDiscoveryFilters({ service: selectedService, district: selectedDistrict });
    return generateUstaMapMarkers(profiles, areaMap, serviceMap, neighborhoodMap, metricsMap)
      .map((marker) => ({
        ...marker,
        profileHref: `${profileHrefBase}/${marker.id}${profileQuery ? `?${profileQuery}` : ''}`,
      }));
  }, [profiles, areaMap, serviceMap, neighborhoodMap, metricsMap, selectedService, selectedDistrict, profileHrefBase]);

  // Spatial Bounding-Box Filter & Real-Time Search Query (Plerdy WML-019 & WML-020)
  const displayedProfiles = useMemo(() => {
    let result = profiles;
    if (visibleUstaIds) {
      result = result.filter((p) => visibleUstaIds.includes(p.user_id));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const nameMatch = p.display_name.toLowerCase().includes(q);
        const bioMatch = (p.bio || '').toLowerCase().includes(q);
        const services = (serviceMap[p.user_id] || []).some((s) => s.toLowerCase().includes(q));
        const areas = (areaMap[p.user_id] || []).some((a) => a.toLowerCase().includes(q));
        return nameMatch || bioMatch || services || areas;
      });
    }
    if (sortMode === 'recommended') return result;
    return [...result].sort((a, b) => {
      const aMetrics = metricsMap?.[a.user_id];
      const bMetrics = metricsMap?.[b.user_id];
      if (sortMode === 'rating') {
        return (bMetrics?.averageRating ?? 0) - (aMetrics?.averageRating ?? 0);
      }
      return (bMetrics?.totalCompletedJobs ?? 0) - (aMetrics?.totalCompletedJobs ?? 0);
    });
  }, [profiles, visibleUstaIds, searchQuery, serviceMap, areaMap, sortMode, metricsMap]);

  // Faz 5: Reset virtual window when spatial filter or search filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setVirtualLimit(VIRTUAL_BATCH_SIZE);
    }, 0);
    return () => clearTimeout(timer);
  }, [visibleUstaIds, hasFilters, searchQuery]);

  // Faz 5: Sliced visible profiles for 60 FPS DOM performance
  const virtualizedProfiles = useMemo(() => {
    return displayedProfiles.slice(0, virtualLimit);
  }, [displayedProfiles, virtualLimit]);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.user_id === (hoveredPinId ?? activeUstaId)),
    [profiles, hoveredPinId, activeUstaId]
  );

  // Faz 5: IntersectionObserver sentinel to dynamically load more cards during scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setVirtualLimit((prev) => {
            if (prev >= displayedProfiles.length) return prev;
            return Math.min(displayedProfiles.length, prev + VIRTUAL_BATCH_SIZE);
          });
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayedProfiles.length]);

  function handleViewModeChange(mode: 'split' | 'list' | 'map') {
    setViewMode(mode);
    trackFunnel('directory_view_changed', { view: mode });
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const nextUrl = discoveryHref(
      updateDiscoveryParams(params, { view: mode }, {
        serviceIds: servicesList.map((service) => service.id),
        districts: districtsList,
      }),
      pathname
    );
    // View changes only alter the mounted client surface. Native history keeps
    // back/forward deterministic even when the RSC server payload is cached.
    window.history.replaceState({}, '', nextUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
    const labels: Record<string, string> = {
      split: 'Bölünmüş ekran (split-view) görünümü aktif.',
      list: 'Liste görünümü aktif.',
      map: 'Tam harita görünümü aktif.',
    };
    setLiveAnnouncement(labels[mode] ?? `${mode} görünümü`);
  }

  function handleSortModeChange(mode: 'recommended' | 'rating' | 'jobs') {
    setSortMode(mode);
    trackFunnel('directory_sort_changed', { sort: mode });
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const next = updateDiscoveryParams(
      params,
      { sort: mode, view: displayedViewMode },
      { serviceIds: servicesList.map((service) => service.id), districts: districtsList }
    );
    router.replace(discoveryHref(next, pathname));
  }

  function handleResetSpatialFilter() {
    setVisibleUstaIds(null);
    setSpatialResetTrigger((prev) => prev + 1);
    trackFunnel('map_region_filter_changed', { active: false, resultCount: profiles.length });
    setLiveAnnouncement('Bölge filtresi kaldırıldı. Tüm Ankara ustaları listeleniyor.');
  }

  function handleVisibleTradespeopleChange(visibleIds: string[] | null) {
    setVisibleUstaIds(visibleIds);
    trackFunnel('map_region_filter_changed', {
      active: visibleIds !== null,
      resultCount: visibleIds?.length ?? profiles.length,
    });
    if (visibleIds === null) {
      setLiveAnnouncement('Harita filtresi kapatıldı. Tüm Ankara ustaları listeleniyor.');
    } else if (visibleIds.length === 0) {
      setLiveAnnouncement('Bu bölgede doğrulanmış usta bulunamadı. Haritayı genişletebilirsiniz.');
    } else {
      setLiveAnnouncement(`Bu bölgede ${visibleIds.length} doğrulanmış usta bulundu.`);
    }
  }

  function handleSelectMarker(ustaId: string) {
    trackFunnel('map_pin_selected', { professionalId: ustaId });
    setActiveUstaId(ustaId);
    setHoveredPinId(ustaId);
    setPanToUstaId(ustaId);
    setIsDrawerCollapsed(false);
    setDrawerSnap('half');
    const matched = profiles.find((p) => p.user_id === ustaId);
    if (matched) {
      setLiveAnnouncement(`${matched.display_name} seçildi. Harita ve liste senkronize edildi.`);
    }

    // Faz 5: Expand virtual window if target usta is beyond currently rendered slice
    const targetIdx = displayedProfiles.findIndex((p) => p.user_id === ustaId);
    if (targetIdx >= 0 && targetIdx >= virtualLimit) {
      setVirtualLimit((prev) => Math.max(prev, targetIdx + 12));
    }

    setTimeout(() => {
      const cardEl = cardRefs.current[ustaId];
      if (cardEl) {
        if (typeof cardEl.scrollIntoView === 'function') {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        cardEl.focus();
      }
      const mobileCardEl = mobileCardRefs.current[ustaId];
      if (mobileCardEl && typeof mobileCardEl.scrollIntoView === 'function') {
        mobileCardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 30);
  }

  function handleSelectMobileCard(ustaId: string) {
    setActiveUstaId(ustaId);
    setHoveredPinId(ustaId);
    setPanToUstaId(ustaId);
    const matched = profiles.find((p) => p.user_id === ustaId);
    if (matched) {
      setLiveAnnouncement(`${matched.display_name} seçildi. Harita odaklandı.`);
    }
    const mobileCardEl = mobileCardRefs.current[ustaId];
    if (mobileCardEl && typeof mobileCardEl.scrollIntoView === 'function') {
      mobileCardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // Keyboard navigation across cards (ArrowDown / ArrowUp / Enter / Escape)
  function handleCardKeyDown(e: React.KeyboardEvent, ustaId: string, index: number) {
    if (e.key === 'ArrowDown' || (e.key === 'ArrowRight' && e.target === e.currentTarget)) {
      e.preventDefault();
      const nextIndex = (index + 1) % displayedProfiles.length;
      const nextUsta = displayedProfiles[nextIndex];
      if (nextIndex >= virtualLimit) {
        setVirtualLimit((prev) => Math.min(displayedProfiles.length, prev + VIRTUAL_BATCH_SIZE));
        setTimeout(() => {
          if (nextUsta) {
            const nextEl = cardRefs.current[nextUsta.user_id];
            nextEl?.focus();
            handleSelectMarker(nextUsta.user_id);
          }
        }, 20);
      } else if (nextUsta) {
        const nextEl = cardRefs.current[nextUsta.user_id];
        nextEl?.focus();
        handleSelectMarker(nextUsta.user_id);
      }
    } else if (e.key === 'ArrowUp' || (e.key === 'ArrowLeft' && e.target === e.currentTarget)) {
      e.preventDefault();
      const prevIndex = (index - 1 + displayedProfiles.length) % displayedProfiles.length;
      const prevUsta = displayedProfiles[prevIndex];
      if (prevUsta) {
        const prevEl = cardRefs.current[prevUsta.user_id];
        prevEl?.focus();
        handleSelectMarker(prevUsta.user_id);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      const firstUsta = displayedProfiles[0];
      if (firstUsta) {
        const firstEl = cardRefs.current[firstUsta.user_id];
        firstEl?.focus();
        handleSelectMarker(firstUsta.user_id);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      const lastIndex = displayedProfiles.length - 1;
      const lastUsta = displayedProfiles[lastIndex];
      if (lastIndex >= virtualLimit) {
        setVirtualLimit(displayedProfiles.length);
        setTimeout(() => {
          if (lastUsta) {
            const lastEl = cardRefs.current[lastUsta.user_id];
            lastEl?.focus();
            handleSelectMarker(lastUsta.user_id);
          }
        }, 20);
      } else if (lastUsta) {
        const lastEl = cardRefs.current[lastUsta.user_id];
        lastEl?.focus();
        handleSelectMarker(lastUsta.user_id);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        const profileLink = e.currentTarget.querySelector('a[href]') as HTMLAnchorElement | null;
        profileLink?.click();
      }
    } else if (e.key === 'Escape') {
      setActiveUstaId(null);
      setHoveredPinId(null);
    }
  }

  function handleMobileCardKeyDown(e: React.KeyboardEvent, ustaId: string, index: number) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % displayedProfiles.length;
      if (nextIndex >= virtualLimit) {
        setVirtualLimit((prev) => Math.min(displayedProfiles.length, prev + VIRTUAL_BATCH_SIZE));
      }
      setTimeout(() => {
        const nextUsta = displayedProfiles[nextIndex];
        if (nextUsta) {
          const nextEl = mobileCardRefs.current[nextUsta.user_id];
          nextEl?.focus();
          handleSelectMobileCard(nextUsta.user_id);
        }
      }, 20);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + displayedProfiles.length) % displayedProfiles.length;
      const prevUsta = displayedProfiles[prevIndex];
      if (prevUsta) {
        const prevEl = mobileCardRefs.current[prevUsta.user_id];
        prevEl?.focus();
        handleSelectMobileCard(prevUsta.user_id);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        const profileLink = e.currentTarget.querySelector('a[href]') as HTMLAnchorElement | null;
        profileLink?.click();
      }
    }
  }

  const renderResultContent = ({
    initials,
    craftsman,
    primaryService,
    workshop,
    primaryDistrict,
    areaCount,
    averageRating,
    reviewCount,
    profileHref,
    professionalId,
    surface,
    areas,
    neighborhoods,
  }: {
    initials: string;
    craftsman: string;
    primaryService: string;
    workshop: string;
    primaryDistrict: string;
    areaCount: number;
    averageRating: number;
    reviewCount: number;
    profileHref: string;
    professionalId: string;
    surface: 'desktop' | 'mobile';
    areas: string[];
    neighborhoods: string[];
  }) => {
    const cardKey = `${surface}-${professionalId}`;
    const isPanelOpen = openServiceAreaKey === cardKey;
    const serviceAreaSummary = getServiceAreaSummary(areas, neighborhoods, primaryDistrict);

    return (
      <>
        <div className={resultStyles.avatar} aria-hidden="true">{initials}</div>
        <div className={resultStyles.body}>
          <div className={resultStyles.identity}>
            <h3 className={resultStyles.name}>{craftsman}</h3>
            {verificationConfirmed && <span className={resultStyles.verified} title="Doğrulanmış profil" aria-label="Doğrulanmış profil">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m7.5 12 3 3 6-6" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>}
          </div>
          <p className={resultStyles.service}>{primaryService}</p>
          {workshop && workshop !== primaryService && <p className={resultStyles.workshop}>{workshop}</p>}
          <p className={resultStyles.region}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></svg>
            {primaryDistrict}{areaCount > 1 ? ` ve ${areaCount - 1} ilçe` : ''}
          </p>

          <div className={resultStyles.serviceAreaContainer}>
            <button
              type="button"
              ref={(el) => {
                triggerRefs.current[cardKey] = el;
              }}
              className={`${resultStyles.serviceAreaTrigger} ${isPanelOpen ? resultStyles.serviceAreaTriggerActive : ''}`}
              aria-expanded={isPanelOpen}
              aria-controls={`service-area-panel-${cardKey}`}
              aria-label={`Hizmet bölgesi: ${serviceAreaSummary}`}
              title={`Hizmet bölgesi: ${serviceAreaSummary}. Ayrıntıları aç`}
              onClick={(e) => {
                e.stopPropagation();
                toggleServiceAreaPanel(cardKey);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  e.preventDefault();
                  toggleServiceAreaPanel(cardKey);
                } else if (e.key === 'Escape' && isPanelOpen) {
                  e.stopPropagation();
                  closeServiceAreaPanel(cardKey, true);
                }
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className={resultStyles.serviceAreaBadgeLabel}>Hizmet bölgesi</span>
              <span className={resultStyles.serviceAreaDot} aria-hidden="true">·</span>
              <span className={resultStyles.serviceAreaSummary}>{serviceAreaSummary}</span>
            </button>

            {isPanelOpen && (
              <div
                id={`service-area-panel-${cardKey}`}
                ref={panelRef}
                className={resultStyles.serviceAreaPanel}
                role="region"
                aria-label={`${craftsman} hizmet bölgesi ayrıntıları`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={resultStyles.panelHeader}>
                  <div className={resultStyles.panelTitle}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Hizmet bölgesi ayrıntıları</span>
                  </div>
                  <button
                    type="button"
                    className={resultStyles.panelCloseBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeServiceAreaPanel(cardKey, true);
                    }}
                    aria-label="Hizmet bölgesi panelini kapat"
                    title="Kapat"
                  >
                    ✕
                  </button>
                </div>

                <div className={resultStyles.panelSection}>
                  <span className={resultStyles.panelSectionTitle}>Hizmet Verilen İlçeler:</span>
                  <div className={resultStyles.tagList}>
                    {(areas.length > 0 ? areas : [primaryDistrict || 'Ankara']).map((d) => (
                      <span key={d} className={resultStyles.districtTag}>{d}</span>
                    ))}
                  </div>
                </div>

                {neighborhoods.length > 0 ? (
                  <div className={resultStyles.panelSection}>
                    <span className={resultStyles.panelSectionTitle}>
                      Hizmet Verilen Mahalleler ({neighborhoods.length}):
                    </span>
                    <div className={resultStyles.tagList}>
                      {neighborhoods.map((n) => (
                        <span key={n} className={resultStyles.neighborhoodTag}>{n}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={resultStyles.panelSection}>
                    <span className={resultStyles.panelEmptyNeighborhoods}>
                      {areas.length > 0
                        ? `${areas.join(', ')} genelinde sevk kabul edilmektedir.`
                        : 'Ankara genelinde sevk kabul edilmektedir.'}
                    </span>
                  </div>
                )}

                <p className={resultStyles.panelDisclaimer}>
                  Açık adres gösterilmez. Ustanın sevk kabul ettiği çalışma bölgeleridir.
                </p>
              </div>
            )}
          </div>

          <div className={resultStyles.footer}>
            <div className={resultStyles.rating} aria-label={averageRating > 0 ? `${averageRating.toFixed(1)} puan, ${reviewCount} yorum` : 'Henüz değerlendirme yok'}>
              {averageRating > 0 ? <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1Z"/></svg>
                <strong>{averageRating.toFixed(1)}</strong>
                <span className={resultStyles.count}>({reviewCount} yorum)</span>
              </> : <span className={resultStyles.newProfile}>Henüz yorum yok</span>}
            </div>
            <Link
              href={profileHref}
              className={resultStyles.profileLink}
              aria-label={`${craftsman} — Profili aç`}
              title={`${craftsman} profilini ve hizmet seçeneklerini aç`}
              onClick={() => trackFunnel('profile_opened', { professionalId: professionalId })}
            >
              <span>Profili aç</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>
            </Link>
          </div>
        </div>
      </>
    );
  };

  const renderUstaCard = (profile: UstalarSplitViewProps['profiles'][number], idx: number) => {
    const profileServices = serviceMap[profile.user_id] ?? [];
    const primaryService = profileServices[0] || 'Genel Zanaat';
    const initials = profile.display_name
      .split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const userMetrics = metricsMap?.[profile.user_id];
    const reviewCount = userMetrics?.totalReviews ?? 0;
    const averageRating = userMetrics?.averageRating ?? 0;
    const isCardActive = activeUstaId === profile.user_id;
    const isHovered = hoveredPinId === profile.user_id;
    const areaNames = [...new Set(areaMap[profile.user_id] ?? [])];
    const neighborhoodNames = [...new Set(neighborhoodMap?.[profile.user_id] ?? [])].filter(Boolean);
    const { craftsman, workshop } = parseCraftsmanName(profile.display_name);
    const primaryDistrict = areaNames[0] || profile.city || 'Ankara';
    const profileQuery = serializeDiscoveryFilters({ service: selectedService, district: selectedDistrict });
    const profileHref = `${profileHrefBase}/${profile.user_id}${profileQuery ? `?${profileQuery}` : ''}`;

    return (
      <article
        key={profile.user_id}
        data-professional-result="true"
        ref={(el) => {
          cardRefs.current[profile.user_id] = el;
        }}
        tabIndex={0}
        role="article"
        aria-setsize={displayedProfiles.length}
        aria-posinset={idx + 1}
        aria-label={`${craftsman}, ${primaryService}, ${primaryDistrict}.${verificationConfirmed ? ' Doğrulanmış profil.' : ''} Enter ile profili aç, ok tuşlarıyla ustalar arasında gezin.`}
        className={`usta-card ${resultStyles.result} ${isCardActive || isHovered ? resultStyles.selected : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a, button')) return;
          handleSelectMarker(profile.user_id);
        }}
        onFocus={() => {
          setActiveUstaId(profile.user_id);
          setHoveredPinId(profile.user_id);
          setPanToUstaId(profile.user_id);
          setLiveAnnouncement(`${craftsman} seçildi. Harita odaklandı.`);
        }}
        onMouseEnter={() => {
          setHoveredPinId(profile.user_id);
        }}
        onMouseLeave={() => {
          setHoveredPinId(null);
        }}
        onKeyDown={(e) => handleCardKeyDown(e, profile.user_id, idx)}
      >
        {renderResultContent({
          initials,
          craftsman,
          primaryService,
          workshop,
          primaryDistrict,
          areaCount: areaNames.length,
          averageRating,
          reviewCount,
          profileHref,
          professionalId: profile.user_id,
          surface: 'desktop',
          areas: areaNames,
          neighborhoods: neighborhoodNames,
        })}
      </article>
    );
  };

  return (
    <div className={styles.splitPageWrapper} data-directory-availability={availability ?? 'unknown'}>
      {/* Screen Reader Live Region Announcement (WCAG 2.1 AA) */}
      <div
        className={styles.srOnly}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveAnnouncement}
      </div>

      {/* View Mode & Filter Controls Header */}
      <div className={styles.viewModeHeader}>
        <div className={styles.viewModeToggle} role="group" aria-label="Görünüm Seçimi">
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${displayedViewMode === 'split' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => handleViewModeChange('split')}
            aria-pressed={displayedViewMode === 'split'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.toggleIcon}>
              <rect x="1" y="1" width="6.5" height="14" rx="2" fill="currentColor" opacity="0.9"/>
              <rect x="8.5" y="1" width="6.5" height="14" rx="2" fill="currentColor" opacity="0.45"/>
            </svg>
            <span className={styles.toggleLabelFull}>Bölünmüş Ekran</span>
            <span className={styles.toggleLabelShort}>Split</span>
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${displayedViewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => handleViewModeChange('list')}
            aria-pressed={displayedViewMode === 'list'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.toggleIcon}>
              <rect x="1" y="2" width="14" height="2.5" rx="1.25" fill="currentColor"/>
              <rect x="1" y="6.75" width="14" height="2.5" rx="1.25" fill="currentColor"/>
              <rect x="1" y="11.5" width="14" height="2.5" rx="1.25" fill="currentColor"/>
            </svg>
            <span className={styles.toggleLabelFull}>Liste Görünümü</span>
            <span className={styles.toggleLabelShort}>Liste</span>
          </button>
          <button
            type="button"
            className={`${styles.viewToggleBtn} ${displayedViewMode === 'map' ? styles.viewToggleBtnActive : ''}`}
            onClick={() => handleViewModeChange('map')}
            aria-pressed={displayedViewMode === 'map'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" className={styles.toggleIcon}>
              <circle cx="8" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M8 14C8 14 3 10 3 6.5a5 5 0 0 1 10 0C13 10 8 14 8 14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            <span className={styles.toggleLabelFull}>Tam Harita</span>
            <span className={styles.toggleLabelShort}>Harita</span>
          </button>
        </div>

        <div className={styles.splitSummaryRow}>
          <span className={styles.splitSummaryBadge}>
            <span className={styles.statusLiveDot} aria-hidden="true" />
            <span className={styles.summaryTextFull} data-testid="usta-result-summary">
              {displayedProfiles.length} usta{visibleUstaIds !== null ? ' · Harita alanında' : ''}
            </span>
            <span className={styles.summaryTextShort}>
              {displayedProfiles.length} Usta
            </span>
          </span>
          <label className={styles.sortInlineControl} htmlFor="usta-sort-inline">
            <span>Sırala</span>
            <select
              id="usta-sort-inline"
              value={sortMode}
              onChange={(e) => handleSortModeChange(e.target.value as 'recommended' | 'rating' | 'jobs')}
            >
              <option value="recommended">Önerilen</option>
              <option value="rating">En yüksek puan</option>
              <option value="jobs">En çok iş</option>
            </select>
          </label>
          {visibleUstaIds !== null && (
            <button
              type="button"
              className={styles.spatialResetFilterBtn}
              onClick={handleResetSpatialFilter}
              title="Bölge filtresini kaldır ve tüm Ankara ustalarını listele"
            >
              <span className={styles.resetLabelFull}>✕ Tüm Ankara&apos;yı Göster</span>
              <span className={styles.resetLabelShort}>✕ Sıfırla</span>
            </button>
          )}

        </div>
      </div>

      {/* DB Connection Warning Banner */}
      {hasDbError && (
        <div className={styles.dbErrorBanner} role="alert">
          <span className={styles.dbErrorLabel}>Uyarı</span>
          <span>Usta veritabanına ulaşılamadı. Doğrulanmış temsilci usta ağı ile kesintisiz çalışılıyor.</span>
        </div>
      )}

      {/* Primary discovery filters: keep the first decision to service + area. */}
        <div className={styles.chipFilterStrip} role="search" aria-label="Usta filtreleri">
        {/* Hidden Accessible Form Controls for Screen Readers & Tests */}
        <label htmlFor="service-select-sr" className={styles.srOnly}>Hizmet</label>
        <select
          id="service-select-sr"
          className={styles.srOnly}
          value={selectedService ?? ''}
          onChange={(e) => navigateWithFilter('service', e.target.value)}
        >
          <option value="">Tüm hizmetler</option>
          {servicesList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="district-select-sr" className={styles.srOnly}>İlçe</label>
        <select
          id="district-select-sr"
          className={styles.srOnly}
          value={selectedDistrict ?? ''}
          onChange={(e) => navigateWithFilter('district', e.target.value)}
        >
          <option value="">Tüm ilçeler</option>
          {districtsList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className={styles.filterSelectGroup} role="group" aria-label="Hizmet filtresi">
          <label className={styles.filterSelectLabel} htmlFor="service-filter-visible">Hizmet</label>
          <select
            id="service-filter-visible"
            className={styles.filterSelect}
            value={selectedService ?? ''}
            onChange={(e) => navigateWithFilter('service', e.target.value)}
          >
            <option value="">Tüm hizmetler</option>
            {servicesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className={styles.filterSelectGroup} role="group" aria-label="İlçe filtresi">
          <label className={styles.filterSelectLabel} htmlFor="district-filter-visible">İlçe</label>
          <select
            id="district-filter-visible"
            className={styles.filterSelect}
            value={selectedDistrict ?? ''}
            onChange={(e) => navigateWithFilter('district', e.target.value)}
          >
            <option value="">Tüm ilçeler</option>
            {districtsList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <button
          type="button"
          className={`${styles.advancedFilterButton} ${isFilterDrawerOpen ? styles.advancedFilterButtonActive : ''}`}
          aria-expanded={isFilterDrawerOpen}
          aria-controls="usta-advanced-filters"
          aria-label="Filtrele, diğer seçenekleri aç"
          title="Diğer filtreleri aç"
          onClick={() => setIsFilterDrawerOpen((open) => !open)}
        >
          <span>Daha fazla filtre</span>
          {activeFilterCount > 0 ? <span className={styles.advancedFilterCount}>{activeFilterCount}</span> : null}
        </button>

        {/* Clear all filters */}
        {(hasFilters || searchQuery) && (
          <button
            type="button"
            className={styles.chipClearAll}
            onClick={() => {
              setSearchQuery('');
              if (hasFilters) {
                router.replace(clearDiscoveryHref);
              }
            }}
            aria-label="Tüm filtreleri ve aramayı temizle"
          >
            ✕ Tümünü Temizle
          </button>
        )}
      </div>

      {(selectedService || selectedDistrict || searchQuery) && <div className={styles.appliedFilterRow} aria-label="Uygulanan filtreler">
        <span className={styles.appliedFilterLabel}>Uygulanan filtreler</span>
        {selectedService && (
          <button type="button" className={styles.appliedFilterChip} onClick={() => navigateWithFilter('service', '')}>
            Hizmet: {servicesList.find((service) => service.id === selectedService)?.name ?? selectedService}
            <span aria-hidden="true">×</span>
          </button>
        )}
        {selectedDistrict && (
          <button type="button" className={styles.appliedFilterChip} onClick={() => navigateWithFilter('district', '')}>
            İlçe: {selectedDistrict}<span aria-hidden="true">×</span>
          </button>
        )}
        {searchQuery && (
          <button type="button" className={styles.appliedFilterChip} onClick={() => setSearchQuery('')}>
            Arama: {searchQuery}<span aria-hidden="true">×</span>
          </button>
        )}
      </div>}

      {isFilterDrawerOpen && (
        <div id="usta-advanced-filters" className={styles.advancedFilterDrawer}>
          <div className={styles.advancedFilterHeader}>
            <strong>Diğer filtreler</strong>
            <span>Usta, atölye veya uzmanlık adıyla ara</span>
          </div>
          <div className={styles.filterSearchBox}>
            <span className={styles.filterSearchIcon} aria-hidden="true">⌕</span>
            <label htmlFor="usta-advanced-search" className={styles.srOnly}>Usta veya uzmanlık ara</label>
            <input
              id="usta-advanced-search"
              type="search"
              className={styles.filterSearchInput}
              placeholder="Usta, atölye veya uzmanlık ara"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className={styles.filterSearchClearBtn} onClick={() => setSearchQuery('')} aria-label="Aramayı temizle">
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Area according to viewMode */}
      {displayedViewMode === 'map' ? (
        <div>
          <div className={dirStyles.mapContainerSection}>
            <AnkaraInteractiveMap
              initialDistrict={selectedDistrict}
              tradespeopleMarkers={mapMarkers}
              activeTradespersonId={hoveredPinId ?? activeUstaId}
              onSelectTradespersonMarker={handleSelectMarker}
              onVisibleTradespeopleChange={handleVisibleTradespeopleChange}
              resetTrigger={spatialResetTrigger}
              onLocationSelect={(district) => navigateWithFilter('district', district)}
            />
          </div>
          <div style={{ marginTop: '28px' }}>
            <div className={dirStyles.directoryListHeading}>
              <h2>Ustalar</h2>
              <span aria-label={`${displayedProfiles.length} usta gösteriliyor`}>
                {displayedProfiles.length} / {count} gösteriliyor
              </span>
            </div>
            <div className={styles.gridFull} role="group" aria-label="Ustalar">
              {virtualizedProfiles.map((profile, idx) => renderUstaCard(profile, idx))}
            </div>
            {displayedProfiles.length > virtualLimit && (
              <div ref={sentinelRef} className={styles.virtualSentinel}>
                <div className={styles.virtualLoadingHint}>
                  <span className={styles.virtualSpinDot} />
                  <span>{displayedProfiles.length - virtualLimit} usta sanal olarak yükleniyor...</span>
                  <button
                    type="button"
                    className={styles.virtualLoadAllBtn}
                    onClick={() => setVirtualLimit(displayedProfiles.length)}
                  >
                    Tümünü Yükle ({displayedProfiles.length})
                  </button>
                </div>
              </div>
            )}
            <nav className={dirStyles.pagination} aria-label="Usta sayfaları" style={{ marginTop: '20px' }}>
              {page > 1 && (
                <Link href={`${baseHref}&page=${page - 1}`} className={dirStyles.pageBtn}>
                  ← Önceki
                </Link>
              )}
              <span className={dirStyles.pageInfo}>Sayfa {page}</span>
              {page * pageSize < count && (
                <Link href={`${baseHref}&page=${page + 1}`} className={dirStyles.pageBtn}>
                  Sonraki →
                </Link>
              )}
            </nav>
          </div>
        </div>
      ) : (
        <div className={`${displayedViewMode === 'split' ? styles.splitLayout : ''} ${isMapExpanded ? styles.splitLayoutExpanded : ''}`}>
          {/* Left Column: Scrollable List of Usta Cards */}
          <div
            className={`${displayedViewMode === 'split' ? styles.splitListPane : ''} ${isMapExpanded ? styles.splitListPaneHidden : ''}`}
            role="region"
            aria-label="Usta Listesi"
          >
            {displayedProfiles.length === 0 ? (
              <div
                className={dirStyles.emptyState}
                data-testid="directory-empty-state"
                data-directory-availability={availability ?? 'unknown'}
              >
                <span className={dirStyles.emptyIcon} aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 5.5 9 3l6 3 5-2.5v15L15 21l-6-3-5 2.5v-15Z" />
                    <path d="M9 3v15M15 6v15" />
                  </svg>
                </span>
                <h2 className={dirStyles.emptyTitle}>
                  {searchQuery
                    ? `"${searchQuery}" ile eşleşen usta bulunamadı`
                    : visibleUstaIds !== null
                    ? 'Bu bölgede doğrulanmış usta bulunamadı.'
                    : getAvailabilityCopy(availability).title}
                </h2>
                <p className={dirStyles.emptyDesc}>
                  {searchQuery
                    ? `Aramanızla eşleşen doğrulanmış usta kaydı bulunamadı. Farklı bir terim arayabilir veya aramayı temizleyebilirsiniz.`
                    : visibleUstaIds !== null
                    ? 'Mevcut harita görünümünüzde usta bulunmuyor. Haritayı uzaklaştırabilir, başka bir bölgeye kaydırabilir veya tüm Ankara ustalarını listeleyebilirsiniz.'
                    : getAvailabilityCopy(availability).description}
                </p>
                <div className={dirStyles.emptyActions}>
                  {searchQuery ? (
                    <button
                      type="button"
                      className={dirStyles.ctaBtn}
                      onClick={() => setSearchQuery('')}
                    >
                      ✕ Aramayı Temizle
                    </button>
                  ) : visibleUstaIds !== null ? (
                    <button
                      type="button"
                      className={dirStyles.ctaBtn}
                      onClick={handleResetSpatialFilter}
                    >
                      Tüm Ankara&apos;yı Göster ({count} Usta)
                    </button>
                  ) : availability === 'limited' ? (
                    <Link href={clearDiscoveryHref} className={dirStyles.ctaBtn}>
                      Tüm ustaları göster
                    </Link>
                  ) : availability === 'waitlist' ? (
                    <>
                      <Link href="/#services" className={dirStyles.ctaBtn}>
                        İhtiyacını anlat
                      </Link>
                      {hasFilters ? (
                        <Link href={clearDiscoveryHref} className={dirStyles.secondaryBtn}>
                          Tüm ustaları gör
                        </Link>
                      ) : null}
                    </>
                  ) : availability === 'unavailable' ? (
                    <Link href="/#services" className={dirStyles.ctaBtn}>
                      Pilot kapsamını incele
                    </Link>
                  ) : hasFilters ? (
                    <Link href={clearDiscoveryHref} className={dirStyles.ctaBtn}>
                      Filtreleri temizle
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div
                  className={displayedViewMode === 'split' ? styles.gridSplit : styles.gridFull}
                  role="group"
                  aria-label="Ustalar"
                >
                  {virtualizedProfiles.map((profile, idx) => renderUstaCard(profile, idx))}
                </div>

                {displayedProfiles.length > virtualLimit && (
                  <div ref={sentinelRef} className={styles.virtualSentinel}>
                    <div className={styles.virtualLoadingHint}>
                      <span className={styles.virtualSpinDot} />
                      <span>{displayedProfiles.length - virtualLimit} usta sanal olarak yükleniyor...</span>
                      <button
                        type="button"
                        className={styles.virtualLoadAllBtn}
                        onClick={() => setVirtualLimit(displayedProfiles.length)}
                      >
                        Tümünü Yükle ({displayedProfiles.length})
                      </button>
                    </div>
                  </div>
                )}

                {/* Pagination (only visible when not spatially filtered) */}
                {visibleUstaIds === null && (
                  <nav className={dirStyles.pagination} aria-label="Usta sayfaları">
                    {page > 1 && (
                      <Link href={`${baseHref}&page=${page - 1}`} className={dirStyles.pageBtn}>
                        ← Önceki
                      </Link>
                    )}
                    <span className={dirStyles.pageInfo}>Sayfa {page}</span>
                    {page * pageSize < count && (
                      <Link href={`${baseHref}&page=${page + 1}`} className={dirStyles.pageBtn}>
                        Sonraki →
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Right Column: Sticky Synchronized Ankara Map in Split View */}
          {displayedViewMode === 'split' && (
            <div
              className={`${styles.splitMapPane} ${isMapExpanded ? styles.splitMapPaneExpanded : ''}`}
              role="region"
              aria-label="Ankara Usta Arama Haritası"
            >
              {/* Mini expand / contract button in the top right (Airbnb & Modern Map Benchmark - User Request) */}
              <button
                type="button"
                className={styles.miniExpandBtn}
                onClick={() => setIsMapExpanded(prev => !prev)}
                title={isMapExpanded ? "Haritayı daralt (Bölünmüş ekrana dön)" : "Haritayı büyüt (Tam ekran harita)"}
                aria-label={isMapExpanded ? "Haritayı daralt" : "Haritayı büyüt"}
                aria-expanded={isMapExpanded}
              >
                {isMapExpanded ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={styles.miniExpandSvg}
                  >
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                ) : (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={styles.miniExpandSvg}
                  >
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                )}
                <span>{isMapExpanded ? 'Daralt' : 'Büyüt'}</span>
              </button>

              {(activeProfile || visibleUstaIds !== null) && (
                <div className={styles.mapSelectionNotice} role="note" aria-live="polite" aria-atomic="true" aria-label="Harita ve liste durumu">
                  <span className={styles.mapSelectionDot} aria-hidden="true" />
                  {activeProfile ? (
                    <>
                      <span><strong>{parseCraftsmanName(activeProfile.display_name).craftsman}</strong> seçildi</span>
                      <span className={styles.mapSelectionHint}>Listeyle eşleşti</span>
                    </>
                  ) : null}
                  {visibleUstaIds !== null ? (
                    <span className={styles.mapRegionHint}>
                      {displayedProfiles.length} usta bu bölgede
                    </span>
                  ) : null}
                </div>
              )}

              {/* Floating restore list button when expanded */}
              {isMapExpanded && (
                <button
                  type="button"
                  className={styles.floatingShowListBtn}
                  onClick={() => setIsMapExpanded(false)}
                  title="Listeyi ve bölünmüş görünümü geri yükle"
                >
                  <span>Listeyi Göster ({count} Usta)</span>
                </button>
              )}

              <AnkaraInteractiveMap
                initialDistrict={selectedDistrict}
                isSplitPane
                tradespeopleMarkers={mapMarkers}
                activeTradespersonId={hoveredPinId ?? activeUstaId}
                onSelectTradespersonMarker={handleSelectMarker}
                onHoverTradespersonMarker={(id) => setHoveredPinId(id)}
                onVisibleTradespeopleChange={handleVisibleTradespeopleChange}
                resetTrigger={spatialResetTrigger}
                panToTradespersonId={panToUstaId}
                onLocationSelect={(district) => navigateWithFilter('district', district)}
              />

              {/* Mobile Bottom Sheet Drawer (Steven Hoober Thumb-Zone Standard < 768px) */}
              <div
                className={`${styles.unifiedBottomSheet} ${
                  isDrawerCollapsed ? styles.unifiedBottomSheetCollapsed : ''
                } ${
                  drawerSnap === 'full' ? styles.unifiedBottomSheetFull : styles.unifiedBottomSheetHalf
                }`}
                role="region"
                aria-label="Mobil Usta Seçim Çekmecesi"
              >
                {/* Drag handle / toggle bar */}
                <div
                  className={styles.mobileDrawerHandleBar}
                  role="button"
                  tabIndex={0}
                  aria-label="Usta kartları çekmece tutamacı"
                  aria-expanded={!isDrawerCollapsed}
                  aria-controls="mobile-usta-carousel"
                  onClick={toggleDrawerCollapse}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDrawerCollapse();
                    }
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div className={styles.mobileDrawerHandle} aria-hidden="true" />
                  <div className={styles.mobileDrawerHeader}>
                    <span className={styles.mobileDrawerCount}>
                      <span className={styles.statusLiveDot} aria-hidden="true" />
                      <span className={styles.mobileCountTextFull}>
                        {displayedProfiles.length} usta {visibleUstaIds !== null ? '· Harita alanında' : ''}
                      </span>
                      <span className={styles.mobileCountTextShort}>
                        {displayedProfiles.length} Usta
                      </span>
                    </span>
                    <div className={styles.mobileDrawerActions}>
                      {!isDrawerCollapsed && (
                        <button
                          type="button"
                          className={styles.mobileSnapModeBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerSnap((prev) => (prev === 'full' ? 'half' : 'full'));
                          }}
                          aria-label={drawerSnap === 'full' ? 'Kartları yatay görünümde aç' : 'Tüm usta listesini aç'}
                          aria-expanded={drawerSnap === 'full'}
                          title={drawerSnap === 'full' ? 'Karusel moduna dön' : 'Tüm listeyi dikey aç'}
                        >
                          <span>{drawerSnap === 'full' ? '⌃ Kartlar' : '☰ Listeyi aç'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.mobileDrawerCollapseBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDrawerCollapse();
                        }}
                        aria-label={isDrawerCollapsed ? 'Usta çekmecesini aç' : 'Usta çekmecesini daralt'}
                      >
                        <span>{isDrawerCollapsed ? '⌃ Ustaları Göster' : '⌄ Haritayı Gör'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Horizontal Snap Carousel or Vertical Full List */}
                {!isDrawerCollapsed && (
                  <div
                    ref={mobileCarouselRef}
                    id="mobile-usta-carousel"
                    className={`${styles.mobileCarouselTrack} ${
                      drawerSnap === 'full' ? styles.mobileCarouselTrackFull : ''
                    }`}
                    role="list"
                    aria-label="Usta Kartları Kaydırıcı"
                    tabIndex={0}
                  >
                    {displayedProfiles.length === 0 ? (
                      <div className={styles.mobileEmptyState}>
                        <p>Bu bölgede doğrulanmış usta bulunamadı.</p>
                        <button
                          type="button"
                          className={styles.mobileResetBtn}
                          onClick={handleResetSpatialFilter}
                        >
                          Tüm Ankara&apos;yı Göster
                        </button>
                      </div>
                    ) : (
                      <>
                        {virtualizedProfiles.map((profile, idx) => {
                          const profileServices = serviceMap[profile.user_id] ?? [];
                          const initials = profile.display_name
                            .split(' ')
                            .map((w: string) => w[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();
                          const userMetrics = metricsMap?.[profile.user_id];
                          const averageRating = userMetrics?.averageRating ?? 0;
                          const isCardActive =
                            activeUstaId === profile.user_id || hoveredPinId === profile.user_id;
                          const { craftsman, workshop } = parseCraftsmanName(profile.display_name);
                          const primaryService = profileServices[0] || 'Genel Zanaat';
                          const areaNames = [...new Set(areaMap[profile.user_id] ?? [])];
                          const neighborhoodNames = [...new Set(neighborhoodMap?.[profile.user_id] ?? [])].filter(Boolean);
                          const primaryDistrict = areaNames[0] || profile.city || 'Ankara';
                          const profileQuery = serializeDiscoveryFilters({ service: selectedService, district: selectedDistrict });
                          const profileHref = `${profileHrefBase}/${profile.user_id}${profileQuery ? `?${profileQuery}` : ''}`;

                          return (
                            <div
                              key={`mobile-${profile.user_id}`}
                              ref={(el) => {
                                mobileCardRefs.current[profile.user_id] = el;
                              }}
                              tabIndex={0}
                              role="listitem"
                              aria-current={isCardActive ? 'true' : undefined}
                              aria-label={`${craftsman}, ${primaryService}, ${primaryDistrict}.${verificationConfirmed ? ' Doğrulanmış profil.' : ''} Enter ile profili aç, ok tuşlarıyla ustalar arasında gezin.`}
                              className={`${resultStyles.result} ${resultStyles.carousel} ${drawerSnap === 'full' ? resultStyles.carouselFull : ''} ${isCardActive ? `${resultStyles.selected} ${styles.mobileCarouselCardActive}` : ''}`}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest('a, button')) return;
                                handleSelectMobileCard(profile.user_id);
                              }}
                              onFocus={() => handleSelectMobileCard(profile.user_id)}
                              onKeyDown={(e) => handleMobileCardKeyDown(e, profile.user_id, idx)}
                            >
                              {renderResultContent({
                                initials,
                                craftsman,
                                primaryService,
                                workshop,
                                primaryDistrict,
                                areaCount: areaNames.length,
                                averageRating,
                                reviewCount: userMetrics?.totalReviews ?? 0,
                                profileHref,
                                professionalId: profile.user_id,
                                surface: 'mobile',
                                areas: areaNames,
                                neighborhoods: neighborhoodNames,
                              })}
                            </div>
                          );
                        })}
                        {displayedProfiles.length > virtualLimit && (
                          <button
                            type="button"
                            className={styles.mobileLoadMorePill}
                            onClick={() => setVirtualLimit(displayedProfiles.length)}
                            aria-label={`Kalan ${displayedProfiles.length - virtualLimit} ustayı yükle`}
                          >
                            +{displayedProfiles.length - virtualLimit} Usta Daha
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Thumb-Zone Floating Action Pill (Airbnb 2026 Thumb-Zone Pattern) */}
              <div
                className={`${styles.floatingMobileBar} ${
                  isDrawerCollapsed ? styles.floatingMobileBarVisible : styles.floatingMobileBarHidden
                }`}
              >
                <button
                  type="button"
                  className={styles.floatingMobileBtn}
                  onClick={toggleDrawerCollapse}
                  aria-label={isDrawerCollapsed ? 'Mobil usta listesini göster' : 'Mobil haritayı tam tuval gör'}
                >
                  <span>Ustaları Göster ({displayedProfiles.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Mobile Toggle, visible only in list mode */}
      {displayedViewMode === 'list' && (
        <div className={styles.floatingMobileBar}>
          <button
            type="button"
            className={styles.floatingMobileBtn}
            onClick={() => handleViewModeChange('split')}
            aria-label="Harita görünümüne geç"
          >
            <span>Haritada Gör</span>
          </button>
        </div>
      )}

      {/* Quick Quote & Dispatch Lead Modal (Plerdy WML-011 / WML-017 / WML-023) */}
      {quoteModal && (
        <div
          className={styles.quoteModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quote-dialog-title"
          onClick={() => setQuoteModal(null)}
        >
          <div
            className={styles.quoteModalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.quoteModalCloseBtn}
              onClick={() => setQuoteModal(null)}
              aria-label="Modalı kapat"
            >
              <IconClose size={18} />
            </button>

            {!quoteSubmitted ? (
              <>
                <div className={styles.quoteModalHeader}>
                  <div className={styles.quoteModalBadgeRow}>
                    <span className={styles.quoteModalBadge}>Hızlı Teklif & Keşif</span>
                    <span className={styles.quoteModalSlaBadge}>{quoteModal.sla}</span>
                  </div>
                  <h2 id="quote-dialog-title" className={styles.quoteModalTitle}>
                    {quoteModal.craftsman}: Ücretsiz Fiyat Teklifi Al
                  </h2>
                  {quoteModal.workshop && (
                    <p className={styles.quoteModalWorkshop}>{quoteModal.workshop}</p>
                  )}
                  <div className={styles.quoteModalMetaRow}>
                    <span>{quoteModal.service}</span>
                    <span>·</span>
                    <span className={styles.quoteModalMetaLocation}>
                      <IconLocation size={14} />
                      {quoteModal.district}
                    </span>
                    <span>·</span>
                    <span className={styles.quoteModalPrice}>{quoteModal.price} Taban</span>
                  </div>
                </div>

                <form
                  className={styles.quoteModalForm}
                  onSubmit={handleQuoteSubmit}
                >
                  <div className={styles.quoteFormField}>
                    <label htmlFor="quote-problem" className={styles.quoteFormLabel}>
                      İhtiyacınız Olan Hizmet veya Arıza Özeti *
                    </label>
                    <input
                      id="quote-problem"
                      type="text"
                      required
                      placeholder="Örn: Mutfak bataryası su kaçırıyor veya dolap montajı"
                      className={styles.quoteFormInput}
                      value={quoteForm.problem}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, problem: e.target.value }))}
                    />
                  </div>

                  {/* Urgency Selector (Plerdy WML-018 - High Conversion Urgency Segmentation) */}
                  <div className={styles.quoteFormField}>
                    <label className={styles.quoteFormLabel}>
                      İş Ne Zaman Başlasın? (Tercih)
                    </label>
                    <div className={styles.quoteUrgencyGroup} role="radiogroup" aria-label="Hizmet Aciliyeti">
                      {['Hemen (Acil Sevk)', 'Bugün İçinde', 'Hafta Sonu'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          role="radio"
                          aria-checked={quoteForm.urgency === opt}
                          className={`${styles.quoteUrgencyPill} ${
                            quoteForm.urgency === opt ? styles.quoteUrgencyPillActive : ''
                          }`}
                          onClick={() => setQuoteForm(prev => ({ ...prev, urgency: opt }))}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.quoteFormField}>
                    <label htmlFor="quote-phone" className={styles.quoteFormLabel}>
                      İletişim Numaranız (Ustanın Arayacağı Hat) *
                    </label>
                    <input
                      id="quote-phone"
                      type="tel"
                      required
                      placeholder="05** *** ** **"
                      className={styles.quoteFormInput}
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: formatTurkishPhone(e.target.value) }))}
                      maxLength={14}
                    />
                  </div>

                  <div className={styles.quoteFormField}>
                    <label htmlFor="quote-address" className={styles.quoteFormLabel}>
                      Mahalle / Adres Notu (Opsiyonel)
                    </label>
                    <input
                      id="quote-address"
                      type="text"
                      placeholder="Örn: Ayrancı Mah. Güvenlik Cad."
                      className={styles.quoteFormInput}
                      value={quoteForm.addressDetail}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, addressDetail: e.target.value }))}
                    />
                  </div>

                  {/* Plerdy WML-015 Trust Proof and Guarantees */}
                  <div className={styles.quoteModalTrustStrip}>
                    <div className={styles.quoteTrustItem}>
                      <IconShield size={15} />
                      <span><strong>Sabit Fiyat Garantisi:</strong> İş onaylanmadan ekstra ücret talep edilmez.</span>
                    </div>
                    <div className={styles.quoteTrustItem}>
                      <IconShield size={15} />
                      <span><strong>KVKK 6698 Korumalı:</strong> İletişim bilginiz yalnızca seçilen ustayla paylaşılır.</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={styles.quoteModalSubmitBtn}
                    disabled={isSubmittingQuote}
                  >
                    <span>{isSubmittingQuote ? 'İletiliyor...' : 'Ücretsiz Fiyat Teklifi İste →'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.quoteModalSuccess}>
                <div className={styles.quoteSuccessIcon}>✓</div>
                {quoteReference && (
                  <div className={styles.quoteReferenceBadge}>
                    <span className={styles.quoteReferenceLabel}>Takip / Referans Kodu:</span>
                    <strong className={styles.quoteReferenceCode}>{quoteReference}</strong>
                  </div>
                )}
                <h3 className={styles.quoteSuccessTitle}>Talebiniz Başarıyla İletildi!</h3>
                <p className={styles.quoteSuccessDesc}>
                  <strong>{quoteModal.craftsman}</strong> ({quoteModal.district}) bilgilendirildi. Ortalama <strong>{quoteModal.sla}</strong> içinde belirttiğiniz numaradan ({quoteForm.phone || '05** *** ** **'}) sizinle iletişime geçecektir.
                </p>
                <div className={styles.quoteSuccessActions}>
                  <a
                    href={`https://wa.me/908503080606?text=${encodeURIComponent(
                      `Merhaba, ${quoteModal.craftsman} için ${quoteReference} referans kodlu hızlı teklif talebim hakkında bilgi almak istiyorum.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.quoteWhatsAppDirectBtn}
                  >
                    <span>WhatsApp ile Öncelikli İlet</span>
                  </a>
                  <button
                    type="button"
                    className={styles.quoteSuccessCloseBtn}
                    onClick={() => setQuoteModal(null)}
                  >
                    Haritaya Dön
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public evidence contract: explain what the directory can actually show. */}
      {trustModalOpen && (
        <div
          className={styles.quoteModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="trust-dialog-title"
          onClick={() => setTrustModalOpen(false)}
        >
          <div
            className={styles.quoteModalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.quoteModalCloseBtn}
              onClick={() => setTrustModalOpen(false)}
              aria-label="Modalı kapat"
            >
              ✕
            </button>

            <div className={styles.trustModalHeader}>
              <div className={styles.trustModalIconWrap} aria-hidden="true">✓</div>
              <h2 id="trust-dialog-title" className={styles.quoteSuccessTitle}>
                Profil kanıtları
              </h2>
              <p className={styles.trustModalSubtitle}>
                Her bilgi, yalnızca ilgili kaydı bulunduğunda gösterilir. Fiyat, garanti veya teslim süresi bu ekranda varsayılmaz.
              </p>
            </div>

            <div className={styles.trustModalPillars}>
              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon} aria-hidden="true">01</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Mesleki belge kontrolü</h3>
                  <p className={styles.trustPillarDesc}>
                    Profil dizinde görünüyorsa güncel mesleki belge kontrolü tamamlanmıştır.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon} aria-hidden="true">02</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Onaylı değerlendirmeler</h3>
                  <p className={styles.trustPillarDesc}>
                    Puan ve yorum yalnızca moderasyondan geçmiş değerlendirme kaydı varsa görünür.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon} aria-hidden="true">03</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Hizmet bölgeleri</h3>
                  <p className={styles.trustPillarDesc}>
                    İlçe ve mahalle bilgisi, ustanın profilinde tanımlı alanlardan gelir; açık adres gösterilmez.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon} aria-hidden="true">04</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Teklif öncesi kapsam</h3>
                  <p className={styles.trustPillarDesc}>
                    Hizmet, konum ve iş kapsamı talep içinde netleşir; net fiyat yalnızca ustanın teklifinde oluşur.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.trustModalActions}>
              <button
                type="button"
                className={styles.quoteSuccessCloseBtn}
                onClick={() => setTrustModalOpen(false)}
              >
                Anladım, Haritaya Dön
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
