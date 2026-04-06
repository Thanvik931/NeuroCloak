import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { AnomalyAlert } from '../models';

const router = Router();

// GET unresolved anomalies
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const anomalies = await AnomalyAlert.find({ resolved: false })
      .sort({ createdAt: -1 })
      .populate('aiSystemId', 'name')
      .lean();
      
    // Map _id to id
    const formatted = anomalies.map(a => ({
      ...a,
      id: a._id.toString(),
      aiSystemId: (a.aiSystemId as any)._id ? (a.aiSystemId as any)._id.toString() : a.aiSystemId
    }));
      
    return res.json(formatted);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH resolve anomaly
router.patch('/:id/resolve', authenticate, requireRole(['ADMIN', 'AUDITOR']), async (req: AuthRequest, res: Response) => {
  try {
    const anomaly = await AnomalyAlert.findByIdAndUpdate(
      req.params.id,
      { $set: { resolved: true } },
      { new: true }
    );
    return res.json(anomaly);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
