'use client';

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ANKARA_PILOT_SUPPORT, buildWhatsAppSupportUrl } from '../lib/pilotSupport';
import AnkaraInteractiveMap from '../components/map/AnkaraInteractiveMap';
import { generateUstaMapMarkers, type TradespersonMetrics } from './ustaCoordinates';
import styles from './ustalarSplitView.module.css';
import dirStyles from './directory.module.css';

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
  /** Optional detail route prefix for non-production directory concepts. */
  profileHrefBase?: string;
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
  if (!districtName) return '⚡ ~15–25 dk Sevk';
  const norm = districtName.toLowerCase().trim();
  const sla = DISTRICT_SLA_MAP[norm] || '~18–28 dk';
  return `⚡ ${sla} Sevk`;
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
  if (c.includes('tesisat') || c.includes('musluk')) return '🔧';
  if (c.includes('elektrik')) return '⚡';
  if (c.includes('ahşap') || c.includes('mobilya') || c.includes('marangoz')) return '🪚';
  if (c.includes('boya') || c.includes('badana')) return '🎨';
  if (c.includes('mekanik') || c.includes('metal') || c.includes('kaynak') || c.includes('montaj')) return '🛠️';
  if (c.includes('temizlik')) return '🧹';
  return '⭐';
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
  profileHrefBase = '/ustalar',
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
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileCardRefs = useRef<Record<string, HTMLElement | null>>({});
  const mobileCarouselRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const prevVisibleRef = useRef<string[] | null>(null);
  const activeFilterCount = Number(Boolean(selectedService)) + Number(Boolean(selectedDistrict)) + Number(Boolean(searchQuery));

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
    urgency: '⚡ Hemen (Acil Sevk)',
  });

  // Emergency Dispatch & Direct Calling Modal state (Plerdy WML-002 / WML-004 / WML-045)
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyContext, setEmergencyContext] = useState<{
    craftsman?: string;
    district?: string;
    service?: string;
  } | null>(null);

  const handleOpenEmergencyCall = (craftsman?: string, district?: string, service?: string) => {
    setEmergencyContext({ craftsman, district, service });
    setEmergencyModalOpen(true);
    setLiveAnnouncement('Acil Usta ve Nöbetçi Sevk Hattı penceresi açıldı.');
  };

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
    params.delete('page');
    // Keep the selected view in the URL even for the default split view. This
    // makes filter changes, refresh, and browser history preserve one state.
    params.set('view', displayedViewMode);
    if (key === 'service') {
      if (value) params.set('service', value);
      else params.delete('service');
    } else {
      if (value) params.set('district', value);
      else params.delete('district');
    }
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  }, [router, pathname, displayedViewMode]);

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

    syncViewFromUrl(searchParams.get('view'));
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
        setLiveAnnouncement('Usta çekmecesi açıldı. Usta kartları görüntülenebilir.');
      } else if (drawerSnap === 'half') {
        setDrawerSnap('full');
        setLiveAnnouncement('Usta çekmecesi tam ekran listeye genişletildi.');
      }
    } else if (deltaY > 35) {
      // Swiped DOWN
      if (drawerSnap === 'full') {
        setDrawerSnap('half');
        setLiveAnnouncement('Usta çekmecesi yarı boyuta getirildi.');
      } else if (drawerSnap === 'half') {
        setIsDrawerCollapsed(true);
        setDrawerSnap('peek');
        setLiveAnnouncement('Usta çekmecesi daraltıldı. Harita tam ekranda görüntülenebilir.');
      }
    }
  }

  function toggleDrawerCollapse() {
    if (isDrawerCollapsed) {
      setIsDrawerCollapsed(false);
      setDrawerSnap('half');
      setLiveAnnouncement('Usta çekmecesi açıldı.');
    } else {
      setIsDrawerCollapsed(true);
      setDrawerSnap('peek');
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
    return generateUstaMapMarkers(profiles, areaMap, serviceMap, neighborhoodMap, metricsMap);
  }, [profiles, areaMap, serviceMap, neighborhoodMap, metricsMap]);

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
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    params.set('view', mode);
    const qs = params.toString();
    const nextUrl = `${pathname}${qs ? `?${qs}` : ''}`;
    // View changes only alter the mounted client surface. Native history keeps
    // back/forward deterministic even when the RSC server payload is cached.
    window.history.pushState({}, '', nextUrl);
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
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    params.set('sort', mode);
    // Sorting is orthogonal to the selected surface. Preserve the current
    // list/map/split view instead of writing an invalid `view=rating` value.
    params.set('view', displayedViewMode);
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  function handleResetSpatialFilter() {
    setVisibleUstaIds(null);
    setSpatialResetTrigger((prev) => prev + 1);
    setLiveAnnouncement('Bölge filtresi kaldırıldı. Tüm Ankara ustaları listeleniyor.');
  }

  function handleVisibleTradespeopleChange(visibleIds: string[] | null) {
    setVisibleUstaIds(visibleIds);
    if (visibleIds === null) {
      setLiveAnnouncement('Harita filtresi kapatıldı. Tüm Ankara ustaları listeleniyor.');
    } else if (visibleIds.length === 0) {
      setLiveAnnouncement('Bu bölgede doğrulanmış usta bulunamadı. Haritayı genişletebilirsiniz.');
    } else {
      setLiveAnnouncement(`Bu bölgede ${visibleIds.length} doğrulanmış usta bulundu.`);
    }
  }

  function handleSelectMarker(ustaId: string) {
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

  const renderUstaCard = (profile: UstalarSplitViewProps['profiles'][number], idx: number, isCompact: boolean) => {
    const profileServices = serviceMap[profile.user_id] ?? [];
    const primaryService = profileServices[0] || 'Genel Zanaat';
    const initials = profile.display_name
      .split(' ')
      .map((w: string) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const userMetrics = metricsMap?.[profile.user_id];
    const completedJobs = userMetrics?.totalCompletedJobs ?? 0;
    const averageRating = userMetrics?.averageRating ?? 0;
    const isCardActive = activeUstaId === profile.user_id;
    const isHovered = hoveredPinId === profile.user_id;
    const areaNames = [...new Set(areaMap[profile.user_id] ?? [])];
    const { craftsman, workshop } = parseCraftsmanName(profile.display_name);
    const primaryDistrict = areaNames[0] || 'Çankaya';
    const profileHref = `${profileHrefBase}/${profile.user_id}?${new URLSearchParams({
      ...(selectedService ? { service: selectedService } : {}),
      ...(selectedDistrict ? { district: selectedDistrict } : {}),
    })}`;

    return (
      <article
        key={profile.user_id}
        ref={(el) => {
          cardRefs.current[profile.user_id] = el;
        }}
        tabIndex={0}
        role="article"
        aria-setsize={displayedProfiles.length}
        aria-posinset={idx + 1}
        aria-label={`${craftsman}, ${primaryService}, ${primaryDistrict}. Orkestra doğrulaması tamamlandı. Enter ile profili aç, ok tuşlarıyla ustalar arasında gezin.`}
        className={`usta-card ${styles.cardInteractive} ${
          isCardActive || isHovered ? styles.cardHighlighted : ''
        } ${isCompact ? styles.cardSplitCompact : styles.cardFullWidth}`}
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
        <div className={styles.avatarWrapper}>
          <div
            className={`${styles.craftsmanAvatar} ${getServiceAvatarClass(primaryService, styles)}`}
            aria-hidden="true"
          >
            {initials}
          </div>
          <span className={styles.cardPinBadge} aria-label={`Harita pin ${idx + 1}`}>
            #{idx + 1}
          </span>
        </div>

        <div className={styles.cardMainContent}>
          {/* Header Row: Craftsman Name + Verified Check + Clean Subtle Rating */}
          <div className={styles.cardTopHeader}>
            <div className={styles.cardIdentityGroup}>
              <h3 className={styles.cardCraftsmanName}>{craftsman}</h3>
              <span className={styles.cardVerifiedMiniCheck} title="Orkestra Doğrulanmış Usta" aria-hidden="true">✓</span>
            </div>

            <div
              className={styles.cardRatingGroup}
              title={`Puan: ${averageRating > 0 ? averageRating.toFixed(1) : '5.0'} (${completedJobs > 0 ? `${completedJobs} iş` : 'Referanslı'})`}
            >
              <span className={styles.cardRatingStar} aria-hidden="true">★</span>
              <span className={styles.cardRatingScore}>{averageRating > 0 ? averageRating.toFixed(1) : '5.0'}</span>
              <span className={styles.cardRatingCount}>{completedJobs > 0 ? `(${completedJobs} iş)` : '(Yeni profil)'}</span>
            </div>
          </div>

          {/* One compact context line keeps the card scannable without repeating the CTA. */}
          <p className={styles.cardSubtitleRow}>
            <span className={styles.cardWorkshopSub}>{workshop || primaryService}</span>
            <span className={styles.cardSubtitleDot} aria-hidden="true">·</span>
            <span className={styles.cardDistrictSub}>{primaryDistrict}</span>
          </p>

          <div className={styles.cardSignalRow} aria-label="Öne çıkan bilgiler">
            <span className={styles.cardSignal}>{primaryService}</span>
            <span className={styles.cardSignalMuted}>{completedJobs > 0 ? `${completedJobs} iş` : 'Yeni profil'}</span>
          </div>

          {/* One clear route to the profile keeps the list scannable; details and request creation live there. */}
          <div className={styles.cardActionRow}>
            <Link
              href={profileHref}
              className={styles.cardCtaPrimary}
              aria-label={`${craftsman} — Profili aç ve talep oluştur`}
              title={`${craftsman} profilini ve hizmet seçeneklerini aç`}
              tabIndex={-1}
            >
              <span>Profili aç →</span>
            </Link>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className={styles.splitPageWrapper}>
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
            <span className={styles.summaryTextFull}>
              {displayedProfiles.length} / {count} Doğrulanmış Usta {visibleUstaIds !== null ? '(Görünür Bölge)' : 'Haritada Aktif'}
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
          <span>⚠️</span>
          <span>Usta veritabanına ulaşılamadı — Doğrulanmış temsilci usta ağı ile kesintisiz çalışılıyor.</span>
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
          title="Diğer filtreleri aç"
          onClick={() => setIsFilterDrawerOpen((open) => !open)}
        >
          <span aria-hidden="true">☷</span>
          <span>Filtrele</span>
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
                router.push(pathname);
              }
            }}
            aria-label="Tüm filtreleri ve aramayı temizle"
          >
            ✕ Tümünü Temizle
          </button>
        )}
      </div>

      {(selectedService || selectedDistrict || searchQuery) && <div className={styles.appliedFilterRow} aria-label="Uygulanan filtreler">
        <span className={styles.appliedFilterLabel}>Seçimler</span>
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
          <a
            href={`tel:${ANKARA_PILOT_SUPPORT.phoneTel}`}
            className={styles.emergencyDispatchPill}
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                e.preventDefault();
                handleOpenEmergencyCall(undefined, selectedDistrict, selectedService);
              }
            }}
            aria-label={`Ankara acil usta sevk hattını ara: ${ANKARA_PILOT_SUPPORT.phoneDisplay}`}
          >
            <span className={styles.emergencyIconPulse} aria-hidden="true">📞</span>
            <span className={styles.emergencyPillLabelFull}>Acil destek: {ANKARA_PILOT_SUPPORT.phoneDisplay}</span>
            <span className={styles.emergencyPillLabelShort}>Acil Ara</span>
          </a>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px' }}>
              📍 Haritadaki Doğrulanmış Ustalar ({displayedProfiles.length} / {count})
            </h2>
            <div className={styles.gridFull} role="list" aria-label="Doğrulanmış ustalar">
              {virtualizedProfiles.map((profile, idx) => renderUstaCard(profile, idx, false))}
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
            aria-label="Doğrulanmış Usta Listesi"
          >
            {displayedProfiles.length === 0 ? (
              <div className={dirStyles.emptyState}>
                <span className={dirStyles.emptyIcon} role="img" aria-label="Harita">
                  🗺️
                </span>
                <h2 className={dirStyles.emptyTitle}>
                  {searchQuery
                    ? `"${searchQuery}" ile eşleşen usta bulunamadı`
                    : visibleUstaIds !== null
                    ? 'Bu harita alanında doğrulanmış usta bulunamadı'
                    : 'Bu kriterlere uygun doğrulanmış usta bulunamadı'}
                </h2>
                <p className={dirStyles.emptyDesc}>
                  {searchQuery
                    ? `Aramanızla eşleşen doğrulanmış usta kaydı bulunamadı. Farklı bir terim arayabilir veya aramayı temizleyebilirsiniz.`
                    : visibleUstaIds !== null
                    ? 'Mevcut harita görünümünüzde usta bulunmuyor. Haritayı uzaklaştırabilir, başka bir bölgeye kaydırabilir veya tüm Ankara ustalarını listeleyebilirsiniz.'
                    : hasFilters
                    ? 'Filtre tercihlerinizi genişletmeyi deneyebilir veya tüm ustaları görmek için filtreleri temizleyebilirsiniz.'
                    : 'Henüz listelenen usta bulunmuyor.'}
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
                      🗺️ Tüm Ankara&apos;yı Göster ({count} Usta)
                    </button>
                  ) : hasFilters ? (
                    <Link href="/ustalar" className={dirStyles.ctaBtn}>
                      Filtreleri Temizle
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <div
                  className={displayedViewMode === 'split' ? styles.gridSplit : styles.gridFull}
                  role="list"
                  aria-label="Doğrulanmış ustalar"
                >
                  {virtualizedProfiles.map((profile, idx) => renderUstaCard(profile, idx, displayedViewMode === 'split'))}
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

              {activeProfile && (
                <div className={styles.mapSelectionNotice} aria-hidden="true">
                  <span className={styles.mapSelectionDot} aria-hidden="true" />
                  <span><strong>{parseCraftsmanName(activeProfile.display_name).craftsman}</strong> seçildi</span>
                  <span className={styles.mapSelectionHint}>Listeyle eşleşti</span>
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
                  <span aria-hidden="true">📋</span>
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
                        {displayedProfiles.length} Doğrulanmış Usta {visibleUstaIds !== null ? '(Görünür Bölge)' : ''}
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
                          title={drawerSnap === 'full' ? 'Karusel moduna dön' : 'Tüm listeyi dikey aç'}
                        >
                          <span>{drawerSnap === 'full' ? '⌃ Karusel' : '☰ Tüm Liste'}</span>
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
                    className={`${styles.mobileCarouselTrack} ${
                      drawerSnap === 'full' ? styles.mobileCarouselTrackFull : ''
                    }`}
                    role="list"
                    aria-label="Usta Kartları Kaydırıcı"
                    tabIndex={0}
                  >
                    {displayedProfiles.length === 0 ? (
                      <div className={styles.mobileEmptyState}>
                        <p>Bu harita alanında doğrulanmış usta bulunamadı.</p>
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
                          const completedJobs = userMetrics?.totalCompletedJobs ?? 0;
                          const averageRating = userMetrics?.averageRating ?? 0;
                          const isCardActive =
                            activeUstaId === profile.user_id || hoveredPinId === profile.user_id;
                          const { craftsman, workshop } = parseCraftsmanName(profile.display_name);
                          const primaryService = profileServices[0] || 'Genel Zanaat';
                          const areaNames = [...new Set(areaMap[profile.user_id] ?? [])];
                          const primaryDistrict = areaNames[0] || 'Çankaya';
                          const profileHref = `${profileHrefBase}/${profile.user_id}?${new URLSearchParams({
                            ...(selectedService ? { service: selectedService } : {}),
                            ...(selectedDistrict ? { district: selectedDistrict } : {}),
                          })}`;

                          return (
                            <div
                              key={`mobile-${profile.user_id}`}
                              ref={(el) => {
                                mobileCardRefs.current[profile.user_id] = el;
                              }}
                              tabIndex={0}
                              role="listitem"
                              aria-current={isCardActive ? 'true' : undefined}
                              aria-label={`${craftsman}, ${primaryService}, ${primaryDistrict}. Enter ile profili aç, ok tuşlarıyla ustalar arasında gezin.`}
                              className={`${styles.mobileCarouselCard} ${
                                isCardActive ? styles.mobileCarouselCardActive : ''
                              }`}
                              onClick={() => handleSelectMobileCard(profile.user_id)}
                              onFocus={() => handleSelectMobileCard(profile.user_id)}
                              onKeyDown={(e) => handleMobileCardKeyDown(e, profile.user_id, idx)}
                            >
                              <div className={styles.mobileCardTopRow}>
                                <div
                                  className={`${styles.mobileMonogram} ${getServiceAvatarClass(primaryService, styles)}`}
                                  aria-hidden="true"
                                >
                                  {initials}
                                </div>
                                <div className={styles.mobileCardMeta}>
                                  <div className={styles.mobileCardHeader}>
                                    <div className={styles.mobileNameGroup}>
                                      <h3 className={styles.mobileCardName}>{craftsman}</h3>
                                      <span className={styles.mobileVerifiedCheck} title="Orkestra Doğrulanmış Usta">✓</span>
                                    </div>
                                    <span className={styles.mobileRatingBadge}>
                                      ★ {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
                                    </span>
                                  </div>
                                  <p className={styles.mobileWorkshopSub}>
                                    {workshop || 'Bağımsız usta'}
                                  </p>
                                </div>
                              </div>

                              <div className={styles.mobileBadgeRow} aria-label="Öne çıkan bilgiler">
                                <span className={styles.mobileSignal}>{primaryService}</span>
                                <span className={styles.mobileSignal}>{primaryDistrict}</span>
                                <span className={styles.mobileSignalMuted}>{completedJobs > 0 ? `${completedJobs} iş` : 'Yeni profil'}</span>
                              </div>

                              <div className={styles.mobileCardFooter}>
                                <span className={styles.mobilePinNumber}>#{idx + 1} Pin</span>
                                <div className={styles.mobileBtnGroup}>
                                  <Link
                                    href={profileHref}
                                    className={styles.mobileCtaPrimary}
                                    aria-label={`${craftsman} — Profili aç ve talep oluştur`}
                                    tabIndex={-1}
                                  >
                                    Profili incele →
                                  </Link>
                                </div>
                              </div>
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
                  <span aria-hidden="true">📋</span>
                  <span>Ustaları Göster ({displayedProfiles.length})</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Mobile Toggle — visible only in list mode */}
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
              ✕
            </button>

            {!quoteSubmitted ? (
              <>
                <div className={styles.quoteModalHeader}>
                  <div className={styles.quoteModalBadgeRow}>
                    <span className={styles.quoteModalBadge}>⚡ Hızlı Teklif & Keşif</span>
                    <span className={styles.quoteModalSlaBadge}>{quoteModal.sla}</span>
                  </div>
                  <h2 id="quote-dialog-title" className={styles.quoteModalTitle}>
                    {quoteModal.craftsman} — Ücretsiz Fiyat Teklifi Al
                  </h2>
                  {quoteModal.workshop && (
                    <p className={styles.quoteModalWorkshop}>{quoteModal.workshop}</p>
                  )}
                  <div className={styles.quoteModalMetaRow}>
                    <span>🔧 {quoteModal.service}</span>
                    <span>·</span>
                    <span>📍 {quoteModal.district}</span>
                    <span>·</span>
                    <span className={styles.quoteModalPrice}>🏷️ {quoteModal.price} Taban</span>
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
                      {['⚡ Hemen (Acil Sevk)', '📅 Bugün İçinde', '🗓️ Hafta Sonu'].map((opt) => (
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
                      <span>🛡️</span>
                      <span><strong>Sabit Fiyat Garantisi:</strong> İş onaylanmadan ekstra ücret talep edilmez.</span>
                    </div>
                    <div className={styles.quoteTrustItem}>
                      <span>🔒</span>
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
                    <span>💬 WhatsApp ile Öncelikli İlet</span>
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

      {/* Platform Trust & Workmanship Guarantee Modal (Plerdy WML-028 / WML-030) */}
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
              <div className={styles.trustModalIconWrap}>🛡️</div>
              <h2 id="trust-dialog-title" className={styles.quoteSuccessTitle}>
                Ankara Usta Platform Güvencesi
              </h2>
              <p className={styles.trustModalSubtitle}>
                Tüm ustalarımız denetlenmiş ve hizmetler 4 katmanlı güvence altına alınmıştır.
              </p>
            </div>

            <div className={styles.trustModalPillars}>
              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>🛡️</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Sabit Fiyat Garantisi</h3>
                  <p className={styles.trustPillarDesc}>
                    Usta keşif sonrasında işe başlamadan önce net fiyat verir. Sizin onayınız olmadan asla ek maliyet talep edilemez.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>📜</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>MYK & Esnaf Belge Doğrulaması</h3>
                  <p className={styles.trustPillarDesc}>
                    Ustalarımızın Mesleki Yeterlilik Kurumu (MYK) seviye belgeleri, vergi levhası ve adli sicil kayıtları ön kontrolden geçirilir.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>🔒</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Güvenli Ödeme & İşçilik Sertifikası</h3>
                  <p className={styles.trustPillarDesc}>
                    İş tamamlanıp siz memnun kalana kadar ödemeniz korunur. Yapılan işe dijital işçilik sertifikası tanımlanır.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>⚡</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Dinamik İlçe Sevk SLA&apos;sı</h3>
                  <p className={styles.trustPillarDesc}>
                    Ankara&apos;nın 12 merkez ilçesinde atölye konumuna göre 12–25 dk ortalama acil sevk süresi taahhüt edilir.
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

      {/* Emergency Dispatch & Direct Call Modal (Plerdy WML-002 / WML-004 / WML-045) */}
      {emergencyModalOpen && (
        <div
          className={styles.quoteModalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-dialog-title"
          onClick={() => setEmergencyModalOpen(false)}
        >
          <div
            className={styles.quoteModalDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.quoteModalCloseBtn}
              onClick={() => setEmergencyModalOpen(false)}
              aria-label="Modalı kapat"
            >
              ✕
            </button>

            <div className={styles.trustModalHeader}>
              <div className={styles.emergencyModalIconWrap}>
                <span aria-hidden="true">🚨</span>
              </div>
              <h2 id="emergency-dialog-title" className={styles.quoteSuccessTitle}>
                Ankara Nöbetçi Usta & Acil Sevk Hattı
              </h2>
              <p className={styles.trustModalSubtitle}>
                {emergencyContext?.craftsman
                  ? `${emergencyContext.craftsman} veya 12 merkez ilçemizdeki en yakın nöbetçi saha ekibimiz için doğrudan koordinasyon merkezimizi arayabilirsiniz.`
                  : 'Su baskını, elektrik arızası, kapıda kalma ve acil durumlar için Ankara genelinde nöbetçi usta sevk hattı.'}
              </p>
            </div>

            {/* Direct Call & WhatsApp Action Buttons */}
            <div className={styles.emergencyModalActions}>
              <a
                href={`tel:${ANKARA_PILOT_SUPPORT.phoneTel}`}
                className={styles.emergencyModalBigCallBtn}
                title="Doğrudan Ara"
              >
                <span className={styles.emergencyBtnIcon} aria-hidden="true">📞</span>
                <div className={styles.emergencyBtnTextCol}>
                  <span className={styles.emergencyBtnMainTitle}>Hemen Ara: {ANKARA_PILOT_SUPPORT.phoneDisplay}</span>
                  <span className={styles.emergencyBtnSubTitle}>Ortalama bağlanma süresi: ~15 saniye · 7/24 Sevk</span>
                </div>
              </a>

              <a
                href={buildWhatsAppSupportUrl({
                  category: 'job_sos',
                  district: emergencyContext?.district,
                  customNote: emergencyContext?.craftsman
                    ? `${emergencyContext.craftsman} (${emergencyContext.district || 'Ankara'}) için acil usta sevk talebi.`
                    : 'Acil nöbetçi usta sevk talebi.',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.emergencyModalWhatsAppBtn}
              >
                <span className={styles.emergencyBtnIcon} aria-hidden="true">💬</span>
                <div className={styles.emergencyBtnTextCol}>
                  <span className={styles.emergencyBtnMainTitle}>WhatsApp ile Konum ve Arıza Gönder</span>
                  <span className={styles.emergencyBtnSubTitle}>Fotoğraf & video ile anında ön keşif desteği</span>
                </div>
              </a>
            </div>

            <div className={styles.trustModalPillars}>
              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>⏱️</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>12–25 Dakika Acil Sevk</h3>
                  <p className={styles.trustPillarDesc}>
                    Siteler, Ostim ve Rüzgarlı zanaat merkezlerimizden ve ilçenizdeki nöbetçi ustalardan en yakını yönlendirilir.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>🛡️</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Sabit Fiyat & KVKK Maskeli Arama</h3>
                  <p className={styles.trustPillarDesc}>
                    Numaranız izinsiz paylaşılmaz. İşçilik ve tahmini maliyet telefonda ve keşifte netleştirilir, sürpriz ücret çıkmaz.
                  </p>
                </div>
              </div>

              <div className={styles.trustPillarCard}>
                <div className={styles.trustPillarIcon}>🕒</div>
                <div className={styles.trustPillarContent}>
                  <h3 className={styles.trustPillarTitle}>Çalışma Saatleri & Nöbetçi Kadro</h3>
                  <p className={styles.trustPillarDesc}>
                    Hafta içi: {ANKARA_PILOT_SUPPORT.operatingHours.weekdays} · Cumartesi: {ANKARA_PILOT_SUPPORT.operatingHours.saturday} · Pazar: {ANKARA_PILOT_SUPPORT.operatingHours.sunday}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.trustModalActions}>
              <button
                type="button"
                className={styles.quoteSuccessCloseBtn}
                onClick={() => setEmergencyModalOpen(false)}
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
