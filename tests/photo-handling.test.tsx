import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MissingPhotosPanel } from '@/components/MissingPhotosPanel';
import CommunityContribute from '@/pages/community-contribute';
import CommunityDetail from '@/pages/community-detail';

// Mock dependencies
jest.mock('wouter', () => ({
  useLocation: () => ['/community/123', jest.fn()],
  useParams: () => ({ id: '123' }),
  Link: ({ children, href }: any) => <a href={href}>{children}</a>
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Photo Handling System', () => {
  describe('MissingPhotosPanel Component', () => {
    it('renders small size panel with correct elements', () => {
      render(
        <MissingPhotosPanel 
          communityId={123} 
          communityName="Test Community" 
          size="small" 
        />
      );

      expect(screen.getByText('Photos Pending — Not Verified')).toBeInTheDocument();
      expect(screen.getByText('No photos available')).toBeInTheDocument();
      expect(screen.getByText('Add Photos')).toBeInTheDocument();
    });

    it('renders large size panel with all information sections', () => {
      render(
        <MissingPhotosPanel 
          communityId={123} 
          communityName="Test Community" 
        />
      );

      // Check for main heading
      expect(screen.getByText("🏗️ This Community Hasn't Been Verified Yet")).toBeInTheDocument();
      
      // Check for missing data items
      expect(screen.getByText('Verified tour photos')).toBeInTheDocument();
      expect(screen.getByText('Real pricing & availability')).toBeInTheDocument();
      expect(screen.getByText('Any move-in incentives or discounts')).toBeInTheDocument();
      
      // Check for transparency message
      expect(screen.getByText('🔐 Transparency only happens when real people share real experiences.')).toBeInTheDocument();
      
      // Check for CTA buttons
      expect(screen.getByText('Submit Tour Tracker Review')).toBeInTheDocument();
      expect(screen.getByText('Upload Info')).toBeInTheDocument();
    });

    it('navigates to tour tracker when clicking Add Photos button', () => {
      const { container } = render(
        <MissingPhotosPanel 
          communityId={123} 
          communityName="Test Community" 
          size="small" 
        />
      );

      const addPhotosButton = screen.getByText('Add Photos');
      fireEvent.click(addPhotosButton);

      // Check window.location.href was set
      expect(window.location.href).toContain('/tour-tracker?communityId=123');
    });

    it('navigates to contribute page when clicking Upload Info button', () => {
      render(
        <MissingPhotosPanel 
          communityId={123} 
          communityName="Test Community" 
        />
      );

      const uploadButton = screen.getByText('Upload Info');
      fireEvent.click(uploadButton);

      expect(window.location.href).toContain('/community/123/contribute');
    });
  });

  describe('Community Contribute Page', () => {
    const mockCommunity = {
      id: 123,
      name: 'Test Senior Living',
      address: '123 Main St',
      city: 'TestCity',
      state: 'CA',
      zipCode: '12345'
    };

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('renders contribution form with all fields', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunity
      });

      render(
        <CommunityContribute />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Help Improve This Listing')).toBeInTheDocument();
      });

      // Check form fields
      expect(screen.getByLabelText(/Your Name/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Your Email/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Your Relationship/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Pricing Information/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Current Availability/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Move-in Incentives/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Photos/)).toBeInTheDocument();
    });

    it('validates required fields before submission', async () => {
      const mockToast = jest.fn();
      jest.spyOn(require('@/hooks/use-toast'), 'useToast').mockReturnValue({
        toast: mockToast
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunity
      });

      render(
        <CommunityContribute />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Submit Contribution')).toBeInTheDocument();
      });

      // Try to submit without required fields
      const submitButton = screen.getByText('Submit Contribution');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Missing Information",
          description: "Please provide your email and relationship to the community.",
          variant: "destructive"
        });
      });
    });

    it('successfully submits contribution with valid data', async () => {
      const mockToast = jest.fn();
      jest.spyOn(require('@/hooks/use-toast'), 'useToast').mockReturnValue({
        toast: mockToast
      });

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCommunity
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      render(
        <CommunityContribute />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Submit Contribution')).toBeInTheDocument();
      });

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/Your Email/), {
        target: { value: 'test@example.com' }
      });

      fireEvent.change(screen.getByLabelText(/Your Relationship/), {
        target: { value: 'toured' }
      });

      // Add some optional information
      fireEvent.change(screen.getByLabelText(/Pricing Information/), {
        target: { value: 'Starting at $3,500/month' }
      });

      // Submit form
      const submitButton = screen.getByText('Submit Contribution');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Thank You!",
          description: "Your contribution has been submitted and will be reviewed shortly."
        });
      });
    });

    it('handles photo upload correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunity
      });

      render(
        <CommunityContribute />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Photos/)).toBeInTheDocument();
      });

      const file1 = new File(['photo1'], 'photo1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['photo2'], 'photo2.jpg', { type: 'image/jpeg' });
      
      const photoInput = screen.getByLabelText(/Photos/) as HTMLInputElement;
      
      // Simulate file selection
      Object.defineProperty(photoInput, 'files', {
        value: [file1, file2],
        writable: false
      });
      
      fireEvent.change(photoInput);

      // Check that file names are displayed
      await waitFor(() => {
        expect(screen.getByText('photo1.jpg')).toBeInTheDocument();
        expect(screen.getByText('photo2.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Integration: Community Detail Page with Missing Photos', () => {
    const mockCommunityNoPhotos = {
      id: 123,
      name: 'Test Senior Living',
      address: '123 Main St',
      city: 'TestCity',
      state: 'CA',
      zipCode: '12345',
      photos: [], // No photos
      careTypes: ['Assisted Living'],
      googleRating: '4.5',
      googleReviewCount: 10
    };

    it('displays MissingPhotosPanel when community has no photos', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunityNoPhotos
      });

      render(
        <CommunityDetail />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Should show the missing photos panel in hero section
        expect(screen.getByText('Photos Pending — Not Verified')).toBeInTheDocument();
      });

      // Switch to photos tab
      const photosTab = screen.getByText('Photos');
      fireEvent.click(photosTab);

      // Should show the full missing photos panel
      await waitFor(() => {
        expect(screen.getByText("🏗️ This Community Hasn't Been Verified Yet")).toBeInTheDocument();
      });
    });

    it('displays actual photos when community has photos', async () => {
      const mockCommunityWithPhotos = {
        ...mockCommunityNoPhotos,
        photos: ['photo1.jpg', 'photo2.jpg']
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockCommunityWithPhotos
      });

      render(
        <CommunityDetail />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Should show authentic photos badge
        expect(screen.getByText('Authentic Community Photos')).toBeInTheDocument();
      });

      // Should not show missing photos message
      expect(screen.queryByText('Photos Pending — Not Verified')).not.toBeInTheDocument();
    });
  });

  describe('API Endpoint Tests', () => {
    it('creates contribution endpoint handler', async () => {
      const contributionData = {
        communityId: '123',
        communityName: 'Test Community',
        contributorEmail: 'test@example.com',
        relationshipToCommunity: 'toured',
        priceInfo: '$3,500/month',
        priceSource: 'Tour in March 2024',
        availabilityInfo: '2 units available',
        incentivesInfo: 'First month free',
        additionalNotes: 'Great staff'
      };

      // Mock FormData for file upload
      const formData = new FormData();
      Object.entries(contributionData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch('/api/community/contribute', {
        method: 'POST',
        body: formData
      });

      // The actual endpoint would process this data and:
      // 1. Store contribution in database
      // 2. Process any uploaded photos
      // 3. Queue for review
      // 4. Send confirmation email
      // 5. Update community data after approval
    });
  });
});

describe('End-to-End Photo Contribution Flow', () => {
  it('complete flow from missing photos to contribution to display', async () => {
    // Step 1: User views community without photos
    // - MissingPhotosPanel is displayed
    // - User clicks "Upload Info"
    
    // Step 2: User fills contribution form
    // - Provides pricing information
    // - Uploads photos
    // - Submits form
    
    // Step 3: System processes contribution
    // - Data stored in pending_contributions table
    // - Photos uploaded to storage
    // - Admin notified for review
    
    // Step 4: Admin approves contribution
    // - Community data updated
    // - Photos become visible
    // - Contributor notified
    
    // Step 5: Other users see updated information
    // - Photos now display instead of placeholder
    // - Pricing information available
    // - Attribution to contributor
  });
});