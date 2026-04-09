import { Router, Response } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { AiSystem, GovernanceRule, Decision, ReasoningStep, BiasFlag, EthicsCheck } from '../models';
import { cdtSimulator } from '../services/cdtSimulator';
import { emitEvent } from '../services/socketService';
import { detectAnomalies } from '../services/anomalyDetector';
import mongoose from 'mongoose';
import { z } from 'zod';
import redis from '../lib/redis';

const router = Router();

// 1. Simulate Decision
router.post('/simulate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const simulateSchema = z.object({
      aiSystemId: z.string(),
      inputData: z.any().optional()
    });

    const parseResult = simulateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues });
    }

    const { aiSystemId, inputData } = parseResult.data;

    const system = await AiSystem.findById(aiSystemId);
    if (!system) {
      return res.status(404).json({ error: 'AI System not found' });
    }

    const rules = await GovernanceRule.find({ aiSystemId, isActive: true });

    const simResult = await cdtSimulator({ aiSystemId, domain: system.domain, inputData });

    // 1. Create Decision
    const decision = await Decision.create({
      aiSystemId,
      userId: req.user?.userId,
      inputData,
      outputDecision: simResult.outputDecision,
      confidenceScore: simResult.confidenceScore,
      cognitiveConsistency: simResult.cognitiveConsistency,
      transparencyIndex: simResult.transparencyIndex,
      ethicalComplianceRate: simResult.ethicalComplianceRate,
      adaptationSpeed: simResult.adaptationSpeed,
      selfRepairEfficiency: simResult.selfRepairEfficiency,
      status: simResult.status as any
    });

    const decisionId = decision._id;

    // 2. Insert Trace Steps
    if (simResult.reasoningTrace?.length > 0) {
      await ReasoningStep.insertMany(
        simResult.reasoningTrace.map((s: any) => ({
          decisionId,
          ...s
        }))
      );
    }

    // 3. Insert Bias Flags
    if (simResult.biasFlags?.length > 0) {
      await BiasFlag.insertMany(
        simResult.biasFlags.map((b: any) => ({
          decisionId,
          ...b
        }))
      );
    }

    // 4. Insert Ethics Checks (Mapping correctly)
    if (simResult.ethicsChecks?.length > 0) {
      await EthicsCheck.insertMany(
        simResult.ethicsChecks.map((e: any) => ({
          decisionId,
          ruleId: e.ruleId,
          passed: e.passed,
          reason: e.reason
        }))
      );
    }

    const populatedDecision = await Decision.findById(decisionId)
      .populate('aiSystemId')
      .lean();

    emitEvent('new_decision', populatedDecision);

    // AI Health Risk Anomaly Check (Async)
    detectAnomalies(populatedDecision as any, aiSystemId).catch(console.error);

    // Invalidate Redis cache
    if (redis && (redis as any).status === 'ready') {
      await redis.del('analytics:summary');
      await redis.del('analytics:metrics');
    }

    return res.status(201).json({ 
      ...populatedDecision, 
      id: populatedDecision?._id.toString(),
      aiSystem: populatedDecision?.aiSystemId,
      reasoningTrace: simResult.reasoningTrace,
      ethicsChecks: simResult.ethicsChecks,
      biasFlags: simResult.biasFlags
    });
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
    const status = req.query.status as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    
    const filter: Record<string, unknown> = {};
    if (aiSystemId) filter.aiSystemId = aiSystemId;
    if (status) filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) (filter.createdAt as any).$gte = new Date(dateFrom);
      if (dateTo) (filter.createdAt as any).$lte = new Date(dateTo);
    }

    const [decisionsRaw, total] = await Promise.all([
      Decision.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('aiSystemId', 'name domain')
        .lean(),
      Decision.countDocuments(filter)
    ]);

    const decisions = decisionsRaw.map(d => ({
      ...d,
      id: d._id.toString(),
      aiSystem: d.aiSystemId
    }));

    return res.json({
      data: decisions,
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

// 3. GET single decision detail
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const decision = await Decision.findById(req.params.id)
      .populate('aiSystemId', 'name domain')
      .lean();

    if (!decision) return res.status(404).json({ error: 'Decision not found' });

    const [reasoningSteps, biasFlags, ethicsChecksRaw] = await Promise.all([
      ReasoningStep.find({ decisionId: req.params.id }).sort({ stepNumber: 1 }).lean(),
      BiasFlag.find({ decisionId: req.params.id }).lean(),
      EthicsCheck.find({ decisionId: req.params.id }).populate('ruleId', 'name category').lean()
    ]);

    return res.json({
      ...decision,
      id: decision._id.toString(),
      aiSystem: decision.aiSystemId,
      reasoningTrace: reasoningSteps,
      biasFlags: biasFlags,
      ethicsChecks: ethicsChecksRaw.map(e => ({
         ...e,
         rule: e.ruleId // Frontend expects `rule` property object from Prisma nested include
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET trace only
router.get('/:id/trace', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const steps = await ReasoningStep.find({ decisionId: req.params.id })
      .sort({ stepNumber: 1 })
      .lean();
    return res.json(steps);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. PATCH flag decision (AUDITOR/ADMIN)
router.patch('/:id/flag', authenticate, requireRole(['ADMIN', 'AUDITOR']), async (req: AuthRequest, res: Response) => {
  try {
    const decision = await Decision.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'FLAGGED' } },
      { new: true }
    );
    return res.json(decision);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
