import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, jest } from '@jest/globals';

// Mock CommunityCard component based on MySeniorValet structure
interface Community {
  id: number;
  name: string;
  city: string;
  state: string;
  type?: string;
  rent?: number;
  description?: string;
  photoUrl?: string;
}

const MockCommunityCard: React.FC<{ 
  community: Community; 
  onViewDetails?: (id: number) => void;
  onScheduleTour?: (id: number) => void;
}> = ({ community, onViewDetails, onScheduleTour }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6" data-testid="community-card">
      <div className="mb-4">
        {community.photoUrl && (
          <img 
            src={community.photoUrl} 
            alt={community.name}
            className="w-full h-48 object-cover rounded-md"
          />
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {community.name}
      </h3>
      
      <p className="text-gray-600 mb-2">
        {community.city}, {community.state}
      </p>
      
      {community.type && (
        <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mb-2">
          {community.type}
        </span>
      )}
      
      {community.rent && (
        <p className="text-green-600 font-semibold mb-2">
          ${community.rent}/month
        </p>
      )}
      
      {community.description && (
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {community.description}
        </p>
      )}
      
      <div className="flex space-x-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex-1"
          onClick={() => onViewDetails?.(community.id)}
          data-testid="view-details-button"
        >
          View Details
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex-1"
          onClick={() => onScheduleTour?.(community.id)}
          data-testid="schedule-tour-button"
        >
          Schedule Tour
        </button>
      </div>
    </div>
  );
};

describe('CommunityCard Component', () => {
  const mockCommunity: Community = {
    id: 264,
    name: 'Heritage Hills Senior Living',
    city: 'Sacramento',
    state: 'California',
    type: 'assisted_living',
    rent: 3500,
    description: 'Premium senior living community with exceptional care and amenities.',
    photoUrl: '/images/heritage-hills.jpg'
  };

  const mockOnViewDetails = jest.fn();
  const mockOnScheduleTour = jest.fn();

  beforeEach(() => {
    mockOnViewDetails.mockClear();
    mockOnScheduleTour.mockClear();
  });

  it('should render community information correctly', () => {
    render(<MockCommunityCard community={mockCommunity} />);
    
    expect(screen.getByText('Heritage Hills Senior Living')).toBeInTheDocument();
    expect(screen.getByText('Sacramento, California')).toBeInTheDocument();
    expect(screen.getByText('assisted_living')).toBeInTheDocument();
    expect(screen.getByText('$3500/month')).toBeInTheDocument();
    expect(screen.getByText('Premium senior living community with exceptional care and amenities.')).toBeInTheDocument();
  });

  it('should render community image when photoUrl is provided', () => {
    render(<MockCommunityCard community={mockCommunity} />);
    
    const image = screen.getByAltText('Heritage Hills Senior Living');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/heritage-hills.jpg');
    expect(image).toHaveClass('w-full', 'h-48', 'object-cover', 'rounded-md');
  });

  it('should not render image when photoUrl is not provided', () => {
    const communityWithoutPhoto = { ...mockCommunity, photoUrl: undefined };
    render(<MockCommunityCard community={communityWithoutPhoto} />);
    
    expect(screen.queryByAltText('Heritage Hills Senior Living')).not.toBeInTheDocument();
  });

  it('should call onViewDetails when View Details button is clicked', () => {
    render(
      <MockCommunityCard 
        community={mockCommunity} 
        onViewDetails={mockOnViewDetails} 
      />
    );
    
    const viewDetailsButton = screen.getByTestId('view-details-button');
    fireEvent.click(viewDetailsButton);
    
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
    expect(mockOnViewDetails).toHaveBeenCalledWith(264);
  });

  it('should call onScheduleTour when Schedule Tour button is clicked', () => {
    render(
      <MockCommunityCard 
        community={mockCommunity} 
        onScheduleTour={mockOnScheduleTour} 
      />
    );
    
    const scheduleTourButton = screen.getByTestId('schedule-tour-button');
    fireEvent.click(scheduleTourButton);
    
    expect(mockOnScheduleTour).toHaveBeenCalledTimes(1);
    expect(mockOnScheduleTour).toHaveBeenCalledWith(264);
  });

  it('should render buttons with correct styling', () => {
    render(<MockCommunityCard community={mockCommunity} />);
    
    const viewDetailsButton = screen.getByTestId('view-details-button');
    const scheduleTourButton = screen.getByTestId('schedule-tour-button');
    
    expect(viewDetailsButton).toHaveClass('bg-blue-600', 'text-white', 'hover:bg-blue-700');
    expect(scheduleTourButton).toHaveClass('bg-green-600', 'text-white', 'hover:bg-green-700');
  });

  it('should handle community without rent information', () => {
    const communityWithoutRent = { ...mockCommunity, rent: undefined };
    render(<MockCommunityCard community={communityWithoutRent} />);
    
    expect(screen.queryByText(/month/)).not.toBeInTheDocument();
  });

  it('should handle community without type information', () => {
    const communityWithoutType = { ...mockCommunity, type: undefined };
    render(<MockCommunityCard community={communityWithoutType} />);
    
    expect(screen.queryByText('assisted_living')).not.toBeInTheDocument();
  });

  it('should handle community without description', () => {
    const communityWithoutDescription = { ...mockCommunity, description: undefined };
    render(<MockCommunityCard community={communityWithoutDescription} />);
    
    expect(screen.queryByText(/Premium senior living/)).not.toBeInTheDocument();
  });

  it('should have proper card structure and styling', () => {
    render(<MockCommunityCard community={mockCommunity} />);
    
    const card = screen.getByTestId('community-card');
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-md', 'p-6');
  });
});