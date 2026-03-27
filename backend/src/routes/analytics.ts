import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /summary -> Total Decisions, Avg Compliance, Avg Transparency, Active Flags
router.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.query.systemId as string;
    const whereClause = aiSystemId ? { aiSystemId } : {};

    const [aggregations, activeFlags] = await Promise.all([
      prisma.decision.aggregate({
        where: whereClause,
        _count: { _all: true },
        _avg: {
          ethicalComplianceRate: true,
          transparencyIndex: true
        }
      }),
      prisma.biasFlag.count({
        where: {
          corrected: false,
          decision: whereClause
        }
      })
    ]);

    return res.json({
      totalDecisions: aggregations._count._all,
      avgComplianceRate: aggregations._avg.ethicalComplianceRate || 0,
      avgTransparencyIndex: aggregations._avg.transparencyIndex || 0,
      activeFlags
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /metrics -> Time-series, last 30 days
router.get('/metrics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.query.systemId as string;
    const whereClause: any = {};
    if (aiSystemId) whereClause.aiSystemId = aiSystemId;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    whereClause.createdAt = { gte: thirtyDaysAgo };

    const decisions = await prisma.decision.findMany({
      where: whereClause,
      select: { createdAt: true, ethicalComplianceRate: true },
      orderBy: { createdAt: 'asc' }
    });

    // Group by day for simple line chart
    const dailyMap: Record<string, { sum: number; count: number }> = {};
    decisions.forEach(d => {
      const day = d.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { sum: 0, count: 0 };
      dailyMap[day].sum += d.ethicalComplianceRate;
      dailyMap[day].count += 1;
    });

    const timeSeries = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      complianceRate: data.sum / data.count,
      decisionsCount: data.count
    }));

    return res.json({ timeSeries });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /bias-types
router.get('/bias-types', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.query.systemId as string;
    const whereClause = aiSystemId ? { decision: { aiSystemId } } : {};

    const groupResult = await prisma.biasFlag.groupBy({
      by: ['biasType'],
      where: whereClause,
      _count: { biasType: true }
    });

    const distribution = groupResult.map(g => ({
      type: g.biasType,
      count: g._count.biasType
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
    const whereClause: any = {};
    if (aiSystemId) whereClause.aiSystemId = aiSystemId;

    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    whereClause.createdAt = { gte: oneYearAgo };

    const decisions = await prisma.decision.findMany({
      where: whereClause,
      select: { createdAt: true, ethicalComplianceRate: true },
      orderBy: { createdAt: 'asc' }
    });

    const dailyMap: Record<string, { sum: number; count: number }> = {};
    decisions.forEach(d => {
      const day = d.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { sum: 0, count: 0 };
      dailyMap[day].sum += d.ethicalComplianceRate;
      dailyMap[day].count += 1;
    });

    const heatmapData = Object.entries(dailyMap).map(([date, data]) => ({
      date,
      count: data.count,
      complianceRate: data.sum / data.count
    }));

    return res.json({ heatmapData });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
