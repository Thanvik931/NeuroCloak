import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET unresolved anomalies
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const anomalies = await prisma.anomalyAlert.findMany({
      where: { resolved: false },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return res.json(anomalies);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH resolve anomaly
router.patch('/:id/resolve', authenticate, requireRole(['ADMIN', 'AUDITOR']), async (req: AuthRequest, res: Response) => {
  try {
    const anomaly = await prisma.anomalyAlert.update({
      where: { id: req.params.id as string },
      data: { resolved: true }
    });
    return res.json(anomaly);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
