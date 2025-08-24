import React, { createContext, useContext, ReactNode } from 'react';
import { useBreakpoints, useDeviceType, useTouchDevice, useOrientation, useViewport } from '@/hooks/useMediaQuery';

interface ResponsiveContextType {
  // Breakpoint states
  isMobile: boolean;
  isSmallTablet: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isExtraLarge: boolean;
  
  // Utility combinations
  isMobileOrTablet: boolean;
  isTabletOrDesktop: boolean;
  isDesktopOrLarger: boolean;
  
  // Current breakpoint
  currentBreakpoint: string;
  
  // Helper functions
  isAtLeast: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => boolean;
  isBelow: (breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl') => boolean;
  
  // Device info
  deviceType: 'mobile' | 'tablet' | 'desktop';
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  
  // Touch and orientation
  isTouch: boolean;
  orientation: 'portrait' | 'landscape';
  
  // Viewport dimensions
  viewport: {
    width: number;
    height: number;
  };
  
  // Responsive utilities
  getResponsiveClass: (mobile: string, tablet?: string, desktop?: string) => string;
  getResponsiveValue: <T>(mobile: T, tablet?: T, desktop?: T) => T;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export const ResponsiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const breakpoints = useBreakpoints();
  const deviceInfo = useDeviceType();
  const isTouch = useTouchDevice();
  const orientation = useOrientation();
  const viewport = useViewport();
  
  // Utility function to get responsive class names
  const getResponsiveClass = (mobile: string, tablet?: string, desktop?: string) => {
    if (breakpoints.isDesktopOrLarger) {
      return desktop || tablet || mobile;
    }
    if (breakpoints.isTabletOrDesktop && !breakpoints.isMobile) {
      return tablet || mobile;
    }
    return mobile;
  };
  
  // Utility function to get responsive values
  const getResponsiveValue = <T,>(mobile: T, tablet?: T, desktop?: T): T => {
    if (breakpoints.isDesktopOrLarger) {
      return desktop ?? tablet ?? mobile;
    }
    if (breakpoints.isTabletOrDesktop && !breakpoints.isMobile) {
      return tablet ?? mobile;
    }
    return mobile;
  };
  
  const value: ResponsiveContextType = {
    // Spread all breakpoint values
    ...breakpoints,
    
    // Device info
    deviceType: deviceInfo.type,
    isIOS: deviceInfo.isIOS,
    isAndroid: deviceInfo.isAndroid,
    isSafari: deviceInfo.isSafari,
    isChrome: deviceInfo.isChrome,
    
    // Touch and orientation
    isTouch,
    orientation,
    
    // Viewport
    viewport,
    
    // Utility functions
    getResponsiveClass,
    getResponsiveValue,
  };
  
  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
};

/**
 * Responsive component that conditionally renders based on breakpoints
 */
export const Responsive: React.FC<{
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  children?: ReactNode;
}> = ({ mobile, tablet, desktop, children }) => {
  const { isMobile, isTabletOrDesktop, isDesktopOrLarger } = useResponsive();
  
  if (children) {
    return <>{children}</>;
  }
  
  if (isDesktopOrLarger && desktop) {
    return <>{desktop}</>;
  }
  
  if (isTabletOrDesktop && !isMobile && tablet) {
    return <>{tablet}</>;
  }
  
  if (isMobile && mobile) {
    return <>{mobile}</>;
  }
  
  // Fallback chain: desktop -> tablet -> mobile
  return <>{desktop || tablet || mobile || null}</>;
};

/**
 * Show component only on specific breakpoints
 */
export const ShowOn: React.FC<{
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  children: ReactNode;
}> = ({ mobile, tablet, desktop, children }) => {
  const { isMobile, isTablet, isDesktopOrLarger } = useResponsive();
  
  const shouldShow = 
    (mobile && isMobile) ||
    (tablet && isTablet) ||
    (desktop && isDesktopOrLarger);
    
  return shouldShow ? <>{children}</> : null;
};

/**
 * Hide component on specific breakpoints
 */
export const HideOn: React.FC<{
  mobile?: boolean;
  tablet?: boolean;
  desktop?: boolean;
  children: ReactNode;
}> = ({ mobile, tablet, desktop, children }) => {
  const { isMobile, isTablet, isDesktopOrLarger } = useResponsive();
  
  const shouldHide = 
    (mobile && isMobile) ||
    (tablet && isTablet) ||
    (desktop && isDesktopOrLarger);
    
  return shouldHide ? null : <>{children}</>;
};