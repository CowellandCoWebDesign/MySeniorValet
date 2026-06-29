import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import MapSearch from './map-search';

// ---------------------------------------------------------------------------
// Regression guard for Task #320: the map/city search must never hang forever
// on the "Loading communities…" mascot loader for a city with zero coverage.
// The original freeze was an infinite invalidate -> refetch -> still-empty ->
// invalidate loop in the "force query when panel opens" effect. These tests
// render the real <MapSearch /> page (with heavy children mocked) and assert
// the panel always settles to either the discovery spinner, community cards,
// or "No communities found" within a bounded time — and that the spatial
// endpoint is not hammered in an unbounded loop on empty results.
// ---------------------------------------------------------------------------

// wouter ships ESM-only; mock it so the page can be imported under ts-jest.
jest.mock('wouter', () => ({
  useLocation: () => ['/map-search', jest.fn()],
  Link: ({ children }: any) => children,
  Router: ({ children }: any) => children,
}));

// Heavy / leaflet-backed children — replaced with light stand-ins.
jest.mock('@/components/Map', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ onBoundsChange }: any) => {
      // Report bounds exactly once on mount, mimicking Leaflet's moveend.
      React.useEffect(() => {
        onBoundsChange &&
          onBoundsChange({
            sw: { lat: 32.0, lng: -97.0 },
            ne: { lat: 33.0, lng: -96.0 },
          });
      }, []);
      return React.createElement('div', { 'data-testid': 'map' });
    },
  };
});

jest.mock('@/components/MapErrorBoundary', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});

jest.mock('@/components/MapTutorial', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/MascotLoadingDisplay', () => {
  const React = require('react');
  return {
    MascotLoadingDisplay: () =>
      React.createElement('div', { 'data-testid': 'status-loading' }, 'Loading communities…'),
  };
});

jest.mock('@/components/CommunityCard', () => {
  const React = require('react');
  return {
    CommunityCard: ({ community }: any) =>
      React.createElement('div', { 'data-testid': 'community-card' }, community?.name),
  };
});

jest.mock('@/components/VendorCard', () => ({ VendorCard: () => null }));
jest.mock('@/components/EnhancedVendorCard', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/HealthcareServiceCard', () => ({ HealthcareServiceCard: () => null }));
jest.mock('@/components/ResourceCard', () => ({ ResourceCard: () => null }));
jest.mock('@/components/AISearchInsights', () => ({ AISearchInsights: () => null }));
jest.mock('@/components/NavigationHeader', () => ({ NavigationHeader: () => null }));
jest.mock('@/components/BreadcrumbNavigation', () => ({ BreadcrumbNavigation: () => null }));
jest.mock('@/components/BottomNav', () => ({ BottomNav: () => null }));
jest.mock('@/components/AutocompleteSearch', () => ({ AutocompleteSearch: () => null }));

// Page-level panels that are imported eagerly but only rendered on demand.
jest.mock('@/pages/MessagingDashboard', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/tours', () => ({ __esModule: true, default: () => null }));
jest.mock('@/pages/AISearchComparison', () => ({ __esModule: true, default: () => null }));

// Hooks with side effects / timers we don't want in the test.
jest.mock('@/hooks/useSEO', () => ({
  useSEO: jest.fn(),
  SEOTemplates: { mapSearch: {} },
}));
jest.mock('@/hooks/useMapSessionStorage', () => ({
  useMapSessionStorage: () => ({ loadState: () => null, saveState: jest.fn() }),
  useDebounceMapSave: jest.fn(),
}));
jest.mock('@/hooks/use-debounce', () => ({ useDebounce: (value: any) => value }));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

// Track how often the spatial (DB) community search is hit, so we can assert
// the empty-result loop guard holds.
let spatialCallCount = 0;

type FetchRouter = {
  spatial: () => any[];
  discovery?: () => { results: any[] };
};

function installFetch(router: FetchRouter) {
  spatialCallCount = 0;
  const jsonResponse = (body: any) =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response);

  global.fetch = jest.fn((input: any) => {
    const url = typeof input === 'string' ? input : input?.url || '';

    if (url.includes('/api/communities/search/spatial')) {
      spatialCallCount += 1;
      return jsonResponse(router.spatial());
    }
    if (url.includes('/api/global-discovery/search')) {
      return jsonResponse(router.discovery ? router.discovery() : { results: [] });
    }
    if (url.includes('/api/geocode')) {
      return jsonResponse({ success: true, lat: 32.5, lng: -96.5, location: 'test' });
    }
    if (url.includes('/api/settings/map-defaults')) {
      return jsonResponse({ lat: 32.5, lng: -96.5, zoom: 12 });
    }
    // vendors / healthcare / resources / community fallback search
    if (url.includes('/api/communities/search?')) {
      return jsonResponse({ communities: [] });
    }
    return jsonResponse([]);
  }) as any;
}

function setLocationSearch(query: string) {
  // history.pushState updates window.location.search in jsdom without the
  // "Cannot redefine property: location" error from redefining location.
  window.history.pushState({}, '', `/map-search?query=${encodeURIComponent(query)}`);
}

const renderPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MapSearch />
    </QueryClientProvider>
  );

describe('MapSearch — never hangs on empty-coverage cities (Task #320)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('settles to "No communities found" for an uncovered city instead of staying on the loader', async () => {
    setLocationSearch('Ranger, TX');
    installFetch({
      spatial: () => [], // zero DB coverage
      discovery: () => ({ results: [] }), // web discovery also finds nothing
    });

    renderPage();

    // The panel must reach a terminal state within a bounded time.
    await waitFor(
      () => {
        expect(screen.getByText(/No communities found/i)).toBeInTheDocument();
      },
      { timeout: 8000 }
    );

    // The mascot "Loading communities…" loader must no longer be on screen.
    expect(screen.queryByTestId('status-loading')).not.toBeInTheDocument();
  });

  it('does not re-fire the spatial query in an unbounded loop on empty results', async () => {
    setLocationSearch('Ranger, TX');
    installFetch({
      spatial: () => [],
      discovery: () => ({ results: [] }),
    });

    renderPage();

    await waitFor(
      () => {
        expect(screen.getByText(/No communities found/i)).toBeInTheDocument();
      },
      { timeout: 8000 }
    );

    // Capture the count once settled, then confirm it stays stable — the old
    // bug kept invalidating/refetching forever on zero results.
    const countAtSettle = spatialCallCount;
    expect(countAtSettle).toBeLessThanOrEqual(5);

    await new Promise((r) => setTimeout(r, 1500));
    expect(spatialCallCount).toBe(countAtSettle);
  });

  it('shows the web-discovery spinner before settling when DB coverage is empty', async () => {
    setLocationSearch('Ranger, TX');

    // Hold the discovery response open so we can observe the interim spinner.
    let releaseDiscovery: (value: { results: any[] }) => void = () => {};
    const discoveryPromise = new Promise<{ results: any[] }>((resolve) => {
      releaseDiscovery = resolve;
    });

    global.fetch = jest.fn((input: any) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      const jsonResponse = (body: any) =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(body),
          text: () => Promise.resolve(JSON.stringify(body)),
        } as unknown as Response);

      if (url.includes('/api/communities/search/spatial')) {
        spatialCallCount += 1;
        return jsonResponse([]);
      }
      if (url.includes('/api/global-discovery/search')) {
        return discoveryPromise.then(
          (body) =>
            ({
              ok: true,
              status: 200,
              json: () => Promise.resolve(body),
              text: () => Promise.resolve(JSON.stringify(body)),
            } as unknown as Response)
        );
      }
      if (url.includes('/api/geocode')) {
        return jsonResponse({ success: true, lat: 32.5, lng: -96.5, location: 'test' });
      }
      if (url.includes('/api/settings/map-defaults')) {
        return jsonResponse({ lat: 32.5, lng: -96.5, zoom: 12 });
      }
      return jsonResponse([]);
    }) as any;

    renderPage();

    // Interim state: the "Searching the web…" discovery spinner is shown.
    await waitFor(
      () => {
        expect(screen.getByTestId('status-discovering')).toBeInTheDocument();
      },
      { timeout: 8000 }
    );

    // Resolve discovery with nothing — the panel settles, never stuck on loader.
    releaseDiscovery({ results: [] });

    await waitFor(
      () => {
        expect(screen.getByText(/No communities found/i)).toBeInTheDocument();
      },
      { timeout: 8000 }
    );
    expect(screen.queryByTestId('status-loading')).not.toBeInTheDocument();
  });

  it('shows community cards for a covered city (e.g. San Francisco)', async () => {
    setLocationSearch('San Francisco');
    installFetch({
      spatial: () => [
        {
          id: 1,
          name: 'San Francisco Senior Living',
          city: 'San Francisco',
          state: 'CA',
          latitude: 32.5,
          longitude: -96.5,
          careTypes: ['Assisted Living'],
        },
        {
          id: 2,
          name: 'San Francisco Memory Care',
          city: 'San Francisco',
          state: 'CA',
          latitude: 32.6,
          longitude: -96.6,
          careTypes: ['Memory Care'],
        },
      ],
    });

    renderPage();

    await waitFor(
      () => {
        expect(screen.getAllByTestId('community-card').length).toBeGreaterThan(0);
      },
      { timeout: 8000 }
    );

    expect(screen.queryByTestId('status-loading')).not.toBeInTheDocument();
    // Covered city should not trigger web discovery.
    const discoveryCalls = (global.fetch as jest.Mock).mock.calls.filter(([u]: any[]) =>
      String(u).includes('/api/global-discovery/search')
    );
    expect(discoveryCalls.length).toBe(0);
  });
});
