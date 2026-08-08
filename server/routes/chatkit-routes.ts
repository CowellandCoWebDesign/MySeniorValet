import { Router } from 'express';

const router = Router();
const DISABLED = { status: 'disabled', message: 'AI chat temporarily unavailable' };

router.use((_req, res) => res.status(503).json(DISABLED));

export function searchCommunities(_args: any) { return { communities: [], total: 0 }; }
export function enableDiscoveryMode(_args: any) { return { communities: [], total: 0 }; }
export default router;
