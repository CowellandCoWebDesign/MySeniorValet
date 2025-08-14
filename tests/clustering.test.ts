import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Supercluster from 'supercluster';

/**
 * AUTOMATED CLUSTERING TEST SUITE
 * Ensures clustering works correctly at all zoom levels
 * Prevents regressions like the current failures
 */

describe('SuperCluster Configuration Tests', () => {
  let index: Supercluster;
  let testData: any[];

  beforeAll(() => {
    // Create test data simulating 35,000 communities across US
    testData = generateTestCommunities(35000);
    
    // Initialize SuperCluster with production config
    index = new Supercluster({
      radius: 80,      // Increased radius for better clustering
      maxZoom: 16,     // Stop clustering at zoom 16
      minZoom: 0,      
      minPoints: 2,    
      extent: 512,     
      nodeSize: 64,    
      generateId: true
    });
    
    index.load(testData);
  });

  describe('Zoom Level Clustering', () => {
    it('should heavily cluster at country view (zoom 4)', () => {
      const bbox: [number, number, number, number] = [-130, 25, -65, 50]; // US bounds
      const clusters = index.getClusters(bbox, 4);
      
      const clusterCount = clusters.filter(c => c.properties?.cluster).length;
      const individualCount = clusters.filter(c => !c.properties?.cluster).length;
      
      // At zoom 4, should be mostly clusters
      expect(clusterCount).toBeGreaterThan(10);
      expect(clusterCount).toBeLessThan(100);
      expect(individualCount).toBeLessThan(50);
      
      console.log(`Zoom 4: ${clusterCount} clusters, ${individualCount} individuals`);
    });

    it('should moderately cluster at state view (zoom 8)', () => {
      const bbox: [number, number, number, number] = [-125, 32, -114, 42]; // California
      const clusters = index.getClusters(bbox, 8);
      
      const clusterCount = clusters.filter(c => c.properties?.cluster).length;
      const individualCount = clusters.filter(c => !c.properties?.cluster).length;
      
      // At zoom 8, should have mix of clusters and individuals
      expect(clusterCount).toBeGreaterThan(20);
      expect(clusterCount).toBeLessThan(200);
      
      console.log(`Zoom 8: ${clusterCount} clusters, ${individualCount} individuals`);
    });

    it('should lightly cluster at city view (zoom 12)', () => {
      const bbox: [number, number, number, number] = [-122.5, 37.7, -122.3, 37.9]; // San Francisco
      const clusters = index.getClusters(bbox, 12);
      
      const clusterCount = clusters.filter(c => c.properties?.cluster).length;
      const individualCount = clusters.filter(c => !c.properties?.cluster).length;
      
      // At zoom 12, should be mostly individuals with some clusters
      expect(clusterCount).toBeLessThan(50);
      expect(individualCount).toBeGreaterThan(clusterCount);
      
      console.log(`Zoom 12: ${clusterCount} clusters, ${individualCount} individuals`);
    });

    it('should NOT cluster at street level (zoom 17+)', () => {
      const bbox: [number, number, number, number] = [-122.42, 37.77, -122.40, 37.79]; // SF neighborhood
      const clusters = index.getClusters(bbox, 17);
      
      const clusterCount = clusters.filter(c => c.properties?.cluster).length;
      const individualCount = clusters.filter(c => !c.properties?.cluster).length;
      
      // At zoom 17+, should be NO clusters (maxZoom is 16)
      expect(clusterCount).toBe(0);
      expect(individualCount).toBeGreaterThan(0);
      
      console.log(`Zoom 17: ${clusterCount} clusters, ${individualCount} individuals`);
    });
  });

  describe('Community Count Calculation', () => {
    it('should correctly count total communities including those in clusters', () => {
      const bbox: [number, number, number, number] = [-130, 25, -65, 50]; // US bounds
      const clusters = index.getClusters(bbox, 10);
      
      let totalCommunities = 0;
      
      clusters.forEach(feature => {
        if (feature.properties?.cluster) {
          // Add the point count from the cluster
          totalCommunities += feature.properties.point_count || 0;
        } else {
          // Add single community
          totalCommunities += 1;
        }
      });
      
      // Should account for all communities in viewport
      expect(totalCommunities).toBeGreaterThan(0);
      expect(totalCommunities).toBeLessThanOrEqual(testData.length);
      
      console.log(`Total communities in viewport: ${totalCommunities}`);
    });
  });

  describe('Cluster Expansion', () => {
    it('should expand clusters as zoom increases', () => {
      const bbox: [number, number, number, number] = [-122.5, 37.7, -122.3, 37.9]; // San Francisco
      
      const zoom10 = index.getClusters(bbox, 10);
      const zoom12 = index.getClusters(bbox, 12);
      const zoom14 = index.getClusters(bbox, 14);
      const zoom16 = index.getClusters(bbox, 16);
      
      const clusters10 = zoom10.filter(c => c.properties?.cluster).length;
      const clusters12 = zoom12.filter(c => c.properties?.cluster).length;
      const clusters14 = zoom14.filter(c => c.properties?.cluster).length;
      const clusters16 = zoom16.filter(c => c.properties?.cluster).length;
      
      // Clusters should decrease as zoom increases
      expect(clusters10).toBeGreaterThanOrEqual(clusters12);
      expect(clusters12).toBeGreaterThanOrEqual(clusters14);
      expect(clusters14).toBeGreaterThanOrEqual(clusters16);
      
      console.log(`Cluster reduction: zoom10(${clusters10}) → zoom12(${clusters12}) → zoom14(${clusters14}) → zoom16(${clusters16})`);
    });
  });

  describe('Performance Tests', () => {
    it('should handle 35,000 points efficiently', () => {
      const bbox: [number, number, number, number] = [-130, 25, -65, 50]; // US bounds
      
      const startTime = performance.now();
      const clusters = index.getClusters(bbox, 10);
      const endTime = performance.now();
      
      const processingTime = endTime - startTime;
      
      // Should process in under 100ms
      expect(processingTime).toBeLessThan(100);
      expect(clusters).toBeDefined();
      expect(clusters.length).toBeGreaterThan(0);
      
      console.log(`Processed ${testData.length} points in ${processingTime.toFixed(2)}ms`);
    });
  });
});

// Helper function to generate test communities
function generateTestCommunities(count: number): any[] {
  const communities = [];
  
  // Generate communities distributed across US
  for (let i = 0; i < count; i++) {
    const lat = 25 + Math.random() * 25; // 25 to 50
    const lng = -130 + Math.random() * 65; // -130 to -65
    
    communities.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        id: i,
        name: `Community ${i}`,
        city: 'Test City',
        state: 'TS'
      }
    });
  }
  
  return communities;
}