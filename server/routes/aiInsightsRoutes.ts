import { type Express } from "express";

const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

export function registerAIInsightsRoutes(app: Express) {
  app.use('/api/ai-insights', (_req, res) => res.status(503).json(DISABLED));
}
