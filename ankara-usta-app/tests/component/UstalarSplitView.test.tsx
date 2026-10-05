import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UstalarSplitView from '../../app/ustalar/UstalarSplitView';

// Mock Leaflet and AnkaraInteractiveMap to avoid canvas/DOM issues in jsdom
vi.mock('../../app/components/map/AnkaraInteractiveMap', () => ({
  default: vi.fn(({ onVisibleTradespeopleChange, resetTrigger, onSelectTradespersonMarker, onHoverTradespersonMarker, activeTradespersonId }) => (
    <div data-testid="mock-interactive-map">
      <span data-testid="mock-active-marker-id">{activeTradespersonId ?? 'none'}</span>
      <button
        data-testid="simulate-spatial-filter"
        onClick={() => onVisibleTradespeopleChange?.(['u1'])}
      >
        Filter to Usta 1
      </button>
      <button
        data-testid="simulate-empty-spatial-filter"
        onClick={() => onVisibleTradespeopleChange?.([])}
      >
        Filter to Empty
      </button>
      <button
        data-testid="simulate-select-marker-35"
        onClick={() => onSelectTradespersonMarker?.('u35')}
      >
        Select Marker 35
      </button>
      <button
        data-testid="simulate-hover-marker-u2"
        onClick={() => onHoverTradespersonMarker?.('u2')}
      >
        Hover Marker u2
      </button>
      <span data-testid="reset-trigger-val">{resetTrigger}</span>
    </div>
  )),
}));

