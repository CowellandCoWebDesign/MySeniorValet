import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import CommunityDetail from './community-detail';

// ---------------------------------------------------------------------------
// This suite used to crash at import (it imported `wouter`, ESM-only and not
// transformed by ts-jest) and asserted a removed contract: it passed
// `params={{ id }}` as a prop and mocked `apiRequest`, but the page now reads
// `useParams()` from wouter and fetches the community through the default
// react-query fetcher. The happy-path assertions also referenced UI that has
// since changed. These tests exercise the page's *current* early-return
// behavior (invalid id, load error, not-found) which is the stable, valuable
// contract — the full detail body pulls in dozens of heavy children.
// ---------------------------------------------------------------------------

// react-markdown ships ESM-only and isn't transformed under ts-jest.
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// Mutable params so each test can drive the route the page sees.
let mockParams: Record<string, string | undefined> = { id: '1' };
const mockSetLocation = jest.fn();
jest.mock('wouter', () => ({
  useParams: () => mockParams,
  useLocation: () => ['/', mockSetLocation],
  Link: ({ children }: any) => children,
}));

// Context + side-effecting hooks that would otherwise throw without providers
// or hit the network/timers.
jest.mock('@/contexts/ResponsiveContext', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTabletOrDesktop: true,
    isDesktopOrLarger: true,
    getResponsiveClass: (m: string) => m,
    getResponsiveValue: (m: any) => m,
  }),
}));
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, user: null }),
}));
jest.mock('@/hooks/useContactReveal', () => ({
  useContactReveal: () => ({ isRevealed: () => false, reveal: jest.fn(), consentDialog: null }),
}));
jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({ data: [], isLoading: false }),
  useAddFavorite: () => ({ mutate: jest.fn() }),
  useRemoveFavorite: () => ({ mutate: jest.fn() }),
}));
jest.mock('@/hooks/useVirtualTourDetection', () => ({
  useVirtualTourDetection: () => ({
    virtualTour: null,
    isLoading: false,
    refreshDetection: jest.fn(),
  }),
}));
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

// SEO components render <head> tags / structured data we don't need here.
jest.mock('@/components/SEOMetaTags', () => ({ SEOMetaTags: () => null }));
jest.mock('@/components/StructuredData', () => ({
  __esModule: true,
  default: () => null,
  StructuredData: () => null,
  createCommunitySchema: () => ({}),
}));

function installFetch(handler: (url: string) => { ok: boolean; status?: number; body: any }) {
  global.fetch = jest.fn((input: any) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const { ok, status = ok ? 200 : 500, body } = handler(url);
    return Promise.resolve({
      ok,
      status,
      statusText: ok ? 'OK' : 'ERROR',
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    } as unknown as Response);
  }) as any;
}

// Use the real app queryClient so the default fetch-based queryFn is wired up.
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CommunityDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
    mockParams = { id: '1' };
  });

  it('shows an invalid-id message when the route id is not a number', () => {
    mockParams = { id: 'not-a-number' };
    installFetch(() => ({ ok: true, body: {} }));

    render(<CommunityDetail />, { wrapper: createWrapper() });

    expect(screen.getByText(/Invalid community ID/i)).toBeInTheDocument();
  });

  it('shows a "Community Not Available" error card when the fetch fails', async () => {
    installFetch((url) => {
      if (url.includes('/api/communities/1')) return { ok: false, status: 500, body: { error: 'boom' } };
      return { ok: true, body: {} };
    });

    render(<CommunityDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Community Not Available/i)).toBeInTheDocument();
    });
  });

  it('shows a "Community Not Found" card when the community resolves to nothing', async () => {
    installFetch((url) => {
      if (url.includes('/api/communities/1')) return { ok: true, body: null };
      return { ok: true, body: {} };
    });

    render(<CommunityDetail />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Community Not Found/i)).toBeInTheDocument();
    });
  });
});
