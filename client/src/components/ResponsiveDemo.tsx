import React from 'react';
import { useResponsive, ShowOn, HideOn, Responsive } from '@/contexts/ResponsiveContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * RESPONSIVE DESIGN PATTERNS DEMO
 * This component demonstrates best practices for responsive design
 * Use these patterns throughout the MySeniorValet platform
 */
export const ResponsiveDemo = () => {
  const {
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint,
    deviceType,
    orientation,
    viewport,
    getResponsiveClass,
    getResponsiveValue
  } = useResponsive();
  
  // Example of responsive value selection
  const columns = getResponsiveValue(1, 2, 3); // mobile: 1, tablet: 2, desktop: 3
  const padding = getResponsiveClass('p-4', 'p-6', 'p-8');
  
  return (
    <div className="container-responsive py-responsive">
      {/* Current Device Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Badge>Breakpoint:</Badge> {currentBreakpoint}
            </div>
            <div className="flex items-center gap-2">
              <Badge>Device Type:</Badge> {deviceType}
            </div>
            <div className="flex items-center gap-2">
              <Badge>Orientation:</Badge> {orientation}
            </div>
            <div className="flex items-center gap-2">
              <Badge>Viewport:</Badge> {viewport.width} x {viewport.height}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Responsive Text Example */}
      <Card className="mb-6 card-responsive">
        <CardHeader>
          <CardTitle className="text-responsive-2xl">
            Responsive Typography
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h1 className="text-responsive-4xl mb-4">
            Fluid Heading (clamp based)
          </h1>
          <p className="text-responsive-base mb-4">
            This text scales smoothly between screen sizes using CSS clamp().
            No jarring jumps at breakpoints!
          </p>
          <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
            Small text that remains readable on all devices.
          </p>
        </CardContent>
      </Card>
      
      {/* Conditional Rendering Examples */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Conditional Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show/Hide Components */}
          <ShowOn mobile>
            <Badge variant="secondary">📱 Mobile Only Content</Badge>
          </ShowOn>
          
          <ShowOn tablet>
            <Badge variant="secondary">📱 Tablet Only Content</Badge>
          </ShowOn>
          
          <ShowOn desktop>
            <Badge variant="secondary">💻 Desktop Only Content</Badge>
          </ShowOn>
          
          <HideOn mobile>
            <p className="text-sm">Hidden on mobile devices</p>
          </HideOn>
          
          {/* Responsive Component */}
          <Responsive
            mobile={<Button size="sm" className="w-full">Mobile Button</Button>}
            tablet={<Button size="default">Tablet Button</Button>}
            desktop={<Button size="lg">Desktop Button</Button>}
          />
        </CardContent>
      </Card>
      
      {/* Responsive Grid Example */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Responsive Grid Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid-responsive">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="card-responsive bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div className="text-responsive-lg font-semibold mb-2">
                  Card {item}
                </div>
                <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
                  Auto-responsive grid item
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Responsive Flex Layout */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Responsive Flex Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex-responsive">
            <div className="flex-1 card-responsive bg-blue-50 dark:bg-blue-900/20 rounded">
              <h3 className="text-responsive-lg font-semibold">Flex Item 1</h3>
              <p className="text-responsive-sm">Stacks on mobile, side-by-side on larger screens</p>
            </div>
            <div className="flex-1 card-responsive bg-green-50 dark:bg-green-900/20 rounded">
              <h3 className="text-responsive-lg font-semibold">Flex Item 2</h3>
              <p className="text-responsive-sm">Automatic responsive behavior</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Touch-Friendly Buttons */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Touch-Friendly Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="touch-target">
              Touch Target (44px min)
            </Button>
            <Button className="btn-fluid">
              Fluid Button
            </Button>
            <Button 
              className={getResponsiveClass(
                'text-sm px-3 py-2',
                'text-base px-4 py-2',
                'text-lg px-6 py-3'
              )}
            >
              Responsive Sizing
            </Button>
          </div>
          <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
            All interactive elements have minimum 44px touch targets on mobile.
          </p>
        </CardContent>
      </Card>
      
      {/* Container Query Example */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Container Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="responsive-container">
            <div className="container-card p-4 bg-gray-50 dark:bg-gray-800 rounded">
              <h3 className="container-card-title mb-2">
                Container-Based Responsive
              </h3>
              <p className="container-card-description text-gray-600 dark:text-gray-400">
                This card responds to its container size, not the viewport.
                Perfect for reusable components!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Responsive Image */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Responsive Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="img-responsive bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
            <span className="text-responsive-lg text-gray-500 dark:text-gray-400">
              Responsive Image Area
            </span>
          </div>
          <p className="text-responsive-sm text-gray-600 dark:text-gray-400 mt-2">
            Images maintain aspect ratio and scale smoothly
          </p>
        </CardContent>
      </Card>
      
      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Design Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-responsive-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Use fluid typography (clamp) instead of fixed breakpoints</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Implement container queries for component-level responsiveness</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Ensure 44px minimum touch targets on mobile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Use modern viewport units (svh, dvh, lvh) for better mobile support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Apply responsive grid layouts with auto-fit/auto-fill</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Test on real devices, not just browser DevTools</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Use the ResponsiveContext for consistent behavior</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Implement logical properties for better i18n support</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsiveDemo;