import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import MySeniorValetHome from './myseniorvalet-home';

// ---------------------------------------------------------------------------
// This suite used to crash at import (`wouter` is ESM-only and not transformed
// by ts-jest) and asserted hero/section copy that has since been rewritten
// (e.g. "Clarity in Senior Living", "Why Choose MySeniorValet"). The home page
// has no early returns and always renders a very large tree, so — mirroring
// the map-search test — we mock wouter, the context hooks, and the heaviest
// child sections, stub fetch, and assert the page mounts and renders the
// current "Search Communities" entry point on the default Communities tab.
// ---------------------------------------------------------------------------

const mockSetLocation = jest.fn();
jest.mock('wouter', () => ({
  useLocation: () => ['/', mockSetLocation],
  Link: ({ children }: any) => children,
}));

// Context hooks that throw without their providers.
jest.mock('@/components/theme-provider', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  ThemeToggle: () => null,
}));
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k: string) => k, language: 'en', setLanguage: jest.fn() }),
}));
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));
jest.mock('@/hooks/useAccessibilityPreferences', () => ({
  useAccessibilityPreferences: () => ({
    preferences: { reducedMotion: false },
    togglePreference: jest.fn(),
  }),
}));
jest.mock('@/hooks/useSEO', () => ({
  useSEO: jest.fn(),
  SEOTemplates: {},
}));

// AutocompleteSearch is covered by its own suite — stub it to a plain input so
// the home page's search bars render deterministically.
jest.mock('@/components/AutocompleteSearch', () => ({
  AutocompleteSearch: ({ placeholder, value, onChange }: any) => (
    <input
      data-testid="search-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

// Heavy child sections (data fetching, framer-motion carousels, portals, chat
// kit, maps) that aren't the focus of these tests. A Proxy returns a null-
// rendering component for ANY export name (default OR named), so we don't have
// to enumerate each module's export shape. `__esModule` stays a real boolean so
// esModule interop treats these as ES modules.
// Function declaration (hoisted) + `mock` prefix so jest's mock-factory hoist
// rule allows referencing it and it's initialized before the factories run.
function mockNullModule() {
  return new Proxy(
    {},
    {
      get: (_t, prop) => {
        if (prop === '__esModule') return true;
        if (prop === 'commonBadges' || prop === 'organizationSchema' || prop === 'searchActionSchema') return {};
        return () => null;
      },
    },
  );
}

jest.mock('@/components/CommunityDirectorySections', () => mockNullModule());
jest.mock('@/components/VendorServiceCard', () => mockNullModule());
jest.mock('@/components/ServiceBadges', () => mockNullModule());
jest.mock('@/components/pricing-breakdown', () => mockNullModule());
jest.mock('@/components/CareServiceCard', () => mockNullModule());
jest.mock('@/components/ProfessionalNavbar', () => mockNullModule());
jest.mock('@/components/language-switcher', () => mockNullModule());
jest.mock('@/components/canadian-stats-card', () => mockNullModule());
jest.mock('@/components/CareSpectrumSlider', () => mockNullModule());
jest.mock('@/components/RemovalRequestModal', () => mockNullModule());
jest.mock('@/components/onboarding/OnboardingWrapper', () => mockNullModule());
jest.mock('@/components/onboarding/PersonalizedBanner', () => mockNullModule());
jest.mock('@/components/RedTagDeals', () => mockNullModule());
jest.mock('@/components/GeographicCommunitiesSection', () => mockNullModule());
jest.mock('@/components/MarketIntelligence', () => mockNullModule());
jest.mock('@/components/MoveInCostCalculator', () => mockNullModule());
jest.mock('@/components/RecentlyDiscoveredCommunities', () => mockNullModule());
jest.mock('@/components/HUDCommunitiesSection', () => mockNullModule());
jest.mock('@/components/DynamicCommunitySection', () => mockNullModule());
jest.mock('@/components/CommunityCard', () => mockNullModule());
jest.mock('@/components/AidAndAttendance', () => mockNullModule());
jest.mock('@/components/CostComparisonWorksheet', () => mockNullModule());
jest.mock('@/components/HospitalCarousel', () => mockNullModule());
jest.mock('@/components/footer', () => mockNullModule());
jest.mock('@/components/BreadcrumbNavigation', () => mockNullModule());
jest.mock('@/components/mascot/HeroMascotPanel', () => mockNullModule());
jest.mock('@/components/MascotLoadingDisplay', () => mockNullModule());
jest.mock('@/components/UnifiedSearch', () => mockNullModule());
jest.mock('@/components/AIChatResponse', () => mockNullModule());
jest.mock('@/components/ComprehensiveSearch', () => mockNullModule());
jest.mock('@/components/LearnModeInterface', () => mockNullModule());
jest.mock('@/components/GracefulFallbackMessage', () => mockNullModule());
jest.mock('@/components/GlobalDiscoveryModal', () => mockNullModule());
jest.mock('@/components/DynamicSearchSEO', () => mockNullModule());
jest.mock('@/components/MySeniorValetChatKit', () => mockNullModule());
jest.mock('@/components/SEOMetaTags', () => mockNullModule());
jest.mock('@/components/StructuredData', () => mockNullModule());
jest.mock('@/components/EmergencyButton', () => mockNullModule());

function installFetch(routes: Record<string, any> = {}) {
  global.fetch = jest.fn((input: any) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    let body: any = {};
    for (const key of Object.keys(routes)) {
      if (url.includes(key)) {
        body = routes[key];
        break;
      }
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response);
  }) as any;
}

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('MySeniorValetHome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    installFetch({
      '/api/communities/count': { count: '32000', communities: '32000', services: '0', isGlobal: true },
      '/api/communities/stats': { totalCommunities: '32000' },
      '/api/home-sections/active': [],
      '/api/platform/stats': {},
      '/api/market/overview': {},
    });
  });

  it('mounts without crashing and renders the search entry point', async () => {
    render(<MySeniorValetHome />, { wrapper: createWrapper() });

    // The Communities tab is active by default and renders the search bar.
    await waitFor(() => {
      expect(screen.getByText(/Search Communities/i)).toBeInTheDocument();
    });
  });

  it('renders the stubbed search input on the default tab', async () => {
    render(<MySeniorValetHome />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getAllByTestId('search-input').length).toBeGreaterThan(0);
    });
  });

  it('renders the hero headline', async () => {
    render(<MySeniorValetHome />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText(/You Don't Have To Navigate Senior Care Alone/i),
      ).toBeInTheDocument();
    });
  });
});
