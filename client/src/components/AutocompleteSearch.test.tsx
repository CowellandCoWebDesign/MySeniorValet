import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AutocompleteSearch } from './AutocompleteSearch';
import { apiRequest } from '@/lib/queryClient';

// ---------------------------------------------------------------------------
// This suite previously crashed at import time: it imported `wouter` (ESM-only,
// not transformed by ts-jest) and asserted against a long-removed API surface
// (a 4-arg `apiRequest('GET', url, null, { query })`, a `role="searchbox"`
// input, aria-autocomplete attributes, and a "No results found" message that
// the component never renders). It now mocks wouter + the side-effecting hooks
// and asserts the component's *current* behavior:
//   - controlled input (value comes from props, parent owns it)
//   - suggestions fetched via apiRequest('GET', `/api/autocomplete/...&query=`)
//   - city/community suggestions rendered, selection wired to onSubmit / nav
// ---------------------------------------------------------------------------

// wouter is ESM-only; mock it so the component can be imported under ts-jest.
const mockSetLocation = jest.fn();
jest.mock('wouter', () => ({
  useLocation: () => ['/', mockSetLocation],
  Link: ({ children }: any) => children,
}));

// apiRequest is the real export shape (method, url) — mock the module so we
// control the suggestion payload without hitting the network.
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn(),
}));

// Debounce is a passthrough in tests so suggestions fetch synchronously.
jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));

jest.mock('@/hooks/useFavorites', () => ({
  useAddFavorite: () => ({ mutate: jest.fn() }),
  useRemoveFavorite: () => ({ mutate: jest.fn() }),
  useFavorites: () => ({ data: [] }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() }),
}));

// Phone reveal helpers used by community suggestion cards.
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));
jest.mock('@/hooks/useContactReveal', () => ({
  useContactReveal: () => ({
    isRevealed: () => false,
    reveal: jest.fn(),
    consentDialog: null,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockSuggestions = [
  {
    label: 'Dallas, TX',
    value: 'Dallas',
    type: 'city' as const,
    count: 103,
    description: 'City in Texas',
  },
  {
    label: 'Brookdale Senior Living Dallas',
    value: 'Brookdale Dallas',
    type: 'community' as const,
    id: 123,
    city: 'Dallas',
    state: 'TX',
    phone: '(214) 555-0123',
    rating: 4.5,
    reviewCount: 89,
    priceRange: { min: 3000, max: 5000 },
    careTypes: ['Assisted Living', 'Memory Care'],
  },
];

describe('AutocompleteSearch', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (apiRequest as jest.Mock).mockResolvedValue({ suggestions: mockSuggestions });
  });

  describe('Rendering', () => {
    it('renders the search input with the provided placeholder', () => {
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          placeholder="Search communities..."
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByPlaceholderText('Search communities...')).toBeInTheDocument();
    });

    it('shows the Search button by default and hides it when hideSearchButton is set', () => {
      const { rerender } = render(
        <AutocompleteSearch value="" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

      rerender(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          hideSearchButton
        />
      );
      expect(screen.queryByRole('button', { name: /search/i })).not.toBeInTheDocument();
    });
  });

  describe('Suggestions', () => {
    it('fetches suggestions via apiRequest with the query in the URL once 2+ chars are typed', async () => {
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          expect.stringContaining('/api/autocomplete/suggestions')
        );
      });
      const calledUrl = (apiRequest as jest.Mock).mock.calls[0][1] as string;
      expect(calledUrl).toContain('query=Dallas');
    });

    it('does not fetch suggestions for queries shorter than 2 characters', async () => {
      render(
        <AutocompleteSearch value="D" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );
      // Give effects a chance to run.
      await new Promise((r) => setTimeout(r, 50));
      expect(apiRequest).not.toHaveBeenCalled();
    });

    it('renders city and community suggestions from the response', async () => {
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      // "Dallas, TX" appears both as the city label and inside the community
      // card, so assert on the city's unique description instead.
      expect(await screen.findByText('City in Texas')).toBeInTheDocument();
      expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
    });

    it('calls onSubmit with the value when a non-community (city) suggestion is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      await user.click(await screen.findByText('City in Texas'));
      expect(mockOnSubmit).toHaveBeenCalledWith('Dallas');
    });

    it('navigates to the community page when a community suggestion is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      await user.click(await screen.findByText('Brookdale Senior Living Dallas'));
      // Community navigation uses the keyword-rich SEO URL, not /community/:id.
      expect(mockSetLocation).toHaveBeenCalledWith(expect.stringContaining('/senior-living/'));
    });
  });

  describe('Submission', () => {
    it('submits the current value when the Search button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      await user.click(screen.getByRole('button', { name: /search/i }));
      expect(mockOnSubmit).toHaveBeenCalledWith('Dallas');
    });

    it('submits the current value on Enter when no suggestion is highlighted', async () => {
      const user = userEvent.setup();
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByPlaceholderText(/search/i);
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(mockOnSubmit).toHaveBeenCalledWith('Dallas');
    });
  });

  describe('Error handling', () => {
    it('does not crash and shows no dropdown when the suggestions request fails', async () => {
      (apiRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      render(
        <AutocompleteSearch value="Dallas" onChange={mockOnChange} onSubmit={mockOnSubmit} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(apiRequest).toHaveBeenCalled());
      // No suggestions should be rendered after a failed fetch.
      await waitFor(() => {
        expect(screen.queryByText('Dallas, TX')).not.toBeInTheDocument();
      });
    });
  });
});
