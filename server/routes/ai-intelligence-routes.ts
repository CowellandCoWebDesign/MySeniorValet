import express from 'express';

const router = express.Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.use((_req, res) => res.status(503).json(DISABLED));

export default router;
