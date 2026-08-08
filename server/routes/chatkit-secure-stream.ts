import express from 'express';

const router = express.Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.all('/api/chatkit/stream', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/chatkit/secure-stream', (_req, res) => res.status(503).json(DISABLED));
router.all('/api/chatkit/*', (_req, res) => res.status(503).json(DISABLED));

export default router;
