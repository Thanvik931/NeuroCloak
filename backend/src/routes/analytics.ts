import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Decision, BiasFlag } from '../models';
import redis from '../lib/redis';

const router = Router();

// GET /summary -> Total Decisions, Avg Compliance, Avg Transparency, Active Flags
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.query.systemId as string;
    
    // Check redis cache if no specific systemId
    if (!aiSystemId && redis && (redis as any).status === 'ready') {
       const cached = await redis.get('analytics:summary');
       if (cached) return res.json(JSON.parse(cached));
    }

    const matchStage: any = {};
    if (aiSystemId) matchStage.aiSystemId = aiSystemId;

    const [summary] = await Decision.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDecisions: { $sum: 1 },
          avgCompliance: { $avg: '$ethicalComplianceRate' },
          avgTransparency: { $avg: '$transparencyIndex' },
          flaggedCount: {
            $sum: {
               $cond: [
                 { $in: ['$status', ['FLAGGED', 'BLOCKED']] },
                 1, 0
               ]
            }
          }
        }
      }
    ]);

    const result = {
      totalDecisions: summary?.totalDecisions || 0,
      avgComplianceRate: summary?.avgCompliance || 0,
      avgTransparencyIndex: summary?.avgTransparency || 0,
      activeFlags: summary?.flaggedCount || 0
    };

    if (!aiSystemId && redis && (redis as any).status === 'ready') {
       await redis.setex('analytics:summary', 300, JSON.stringify(result));
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /metrics -> Time-series, last 30 days
router.get('/metrics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.query.systemId as string;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const matchStage: any = { createdAt: { $gte: thirtyDaysAgo } };
    if (aiSystemId) matchStage.aiSystemId = aiSystemId;

    const metrics = await Decision.aggregate([
      { $match: matchStage },
      { $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          avgCompliance: { $avg: '$ethicalComplianceRate' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Map safely to exact previous return shape
    const timeSeries = metrics.map(m => ({
      date: m._id,
      complianceRate: m.avgCompliance,
      decisionsCount: m.count
    }));

    return res.json({ timeSeries });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bias-types
router.get('/bias-types', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    // If aiSystemId is provided, we normally link models, but biasflag has direct decisionId reference. 
    // In strict aggregation we'd lookup decisions, but keeping it simpler if it's general:
    const biasCounts = await BiasFlag.aggregate([
      { $group: {
          _id: '$biasType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const distribution = biasCounts.map(b => ({
      type: b._id,
      count: b.count
    }));

    return res.json({ distribution });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /heatmap
router.get('/heatmap', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.query.systemId as string;
    const days = parseInt(req.query.days as string) || 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchStage: any = { createdAt: { $gte: startDate } };
    if (aiSystemId) matchStage.aiSystemId = aiSystemId;

    const heatmapAgg = await Decision.aggregate([
      { $match: matchStage },
      { $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          value: { $avg: '$ethicalComplianceRate' },
          count: { $sum: 1 }
        }
      },
      { $project: {
          date: '$_id',
          complianceRate: { $round: ['$value', 3] },
          count: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    return res.json({ heatmapData: heatmapAgg });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
