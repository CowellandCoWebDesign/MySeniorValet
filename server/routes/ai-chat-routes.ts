import { Router } from 'express';

const router = Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.post('/public/ai-chat', (_req, res) => res.status(503).json(DISABLED));
router.post('/ai/suggestions', (_req, res) => res.status(503).json(DISABLED));
router.all('/ai/chat*', (_req, res) => res.status(503).json(DISABLED));

export default router;
