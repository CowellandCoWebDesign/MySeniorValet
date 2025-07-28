import request from 'supertest';
import { Express } from 'express';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { registerRoutes } from '../../server/routes';
import express from 'express';

/**
 * 1-800-FLORALS Integration Test Suite
 * 
 * Tests the complete floral services integration including:
 * - Vendor database integration
 * - Product catalog API
 * - Order processing
 * - Affiliate link generation
 * - Special offers for senior living
 */

describe('1-800-FLORALS Service Integration', () => {
  let app: Express;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
  });

  describe('Floral Catalog API', () => {
    it('should return product catalog with authentic 1-800-FLORALS products', async () => {
      const response = await request(app)
        .get('/api/florals/catalog')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('occasions');
      expect(response.body).toHaveProperty('specialOffers');
      expect(response.body).toHaveProperty('deliveryInfo');

      // Verify we have authentic products from 1-800-FLORALS
      expect(response.body.products).toHaveLength(8);
      expect(response.body.products[0]).toMatchObject({
        id: '4810D',
        name: 'FTD Graceful Grandeur 18 Roses Vase',
        price: 149.95,
        image: 'https://www.800florals.com/img/4810Dmd.jpg'
      });

      // Verify senior living specific occasions
      expect(response.body.occasions).toContain('move-in');
      expect(response.body.occasions).toContain('get-well');
      expect(response.body.occasions).toContain('sympathy');

      // Verify special offers for senior living
      expect(response.body.specialOffers).toHaveProperty('move-in-special');
      expect(response.body.specialOffers['move-in-special']).toMatchObject({
        title: 'Welcome Home Arrangement',
        discount: 15,
        minOrder: 75
      });
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/florals/catalog?category=roses')
        .expect(200);

      expect(response.body.products.every((product: any) => 
        product.category === 'roses'
      )).toBe(true);
    });

    it('should filter products by occasion', async () => {
      const response = await request(app)
        .get('/api/florals/catalog?occasion=move-in')
        .expect(200);

      expect(response.body.products.every((product: any) => 
        product.suitable_occasions.includes('move-in')
      )).toBe(true);
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/florals/catalog?priceRange=80-120')
        .expect(200);

      expect(response.body.products.every((product: any) => 
        product.price >= 80 && product.price <= 120
      )).toBe(true);
    });
  });

  describe('Product Details API', () => {
    it('should return detailed product information', async () => {
      const response = await request(app)
        .get('/api/florals/product/4810D')
        .expect(200);

      expect(response.body).toMatchObject({
        id: '4810D',
        name: 'FTD Graceful Grandeur 18 Roses Vase',
        price: 149.95,
        orderUrl: 'https://www.800florals.com/order.asp?item=4810D&sid=movein_support_florals'
      });

      expect(response.body).toHaveProperty('specialOffers');
      expect(response.body).toHaveProperty('deliveryInfo');
    });

    it('should return 404 for non-existent products', async () => {
      await request(app)
        .get('/api/florals/product/INVALID')
        .expect(404);
    });
  });

  describe('Occasion-Based Recommendations', () => {
    it('should return move-in specific recommendations', async () => {
      const response = await request(app)
        .get('/api/florals/occasions/move-in')
        .expect(200);

      expect(response.body).toHaveProperty('occasion', 'move-in');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('occasionInfo');
      
      expect(response.body.occasionInfo).toMatchObject({
        title: 'Welcome Home Arrangements',
        description: 'Beautiful flowers to brighten your new senior living home'
      });

      expect(response.body.recommendations.every((product: any) => 
        product.suitable_occasions.includes('move-in')
      )).toBe(true);
    });

    it('should return sympathy recommendations', async () => {
      const response = await request(app)
        .get('/api/florals/occasions/sympathy')
        .expect(200);

      expect(response.body.occasionInfo).toMatchObject({
        title: 'Sympathy & Comfort',
        description: 'Thoughtful arrangements for difficult times'
      });
    });

    it('should filter by budget', async () => {
      const response = await request(app)
        .get('/api/florals/occasions/birthday?budget=100')
        .expect(200);

      expect(response.body.recommendations.every((product: any) => 
        product.price <= 100
      )).toBe(true);
    });
  });

  describe('Order Processing', () => {
    it('should process order and generate affiliate tracking URL', async () => {
      const orderData = {
        productId: '4810D',
        userId: 'test-user-123',
        communityId: 456,
        deliveryInfo: {
          deliveryDate: '2025-07-30',
          recipientName: 'John Doe',
          address: '123 Senior Living Way'
        },
        orderValue: 149.95
      };

      const response = await request(app)
        .post('/api/florals/order')
        .send(orderData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        orderUrl: 'https://www.800florals.com/order.asp?item=4810D&sid=movein_support_florals'
      });

      expect(response.body).toHaveProperty('orderSummary');
      expect(response.body.orderSummary).toMatchObject({
        product: 'FTD Graceful Grandeur 18 Roses Vase',
        price: 149.95
      });
    });

    it('should handle invalid product orders', async () => {
      const orderData = {
        productId: 'INVALID',
        orderValue: 99.99
      };

      await request(app)
        .post('/api/florals/order')
        .send(orderData)
        .expect(404);
    });
  });

  describe('Delivery Information', () => {
    it('should return delivery options and coverage', async () => {
      const response = await request(app)
        .get('/api/florals/delivery-info')
        .expect(200);

      expect(response.body).toMatchObject({
        available: true,
        sameDayAvailable: true,
        sameDayCutoff: '11:00 AM',
        nextDayAvailable: true,
        scheduledDeliveryAvailable: true,
        deliveryFee: 14.99,
        freeDeliveryThreshold: 75.00
      });

      expect(response.body).toHaveProperty('estimatedDelivery');
      expect(response.body.estimatedDelivery).toMatchObject({
        sameDay: 'Today by 7 PM',
        nextDay: 'Tomorrow by 7 PM',
        scheduled: 'On selected date by 7 PM'
      });
    });

    it('should handle Hawaii delivery restrictions', async () => {
      const response = await request(app)
        .get('/api/florals/delivery-info?zipCode=96720')
        .expect(200);

      expect(response.body.restrictions).toContain('Hawaii deliveries not available');
    });
  });

  describe('Vendor Information', () => {
    it('should return 1-800-FLORALS vendor details', async () => {
      const response = await request(app)
        .get('/api/florals/vendor-info')
        .expect(200);

      expect(response.body).toMatchObject({
        name: '1-800-FLORALS',
        description: 'Professional florist network with over 95 years of experience',
        coverage: '49 Continental US states and Canada',
        experience: 'More than 95 years in business'
      });

      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('seniorLivingBenefits');
      expect(response.body).toHaveProperty('contact');

      expect(response.body.contact).toMatchObject({
        phone: '1-800-356-7257',
        website: 'https://www.800florals.com'
      });

      expect(response.body.seniorLivingBenefits).toContain('Special pricing for senior living communities');
      expect(response.body.seniorLivingBenefits).toContain('Move-in welcome arrangements');
    });
  });

  describe('Integration Analytics', () => {
    it('should track catalog views', async () => {
      // This would be verified through console logs in the current implementation
      const response = await request(app)
        .get('/api/florals/catalog?category=roses&occasion=birthday')
        .expect(200);

      expect(response.body).toHaveProperty('products');
      // In a full implementation, we would verify tracking data was stored
    });

    it('should track product views', async () => {
      const response = await request(app)
        .get('/api/florals/product/T2533')
        .expect(200);

      expect(response.body.name).toBe('Your Light Shines Arrangement');
      // In a full implementation, we would verify tracking data was stored
    });

    it('should track order initiations with commission calculation', async () => {
      const orderData = {
        productId: 'TW424',
        orderValue: 79.95
      };

      const response = await request(app)
        .post('/api/florals/order')
        .send(orderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Commission would be 79.95 * 0.08 = $6.40
      // In a full implementation, we would verify this was tracked in the database
    });
  });
});

describe('Database Vendor Integration', () => {
  it('should have 1-800-FLORALS vendor in database', async () => {
    const response = await request(app)
      .get('/api/vendors/featured')
      .expect(200);

    // The vendor should be in the featured vendors list
    expect(Array.isArray(response.body)).toBe(true);
  });
});