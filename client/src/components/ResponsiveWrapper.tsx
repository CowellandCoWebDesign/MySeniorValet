import React, { ReactNode } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
  // Padding presets
  padding?: 'none' | 'small' | 'medium' | 'large' | 'responsive';
  // Container presets
  container?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  // Touch-friendly mode
  touchFriendly?: boolean;
}

/**
 * ResponsiveWrapper - Apply responsive styles to any component
 * 
 * Usage:
 * <ResponsiveWrapper 
 *   padding="responsive"
 *   container
 *   maxWidth="xl"
 *   mobileClassName="text-sm"
 *   desktopClassName="text-lg"
 * >
 *   <YourComponent />
 * </ResponsiveWrapper>
 */
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  padding = 'none',
  container = false,
  maxWidth = 'xl',
  touchFriendly = false,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Build responsive classes
  const responsiveClasses = cn(
    className,
    {
      // Apply device-specific classes
      [mobileClassName]: isMobile,
      [tabletClassName]: isTablet,
      [desktopClassName]: isDesktop,
      
      // Padding presets
      'p-0': padding === 'none',
      'p-2 sm:p-3 lg:p-4': padding === 'small',
      'p-4 sm:p-6 lg:p-8': padding === 'medium',
      'p-6 sm:p-8 lg:p-12': padding === 'large',
      'p-responsive': padding === 'responsive',
      
      // Container styles
      'container-responsive': container,
      'max-w-sm': container && maxWidth === 'sm',
      'max-w-md': container && maxWidth === 'md',
      'max-w-lg': container && maxWidth === 'lg',
      'max-w-xl': container && maxWidth === 'xl',
      'max-w-2xl': container && maxWidth === '2xl',
      'max-w-full': container && maxWidth === 'full',
      
      // Touch-friendly mode
      'touch-friendly': touchFriendly && isMobile,
    }
  );
  
  return (
    <div className={responsiveClasses}>
      {children}
    </div>
  );
};

/**
 * ResponsiveSection - Pre-configured section wrapper
 */
export const ResponsiveSection: React.FC<{
  children: ReactNode;
  className?: string;
  background?: 'white' | 'gray' | 'primary' | 'transparent';
}> = ({ children, className = '', background = 'transparent' }) => {
  const bgClasses = {
    white: 'bg-white dark:bg-gray-900',
    gray: 'bg-gray-50 dark:bg-gray-800',
    primary: 'bg-primary/5 dark:bg-primary/10',
    transparent: '',
  };
  
  return (
    <section 
      className={cn(
        'section-padding',
        bgClasses[background],
        className
      )}
    >
      <ResponsiveWrapper container maxWidth="2xl">
        {children}
      </ResponsiveWrapper>
    </section>
  );
};

/**
 * ResponsiveGrid - Pre-configured responsive grid
 */
export const ResponsiveGrid: React.FC<{
  children: ReactNode;
  columns?: 'auto' | '2' | '3' | '4';
  gap?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ children, columns = 'auto', gap = 'medium', className = '' }) => {
  const gridClasses = {
    auto: 'grid-responsive',
    '2': 'grid grid-cols-1 md:grid-cols-2',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };
  
  const gapClasses = {
    small: 'gap-2 sm:gap-3 lg:gap-4',
    medium: 'gap-4 sm:gap-6 lg:gap-8',
    large: 'gap-6 sm:gap-8 lg:gap-12',
  };
  
  return (
    <div className={cn(gridClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

/**
 * ResponsiveCard - Pre-configured responsive card
 */
export const ResponsiveCard: React.FC<{
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}> = ({ children, className = '', onClick, hoverable = false }) => {
  const { isMobile } = useResponsive();
  
  return (
    <div 
      className={cn(
        'card-responsive',
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-lg',
        'shadow-sm',
        {
          'cursor-pointer transition-shadow hover:shadow-md': hoverable || onClick,
          'touch-target': isMobile && onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveText - Text with automatic responsive sizing
 */
export const ResponsiveText: React.FC<{
  children: ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'secondary';
  className?: string;
}> = ({ 
  children, 
  size = 'base', 
  weight = 'normal',
  color = 'default',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'text-responsive-xs',
    sm: 'text-responsive-sm',
    base: 'text-responsive-base',
    lg: 'text-responsive-lg',
    xl: 'text-responsive-xl',
    '2xl': 'text-responsive-2xl',
    '3xl': 'text-responsive-3xl',
    '4xl': 'text-responsive-4xl',
    '5xl': 'text-responsive-5xl',
  };
  
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };
  
  const colorClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    muted: 'text-gray-600 dark:text-gray-400',
    primary: 'text-primary',
    secondary: 'text-secondary',
  };
  
  return (
    <span 
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
};

/**
 * ResponsiveButton - Button with automatic responsive sizing
 */
export const ResponsiveButton: React.FC<{
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'small' | 'medium' | 'large' | 'responsive';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ 
  children, 
  variant = 'primary',
  size = 'responsive',
  fullWidth = false,
  onClick,
  disabled = false,
  className = ''
}) => {
  const { isMobile } = useResponsive();
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
    responsive: 'btn-fluid',
  };
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        {
          'w-full': fullWidth || (isMobile && size === 'responsive'),
          'touch-target': isMobile,
        },
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ResponsiveWrapper;