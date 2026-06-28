import type { Express } from 'express';

const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

export function registerPricingIntelligenceRoutes(app: Express): void {
  app.use('/api/pricing-intelligence', (_req, res) => res.status(503).json(DISABLED));
}
