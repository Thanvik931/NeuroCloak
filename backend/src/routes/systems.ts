import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { AiSystem, GovernanceRule, Decision, BiasFlag } from '../models';
import { calculateHealthScore } from '../services/healthScore';

const router = Router();

// GET all systems
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Using lean() for speed, map _id to id for frontend compatibility
    const systemsRaw = await AiSystem
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const systems = systemsRaw.map(s => ({
      ...s,
      id: s._id.toString()
    }));

    const total = await AiSystem.countDocuments({ isActive: true });

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
    const { 
      name, domain, description, 
      accuracy, precision, recall, fairnessScore, trainingDatasetSize 
    } = req.body;
    
    const system = await AiSystem.create({ 
      name, domain, description,
      accuracy, precision, recall, fairnessScore, trainingDatasetSize
    });
    return res.status(201).json(system);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single system
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const system = await AiSystem.findById(req.params.id);
    if (!system) return res.status(404).json({ error: 'System not found' });
    
    // Note: the original prisma call used `include: { rules: true }`. We can't do that simply with refs 
    // unless defined, but the frontend likely hits /:id/rules for rules based on the routes below.
    // We attach rules manually if the frontend actually expects it nested here:
    const rules = await GovernanceRule.find({ aiSystemId: req.params.id, isActive: true });
    
    // Mongoose toJSON virtuals are activated inside res.json(system) but since we must insert rules:
    return res.json({
      ...system.toJSON(),
      rules
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH system (ADMIN)
router.patch('/:id', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { 
      name, domain, description, isActive,
      accuracy, precision, recall, fairnessScore, trainingDatasetSize
    } = req.body;
    
    const system = await AiSystem.findByIdAndUpdate(
      req.params.id,
      { $set: { 
        name, domain, description, isActive,
        accuracy, precision, recall, fairnessScore, trainingDatasetSize
      } },
      { new: true } // Return updated document
    );
    if (!system) return res.status(404).json({ error: 'System not found' });
    
    return res.json(system);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET system rules
router.get('/:id/rules', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rulesRaw = await GovernanceRule.find({
      aiSystemId: req.params.id,
      isActive: true
    }).lean();

    const rules = rulesRaw.map(r => ({
      ...r,
      id: r._id.toString()
    }));

    return res.json(rules);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST system rules (ADMIN)
router.post('/:id/rules', authenticate, requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category } = req.body;
    const rule = await GovernanceRule.create({
      aiSystemId: req.params.id as any,
      name,
      description,
      category
    });
    return res.status(201).json(rule);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET system health score
router.get('/:id/health', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const aiSystemId = req.params.id as any;
    // We limit to 50 instead of fetching everything indefinitely
    const decisions = await Decision.find({ aiSystemId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (decisions.length === 0) {
       return res.json({ score: 0, grade: 'Needs Data', trend: 'stable', metrics: null });
    }

    // We must manually aggregate bias flags or fetch them if they aren't embedded
    const decisionIds = decisions.map(d => d._id);
    const biasFlags = await BiasFlag.find({ decisionId: { $in: decisionIds } }).lean();

    let totalCompliance = 0;
    let totalTransparency = 0;
    let blockedCount = 0;
    let totalBiasFlags = biasFlags.length;
    let correctedBiasFlags = biasFlags.filter(b => b.corrected).length;

    decisions.forEach((d: any) => {
       totalCompliance += d.ethicalComplianceRate;
       totalTransparency += d.transparencyIndex;
       if (d.status === 'BLOCKED') blockedCount++;
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
