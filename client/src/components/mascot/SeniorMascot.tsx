import React from 'react';
import { cn } from '@/lib/utils';

interface SeniorMascotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'wave' | 'bounce' | 'pulse' | 'spin' | 'none';
  expression?: 'happy' | 'thinking' | 'waving' | 'helpful';
}

export function SeniorMascot({ 
  className, 
  size = 'md', 
  animation = 'none',
  expression = 'happy'
}: SeniorMascotProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const animationClasses = {
    wave: '',
    bounce: '',
    pulse: '',
    spin: '',
    none: ''
  };

  // SVG mascot - friendly elderly character with glasses and warm smile
  return (
    <div className={cn(
      'relative inline-block',
      sizeClasses[size],
      animationClasses[animation],
      className
    )}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Face circle */}
        <circle
          cx="50"
          cy="45"
          r="35"
          fill="#FDF2E9"
          stroke="#E67E22"
          strokeWidth="2"
        />
        
        {/* Hair */}
        <path
          d="M20 35 Q25 15 50 18 Q75 15 80 35 Q78 25 70 22 Q60 20 50 20 Q40 20 30 22 Q22 25 20 35 Z"
          fill="#BDC3C7"
        />
        
        {/* Glasses */}
        <circle cx="40" cy="40" r="8" fill="none" stroke="#34495E" strokeWidth="2" />
        <circle cx="60" cy="40" r="8" fill="none" stroke="#34495E" strokeWidth="2" />
        <line x1="48" y1="40" x2="52" y2="40" stroke="#34495E" strokeWidth="2" />
        <line x1="32" y1="38" x2="25" y2="35" stroke="#34495E" strokeWidth="2" />
        <line x1="68" y1="38" x2="75" y2="35" stroke="#34495E" strokeWidth="2" />
        
        {/* Eyes */}
        <circle cx="40" cy="40" r="3" fill="#2C3E50" />
        <circle cx="60" cy="40" r="3" fill="#2C3E50" />
        <circle cx="41" cy="39" r="1" fill="#FFFFFF" />
        <circle cx="61" cy="39" r="1" fill="#FFFFFF" />
        
        {/* Nose */}
        <ellipse cx="50" cy="48" rx="2" ry="3" fill="#E67E22" />
        
        {/* Mouth - changes based on expression */}
        {expression === 'happy' && (
          <path
            d="M42 55 Q50 62 58 55"
            fill="none"
            stroke="#E74C3C"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        
        {expression === 'thinking' && (
          <ellipse cx="50" cy="55" rx="4" ry="2" fill="#E74C3C" />
        )}
        
        {expression === 'waving' && (
          <>
            <path
              d="M42 55 Q50 62 58 55"
              fill="none"
              stroke="#E74C3C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Waving hand */}
            <g className="animate-wave origin-[85_65]">
              <circle cx="85" cy="65" r="6" fill="#FDF2E9" stroke="#E67E22" strokeWidth="1" />
              <path d="M82 62 L88 62 M82 65 L88 65 M82 68 L88 68" stroke="#E67E22" strokeWidth="1" />
            </g>
          </>
        )}
        
        {expression === 'helpful' && (
          <>
            <path
              d="M42 55 Q50 58 58 55"
              fill="none"
              stroke="#E74C3C"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Helpful gesture - pointing finger */}
            <g>
              <circle cx="85" cy="50" r="5" fill="#FDF2E9" stroke="#E67E22" strokeWidth="1" />
              <line x1="85" y1="45" x2="85" y2="35" stroke="#E67E22" strokeWidth="2" strokeLinecap="round" />
            </g>
          </>
        )}
        
        {/* Rosy cheeks */}
        <circle cx="30" cy="48" r="4" fill="#F8BBD9" opacity="0.6" />
        <circle cx="70" cy="48" r="4" fill="#F8BBD9" opacity="0.6" />
        
        {/* Body hint */}
        <ellipse cx="50" cy="85" rx="25" ry="12" fill="#3498DB" />
        <ellipse cx="50" cy="83" rx="20" ry="8" fill="#5DADE2" />
      </svg>
    </div>
  );
}

// Custom animation for waving
const waveKeyframes = `
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-20deg); }
  }
  .animate-wave {
    animation: wave 2s ease-in-out infinite;
  }
`;

// Inject the keyframes into the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = waveKeyframes;
  document.head.appendChild(style);
}