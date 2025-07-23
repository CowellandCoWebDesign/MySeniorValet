import React from 'react';
import { SeniorMascot } from './SeniorMascot';
import { cn } from '@/lib/utils';

interface LoadingMascotProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'searching' | 'loading' | 'thinking' | 'greeting';
}

export function LoadingMascot({ 
  message = "Finding the perfect community for you...",
  className,
  size = 'lg',
  variant = 'searching'
}: LoadingMascotProps) {
  const variantConfig = {
    searching: {
      animation: 'pulse' as const,
      expression: 'thinking' as const,
      defaultMessage: "Searching communities for you..."
    },
    loading: {
      animation: 'bounce' as const,
      expression: 'happy' as const,
      defaultMessage: "Loading your results..."
    },
    thinking: {
      animation: 'pulse' as const,
      expression: 'thinking' as const,
      defaultMessage: "Let me think about that..."
    },
    greeting: {
      animation: 'wave' as const,
      expression: 'waving' as const,
      defaultMessage: "Hello! I'm here to help you find the perfect senior community."
    }
  };

  const config = variantConfig[variant];
  const displayMessage = message || config.defaultMessage;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4 p-8',
      className
    )}>
      <div className="relative">
        <SeniorMascot
          size={size}
          animation={config.animation}
          expression={config.expression}
        />
        
        {/* Floating dots animation around mascot */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full" />
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-green-400 rounded-full" />
          <div className="absolute top-1/2 left-0 w-2 h-2 bg-orange-400 rounded-full" />
          <div className="absolute top-1/2 right-0 w-2 h-2 bg-purple-400 rounded-full" />
        </div>
      </div>
      
      <div className="text-center max-w-md">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          {displayMessage}
        </p>
        
        {/* Animated loading dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>
      
      {/* Progress bar for longer loading */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" 
               style={{ 
                 width: '100%'
               }} />
        </div>
      </div>
    </div>
  );
}

// Progress bar animation
const progressKeyframes = `
  @keyframes progress {
    0% { width: 0%; }
    50% { width: 100%; }
    100% { width: 0%; }
  }
`;

// Inject the keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = progressKeyframes;
  document.head.appendChild(style);
}