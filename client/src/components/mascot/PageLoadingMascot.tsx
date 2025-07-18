import React from 'react';
import { LoadingMascot } from './LoadingMascot';

interface PageLoadingMascotProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export function PageLoadingMascot({ 
  isLoading, 
  message = "Loading page...",
  className 
}: PageLoadingMascotProps) {
  if (!isLoading) return null;

  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center
      bg-white dark:bg-gray-900 transition-opacity duration-300
      ${isLoading ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className="text-center">
        <LoadingMascot
          message={message}
          variant="loading"
          size="xl"
          className={className}
        />
        
        {/* MySeniorValet branding */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            MySeniorValet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your trusted guide to senior living
          </p>
        </div>
      </div>
    </div>
  );
}