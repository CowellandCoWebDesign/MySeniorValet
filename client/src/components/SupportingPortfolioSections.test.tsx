import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SupportingPortfolioSections,
  dedupeCommunitiesById,
} from './SupportingPortfolioSections';

// wouter is ESM-only under ts-jest; CommunityCard imports it transitively.
jest.mock('wouter', () => ({
  useLocation: () => ['/', jest.fn()],
  Link: ({ children }: any) => children,
}));
jest.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k: string) => k, language: 'en', setLanguage: jest.fn() }),
}));

// CommunityCard is covered by its own concerns; stub to a minimal node that
// exposes the community id so we can assert dedupe/rendering behaviour.
jest.mock('@/components/CommunityCard', () => ({
  CommunityCard: ({ community }: any) => (
    <div data-testid={`card-${community.id}`}>{community.name}</div>
  ),
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('dedupeCommunitiesById', () => {
  it('removes duplicate communities by id, keeping first occurrence', () => {
    const input = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 1, name: 'A duplicate' },
    ];
    const out = dedupeCommunitiesById(input);
    expect(out).toHaveLength(2);
    expect(out.map((c) => c.id)).toEqual([1, 2]);
    expect(out[0].name).toBe('A');
  });

  it('accepts communityId as an id fallback and keeps id-less rows', () => {
    const input = [
      { communityId: 5, name: 'X' },
      { communityId: 5, name: 'X dup' },
      { name: 'no id 1' },
      { name: 'no id 2' },
    ];
    const out = dedupeCommunitiesById(input);
    // 1 deduped + 2 id-less kept
    expect(out).toHaveLength(3);
  });

  it('handles null/empty input', () => {
    expect(dedupeCommunitiesById([] as any)).toEqual([]);
    expect(dedupeCommunitiesById(null as any)).toEqual([]);
  });
});

describe('SupportingPortfolioSections', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('consumes the canonical supporting-portfolios endpoint', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch' as any)
      .mockResolvedValue({
        ok: true,
        json: async () => ({ families: [] }),
      } as any);

    renderWithClient(<SupportingPortfolioSections />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/communities/supporting-portfolios',
        expect.objectContaining({ credentials: 'include' }),
      );
    });
  });

  it('renders one section per approved family and dedupes cards by id', async () => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        families: [
          {
            id: 10,
            slug: 'discovery',
            name: 'Discovery Senior Living',
            communities: [
              { id: 100, name: 'Alpha' },
              { id: 101, name: 'Beta' },
              { id: 100, name: 'Alpha dup' },
            ],
          },
          {
            id: 20,
            slug: 'atria',
            name: 'Atria Senior Living',
            communities: [{ id: 200, name: 'Gamma' }],
          },
        ],
      }),
    } as any);

    renderWithClient(<SupportingPortfolioSections />);

    await waitFor(() => {
      expect(screen.getByTestId('portfolio-section-discovery')).toBeInTheDocument();
    });
    expect(screen.getByTestId('portfolio-section-atria')).toBeInTheDocument();

    // Discovery had 3 communities but one duplicate id → 2 rendered cards.
    expect(screen.getByTestId('card-100')).toBeInTheDocument();
    expect(screen.getByTestId('card-101')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-count-discovery')).toHaveTextContent('2 Communities');
  });

  it('does not use literal comprehensive-search brand queries', async () => {
    const fetchMock = jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ families: [] }),
    } as any);

    renderWithClient(<SupportingPortfolioSections />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const calledUrls = fetchMock.mock.calls.map((c: any[]) => String(c[0]));
    expect(calledUrls.some((u) => u.includes('/api/search/comprehensive'))).toBe(false);
  });

  it('renders nothing when there are no approved families', async () => {
    jest.spyOn(global, 'fetch' as any).mockResolvedValue({
      ok: true,
      json: async () => ({ families: [] }),
    } as any);

    const { container } = renderWithClient(<SupportingPortfolioSections />);

    await waitFor(() => {
      expect(container.querySelector('[data-testid^="portfolio-section-"]')).toBeNull();
    });
  });
});
