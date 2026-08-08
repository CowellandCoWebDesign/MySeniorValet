import { type Express } from "express";

const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

export function registerMultiAITestRoutes(app: Express) {
  app.use('/api/multi-ai', (_req, res) => res.status(503).json(DISABLED));
}
