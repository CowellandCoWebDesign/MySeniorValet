import { Router } from 'express';

const router = Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.get('/api/analytics/market-intelligence/stats', (_req, res) => res.status(503).json(DISABLED));
router.get('/api/analytics/market-intelligence/popular-locations', (_req, res) => res.status(503).json(DISABLED));
router.get('/api/analytics/market-intelligence/care-level-trends', (_req, res) => res.status(503).json(DISABLED));
router.get('/api/analytics/market-intelligence/state-trends', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/analytics/market-intelligence/*', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/analytics-intelligence/*', (_req, res) => res.status(503).json(DISABLED));

export default router;
