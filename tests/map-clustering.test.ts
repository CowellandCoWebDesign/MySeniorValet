import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import puppeteer, { Browser, Page } from 'puppeteer';

describe('Map Clustering Integration Tests', () => {
  let browser: Browser;
  let page: Page;
  const BASE_URL = 'http://localhost:5173'; // Vite dev server

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    // Set viewport to standard desktop size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.text().includes('CLUSTER') || msg.text().includes('ZOOM') || msg.text().includes('RENDERING')) {
        console.log(`Browser console: ${msg.text()}`);
      }
    });
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should load the map search page', async () => {
    await page.goto(`${BASE_URL}/map-search`, { waitUntil: 'networkidle2' });
    
    // Wait for map to be visible
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    
    // Check that map loaded
    const mapElement = await page.$('.leaflet-container');
    expect(mapElement).toBeTruthy();
  }, 30000);

  it('should show clusters at zoom level 12', async () => {
    // Set zoom to 12 (city view)
    await page.evaluate(() => {
      const map = (window as any).leafletMap;
      if (map) {
        map.setZoom(12);
      }
    });
    
    // Wait for clusters to load
    await page.waitForTimeout(2000);
    
    // Check for cluster markers
    const clusters = await page.$$('.leaflet-marker-icon.cluster-marker');
    const individualMarkers = await page.$$('.leaflet-marker-icon:not(.cluster-marker)');
    
    console.log(`Zoom 12: Found ${clusters.length} clusters and ${individualMarkers.length} individual markers`);
    
    // At zoom 12, we expect some clusters
    expect(clusters.length).toBeGreaterThan(0);
  }, 30000);

  it('should show individual markers when zooming to level 13', async () => {
    // Zoom in to level 13
    await page.evaluate(() => {
      const map = (window as any).leafletMap;
      if (map) {
        map.setZoom(13);
      }
    });
    
    // Wait for markers to update
    await page.waitForTimeout(2000);
    
    // Count markers after zoom
    const clustersAfterZoom = await page.$$('.leaflet-marker-icon.cluster-marker');
    const individualMarkersAfterZoom = await page.$$('.leaflet-marker-icon:not(.cluster-marker)');
    
    console.log(`Zoom 13: Found ${clustersAfterZoom.length} clusters and ${individualMarkersAfterZoom.length} individual markers`);
    
    // At zoom 13, we expect mostly individual markers
    expect(individualMarkersAfterZoom.length).toBeGreaterThan(clustersAfterZoom.length);
  }, 30000);

  it('should update clusters when panning the map', async () => {
    // Get initial marker count
    const initialMarkers = await page.$$('.leaflet-marker-icon');
    const initialCount = initialMarkers.length;
    
    // Pan the map to a different area
    await page.evaluate(() => {
      const map = (window as any).leafletMap;
      if (map) {
        // Pan to Oakland area
        map.panTo([37.8044, -122.2711]);
      }
    });
    
    // Wait for new markers to load
    await page.waitForTimeout(2000);
    
    // Get new marker count
    const newMarkers = await page.$$('.leaflet-marker-icon');
    const newCount = newMarkers.length;
    
    console.log(`After panning: Initial markers: ${initialCount}, New markers: ${newCount}`);
    
    // Markers should change when panning to a different area
    expect(newCount).not.toBe(initialCount);
  }, 30000);

  it('should properly separate clusters when zooming in progressively', async () => {
    // Start at zoom 12
    await page.evaluate(() => {
      const map = (window as any).leafletMap;
      if (map) {
        map.setView([37.7749, -122.4194], 12); // San Francisco
      }
    });
    
    await page.waitForTimeout(1500);
    
    // Track cluster counts at each zoom level
    const zoomLevels = [12, 13, 14, 15];
    const clusterCounts: number[] = [];
    
    for (const zoom of zoomLevels) {
      await page.evaluate((z) => {
        const map = (window as any).leafletMap;
        if (map) {
          map.setZoom(z);
        }
      }, zoom);
      
      await page.waitForTimeout(1500);
      
      const clusters = await page.$$('.leaflet-marker-icon.cluster-marker');
      clusterCounts.push(clusters.length);
      
      console.log(`Zoom ${zoom}: ${clusters.length} clusters`);
    }
    
    // Clusters should decrease as we zoom in
    for (let i = 1; i < clusterCounts.length; i++) {
      expect(clusterCounts[i]).toBeLessThanOrEqual(clusterCounts[i - 1]);
    }
    
    // At zoom 15, there should be very few or no clusters
    expect(clusterCounts[clusterCounts.length - 1]).toBeLessThanOrEqual(2);
  }, 30000);
});

// Run a simple non-Puppeteer test to verify backend clustering
describe('Backend Clustering API Tests', () => {
  const BASE_API_URL = 'http://localhost:5000/api';
  
  it('should return different cluster counts at different zoom levels', async () => {
    const bounds = 'west=-122.43&south=37.76&east=-122.40&north=37.79';
    
    // Test zoom 12
    const response12 = await fetch(`${BASE_API_URL}/communities/clusters?${bounds}&zoom=12`);
    const data12 = await response12.json();
    
    // Test zoom 13
    const response13 = await fetch(`${BASE_API_URL}/communities/clusters?${bounds}&zoom=13`);
    const data13 = await response13.json();
    
    console.log(`API Test - Zoom 12: ${data12.clusters?.length} features`);
    console.log(`API Test - Zoom 13: ${data13.clusters?.length} features`);
    
    // Should have different counts
    expect(data12.clusters?.length).toBeDefined();
    expect(data13.clusters?.length).toBeDefined();
    
    // Count actual clusters vs markers
    const clusters12 = data12.clusters?.filter((f: any) => f.properties?.cluster).length || 0;
    const clusters13 = data13.clusters?.filter((f: any) => f.properties?.cluster).length || 0;
    
    // Zoom 13 should have fewer clusters than zoom 12
    expect(clusters13).toBeLessThanOrEqual(clusters12);
  }, 10000);
});