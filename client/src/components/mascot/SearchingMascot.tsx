import React, { useState, useEffect } from 'react';
import { LoadingMascot } from './LoadingMascot';

interface SearchingMascotProps {
  isLoading: boolean;
  searchLocation?: string;
  searchType?: string;
  className?: string;
}

export function SearchingMascot({ 
  isLoading, 
  searchLocation = '',
  searchType = 'communities',
  className 
}: SearchingMascotProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showMascot, setShowMascot] = useState(false);

  // Encouraging messages that rotate during search
  const searchMessages = [
    searchLocation 
      ? `Looking for ${searchType} in ${searchLocation}...`
      : `Searching for the perfect ${searchType}...`,
    "I'm checking thousands of communities for you...",
    "Finding communities that match your needs...",
    "Almost there! Gathering the best options...",
    "Reviewing pricing and availability...",
    "Checking amenities and care services...",
    "Preparing your personalized results..."
  ];

  useEffect(() => {
    if (isLoading) {
      setShowMascot(true);
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % searchMessages.length);
      }, 6000); // Change message every 6 seconds

      return () => clearInterval(interval);
    } else {
      // Delay hiding to allow for smooth transition
      const timeout = setTimeout(() => setShowMascot(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, searchMessages.length]);

  if (!showMascot) return null;

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm
      transition-opacity duration-500
      ${isLoading ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md mx-4">
        <LoadingMascot
          message={searchMessages[messageIndex]}
          variant="searching"
          size="xl"
          className={className}
        />
        
        {/* Additional encouraging text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We're reviewing over <span className="font-semibold text-blue-600">25,000+ communities</span> to find your perfect match
          </p>
        </div>
      </div>
    </div>
  );
}