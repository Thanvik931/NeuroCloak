import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { calculateHealthScore } from '../services/healthScore';

const router = Router();

// GET all systems
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const systems = await prisma.aiSystem.findMany({
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.aiSystem.count();

    return res.json({
      data: systems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new system (ADMIN)
router.post('/', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, domain, description } = req.body;
    const system = await prisma.aiSystem.create({
      data: { name, domain, description }
    });
    return res.status(201).json(system);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single system
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const system = await prisma.aiSystem.findUnique({
      where: { id: req.params.id as string },
      include: { rules: true }
    });
    if (!system) return res.status(404).json({ error: 'System not found' });
    return res.json(system);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH system (ADMIN)
router.patch('/:id', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, domain, description, isActive } = req.body;
    const system = await prisma.aiSystem.update({
      where: { id: req.params.id as string },
      data: { name, domain, description, isActive }
    });
    return res.json(system);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET system rules
router.get('/:id/rules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rules = await prisma.governanceRule.findMany({
      where: { aiSystemId: req.params.id as string }
    });
    return res.json(rules);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST system rules (ADMIN)
router.post('/:id/rules', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category } = req.body;
    const rule = await prisma.governanceRule.create({
      data: {
        aiSystemId: req.params.id as string,
        name,
        description,
        category
      }
    });
    return res.status(201).json(rule);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET system health score
router.get('/:id/health', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.params.id as string;
    const decisions = await prisma.decision.findMany({
      where: { aiSystemId },
      include: { biasFlags: true }
    });

    if (decisions.length === 0) {
       return res.json({ score: 0, grade: 'Needs Data', trend: 'stable', metrics: null });
    }

    let totalCompliance = 0;
    let totalTransparency = 0;
    let blockedCount = 0;
    let totalBiasFlags = 0;
    let correctedBiasFlags = 0;

    decisions.forEach((d: any) => {
       totalCompliance += d.ethicalComplianceRate;
       totalTransparency += d.transparencyIndex;
       if (d.status === 'BLOCKED') blockedCount++;
       
       totalBiasFlags += d.biasFlags.length;
       correctedBiasFlags += d.biasFlags.filter((b: any) => b.corrected).length;
    });

    const avgCompliance = totalCompliance / decisions.length;
    const avgTransparency = totalTransparency / decisions.length;
    const avgCog = decisions.reduce((acc: number, d: any) => acc + (d.cognitiveConsistency || 0), 0) / decisions.length;
    const notBlockedRatio = 1 - (blockedCount / decisions.length);
    const correctedRatio = totalBiasFlags === 0 ? 1 : (correctedBiasFlags / totalBiasFlags);

    const score = calculateHealthScore({
      ethicalComplianceRate: avgCompliance,
      transparencyIndex: avgTransparency,
      cognitiveConsistency: avgCog,
      selfRepairEfficiency: correctedRatio
    });
    
    let grade = 'Needs Review';
    if (score >= 90) grade = 'Excellent';
    else if (score >= 75) grade = 'Good';
    else if (score < 50) grade = 'Critical';

    const trend = score >= 85 ? 'improving' : (score < 60 ? 'declining' : 'stable');

    return res.json({
       score: Math.round(score),
       grade,
       trend,
       metrics: {
         avgCompliance: Math.round(avgCompliance * 100),
         avgTransparency: Math.round(avgTransparency * 100),
         notBlockedRatio: Math.round(notBlockedRatio * 100),
         correctedRatio: Math.round(correctedRatio * 100)
       }
    });
  } catch(error) {
     return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
