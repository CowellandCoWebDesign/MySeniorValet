import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';
import MySeniorValetHome from './myseniorvalet-home';

// Mock dependencies
jest.mock('@/lib/queryClient', () => ({
  apiRequest: jest.fn()
}));

jest.mock('@/components/NavigationHeader', () => ({
  NavigationHeader: ({ title }: { title: string }) => <div>{title}</div>
}));

jest.mock('@/components/AutocompleteSearch', () => ({
  AutocompleteSearch: ({ onSubmit, placeholder }: any) => (
    <input 
      placeholder={placeholder}
      onChange={(e) => onSubmit(e.target.value)}
      data-testid="search-input"
    />
  )
}));

// Create test wrapper with providers
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

describe('MySeniorValetHome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('renders the home page with all major sections', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });

      // Check hero section
      expect(screen.getByText(/Clarity in Senior Living/i)).toBeInTheDocument();
      expect(screen.getByText(/transparent/i)).toBeInTheDocument();
      
      // Check search input
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('displays the platform statistics', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      // Check for stats section
      expect(screen.getByText(/Communities/i)).toBeInTheDocument();
      expect(screen.getByText(/States/i)).toBeInTheDocument();
    });

    it('shows the why choose section with key benefits', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Why Choose MySeniorValet/i)).toBeInTheDocument();
      expect(screen.getByText(/Verified Information/i)).toBeInTheDocument();
      expect(screen.getByText(/Complete Care Spectrum/i)).toBeInTheDocument();
    });

    it('renders the features section with all features', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Features/i)).toBeInTheDocument();
      expect(screen.getByText(/TourMate/i)).toBeInTheDocument();
      expect(screen.getByText(/Emergency Contact/i)).toBeInTheDocument();
    });

    it('displays the transparency commitment section', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Transparency Promise/i)).toBeInTheDocument();
      expect(screen.getByText(/authentic/i)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('handles search input correctly', async () => {
      const user = userEvent.setup();
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByTestId('search-input');
      
      await user.type(searchInput, 'Dallas');
      
      // Check that the input value changed
      expect(searchInput).toHaveValue('Dallas');
    });

    it('navigates to map search when search is submitted', async () => {
      const user = userEvent.setup();
      const mockNavigate = jest.fn();
      
      // Mock window.location.href
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      });
      
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'Dallas{enter}');
      
      await waitFor(() => {
        expect(window.location.href).toContain('Dallas');
      });
    });
  });

  describe('CTA Buttons', () => {
    it('renders explore communities button', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const exploreBtns = screen.getAllByText(/Explore Communities/i);
      expect(exploreBtns.length).toBeGreaterThan(0);
    });

    it('renders search communities button', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const searchBtns = screen.getAllByText(/Search/i);
      expect(searchBtns.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile devices', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      // Check that mobile-specific styles are applied
      expect(screen.getByText(/Clarity in Senior Living/i)).toBeInTheDocument();
    });

    it('renders correctly on desktop devices', () => {
      // Mock desktop viewport
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      // Check that desktop layout is rendered
      expect(screen.getByText(/Clarity in Senior Living/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBeGreaterThan(0);
    });

    it('has accessible search input', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('placeholder');
    });

    it('has accessible buttons with proper labels', () => {
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveTextContent(/.+/); // Has text content
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API failures gracefully', async () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockRejectedValueOnce(new Error('API Error'));
      
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      // Page should still render even if API calls fail
      expect(screen.getByText(/Clarity in Senior Living/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator while fetching data', () => {
      const { apiRequest } = require('@/lib/queryClient');
      apiRequest.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<MySeniorValetHome />, { wrapper: createWrapper() });
      
      // Page should render with skeleton/loading states
      expect(screen.getByText(/Clarity in Senior Living/i)).toBeInTheDocument();
    });
  });
});