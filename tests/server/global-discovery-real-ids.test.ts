/**
 * @jest-environment node
 *
 * Regression guard for Task #322: tapping a freshly found community must never
 * open a broken page. The map-search click handler only navigates when a result
 * carries a positive numeric id, so the discovery endpoint MUST persist every
 * discovered community and return it with a real positive id (and, when the
 * location geocodes, latitude/longitude for the map pin).
 *
 * This drives the real POST /api/global-discovery/search handler in
 * discoveryMode with the DB, geocoder and Perplexity layers mocked so we can
 * assert the response shape contract that keeps /communities/<id> links valid.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// --------------------------------------------------------------------------
// Mock every server dependency before the router is imported.
// jest.mock() calls are hoisted above the imports.
// --------------------------------------------------------------------------

// Geocoder — always returns coordinates so saved communities carry lat/lng.
const mockGeocode = jest.fn();
jest.mock('../../server/nominatim-geocoding', () => ({
  geocodeWithNominatim: (...a: any[]) => mockGeocode(...a),
}));

// Perplexity discovery — returns the freshly "found" communities (dynamic import).
const mockDiscoverCommunities = jest.fn();
jest.mock('../../server/services/perplexity-search-api', () => ({
  perplexitySearchAPI: {
    discoverCommunities: (...a: any[]) => mockDiscoverCommunities(...a),
  },
}));

// Free web discovery service (used for the services path / not exercised here).
jest.mock('../../server/services/free-discovery-service', () => ({
  discoverCommunitiesViaWeb: jest.fn(async () => []),
  discoverHealthcareViaWeb: jest.fn(async () => []),
  discoverResourcesViaWeb: jest.fn(async () => []),
}));

// AI usage tracker — no-op.
jest.mock('../../server/services/ai-tracker.service', () => ({
  aiTracker: new Proxy({}, { get: () => jest.fn() }),
}));

// --------------------------------------------------------------------------
// DB mock: db.select() chains resolve to [] (no existing / no duplicates);
// db.insert().values(v).returning() echoes the inserted row with a fresh
// positive id so the route maps it to a real database id.
// --------------------------------------------------------------------------
let nextInsertId = 100;
const insertedValues: any[] = [];

function makeSelectChain(): any {
  const result: any[] = [];
  const chain: any = {
    from: () => chain,
    where: () => chain,
    limit: () => chain,
    orderBy: () => chain,
    then: (res: any, rej: any) => Promise.resolve(result).then(res, rej),
    catch: (rej: any) => Promise.resolve(result).catch(rej),
  };
  return chain;
}

const mockInsert = jest.fn(() => ({
  values: (v: any) => {
    insertedValues.push(v);
    const saved = { ...v, id: nextInsertId++ };
    return { returning: async () => [saved] };
  },
}));

const mockUpdate = jest.fn(() => ({
  set: () => ({ where: async () => undefined }),
}));

jest.mock('../../server/db', () => ({
  db: {
    select: () => makeSelectChain(),
    insert: (...a: any[]) => mockInsert(...a),
    update: (...a: any[]) => mockUpdate(...a),
  },
}));

// Shared schema — Drizzle table objects; any column access returns a stub.
jest.mock('../../shared/schema', () => {
  const table = () => new Proxy({}, { get: (_t, prop) => String(prop) });
  return {
    communities: table(),
    vendors: table(),
    services: table(),
    healthcareProviders: table(),
    seniorResources: table(),
  };
});

// drizzle-orm helpers — return their args unchanged; sql is also a tag fn.
jest.mock('drizzle-orm', () => ({
  eq: (...a: any[]) => a,
  and: (...a: any[]) => a,
  or: (...a: any[]) => a,
  isNull: (...a: any[]) => a,
  like: (...a: any[]) => a,
  sql: Object.assign((...a: any[]) => a, { raw: (...a: any[]) => a }),
}));

// --------------------------------------------------------------------------
// Import the router under test.
// --------------------------------------------------------------------------
import request from 'supertest';
import express from 'express';
import { setupGlobalDiscoveryRoutes } from '../../server/routes/global-discovery';

function buildApp() {
  const app = express();
  app.use(express.json());
  setupGlobalDiscoveryRoutes(app);
  return app;
}

describe('POST /api/global-discovery/search — discovered communities carry real ids (Task #322)', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    nextInsertId = 100;
    insertedValues.length = 0;
    mockGeocode.mockResolvedValue({ lat: 32.5, lng: -96.5 });
    mockDiscoverCommunities.mockResolvedValue({
      communities: [
        {
          name: 'Ranger Senior Living',
          address: '100 Main St',
          city: 'Ranger',
          state: 'TX',
          phone: '254-555-0100',
          website: 'https://rangerseniorliving.com',
          careTypes: ['Assisted Living'],
          confidence: 90,
        },
        {
          name: 'Eastland Memory Care',
          address: '200 Oak Ave',
          city: 'Ranger',
          state: 'TX',
          phone: '254-555-0200',
          website: 'https://eastlandmemorycare.com',
          careTypes: ['Memory Care'],
          confidence: 88,
        },
      ],
      sources: ['https://example.com/source'],
    });
    app = buildApp();
  });

  it('returns every discovered result with a positive numeric id and lat/lng', async () => {
    const res = await request(app)
      .post('/api/global-discovery/search')
      .send({ query: 'Ranger, TX', discoveryMode: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);

    for (const result of res.body.results) {
      expect(typeof result.id).toBe('number');
      expect(Number.isFinite(result.id)).toBe(true);
      expect(result.id).toBeGreaterThan(0);
      // Geocoded → coordinates present for the map pin.
      expect(result.latitude).toBe(32.5);
      expect(result.longitude).toBe(-96.5);
    }
  });

  it('still returns positive ids when geocoding fails (lat/lng null, id valid)', async () => {
    mockGeocode.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/global-discovery/search')
      .send({ query: 'Ranger, TX', discoveryMode: true });

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    for (const result of res.body.results) {
      expect(result.id).toBeGreaterThan(0);
      expect(result.latitude).toBeNull();
      expect(result.longitude).toBeNull();
    }
  });

  it('persists each discovered community before returning it', async () => {
    await request(app)
      .post('/api/global-discovery/search')
      .send({ query: 'Ranger, TX', discoveryMode: true });

    // Every returned community was inserted (so it has a real DB id).
    expect(mockInsert).toHaveBeenCalled();
    expect(insertedValues.length).toBeGreaterThan(0);
  });
});
