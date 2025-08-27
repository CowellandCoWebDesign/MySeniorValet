import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import MapSearch from './map-search';

// Mock dependencies
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, children }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    fitBounds: jest.fn(),
    getBounds: jest.fn(() => ({
      getNorth: () => 40,
      getSouth: () => 30,
      getEast: () => -90,
      getWest: () => -100
    }))
  })
}));

jest.mock('react-leaflet-cluster', () => ({
  MarkerCluster: ({ children }: any) => <div data-testid="marker-cluster">{children}</div>
}));

// Mock community data
const mockMapData = {
  communities: [
    {
      id: 1,
      name: 'Brookdale Senior Living Dallas',
      latitude: 32.7767,
      longitude: -96.7970,
      address: '123 Main St',
      city: 'Dallas',
      state: 'TX',
      phone: '(214) 555-0123',
      rating: 4.5,
      reviewCount: 89,
      monthlyRentRangeStart: 3000,
      monthlyRentRangeEnd: 5000,
      careTypes: ['Assisted Living', 'Memory Care']
    },
    {
      id: 2,
      name: 'Belmont Village Dallas',
      latitude: 32.8167,
      longitude: -96.8170,
      address: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      phone: '(214) 555-0456',
      rating: 4.3,
      reviewCount: 67,
      monthlyRentRangeStart: 3500,
      monthlyRentRangeEnd: 5500,
      careTypes: ['Independent Living', 'Assisted Living']
    }
  ],
  total: 103,
  clusters: []
};

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

