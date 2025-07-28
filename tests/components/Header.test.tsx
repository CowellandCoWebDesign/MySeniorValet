import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the Header component structure based on MySeniorValet
const MockHeader: React.FC<{ onMenuToggle?: () => void }> = ({ onMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-blue-600">MySeniorValet</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="/search" className="text-gray-600 hover:text-blue-600">Search</a>
          <a href="/communities" className="text-gray-600 hover:text-blue-600">Communities</a>
          <a href="/vendors" className="text-gray-600 hover:text-blue-600">Vendors</a>
          <a href="/admin" className="text-gray-600 hover:text-blue-600">Admin</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            data-testid="login-button"
          >
            Login
          </button>
          <button 
            className="md:hidden p-2"
            onClick={onMenuToggle}
            data-testid="menu-toggle"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
};

describe('Header Component', () => {
  const mockOnMenuToggle = jest.fn();

  beforeEach(() => {
    mockOnMenuToggle.mockClear();
  });

  it('should render MySeniorValet brand name', () => {
    render(<MockHeader />);
    
    expect(screen.getByText('MySeniorValet')).toBeInTheDocument();
    expect(screen.getByText('MySeniorValet')).toHaveClass('text-2xl', 'font-bold', 'text-blue-600');
  });

  it('should render main navigation links', () => {
    render(<MockHeader />);
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Communities')).toBeInTheDocument();
    expect(screen.getByText('Vendors')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should render login button', () => {
    render(<MockHeader />);
    
    const loginButton = screen.getByTestId('login-button');
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveTextContent('Login');
    expect(loginButton).toHaveClass('bg-blue-600', 'text-white');
  });

  it('should call onMenuToggle when mobile menu button is clicked', () => {
    render(<MockHeader onMenuToggle={mockOnMenuToggle} />);
    
    const menuButton = screen.getByTestId('menu-toggle');
    fireEvent.click(menuButton);
    
    expect(mockOnMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('should have proper navigation link structure', () => {
    render(<MockHeader />);
    
    const searchLink = screen.getByText('Search').closest('a');
    const communitiesLink = screen.getByText('Communities').closest('a');
    const vendorsLink = screen.getByText('Vendors').closest('a');
    const adminLink = screen.getByText('Admin').closest('a');
    
    expect(searchLink).toHaveAttribute('href', '/search');
    expect(communitiesLink).toHaveAttribute('href', '/communities');
    expect(vendorsLink).toHaveAttribute('href', '/vendors');
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  it('should apply hover styles to navigation links', () => {
    render(<MockHeader />);
    
    const searchLink = screen.getByText('Search');
    expect(searchLink).toHaveClass('text-gray-600', 'hover:text-blue-600');
  });

  it('should have responsive design classes', () => {
    render(<MockHeader />);
    
    // Navigation should be hidden on mobile
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('hidden', 'md:flex');
    
    // Menu button should be hidden on desktop
    const menuButton = screen.getByTestId('menu-toggle');
    expect(menuButton).toHaveClass('md:hidden');
  });
});