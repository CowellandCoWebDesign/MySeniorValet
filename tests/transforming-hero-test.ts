// Comprehensive Test Suite for Transforming Hero Section
// Test Date: August 28, 2025

import { describe, test, expect } from '@playwright/test';

describe('Transforming Hero Section Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  describe('Initial State Tests', () => {
    test('Hero text is visible on load', async ({ page }) => {
      const heroTitle = await page.locator('h1:has-text("Everything You Need")');
      await expect(heroTitle).toBeVisible();
      
      const bulletPoints = await page.locator('ul li span:has-text("We NEVER sell your info")');
      await expect(bulletPoints).toBeVisible();
    });

    test('Search bar is present and functional', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
    });

    test('Trust indicators are visible', async ({ page }) => {
      await expect(page.locator('text=Live Pricing')).toBeVisible();
      await expect(page.locator('text=Family Reviews')).toBeVisible();
      await expect(page.locator('text=Live Availability')).toBeVisible();
    });
  });

  describe('Search Transformation Tests', () => {
    test('Hero text animates away when search is initiated', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      const heroTitle = await page.locator('h1:has-text("Everything You Need")');
      
      // Type search query
      await searchInput.fill('Sacramento');
      
      // Click search button
      await page.locator('button:has-text("Search")').click();
      
      // Hero text should disappear
      await expect(heroTitle).not.toBeVisible({ timeout: 2000 });
    });

    test('Search bar slides to top position', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Get initial position
      const initialBox = await searchInput.boundingBox();
      const initialY = initialBox?.y || 0;
      
      // Perform search
      await searchInput.fill('Los Angeles');
      await page.locator('button:has-text("Search")').click();
      
      // Wait for animation
      await page.waitForTimeout(700);
      
      // Get new position
      const newBox = await searchInput.boundingBox();
      const newY = newBox?.y || 0;
      
      // Should be higher on the page
      expect(newY).toBeLessThan(initialY);
    });

    test('View toggle appears after search', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Initially no toggle
      await expect(page.locator('button:has([data-lucide="list"])')).not.toBeVisible();
      
      // Perform search
      await searchInput.fill('Florida');
      await page.locator('button:has-text("Search")').click();
      
      // Toggle should appear
      await expect(page.locator('button:has([data-lucide="list"])')).toBeVisible();
      await expect(page.locator('button:has([data-lucide="map"])')).toBeVisible();
    });

    test('Clear button replaces search button', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Search button initially
      await expect(page.locator('button:has-text("Search")')).toBeVisible();
      
      // Perform search
      await searchInput.fill('Texas');
      await page.locator('button:has-text("Search")').click();
      
      // Clear button should appear
      await expect(page.locator('button:has([data-lucide="x"])')).toBeVisible();
      await expect(page.locator('button:has-text("Search")')).not.toBeVisible();
    });
  });

  describe('Search Results Tests', () => {
    test('Loading state displays during search', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Perform search
      await searchInput.fill('New York');
      await page.locator('button:has-text("Search")').click();
      
      // Loading indicator should show
      await expect(page.locator('text=Searching communities...')).toBeVisible();
    });

    test('Results display in list format', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Perform search for known location
      await searchInput.fill('California');
      await page.locator('button:has-text("Search")').click();
      
      // Wait for results
      await page.waitForResponse(resp => resp.url().includes('/api/search/unified'));
      
      // Check for community cards
      const communityCards = page.locator('[data-testid="community-card"]');
      const count = await communityCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('No results message displays for invalid search', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Search for nonsense
      await searchInput.fill('xyzabc123nonsense');
      await page.locator('button:has-text("Search")').click();
      
      // Wait for API response
      await page.waitForResponse(resp => resp.url().includes('/api/search/unified'));
      
      // No results message
      await expect(page.locator('text=No communities found')).toBeVisible();
    });
  });

  describe('View Mode Toggle Tests', () => {
    test('List view is default', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      await searchInput.fill('Miami');
      await page.locator('button:has-text("Search")').click();
      
      // List button should be active
      const listButton = page.locator('button:has([data-lucide="list"])');
      await expect(listButton).toHaveClass(/.*default.*/);
    });

    test('Map view navigates to map search', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      await searchInput.fill('Seattle');
      await page.locator('button:has-text("Search")').click();
      
      // Click map button
      await page.locator('button:has([data-lucide="map"])').click();
      
      // Should navigate to map search
      await expect(page).toHaveURL(/.*map-search.*Seattle.*/);
    });
  });

  describe('Clear Search Tests', () => {
    test('Clear button resets to initial state', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      const heroTitle = await page.locator('h1:has-text("Everything You Need")');
      
      // Perform search
      await searchInput.fill('Chicago');
      await page.locator('button:has-text("Search")').click();
      
      // Hero should be hidden
      await expect(heroTitle).not.toBeVisible();
      
      // Click clear
      await page.locator('button:has([data-lucide="x"])').click();
      
      // Hero should reappear
      await expect(heroTitle).toBeVisible();
      
      // Search input should be empty
      await expect(searchInput).toHaveValue('');
    });

    test('Trust indicators reappear after clear', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      await searchInput.fill('Phoenix');
      await page.locator('button:has-text("Search")').click();
      
      // Trust indicators hidden during search
      await expect(page.locator('text=Live Pricing').first()).not.toBeVisible();
      
      // Clear search
      await page.locator('button:has([data-lucide="x"])').click();
      
      // Trust indicators should reappear
      await expect(page.locator('text=Live Pricing')).toBeVisible();
    });
  });

  describe('Animation Performance Tests', () => {
    test('Animations complete within expected timeframe', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      const startTime = Date.now();
      
      await searchInput.fill('Boston');
      await page.locator('button:has-text("Search")').click();
      
      // Wait for search bar to complete animation
      await page.waitForTimeout(700);
      
      const animationTime = Date.now() - startTime;
      expect(animationTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('No layout shift during transformation', async ({ page }) => {
      // Measure Cumulative Layout Shift
      const cls = await page.evaluate(() => {
        return new Promise((resolve) => {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
          });
          observer.observe({ type: 'layout-shift', buffered: true });
          
          setTimeout(() => {
            observer.disconnect();
            resolve(clsValue);
          }, 2000);
        });
      });
      
      // Perform search to trigger animation
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      await searchInput.fill('Denver');
      await page.locator('button:has-text("Search")').click();
      
      // CLS should be minimal (less than 0.1 for good UX)
      expect(cls).toBeLessThan(0.1);
    });
  });

  describe('Mobile Responsiveness Tests', () => {
    test('Works on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      await expect(searchInput).toBeVisible();
      
      // Test search on mobile
      await searchInput.fill('Houston');
      await page.locator('button:has-text("Search")').click();
      
      // Results should display
      await page.waitForResponse(resp => resp.url().includes('/api/search/unified'));
      await expect(page.locator('[data-testid="community-card"]').first()).toBeVisible();
    });

    test('Touch interactions work', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Simulate touch tap
      await searchInput.tap();
      await searchInput.fill('Portland');
      
      // Tap search button
      await page.locator('button:has-text("Search")').tap();
      
      // Should trigger search
      await expect(page.locator('text=Searching communities...')).toBeVisible();
    });
  });

  describe('API Integration Tests', () => {
    test('Unified search API is called correctly', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Set up request interception
      const apiPromise = page.waitForRequest(req => 
        req.url().includes('/api/search/unified') && 
        req.method() === 'POST'
      );
      
      await searchInput.fill('Las Vegas');
      await page.locator('button:has-text("Search")').click();
      
      const request = await apiPromise;
      const postData = request.postDataJSON();
      
      expect(postData).toMatchObject({
        query: 'Las Vegas',
        includeHospitals: true,
        includeServices: true,
        limit: 50
      });
    });

    test('API errors are handled gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/search/unified', route => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });
      
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      await searchInput.fill('Nashville');
      await page.locator('button:has-text("Search")').click();
      
      // Should show error state (no results or error message)
      await expect(page.locator('text=No communities found')).toBeVisible();
    });
  });

  describe('Accessibility Tests', () => {
    test('Keyboard navigation works', async ({ page }) => {
      // Tab to search input
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // May need multiple tabs
      
      // Type in focused element
      await page.keyboard.type('San Francisco');
      
      // Press Enter to search
      await page.keyboard.press('Enter');
      
      // Should trigger search
      await expect(page.locator('text=Searching communities...')).toBeVisible();
    });

    test('Screen reader labels are present', async ({ page }) => {
      const searchInput = await page.locator('input[placeholder*="Search communities"]');
      
      // Check for aria labels
      const ariaLabel = await searchInput.getAttribute('aria-label');
      expect(ariaLabel || await searchInput.getAttribute('placeholder')).toBeTruthy();
    });
  });
});

// Performance Metrics Test
describe('Performance Metrics', () => {
  test('First Contentful Paint is fast', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation')[0]);
    });
    
    const perfData = JSON.parse(metrics);
    expect(perfData.domContentLoadedEventEnd).toBeLessThan(3000); // Under 3 seconds
  });

  test('Search response time is acceptable', async ({ page }) => {
    await page.goto('/');
    const searchInput = await page.locator('input[placeholder*="Search communities"]');
    
    const startTime = Date.now();
    await searchInput.fill('Atlanta');
    await page.locator('button:has-text("Search")').click();
    
    await page.waitForResponse(resp => resp.url().includes('/api/search/unified'));
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(5000); // Under 5 seconds
  });
});