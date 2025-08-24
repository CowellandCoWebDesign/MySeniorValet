import { useState, useEffect } from 'react';

/**
 * Custom hook for media query detection
 * Optimized for performance with proper cleanup
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener (using modern addEventListener)
    media.addEventListener('change', listener);
    
    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Predefined breakpoint hooks following Tailwind's mobile-first approach
 */
export const useBreakpoints = () => {
  // Mobile-first breakpoints matching Tailwind CSS
  const isMobile = useMediaQuery('(max-width: 639px)'); // < sm
  const isSmallTablet = useMediaQuery('(min-width: 640px) and (max-width: 767px)'); // sm
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)'); // md
  const isDesktop = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)'); // lg
  const isLargeDesktop = useMediaQuery('(min-width: 1280px) and (max-width: 1535px)'); // xl
  const isExtraLarge = useMediaQuery('(min-width: 1536px)'); // 2xl
  
  // Utility breakpoints
  const isMobileOrTablet = useMediaQuery('(max-width: 1023px)');
  const isTabletOrDesktop = useMediaQuery('(min-width: 640px)');
  const isDesktopOrLarger = useMediaQuery('(min-width: 1024px)');
  
  // Current breakpoint identifier
  let currentBreakpoint = 'mobile';
  if (isSmallTablet) currentBreakpoint = 'sm';
  else if (isTablet) currentBreakpoint = 'md';
  else if (isDesktop) currentBreakpoint = 'lg';
  else if (isLargeDesktop) currentBreakpoint = 'xl';
  else if (isExtraLarge) currentBreakpoint = '2xl';
  
  return {
    // Individual breakpoints
    isMobile,
    isSmallTablet,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isExtraLarge,
    
    // Utility combinations
    isMobileOrTablet,
    isTabletOrDesktop,
    isDesktopOrLarger,
    
    // Current breakpoint
    currentBreakpoint,
    
    // Helper function to check if we're at or above a breakpoint
    isAtLeast: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
      switch (breakpoint) {
        case 'sm': return !isMobile;
        case 'md': return isTabletOrDesktop && !isSmallTablet;
        case 'lg': return isDesktopOrLarger;
        case 'xl': return isLargeDesktop || isExtraLarge;
        case '2xl': return isExtraLarge;
        default: return false;
      }
    },
    
    // Helper function to check if we're below a breakpoint
    isBelow: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => {
      switch (breakpoint) {
        case 'sm': return isMobile;
        case 'md': return isMobile || isSmallTablet;
        case 'lg': return !isDesktopOrLarger;
        case 'xl': return !isLargeDesktop && !isExtraLarge;
        case '2xl': return !isExtraLarge;
        default: return true;
      }
    }
  };
};

/**
 * Hook for touch device detection
 */
export const useTouchDevice = () => {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);
  
  return isTouch;
};

/**
 * Hook for device type detection combining screen size and user agent
 */
export const useDeviceType = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    type: 'desktop' as 'mobile' | 'tablet' | 'desktop',
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
  });
  
  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      
      // User agent detection
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
      const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
      
      // Device type based on screen size (mobile-first)
      let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (width <= 640) {
        type = 'mobile';
      } else if (width <= 1024) {
        type = 'tablet';
      }
      
      setDeviceInfo({
        type,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
      });
    };
    
    detectDevice();
    window.addEventListener('resize', detectDevice);
    
    return () => window.removeEventListener('resize', detectDevice);
  }, []);
  
  return deviceInfo;
};

/**
 * Hook for viewport dimensions
 */
export const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return viewport;
};

/**
 * Hook for orientation detection
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  return orientation;
};