import React, { useState, useEffect } from 'react';
import { LoadingMascot } from './LoadingMascot';
import { X } from 'lucide-react';

interface GreetingMascotProps {
  userName?: string;
  onDismiss?: () => void;
  autoShow?: boolean;
  className?: string;
}

export function GreetingMascot({ 
  userName = '',
  onDismiss,
  autoShow = true,
  className 
}: GreetingMascotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const greetingMessages = [
    userName 
      ? `Hello ${userName}! I'm here to help you find the perfect senior community.`
      : "Welcome to MySeniorValet! I'm here to help you find the perfect senior community.",
    "I can help you search by location, care type, amenities, and pricing.",
    "Let me know if you need assistance with anything - I'm here to help!",
    "Ready to start your search? I'll guide you through finding your ideal community."
  ];

  useEffect(() => {
    if (autoShow) {
      // Check if user has dismissed the greeting before
      const dismissed = localStorage.getItem('greeting-mascot-dismissed');
      if (!dismissed) {
        // Show greeting after a short delay
        const showTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 1000);

        return () => clearTimeout(showTimeout);
      }
    }
  }, [autoShow]);

  useEffect(() => {
    if (isVisible && greetingMessages.length > 1) {
      const messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % greetingMessages.length);
      }, 4000);

      return () => clearInterval(messageInterval);
    }
  }, [isVisible, greetingMessages.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-40 max-w-sm
      transform transition-all duration-500 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
    `}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Close greeting"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
        
        <LoadingMascot
          message={greetingMessages[currentMessage]}
          variant="greeting"
          size="md"
          className="pb-2"
        />
        
        {/* Action buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => {
              // Scroll to search section
              const searchSection = document.getElementById('search-section');
              if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
              }
              handleDismiss();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Start Searching
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            I'll browse on my own
          </button>
        </div>
      </div>
    </div>
  );
}