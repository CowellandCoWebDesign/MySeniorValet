import { Router } from 'express';

const router = Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.all('/api/web-intelligence', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/web-intelligence/*', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/web-intel/*', (_req, res) => res.status(503).json(DISABLED));

export default router;
