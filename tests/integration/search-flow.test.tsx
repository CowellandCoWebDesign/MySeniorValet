import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import App from '@/App';

// Mock external dependencies
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn(),
  queryClient: new QueryClient()
}));

// Mock data
const mockSearchResults = {
  suggestions: [
    {
      label: 'Dallas, TX',
      value: 'Dallas',
      type: 'city',
      count: 103
    },
    {
      label: 'Brookdale Senior Living Dallas',
      value: 'Brookdale Dallas',
      type: 'community',
      id: 123,
      city: 'Dallas',
      state: 'TX',
      address: '123 Main St, Dallas, TX',
      phone: '(214) 555-0123'
    }
  ]
};

const mockCommunityDetails = {
  id: 123,
  name: 'Brookdale Senior Living Dallas',
  address: '123 Main St',
  city: 'Dallas',
  state: 'TX',
  zip: '75201',
  phone: '(214) 555-0123',
  website: 'https://www.brookdale.com',
  description: 'Premier senior living community',
  rating: 4.5,
  reviewCount: 89,
  photos: ['photo1.jpg', 'photo2.jpg'],
  amenities: ['dining', 'fitness'],
  careTypes: ['Assisted Living', 'Memory Care'],
  monthlyRentRangeStart: 3000,
  monthlyRentRangeEnd: 5000
};

const mockMapData = {
  communities: [
    {
      id: 123,
      name: 'Brookdale Senior Living Dallas',
      latitude: 32.7767,
      longitude: -96.7970,
      city: 'Dallas',
      state: 'TX'
    },
    {
      id: 124,
      name: 'Belmont Village Dallas',
      latitude: 32.8167,
      longitude: -96.8170,
      city: 'Dallas', 
      state: 'TX'
    }
  ],
  clusters: [],
  total: 103
};

