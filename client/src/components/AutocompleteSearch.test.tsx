import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import { AutocompleteSearch } from './AutocompleteSearch';
import { apiRequest } from '@/lib/queryClient';

// Mock dependencies
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

jest.mock('@/hooks/useFavorites', () => ({
  useAddFavorite: () => ({ mutate: jest.fn() }),
  useRemoveFavorite: () => ({ mutate: jest.fn() }),
  useFavorites: () => ({ data: [] })
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value
}));

// Create test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Router hook={memoryLocation()}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Router>
  );
};

// Mock suggestion data
const mockSuggestions = [
  {
    label: 'Dallas, TX',
    value: 'Dallas',
    type: 'city' as const,
    count: 103,
    description: 'City in Texas'
  },
  {
    label: 'Brookdale Senior Living Dallas',
    value: 'Brookdale Dallas',
    type: 'community' as const,
    id: 123,
    city: 'Dallas',
    state: 'TX',
    address: '123 Main St, Dallas, TX',
    phone: '(214) 555-0123',
    rating: 4.5,
    reviewCount: 89,
    priceRange: { min: 3000, max: 5000 },
    careTypes: ['Assisted Living', 'Memory Care']
  },
  {
    label: 'Texas',
    value: 'Texas',
    type: 'state' as const,
    count: 1500,
    description: 'State'
  }
];

describe('AutocompleteSearch', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (apiRequest as jest.Mock).mockResolvedValue({ 
      suggestions: mockSuggestions 
    });
  });

  describe('Component Rendering', () => {
    it('renders search input with placeholder', () => {
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          placeholder="Search communities..."
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByPlaceholderText('Search communities...');
      expect(input).toBeInTheDocument();
    });

    it('displays search button when hideSearchButton is false', () => {
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          hideSearchButton={false}
        />,
        { wrapper: createWrapper() }
      );

      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
    });

    it('hides search button when hideSearchButton is true', () => {
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          hideSearchButton={true}
        />,
        { wrapper: createWrapper() }
      );

      const searchButton = screen.queryByRole('button', { name: /search/i });
      expect(searchButton).not.toBeInTheDocument();
    });

    it('shows loading spinner when isLoading is true', () => {
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          isLoading={true}
        />,
        { wrapper: createWrapper() }
      );

      // Check for loading indicator (Loader2 icon)
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Autocomplete Suggestions', () => {
    it('fetches and displays suggestions when typing', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      
      await user.type(input, 'Dallas');
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/autocomplete/suggestions',
          null,
          expect.objectContaining({
            query: 'Dallas'
          })
        );
      });
    });

    it('displays city suggestions correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
        expect(screen.getByText('103 communities')).toBeInTheDocument();
      });
    });

    it('displays community suggestions with details', async () => {
      render(
        <AutocompleteSearch
          value="Brookdale"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        expect(screen.getByText('123 Main St, Dallas, TX')).toBeInTheDocument();
        expect(screen.getByText('(214) 555-0123')).toBeInTheDocument();
        expect(screen.getByText(/4.5/)).toBeInTheDocument();
        expect(screen.getByText('Assisted Living')).toBeInTheDocument();
        expect(screen.getByText('Memory Care')).toBeInTheDocument();
      });
    });

    it('navigates to community detail when community is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
      });

      const communityOption = screen.getByText('Brookdale Senior Living Dallas');
      await user.click(communityOption);

      // Should navigate to community detail page
      await waitFor(() => {
        expect(window.location.pathname).toContain('/community/123');
      });
    });

    it('submits search query when non-community suggestion is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      const cityOption = screen.getByText('Dallas, TX');
      await user.click(cityOption);

      expect(mockOnSubmit).toHaveBeenCalledWith('Dallas');
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates suggestions with arrow keys', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      // Press down arrow
      await user.type(input, '{arrowdown}');
      
      // First suggestion should be highlighted
      const firstSuggestion = screen.getByText('Dallas, TX').closest('div');
      expect(firstSuggestion).toHaveClass('bg-gray-100');

      // Press down arrow again
      await user.type(input, '{arrowdown}');
      
      // Second suggestion should be highlighted
      const secondSuggestion = screen.getByText('Brookdale Senior Living Dallas').closest('div');
      expect(secondSuggestion).toHaveClass('bg-gray-100');

      // Press Enter to select
      await user.type(input, '{enter}');
      
      // Should navigate to community
      expect(window.location.pathname).toContain('/community/123');
    });

    it('closes suggestions on Escape key', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      // Press Escape
      await user.type(input, '{escape}');
      
      // Suggestions should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Dallas, TX')).not.toBeInTheDocument();
      });
    });
  });

  describe('Search Submission', () => {
    it('submits search on button click', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const searchButton = screen.getByRole('button', { name: /search/i });
      await user.click(searchButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('Dallas');
    });

    it('submits search on Enter key when no suggestion selected', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      await user.type(input, '{enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('Dallas');
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      (apiRequest as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Dallas');

      // Should not crash, suggestions list should be empty
      await waitFor(() => {
        expect(screen.queryByText('Dallas, TX')).not.toBeInTheDocument();
      });
    });

    it('handles empty search results', async () => {
      (apiRequest as jest.Mock).mockResolvedValueOnce({ suggestions: [] });
      
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      await user.type(input, 'NonexistentPlace');

      // Should show no results message
      await waitFor(() => {
        expect(screen.getByText(/No results found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      expect(input).toHaveAttribute('aria-expanded');
      expect(input).toHaveAttribute('aria-controls');
    });

    it('announces selected suggestion to screen readers', async () => {
      const user = userEvent.setup();
      
      render(
        <AutocompleteSearch
          value="Dallas"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      await user.type(input, '{arrowdown}');
      
      // Check for aria-selected attribute
      const selectedOption = screen.getByText('Dallas, TX').closest('[role="option"]');
      expect(selectedOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Performance', () => {
    it('debounces API calls when typing quickly', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(
        <AutocompleteSearch
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />,
        { wrapper: createWrapper() }
      );

      const input = screen.getByRole('searchbox');
      
      // Type quickly
      await user.type(input, 'D');
      await user.type(input, 'a');
      await user.type(input, 'l');
      await user.type(input, 'l');
      await user.type(input, 'a');
      await user.type(input, 's');
      
      // Fast typing should result in only one API call due to debouncing
      act(() => {
        jest.runAllTimers();
      });
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledTimes(1);
      });
      
      jest.useRealTimers();
    });
  });
});