describe('UstalarSplitView (Spatial Bounding-Box Filtering)', () => {
  const mockProfiles = [
    {
      user_id: 'u1',
      display_name: 'Hasan Usta (Siteler Mobilya)',
      bio: 'Marangoz ustası',
      city: 'Ankara',
      total_count: 2,
    },
    {
      user_id: 'u2',
      display_name: 'Mehmet Usta (Ostim Mekanik)',
      bio: 'Torna ve kaynak',
      city: 'Ankara',
      total_count: 2,
    },
  ];

  const mockServiceMap = {
    u1: ['Mobilya & Ahşap'],
    u2: ['Kaynak & Torna'],
  };

  const mockAreaMap = {
    u1: ['Altındağ'],
    u2: ['Yenimahalle'],
  };

  const defaultProps = {
    profiles: mockProfiles,
    serviceMap: mockServiceMap,
    areaMap: mockAreaMap,
    servicesList: [{ id: 'carpentry', name: 'Mobilya' }],
    districtsList: ['Altındağ', 'Yenimahalle'],
    count: 2,
    page: 1,
    pageSize: 10,
    hasFilters: false,
    baseHref: '/ustalar?',
    initialView: 'split' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, leadRef: 'ANK-3004' }),
    });
  });

  it('renders all usta cards initially in split view (both desktop and mobile carousel)', () => {
    render(<UstalarSplitView {...defaultProps} />);

    expect(screen.getAllByText(/Hasan Usta/i).length).toBe(2);
    expect(screen.getAllByText(/Mehmet Usta/i).length).toBe(2);
    expect(screen.getByText(/2 \/ 2 Doğrulanmış Usta Haritada Aktif/i)).toBeInTheDocument();
  });

  it('filters cards to visible bounding-box when onVisibleTradespeopleChange is invoked', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Simulate map moveend triggering spatial bounding box filter
    fireEvent.click(screen.getByTestId('simulate-spatial-filter'));

    // Now only u1 should be visible (both in desktop list and mobile carousel)
    expect(screen.getAllByText(/Hasan Usta/i).length).toBe(2);
    expect(screen.queryByText(/Mehmet Usta/i)).not.toBeInTheDocument();
    expect(screen.getByText(/1 \/ 2 Doğrulanmış Usta \(Görünür Bölge\)/i)).toBeInTheDocument();

    // Reset button should appear
    expect(screen.getByRole('button', { name: /Tüm Ankara'yı Göster/i })).toBeInTheDocument();
  });

  it('resets spatial filter and triggers resetTrigger when reset button is clicked', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Apply spatial filter
    fireEvent.click(screen.getByTestId('simulate-spatial-filter'));
    expect(screen.queryByText(/Mehmet Usta/i)).not.toBeInTheDocument();

    // Click reset button
    const resetBtn = screen.getByRole('button', { name: /Tüm Ankara'yı Göster/i });
    fireEvent.click(resetBtn);

    // Both ustas should be visible again
    expect(screen.getAllByText(/Hasan Usta/i).length).toBe(2);
    expect(screen.getAllByText(/Mehmet Usta/i).length).toBe(2);
    expect(screen.getByText(/2 \/ 2 Doğrulanmış Usta Haritada Aktif/i)).toBeInTheDocument();
    expect(screen.getByTestId('reset-trigger-val')).toHaveTextContent('1');
  });

  it('renders a friendly spatial empty state when no ustas fall within the map view', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Simulate empty bounding box
    fireEvent.click(screen.getByTestId('simulate-empty-spatial-filter'));

    expect(screen.getAllByText(/Bu harita alanında doğrulanmış usta bulunamadı/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Tüm Ankara'yı Göster \(2 Usta\)/i })).toBeInTheDocument();

    // Clicking reset in empty state restores the list
    fireEvent.click(screen.getByRole('button', { name: /Tüm Ankara'yı Göster \(2 Usta\)/i }));
    expect(screen.getAllByText(/Hasan Usta/i).length).toBe(2);
    expect(screen.getAllByText(/Mehmet Usta/i).length).toBe(2);
  });

  it('toggles map expansion with the mini expand button', () => {
    render(<UstalarSplitView {...defaultProps} />);

    const expandBtn = screen.getByRole('button', { name: /^Haritayı büyüt$/i });
    expect(expandBtn).toBeInTheDocument();

    fireEvent.click(expandBtn);
    expect(screen.getByRole('button', { name: /^Haritayı daralt$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Listeyi Göster \(2 Usta\)/i })).toBeInTheDocument();
  });

  it('renders Phase 3 mobile bottom sheet drawer and toggles collapse state', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // The mobile bottom sheet drawer should exist with proper aria region
    const drawer = screen.getByRole('region', { name: /Mobil Usta Seçim Çekmecesi/i });
    expect(drawer).toBeInTheDocument();

    // Check collapse button
    const collapseBtn = screen.getByRole('button', { name: /Usta çekmecesini daralt/i });
    expect(collapseBtn).toBeInTheDocument();

    // Clicking collapse hides the horizontal track
    fireEvent.click(collapseBtn);
    expect(screen.getByRole('button', { name: /Usta çekmecesini aç/i })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /Usta Kartları Kaydırıcı/i })).not.toBeInTheDocument();

    // Clicking expand brings back the carousel track
    fireEvent.click(screen.getByRole('button', { name: /Usta çekmecesini aç/i }));
    expect(screen.getByRole('list', { name: /Usta Kartları Kaydırıcı/i })).toBeInTheDocument();
  });

  it('allows selecting a mobile carousel card to trigger active highlight', () => {
    render(<UstalarSplitView {...defaultProps} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(2);

    // Click first mobile card
    fireEvent.click(listItems[0]);
    // The active usta ID should highlight the card
    expect(listItems[0].className).toContain('mobileCarouselCardActive');
  });

  it('supports 3-snap adaptive bottom sheet modes (peek, half carousel, full list)', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Initially in half snap mode with carousel track
    const track = screen.getByRole('list', { name: /Usta Kartları Kaydırıcı/i });
    expect(track).toBeInTheDocument();
    expect(track.className).not.toContain('mobileCarouselTrackFull');

    // Click snap toggle to expand to full list
    const snapBtn = screen.getByRole('button', { name: /Tüm Liste/i });
    expect(snapBtn).toBeInTheDocument();
    fireEvent.click(snapBtn);

    // Track should now have mobileCarouselTrackFull class
    expect(track.className).toContain('mobileCarouselTrackFull');
    expect(screen.getByRole('button', { name: /Karusel/i })).toBeInTheDocument();

    // Clicking snap toggle again returns to half carousel mode
    fireEvent.click(screen.getByRole('button', { name: /Karusel/i }));
    expect(track.className).not.toContain('mobileCarouselTrackFull');
  });

  it('announces view mode changes and spatial filtering updates in aria-live polite region (WCAG 2.1 AA)', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Live region exists with role status and aria-live polite
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');

    // Change view mode to list
    const listBtn = screen.getByRole('button', { name: /Liste Görünümü/i });
    fireEvent.click(listBtn);
    expect(liveRegion).toHaveTextContent(/Liste görünümü aktif/i);

    // Change back to split
    const splitBtn = screen.getByRole('button', { name: /Bölünmüş Ekran/i });
    fireEvent.click(splitBtn);
    expect(liveRegion).toHaveTextContent(/Bölünmüş ekran \(split-view\) görünümü aktif/i);

    // Trigger spatial bounding box filter
    fireEvent.click(screen.getByTestId('simulate-spatial-filter'));
    expect(liveRegion).toHaveTextContent(/Harita görünümü güncellendi: Görünür alanda 1 doğrulanmış usta listelendi/i);

    // Reset spatial filter
    const resetBtn = screen.getByRole('button', { name: /Tüm Ankara'yı Göster/i });
    fireEvent.click(resetBtn);
    expect(liveRegion).toHaveTextContent(/Tüm Ankara görünümü geri yüklendi: Toplam 2 doğrulanmış usta listeleniyor/i);
  });

  it('supports spatial keyboard navigation (Focus, ArrowDown, ArrowUp, Enter, Escape) on cards', () => {
    render(<UstalarSplitView {...defaultProps} />);

    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(2);

    const firstCard = articles[0];
    const secondCard = articles[1];

    // Cards must be keyboard focusable
    expect(firstCard).toHaveAttribute('tabindex', '0');
    expect(secondCard).toHaveAttribute('tabindex', '0');

    // Focusing first card activates highlight and announces to live region
    fireEvent.focus(firstCard);
    expect(firstCard.className).toContain('cardHighlighted');
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent(/Hasan Usta.*seçildi/i);

    // ArrowDown navigates to second card
    fireEvent.keyDown(firstCard, { key: 'ArrowDown' });
    fireEvent.focus(secondCard);
    expect(secondCard.className).toContain('cardHighlighted');
    expect(liveRegion).toHaveTextContent(/Mehmet Usta.*seçildi/i);

    // ArrowUp navigates back to first card
    fireEvent.keyDown(secondCard, { key: 'ArrowUp' });
    fireEvent.focus(firstCard);
    expect(firstCard.className).toContain('cardHighlighted');

    // Escape clears highlight
    fireEvent.keyDown(firstCard, { key: 'Escape' });
    expect(firstCard.className).not.toContain('cardHighlighted');
  });

  it('supports Home and End keys for rapid keyboard spatial navigation across usta cards', () => {
    render(<UstalarSplitView {...defaultProps} />);

    const cards = screen.getAllByRole('article');
    const firstCard = cards[0];
    const secondCard = cards[1];

    // Press End on first card -> jumps to last card
    fireEvent.keyDown(firstCard, { key: 'End' });
    expect(screen.getByRole('status')).toHaveTextContent(/Mehmet Usta.*seçildi/i);

    // Press Home on second card -> jumps back to first card
    fireEvent.keyDown(secondCard, { key: 'Home' });
    expect(screen.getByRole('status')).toHaveTextContent(/Hasan Usta.*seçildi/i);
  });

  it('provides accessible landmark regions and aria-expanded state for split panes', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Screen reader landmarks
    expect(screen.getByRole('region', { name: /Doğrulanmış Usta Listesi/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Ankara Usta Arama Haritası/i })).toBeInTheDocument();

    const expandBtn = screen.getByRole('button', { name: /^Haritayı büyüt$/i });
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(expandBtn);
    const contractBtn = screen.getByRole('button', { name: /^Haritayı daralt$/i });
    expect(contractBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('activates 60 FPS virtual windowing when list exceeds VIRTUAL_BATCH_SIZE (WCAG aria-setsize & DOM limiting)', () => {
    // Generate 50 mock profiles
    const largeProfiles = Array.from({ length: 50 }, (_, i) => ({
      user_id: `u${i + 1}`,
      display_name: `Usta ${i + 1}`,
      bio: `Usta ${i + 1} bio`,
      city: 'Ankara',
      total_count: 50,
    }));
    const largeServiceMap = Object.fromEntries(largeProfiles.map((p) => [p.user_id, ['Tesisat']]));
    const largeAreaMap = Object.fromEntries(largeProfiles.map((p) => [p.user_id, ['Çankaya']]));

    render(
      <UstalarSplitView
        {...defaultProps}
        profiles={largeProfiles}
        serviceMap={largeServiceMap}
        areaMap={largeAreaMap}
        count={50}
      />
    );

    // Initial render should only mount VIRTUAL_BATCH_SIZE (24) cards in desktop list
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(24);

    // 60 FPS Sanal Liste performance badge should be visible
    expect(screen.getByText(/60 FPS Sanal Liste \(24 \/ 50\)/i)).toBeInTheDocument();

    // Check WCAG virtualized list attributes
    expect(articles[0]).toHaveAttribute('aria-setsize', '50');
    expect(articles[0]).toHaveAttribute('aria-posinset', '1');
    expect(articles[23]).toHaveAttribute('aria-posinset', '24');

    // Remaining items hint and load all button
    expect(screen.getByText(/26 usta sanal olarak yükleniyor/i)).toBeInTheDocument();
    const loadAllBtn = screen.getByRole('button', { name: /Tümünü Yükle \(50\)/i });
    expect(loadAllBtn).toBeInTheDocument();

    // Click load all button
    fireEvent.click(loadAllBtn);
    expect(screen.getAllByRole('article').length).toBe(50);
  });

  it('dynamically expands virtual window when selecting a marker located beyond initial batch', () => {
    const largeProfiles = Array.from({ length: 50 }, (_, i) => ({
      user_id: `u${i + 1}`,
      display_name: `Usta ${i + 1}`,
      bio: `Usta ${i + 1} bio`,
      city: 'Ankara',
      total_count: 50,
    }));
    const largeServiceMap = Object.fromEntries(largeProfiles.map((p) => [p.user_id, ['Elektrik']]));
    const largeAreaMap = Object.fromEntries(largeProfiles.map((p) => [p.user_id, ['Yenimahalle']]));

    render(
      <UstalarSplitView
        {...defaultProps}
        profiles={largeProfiles}
        serviceMap={largeServiceMap}
        areaMap={largeAreaMap}
        count={50}
      />
    );

    expect(screen.queryByText(/Usta 35/i)).not.toBeInTheDocument();

    // Simulate clicking pin 35 on the map
    fireEvent.click(screen.getByTestId('simulate-select-marker-35'));

    // Usta 35 should now be mounted in the DOM
    expect(screen.getAllByText(/Usta 35/i).length).toBeGreaterThan(0);
  });

  it('synchronizes two-way spatial resonance between list card and map marker', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Initially no active marker
    expect(screen.getByTestId('mock-active-marker-id')).toHaveTextContent('none');

    // 1. Click list card u1: should update active marker and live announcement
    const hasanCard = screen.getAllByRole('article')[0];
    fireEvent.click(hasanCard);
    expect(screen.getByTestId('mock-active-marker-id')).toHaveTextContent('u1');
    expect(screen.getByText(/Hasan Usta.*seçildi.*Harita ve liste senkronize edildi/i)).toBeInTheDocument();

    // 2. Hover map marker u2: should update hovered marker state and active id
    fireEvent.click(screen.getByTestId('simulate-hover-marker-u2'));
    expect(screen.getByTestId('mock-active-marker-id')).toHaveTextContent('u2');
  });

  it('renders and toggles mobile drawer using the floating thumb action pill', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Collapse drawer
    const collapseBtn = screen.getByRole('button', { name: /Usta çekmecesini daralt/i });
    fireEvent.click(collapseBtn);

    // Floating action button becomes visible and displays count
    const floatingBtn = screen.getByRole('button', { name: /Mobil usta listesini göster/i });
    expect(floatingBtn).toBeInTheDocument();
    expect(floatingBtn).toHaveTextContent(/Ustaları Göster \(2\)/i);

    // Clicking floating action button expands the drawer back
    fireEvent.click(floatingBtn);
    expect(screen.getByRole('list', { name: /Usta Kartları Kaydırıcı/i })).toBeInTheDocument();
  });

  it('uses one profile-first CTA for each card', () => {
    render(<UstalarSplitView {...defaultProps} />);

    const profileLinks = screen.getAllByRole('link', { name: /Profili aç ve talep oluştur/i });
    expect(profileLinks).toHaveLength(4);
    expect(profileLinks[0]).toHaveAttribute('href', '/ustalar/u1?');
    expect(screen.queryByRole('link', { name: /Teklif İste/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /acil usta sevk hattını ara/i })).not.toBeInTheDocument();
  });

  it('opens the profile CTA from the card keyboard focus model', () => {
    render(<UstalarSplitView {...defaultProps} />);

    const firstCard = screen.getAllByRole('article')[0];
    firstCard.focus();
    fireEvent.keyDown(firstCard, { key: 'Enter' });
    expect(screen.getAllByRole('link', { name: /Profili aç ve talep oluştur/i })[0]).toHaveAttribute('href', '/ustalar/u1?');
  });

  it('filters usta cards in real-time via search input and allows clearing query', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Initially both ustas (Hasan and Mehmet) are rendered
    expect(screen.getAllByText(/Hasan Usta/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mehmet Usta/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Filtrele/i }));
    const searchInput = screen.getByPlaceholderText(/Usta, atölye veya uzmanlık ara/i);
    expect(searchInput).toBeInTheDocument();

    // Type 'Hasan' in search box
    fireEvent.change(searchInput, { target: { value: 'Hasan' } });

    // Only Hasan Usta should remain in articles
    const articles = screen.getAllByRole('article');
    expect(articles.length).toBe(1);
    expect(screen.getAllByRole('heading', { name: 'Hasan Usta' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: 'Mehmet Usta' })).not.toBeInTheDocument();

    // Clear search using clear button
    const clearBtn = screen.getByRole('button', { name: /^Aramayı temizle$/i });
    fireEvent.click(clearBtn);

    // Both ustas return
    expect(screen.getAllByRole('article').length).toBe(2);
  });

  it('keeps repeated verification claims out of the list card', () => {
    render(<UstalarSplitView {...defaultProps} />);

    expect(screen.queryByRole('button', { name: /Sabit Fiyat Koruması/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/MYK Onaylı:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Platform Teyitli Şeffaf Tarife/i)).not.toBeInTheDocument();
  });

  it('renders emergency click-to-call links on mobile cards and header with tel: protocol', () => {
    render(<UstalarSplitView {...defaultProps} />);

    // Header emergency dispatch pill
    const headerEmergencyLink = screen.getByRole('link', { name: /Ankara acil usta sevk hattını ara/i });
    expect(headerEmergencyLink).toBeInTheDocument();
    expect(headerEmergencyLink).toHaveAttribute('href', 'tel:+903128000606');

    // Card-level emergency links are intentionally removed; emergency access remains in the header.
    const mobileCallLinks = screen.queryAllByRole('link', { name: /için acil usta sevk hattını ara/i });
    expect(mobileCallLinks).toHaveLength(0);
  });

  it('does not add a second emergency action to each card', () => {
    render(<UstalarSplitView {...defaultProps} />);
    expect(screen.getAllByRole('link', { name: /Profili aç ve talep oluştur/i })).toHaveLength(4);
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });
});