describe('Search Flow Integration Tests', () => {
  let apiRequest: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiRequest = require('@/lib/queryClient').apiRequest;
    
    // Default mock responses
    apiRequest.mockImplementation((method: string, url: string) => {
      if (url.includes('/api/autocomplete/suggestions')) {
        return Promise.resolve(mockSearchResults);
      }
      if (url.includes('/api/communities/123')) {
        return Promise.resolve(mockCommunityDetails);
      }
      if (url.includes('/api/communities/map')) {
        return Promise.resolve(mockMapData);
      }
      if (url.includes('/api/platform/stats')) {
        return Promise.resolve({
          totalCommunities: '34,365',
          citiesCovered: '6,908',
          statesCovered: '190'
        });
      }
      return Promise.resolve({});
    });
  });

  describe('Complete Search to Detail Flow', () => {
    it('allows user to search and navigate to community detail', async () => {
      const user = userEvent.setup();
      
      // Start at home page
      render(<App />);
      
      // Verify home page loads
      await waitFor(() => {
        expect(screen.getByText(/Clarity in Senior Living/i)).toBeInTheDocument();
      });

      // Find and interact with search bar
      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      expect(searchInput).toBeInTheDocument();

      // Type in search
      await user.type(searchInput, 'Dallas');

      // Wait for autocomplete suggestions
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/autocomplete/suggestions',
          null,
          expect.objectContaining({ query: 'Dallas' })
        );
      });

      // Verify suggestions appear
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
        expect(screen.getByText('103 communities')).toBeInTheDocument();
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
      });

      // Click on a community suggestion
      const communitySuggestion = screen.getByText('Brookdale Senior Living Dallas');
      await user.click(communitySuggestion);

      // Should navigate to community detail page
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/123'
        );
      });

      // Verify community detail page loads
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('(214) 555-0123')).toBeInTheDocument();
        expect(screen.getByText('$3000 - $5000')).toBeInTheDocument();
      });
    });

    it('allows user to search cities and view map results', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Search for a city
      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      await user.type(searchInput, 'Dallas');

      // Wait for suggestions
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      // Click on city suggestion
      const citySuggestion = screen.getByText('Dallas, TX');
      await user.click(citySuggestion);

      // Should navigate to map search with query
      await waitFor(() => {
        expect(window.location.pathname).toContain('/map-search');
        expect(window.location.search).toContain('Dallas');
      });

      // Map should load with results
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/map',
          null,
          expect.objectContaining({ 
            search: 'Dallas'
          })
        );
      });
    });

    it('handles search with no results gracefully', async () => {
      const user = userEvent.setup();
      apiRequest.mockResolvedValueOnce({ suggestions: [] });
      
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      await user.type(searchInput, 'NonexistentPlace');

      await waitFor(() => {
        expect(screen.getByText(/No results found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Direct Navigation', () => {
    it('allows direct navigation to community detail via URL', async () => {
      // Navigate directly to community detail
      window.history.pushState({}, '', '/community/123');
      
      render(<App />);

      // Should fetch community details
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/123'
        );
      });

      // Community detail should load
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
      });
    });

    it('shows error for non-existent community', async () => {
      apiRequest.mockRejectedValueOnce(new Error('Community not found'));
      
      window.history.pushState({}, '', '/community/999');
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Community not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Persistence', () => {
    it('maintains search context when navigating back', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Perform a search
      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      await user.type(searchInput, 'Dallas');

      // Navigate to a community
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
      });
      
      const community = screen.getByText('Brookdale Senior Living Dallas');
      await user.click(community);

      // Wait for detail page
      await waitFor(() => {
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Search value should be preserved
      const searchInputAfterBack = screen.getByPlaceholderText(/Search communities/i);
      expect(searchInputAfterBack).toHaveValue('Dallas');
    });
  });

  describe('Performance', () => {
    it('caches repeated searches', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      
      // First search
      await user.type(searchInput, 'Dallas');
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      // Clear and search again
      await user.clear(searchInput);
      await user.type(searchInput, 'Dallas');

      // Should use cached results (only called once)
      expect(apiRequest).toHaveBeenCalledWith(
        'GET',
        '/api/autocomplete/suggestions',
        null,
        expect.objectContaining({ query: 'Dallas' })
      );
      expect(apiRequest).toHaveBeenCalledTimes(1);
    });

    it('debounces rapid typing', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      
      // Type rapidly
      await user.type(searchInput, 'D');
      await user.type(searchInput, 'a');
      await user.type(searchInput, 'l');
      await user.type(searchInput, 'l');
      await user.type(searchInput, 'a');
      await user.type(searchInput, 's');

      // Advance timers
      jest.runAllTimers();

      // Should only make one API call due to debouncing
      await waitFor(() => {
        const autocompleteCalls = apiRequest.mock.calls.filter(
          call => call[1].includes('/api/autocomplete')
        );
        expect(autocompleteCalls.length).toBe(1);
      });

      jest.useRealTimers();
    });
  });

  describe('Error Recovery', () => {
    it('recovers from API errors and allows retry', async () => {
      const user = userEvent.setup();
      
      // First call fails
      apiRequest.mockRejectedValueOnce(new Error('Network error'));
      
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      await user.type(searchInput, 'Dallas');

      // Error handled gracefully
      await waitFor(() => {
        expect(screen.queryByText('Dallas, TX')).not.toBeInTheDocument();
      });

      // Reset mock to succeed
      apiRequest.mockResolvedValueOnce(mockSearchResults);

      // Retry search
      await user.clear(searchInput);
      await user.type(searchInput, 'Dallas');

      // Should work now
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('maintains focus management through navigation', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      // Focus on search
      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Type and navigate
      await user.type(searchInput, 'Dallas');
      
      await waitFor(() => {
        expect(screen.getByText('Dallas, TX')).toBeInTheDocument();
      });

      // Use keyboard to select
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');

      // Focus should be managed appropriately on new page
      await waitFor(() => {
        expect(document.activeElement).not.toBe(searchInput);
      });
    });

    it('provides screen reader announcements for search results', async () => {
      const user = userEvent.setup();
      
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/Search communities/i);
      await user.type(searchInput, 'Dallas');

      await waitFor(() => {
        // Check for ARIA live region or status
        const statusElements = screen.getAllByRole('status');
        expect(statusElements.length).toBeGreaterThan(0);
      });
    });
  });
});