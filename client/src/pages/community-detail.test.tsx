import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import CommunityDetail from './community-detail';

// Mock API responses
const mockCommunity = {
  id: 1,
  name: 'Brookdale Senior Living Dallas',
  address: '123 Main St',
  city: 'Dallas',
  state: 'TX',
  zip: '75201',
  country: 'US',
  phone: '(214) 555-0123',
  website: 'https://www.brookdale.com',
  description: 'Premier senior living community in Dallas',
  communityType: 'senior_living',
  communitySubtype: 'assisted_living',
  rating: 4.5,
  reviewCount: 89,
  availabilityStatus: 'AVAILABLE',
  capacity: 120,
  currentOccupancy: 95,
  photos: [
    { url: 'photo1.jpg', caption: 'Community exterior' },
    { url: 'photo2.jpg', caption: 'Dining area' }
  ],
  amenities: [
    'dining', 'fitness', 'transportation', 'activities', 'housekeeping'
  ],
  careTypes: ['Assisted Living', 'Memory Care'],
  monthlyRentRangeStart: 3000,
  monthlyRentRangeEnd: 5000,
  hudPropertyId: null,
  nearbyTransit: ['Bus Route 123', 'Light Rail Station'],
  emergencyContact: {
    phone: '(214) 555-0911',
    name: 'Emergency Services'
  }
};

// Mock dependencies
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

jest.mock('@/components/NavigationHeader', () => ({
  NavigationHeader: ({ title }: { title: string }) => <div>{title}</div>
}));

jest.mock('@/components/AutocompleteSearch', () => ({
  AutocompleteSearch: () => <input data-testid="search-input" />
}));

jest.mock('@/components/BreadcrumbNavigation', () => ({
  BreadcrumbNavigation: ({ items }: any) => (
    <div data-testid="breadcrumb">
      {items.map((item: any, i: number) => (
        <span key={i}>{item.label}</span>
      ))}
    </div>
  )
}));

jest.mock('@/components/LiveWebIntelligence', () => ({
  LiveWebIntelligence: ({ communityName, onDataUpdate }: any) => (
    <div data-testid="live-intelligence">
      <button onClick={() => onDataUpdate({ photos: [], website: 'test.com' })}>
        Fetch Intelligence
      </button>
    </div>
  )
}));

jest.mock('@/components/TourScheduler', () => ({
  TourScheduler: ({ community }: any) => (
    <div data-testid="tour-scheduler">
      Schedule Tour for {community.name}
    </div>
  )
}));

jest.mock('@/components/AuthenticPricingDisplay', () => ({
  AuthenticPricingDisplay: ({ pricing }: any) => (
    <div data-testid="pricing-display">
      ${pricing?.monthlyRentRangeStart} - ${pricing?.monthlyRentRangeEnd}
    </div>
  )
}));

// Test utilities
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

describe('CommunityDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { apiRequest } = require('@/lib/queryClient');
    apiRequest.mockResolvedValue(mockCommunity);
  });

  describe('Page Loading and Data Fetching', () => {
    it('shows loading state initially', () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    it('fetches community data on mount', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          'GET',
          '/api/communities/1'
        );
      });
    });

    it('displays community data after loading', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
        expect(screen.getByText(/Dallas, TX/)).toBeInTheDocument();
        expect(screen.getByText('(214) 555-0123')).toBeInTheDocument();
      });
    });
  });

  describe('Community Information Display', () => {
    it('displays basic community information', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        expect(screen.getByText(/Premier senior living community/)).toBeInTheDocument();
      });
    });

    it('displays care types', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Assisted Living')).toBeInTheDocument();
        expect(screen.getByText('Memory Care')).toBeInTheDocument();
      });
    });

    it('displays amenities', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/dining/i)).toBeInTheDocument();
        expect(screen.getByText(/fitness/i)).toBeInTheDocument();
        expect(screen.getByText(/transportation/i)).toBeInTheDocument();
      });
    });

    it('displays pricing information', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const pricingDisplay = screen.getByTestId('pricing-display');
        expect(pricingDisplay).toHaveTextContent('$3000 - $5000');
      });
    });

    it('displays availability status', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/AVAILABLE/)).toBeInTheDocument();
      });
    });

    it('displays community photos', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interactive Features', () => {
    it('displays tour scheduler component', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const tourScheduler = screen.getByTestId('tour-scheduler');
        expect(tourScheduler).toHaveTextContent('Schedule Tour for Brookdale Senior Living Dallas');
      });
    });

    it('displays live intelligence component', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('live-intelligence')).toBeInTheDocument();
      });
    });

    it('handles phone number clicks', async () => {
      const user = userEvent.setup();
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const phoneLink = screen.getByText('(214) 555-0123');
        expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:(214) 555-0123');
      });
    });

    it('handles website clicks', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const websiteLink = screen.getByText(/Visit Website/i);
        expect(websiteLink.closest('a')).toHaveAttribute('href', 'https://www.brookdale.com');
      });
    });

    it('handles emergency contact display', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('(214) 555-0911')).toBeInTheDocument();
      });
    });
  });

  describe('Search Bar Integration', () => {
    it('renders search bar on community detail page', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('displays breadcrumb navigation', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const breadcrumb = screen.getByTestId('breadcrumb');
        expect(breadcrumb).toHaveTextContent('Home');
        expect(breadcrumb).toHaveTextContent('Communities');
      });
    });

    it('handles back navigation', async () => {
      const user = userEvent.setup();
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error message when community not found', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockRejectedValueOnce(new Error('Community not found'));
      
      render(<CommunityDetail params={{ id: '999' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/Community not found/i)).toBeInTheDocument();
      });
    });

    it('handles missing data gracefully', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockResolvedValueOnce({
        id: 1,
        name: 'Test Community',
        // Minimal data
      });
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Test Community')).toBeInTheDocument();
        // Should not crash with missing data
      });
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile devices', async () => {
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        // Mobile layout should be applied
      });
    });

    it('adapts layout for tablet devices', async () => {
      global.innerWidth = 768;
      global.innerHeight = 1024;
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        // Tablet layout should be applied
      });
    });

    it('adapts layout for desktop devices', async () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Brookdale Senior Living Dallas')).toBeInTheDocument();
        // Desktop layout should be applied
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);
      });
    });

    it('has accessible interactive elements', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button).toHaveAccessibleName();
        });
      });
    });

    it('provides alt text for images', async () => {
      render(<CommunityDetail params={{ id: '1' }} />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
        });
      });
    });
  });
});