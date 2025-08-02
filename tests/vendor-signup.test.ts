import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { db } from '../server/db';
import { vendorRegistrations, auditLogs } from '../shared/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// Mock Stripe for testing
jest.mock('stripe');
const mockStripe = {
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_test123',
      email: 'test@vendor.com'
    })
  },
  products: {
    create: jest.fn().mockResolvedValue({
      id: 'prod_test123',
      name: 'MySeniorValet Professional Plan'
    })
  },
  prices: {
    create: jest.fn().mockResolvedValue({
      id: 'price_test123',
      unit_amount: 14900,
      currency: 'usd'
    })
  },
  subscriptions: {
    create: jest.fn().mockResolvedValue({
      id: 'sub_test123',
      customer: 'cus_test123',
      status: 'incomplete',
      latest_invoice: {
        payment_intent: {
          id: 'pi_test123',
          client_secret: 'pi_test123_secret_test',
          status: 'requires_payment_method'
        }
      }
    }),
    retrieve: jest.fn().mockResolvedValue({
      id: 'sub_test123',
      customer: {
        id: 'cus_test123',
        email: 'test@vendor.com'
      },
      metadata: {
        businessName: 'Test Vendor Inc',
        contactName: 'John Doe',
        email: 'test@vendor.com',
        phone: '555-0123',
        website: 'https://testvendor.com',
        businessType: 'healthcare',
        description: 'Test healthcare services',
        serviceAreas: 'California, Nevada',
        planType: 'professional'
      }
    })
  },
  paymentIntents: {
    retrieve: jest.fn().mockResolvedValue({
      id: 'pi_test123',
      status: 'succeeded',
      customer: 'cus_test123',
      metadata: {
        subscriptionId: 'sub_test123',
        businessName: 'Test Vendor Inc',
        email: 'test@vendor.com',
        planType: 'professional'
      },
      amount: 14900
    })
  },
  webhooks: {
    constructEvent: jest.fn()
  }
};

(Stripe as any).mockImplementation(() => mockStripe);

let app: any;

beforeAll(async () => {
  // Import app after mocking Stripe
  const appModule = await import('../server/index');
  app = appModule.app;
  
  // Clean up test data
  await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'test@vendor.com'));
  await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'basic@vendor.com'));
  await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'enterprise@vendor.com'));
});

afterAll(async () => {
  // Clean up test data
  await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'test@vendor.com'));
  await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'basic@vendor.com'));
  await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'enterprise@vendor.com'));
});