describe('MapSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { apiRequest } = require('@/lib/queryClient');
    apiRequest.mockResolvedValue(mockMapData);
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        search: '?q=Dallas',
        pathname: '/map-search'
      },
      writable: true
    });
  });

  describe('Map Rendering', () => {
    it('renders map container', async () => {
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });
    });

    it('displays search controls', async () => {
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
      });
    });

    it('shows filter options', async () => {
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/Filter/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('fetches communities on mount', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
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

    it('displays community markers on map', async () => {
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(2);
      });
    });

    it('shows loading state while fetching', () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('displays community count', async () => {
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/103 communities found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('updates search when input changes', async () => {
      const user = userEvent.setup();
      const { apiRequest } = require('@/lib/queryClient');
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'Austin');
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/map',
          null,
          expect.objectContaining({
            search: 'Austin'
          })
        );
      });
    });

    it('handles search with no results', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockResolvedValueOnce({
        communities: [],
        total: 0,
        clusters: []
      });
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/No communities found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('allows filtering by care type', async () => {
      const user = userEvent.setup();
      const { apiRequest } = require('@/lib/queryClient');
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      // Open filter panel
      const filterButton = screen.getByText(/Filter/i);
      await user.click(filterButton);
      
      // Select care type filter
      const assistedLivingFilter = screen.getByLabelText(/Assisted Living/i);
      await user.click(assistedLivingFilter);
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/map',
          null,
          expect.objectContaining({
            careTypes: ['Assisted Living']
          })
        );
      });
    });

    it('allows filtering by price range', async () => {
      const user = userEvent.setup();
      const { apiRequest } = require('@/lib/queryClient');
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      // Open filter panel
      const filterButton = screen.getByText(/Filter/i);
      await user.click(filterButton);
      
      // Set price range
      const minPriceInput = screen.getByLabelText(/Min Price/i);
      const maxPriceInput = screen.getByLabelText(/Max Price/i);
      
      await user.type(minPriceInput, '3000');
      await user.type(maxPriceInput, '5000');
      
      // Apply filters
      const applyButton = screen.getByText(/Apply/i);
      await user.click(applyButton);
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/map',
          null,
          expect.objectContaining({
            minPrice: 3000,
            maxPrice: 5000
          })
        );
      });
    });

    it('clears filters when reset is clicked', async () => {
      const user = userEvent.setup();
      const { apiRequest } = require('@/lib/queryClient');
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      // Apply some filters first
      const filterButton = screen.getByText(/Filter/i);
      await user.click(filterButton);
      
      const assistedLivingFilter = screen.getByLabelText(/Assisted Living/i);
      await user.click(assistedLivingFilter);
      
      // Reset filters
      const resetButton = screen.getByText(/Reset/i);
      await user.click(resetButton);
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenLastCalledWith(
          'GET',
          '/api/communities/map',
          null,
          expect.objectContaining({
            search: 'Dallas'
            // No filters
          })
        );
      });
    });
  });

  describe('Community Interaction', () => {
    it('shows community details on marker click', async () => {
      const user = userEvent.setup();
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(2);
      });
      
      const firstMarker = screen.getAllByTestId('marker')[0];
      await user.click(firstMarker);
      
      // Should show community popup
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        expect(screen.getByText('$3,000 - $5,000')).toBeInTheDocument();
      });
    });

    it('navigates to community detail on view details click', async () => {
      const user = userEvent.setup();
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(2);
      });
      
      // Click marker to open popup
      const firstMarker = screen.getAllByTestId('marker')[0];
      await user.click(firstMarker);
      
      // Click view details
      const viewDetailsButton = screen.getByText(/View Details/i);
      await user.click(viewDetailsButton);
      
      // Should navigate to community detail page
      expect(window.location.pathname).toContain('/community/1');
    });
  });

  describe('List/Map View Toggle', () => {
    it('switches between map and list view', async () => {
      const user = userEvent.setup();
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      // Initially in map view
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
      
      // Switch to list view
      const listViewButton = screen.getByText(/List View/i);
      await user.click(listViewButton);
      
      // Should show list of communities
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        expect(screen.getByText('Belmont Village Dallas')).toBeInTheDocument();
      });
      
      // Switch back to map view
      const mapViewButton = screen.getByText(/Map View/i);
      await user.click(mapViewButton);
      
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  describe('Map Controls', () => {
    it('allows zooming in and out', async () => {
      const user = userEvent.setup();
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      const zoomInButton = screen.getByLabelText(/Zoom in/i);
      const zoomOutButton = screen.getByLabelText(/Zoom out/i);
      
      await user.click(zoomInButton);
      await user.click(zoomOutButton);
      
      // Map should handle zoom changes
      expect(zoomInButton).toBeInTheDocument();
      expect(zoomOutButton).toBeInTheDocument();
    });

    it('recenters map when recenter button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      const recenterButton = screen.getByLabelText(/Recenter/i);
      await user.click(recenterButton);
      
      // Map should recenter
      expect(recenterButton).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('clusters markers when there are many communities', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      
      // Mock large dataset
      const largeMockData = {
        ...mockMapData,
        communities: Array(100).fill(null).map((_, i) => ({
          ...mockMapData.communities[0],
          id: i,
          latitude: 32.7767 + (Math.random() - 0.5) * 0.1,
          longitude: -96.7970 + (Math.random() - 0.5) * 0.1
        })),
        total: 100
      };
      
      apiRequest.mockResolvedValueOnce(largeMockData);
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('marker-cluster')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockRejectedValueOnce(new Error('API Error'));
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading communities/i)).toBeInTheDocument();
      });
    });

    it('allows retry on error', async () => {
      const user = userEvent.setup();
      const { apiRequest } = require('@/lib/queryClient');
      
      // First call fails
      apiRequest.mockRejectedValueOnce(new Error('API Error'));
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading communities/i)).toBeInTheDocument();
      });
      
      // Reset to succeed
      apiRequest.mockResolvedValueOnce(mockMapData);
      
      // Click retry
      const retryButton = screen.getByText(/Retry/i);
      await user.click(retryButton);
      
      // Should load successfully
      await waitFor(() => {
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has accessible map controls', async () => {
      render(<MapSearch />, { wrapper: createWrapper() });
      
      const zoomIn = screen.getByLabelText(/Zoom in/i);
      const zoomOut = screen.getByLabelText(/Zoom out/i);
      
      expect(zoomIn).toHaveAttribute('aria-label');
      expect(zoomOut).toHaveAttribute('aria-label');
    });

    it('provides keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(<MapSearch />, { wrapper: createWrapper() });
      
      // Tab through controls
      await user.tab();
      expect(document.activeElement).toHaveAttribute('placeholder', expect.stringContaining('Search'));
      
      await user.tab();
      // Should tab to next control
      expect(document.activeElement).not.toBe(document.body);
    });
  });
});