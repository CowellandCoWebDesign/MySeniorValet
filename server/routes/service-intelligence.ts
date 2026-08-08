import { Router } from 'express';

const router = Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.all('/api/service-intelligence', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/service-intelligence/*', (_req, res) => res.status(503).json(DISABLED));

export default router;