describe('Vendor Signup API Tests', () => {
  describe('POST /api/vendor-signup', () => {
    test('should create a new vendor signup with professional plan', async () => {
      const vendorData = {
        businessName: 'Test Vendor Inc',
        contactName: 'John Doe',
        email: 'test@vendor.com',
        phone: '555-0123',
        website: 'https://testvendor.com',
        businessType: 'healthcare',
        description: 'Test healthcare services for seniors',
        serviceAreas: 'California, Nevada',
        planType: 'professional',
        amount: 149
      };

      const response = await request(app)
        .post('/api/vendor-signup')
        .send(vendorData)
        .expect(200);

      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body).toHaveProperty('subscriptionId');
      expect(response.body).toHaveProperty('customerId');
      expect(response.body.clientSecret).toBe('pi_test123_secret_test');
      expect(response.body.subscriptionId).toBe('sub_test123');
      expect(response.body.customerId).toBe('cus_test123');

      // Verify Stripe calls
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: vendorData.email,
        name: vendorData.contactName,
        phone: vendorData.phone,
        metadata: {
          businessName: vendorData.businessName,
          businessType: vendorData.businessType,
          planType: vendorData.planType
        }
      });

      expect(mockStripe.products.create).toHaveBeenCalled();
      expect(mockStripe.prices.create).toHaveBeenCalledWith({
        product: 'prod_test123',
        unit_amount: 14900,
        currency: 'usd',
        recurring: { interval: 'month' }
      });
    });

    test('should handle basic plan ($49/month)', async () => {
      mockStripe.prices.create.mockResolvedValueOnce({
        id: 'price_basic123',
        unit_amount: 4900,
        currency: 'usd'
      });

      const vendorData = {
        businessName: 'Basic Vendor Co',
        contactName: 'Jane Smith',
        email: 'basic@vendor.com',
        phone: '555-0456',
        businessType: 'transportation',
        description: 'Senior transportation services',
        serviceAreas: 'Texas',
        planType: 'basic',
        amount: 49
      };

      const response = await request(app)
        .post('/api/vendor-signup')
        .send(vendorData)
        .expect(200);

      expect(response.body).toHaveProperty('clientSecret');
      expect(mockStripe.prices.create).toHaveBeenCalledWith({
        product: expect.any(String),
        unit_amount: 4900,
        currency: 'usd',
        recurring: { interval: 'month' }
      });
    });

    test('should handle enterprise plan ($299/month)', async () => {
      mockStripe.prices.create.mockResolvedValueOnce({
        id: 'price_enterprise123',
        unit_amount: 29900,
        currency: 'usd'
      });

      const vendorData = {
        businessName: 'Enterprise Senior Care',
        contactName: 'Bob Johnson',
        email: 'enterprise@vendor.com',
        phone: '555-0789',
        businessType: 'homecare',
        description: 'Comprehensive home care services',
        serviceAreas: 'Florida, Georgia, Alabama',
        planType: 'enterprise',
        amount: 299
      };

      const response = await request(app)
        .post('/api/vendor-signup')
        .send(vendorData)
        .expect(200);

      expect(response.body).toHaveProperty('clientSecret');
      expect(mockStripe.prices.create).toHaveBeenCalledWith({
        product: expect.any(String),
        unit_amount: 29900,
        currency: 'usd',
        recurring: { interval: 'month' }
      });
    });

    test('should validate required fields', async () => {
      const invalidData = {
        businessName: 'Test Vendor',
        // Missing required fields
      };

      await request(app)
        .post('/api/vendor-signup')
        .send(invalidData)
        .expect(500);
    });

    test('should log vendor signup attempt in audit logs', async () => {
      const vendorData = {
        businessName: 'Audit Test Vendor',
        contactName: 'Audit Tester',
        email: 'audit@test.com',
        phone: '555-1111',
        businessType: 'healthcare',
        description: 'Test for audit logging',
        serviceAreas: 'California',
        planType: 'basic',
        amount: 49
      };

      await request(app)
        .post('/api/vendor-signup')
        .send(vendorData)
        .expect(200);

      // Check audit log was created
      const auditLog = await db.query.auditLogs.findFirst({
        where: eq(auditLogs.action, 'vendor_signup_initiated'),
        orderBy: (logs, { desc }) => [desc(logs.timestamp)]
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog?.metadata?.additionalInfo).toMatchObject({
        businessName: 'Audit Test Vendor',
        email: 'audit@test.com',
        planType: 'basic'
      });
    });
  });

  describe('POST /api/vendor-registration-status', () => {
    test('should retrieve vendor registration status by payment intent', async () => {
      const response = await request(app)
        .post('/api/vendor-registration-status')
        .send({
          paymentIntent: 'pi_test123',
          paymentIntentClientSecret: 'pi_test123_secret_test'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        businessName: 'Test Vendor Inc',
        email: 'test@vendor.com',
        planType: 'professional',
        monthlyAmount: '149.00',
        status: 'pending'
      });
    });

    test('should handle missing payment intent', async () => {
      await request(app)
        .post('/api/vendor-registration-status')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/vendor-status/:email', () => {
    test('should check if vendor exists', async () => {
      // First create a vendor
      await db.insert(vendorRegistrations).values({
        businessName: 'Existing Vendor',
        contactName: 'Test Contact',
        email: 'existing@vendor.com',
        phone: '555-2222',
        businessType: 'healthcare',
        description: 'Test vendor',
        serviceAreas: ['California'],
        planType: 'professional',
        stripeCustomerId: 'cus_existing',
        stripeSubscriptionId: 'sub_existing',
        status: 'active',
        verifiedPartner: true,
        monthlyAmount: 149
      });

      const response = await request(app)
        .get('/api/vendor-status/existing@vendor.com')
        .expect(200);

      expect(response.body).toMatchObject({
        exists: true,
        status: 'active',
        planType: 'professional',
        businessName: 'Existing Vendor'
      });

      // Clean up
      await db.delete(vendorRegistrations).where(eq(vendorRegistrations.email, 'existing@vendor.com'));
    });

    test('should return false for non-existent vendor', async () => {
      const response = await request(app)
        .get('/api/vendor-status/nonexistent@vendor.com')
        .expect(200);

      expect(response.body).toEqual({ exists: false });
    });
  });
});

describe('Vendor Signup Flow Integration Test', () => {
  test('complete vendor signup flow', async () => {
    const vendorData = {
      businessName: 'Complete Flow Test',
      contactName: 'Flow Tester',
      email: 'flow@test.com',
      phone: '555-3333',
      website: 'https://flowtest.com',
      businessType: 'homecare',
      description: 'Testing complete flow',
      serviceAreas: 'New York, New Jersey',
      planType: 'enterprise',
      amount: 299
    };

    // Step 1: Initialize signup
    const signupResponse = await request(app)
      .post('/api/vendor-signup')
      .send(vendorData)
      .expect(200);

    expect(signupResponse.body.clientSecret).toBeTruthy();
    expect(signupResponse.body.subscriptionId).toBeTruthy();

    // Step 2: Simulate successful payment (webhook would normally handle this)
    // In real scenario, Stripe would send a webhook after payment completion

    // Step 3: Check registration status
    const statusResponse = await request(app)
      .post('/api/vendor-registration-status')
      .send({
        paymentIntent: 'pi_test123',
        paymentIntentClientSecret: signupResponse.body.clientSecret
      })
      .expect(200);

    expect(statusResponse.body.businessName).toBe('Test Vendor Inc'); // From mock
    expect(statusResponse.body.planType).toBe('professional'); // From mock
  });
});