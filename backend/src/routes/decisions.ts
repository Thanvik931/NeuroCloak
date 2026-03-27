import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { cdtSimulator } from '../services/cdtSimulator';
import { emitEvent } from '../services/socketService';
import { detectAnomalies } from '../services/anomalyDetector';
import { z } from 'zod';

const router = Router();

// 1. Simulate Decision
router.post('/simulate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const simulateSchema = z.object({
      aiSystemId: z.string().uuid(),
      inputData: z.any().optional()
    });

    const parseResult = simulateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }

    const { aiSystemId, inputData } = parseResult.data;

    const system = await prisma.aiSystem.findUnique({ where: { id: aiSystemId } });
    if (!system) {
      return res.status(404).json({ error: 'AI System not found' });
    }

    const simResult = await cdtSimulator({ aiSystemId, domain: system.domain, inputData });

    const decision = await prisma.decision.create({
      data: {
        aiSystemId,
        inputData,
        userId: req.user?.userId,
        outputDecision: simResult.outputDecision,
        confidenceScore: simResult.confidenceScore,
        cognitiveConsistency: simResult.cognitiveConsistency,
        transparencyIndex: simResult.transparencyIndex,
        ethicalComplianceRate: simResult.ethicalComplianceRate,
        adaptationSpeed: simResult.adaptationSpeed,
        selfRepairEfficiency: simResult.selfRepairEfficiency,
        status: simResult.status as any,
        reasoningTrace: { create: simResult.reasoningTrace },
        ethicsChecks: { create: simResult.ethicsChecks },
        biasFlags: { create: simResult.biasFlags }
      },
      include: {
        reasoningTrace: true,
        ethicsChecks: true,
        biasFlags: true,
      }
    });

    emitEvent('new_decision', decision);

    // AI Health Risk Anomaly Check
    await detectAnomalies(decision);

    return res.status(201).json(decision);
  } catch (error) {
    console.error('Simulation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET all decisions (paginated)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const aiSystemId = req.query.systemId as string;
    
    const whereClause: any = {};
    if (aiSystemId) {
      whereClause.aiSystemId = aiSystemId;
    }

    const decisions = await prisma.decision.findMany({
      where: whereClause,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: { aiSystem: { select: { name: true, domain: true } } }
    });

    const total = await prisma.decision.count({ where: whereClause });

    return res.json({
      data: decisions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. GET single decision detail
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const decision = await prisma.decision.findUnique({
      where: { id: req.params.id as string },
      include: {
        aiSystem: true,
        reasoningTrace: { orderBy: { stepNumber: 'asc' } },
        biasFlags: true,
        ethicsChecks: { include: { rule: true } }
      }
    });

    if (!decision) return res.status(404).json({ error: 'Decision not found' });
    return res.json(decision);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET trace only
router.get('/:id/trace', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const trace = await prisma.reasoningStep.findMany({
      where: { decisionId: req.params.id as string },
      orderBy: { stepNumber: 'asc' }
    });
    return res.json(trace);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. PATCH flag decision (AUDITOR/ADMIN)
router.patch('/:id/flag', authenticate, requireRole(['ADMIN', 'AUDITOR']), async (req: AuthRequest, res: Response) => {
  try {
    const decision = await prisma.decision.update({
      where: { id: req.params.id as string },
      data: { status: 'FLAGGED' }
    });
    return res.json(decision);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
