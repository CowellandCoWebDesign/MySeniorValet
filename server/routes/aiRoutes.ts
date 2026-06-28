import { type Express } from "express";

const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

export function registerAIRoutes(app: Express) {
  app.use('/api/ai', (_req, res) => res.status(503).json(DISABLED));
  app.use('/api/recommendations', (_req, res) => res.status(503).json(DISABLED));
}
