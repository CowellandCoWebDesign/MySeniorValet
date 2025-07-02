import { jest } from '@jest/globals';
import { runEnrichment } from '../runEnrichment.js';

// Mock external dependencies
jest.mock('../foursquareLookup.js', () => ({
  foursquareLookup: jest.fn()
}));

jest.mock('../phoneValidate.js', () => ({
  validatePhone: jest.fn()
}));

jest.mock('../spendGuards.js', () => ({
  logEnrichmentCall: jest.fn(),
  checkDailyLimits: jest.fn()
}));

jest.mock('../../db.js', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis()
  }
}));

describe('Enrichment System', () => {
  const mockCommunity = {
    id: 1,
    name: 'Test Senior Living',
    address: '123 Test St',
    city: 'San Francisco',
    state: 'CA',
    phone: '(415) 555-0123',
    licenseStatus: 'Licensed',
    photos: ['existing-photo.jpg'],
    rating: 4.0
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const { foursquareLookup } = require('../foursquareLookup.js');
    const { validatePhone } = require('../phoneValidate.js');
    const { checkDailyLimits } = require('../spendGuards.js');
    const { db } = require('../../db.js');

    foursquareLookup.mockResolvedValue({
      photos: ['foursquare-photo1.jpg', 'foursquare-photo2.jpg'],
      rating: 4.2
    });

    validatePhone.mockResolvedValue({
      isValid: true,
      phoneNumber: '+14155550123',
      carrier: 'Test Carrier'
    });

    checkDailyLimits.mockResolvedValue({
      alertTriggered: false,
      dailyCounts: {}
    });

    // Mock database responses
    db.select.mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([mockCommunity])
    }));

    db.update.mockImplementation(() => ({
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([{ ...mockCommunity, photos: ['existing-photo.jpg', 'foursquare-photo1.jpg', 'foursquare-photo2.jpg'] }])
    }));
  });

  test('runEnrichment adds photos and validates phone', async () => {
    // Set up environment variables for testing
    process.env.FOURSQUARE_API_KEY = 'test-foursquare-key';
    process.env.TWILIO_LOOKUP_KEY = 'test-twilio-key';
    process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token';

    const result = await runEnrichment(1);

    expect(result.success).toBe(true);
    expect(result.communityName).toBe('Test Senior Living');
    expect(result.phoneValid).toBe(true);
    expect(result.totalPhotos).toBeGreaterThanOrEqual(1);
    expect(result.sources).toContain('foursquare');
    expect(result.sources).toContain('twilio_phone');
  });

  test('runEnrichment handles missing community gracefully', async () => {
    const { db } = require('../../db.js');
    db.select.mockImplementation(() => ({
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue([]) // No community found
    }));

    const result = await runEnrichment(999);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Community 999 not found');
  });

  test('runEnrichment skips APIs when keys are missing', async () => {
    // Clear environment variables
    delete process.env.FOURSQUARE_API_KEY;
    delete process.env.TWILIO_LOOKUP_KEY;

    const result = await runEnrichment(1);

    expect(result.success).toBe(true);
    // Should still work with just license confidence boost
    expect(result.confidence).toBeGreaterThan(0);
  });

  test('runEnrichment respects daily spending limits', async () => {
    const { checkDailyLimits } = require('../spendGuards.js');
    checkDailyLimits.mockResolvedValue({
      alertTriggered: true,
      dailyCounts: { yelp: 1001 }
    });

    process.env.YELP_API_KEY = 'test-yelp-key';
    process.env.GOOGLE_PLACES_API_KEY = 'test-google-key';

    const result = await runEnrichment(1);

    expect(result.success).toBe(true);
    // Should skip expensive APIs when limits are hit
    expect(result.sources).not.toContain('yelp');
    expect(result.sources).not.toContain('google_places');
  });

  test('phone validation marks invalid phones correctly', async () => {
    const { validatePhone } = require('../phoneValidate.js');
    validatePhone.mockResolvedValue({
      isValid: false,
      error: 'Invalid phone number format'
    });

    process.env.TWILIO_LOOKUP_KEY = 'test-twilio-key';
    process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token';

    const result = await runEnrichment(1);

    expect(result.success).toBe(true);
    expect(result.phoneValid).toBe(false);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.FOURSQUARE_API_KEY;
    delete process.env.YELP_API_KEY;
    delete process.env.GOOGLE_PLACES_API_KEY;
    delete process.env.TWILIO_LOOKUP_KEY;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.MAPILLARY_TOKEN;
    delete process.env.MAPBOX_TOKEN;
  });
});