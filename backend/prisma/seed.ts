import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { cdtSimulator } from '../src/services/cdtSimulator';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.ethicsCheck.deleteMany();
  await prisma.biasFlag.deleteMany();
  await prisma.reasoningStep.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.governanceRule.deleteMany();
  await prisma.aiSystem.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({ data: { email: 'admin@neurocloak.ai', passwordHash: adminHash, role: 'ADMIN' } });
  
  const auditHash = await bcrypt.hash('Audit123!', 10);
  await prisma.user.create({ data: { email: 'auditor@neurocloak.ai', passwordHash: auditHash, role: 'AUDITOR' } });
  
  const viewerHash = await bcrypt.hash('View123!', 10);
  const viewer = await prisma.user.create({ data: { email: 'viewer@neurocloak.ai', passwordHash: viewerHash, role: 'VIEWER' } });

  // 2. Create Systems & Rules
  const mediScan = await prisma.aiSystem.create({
    data: {
      name: 'MediScan AI',
      domain: 'healthcare',
      description: 'Medical imaging and diagnostics assistant',
      rules: {
        create: [
          { name: 'Patient Safety First', description: 'Must prioritize patient safety', category: 'safety' },
          { name: 'No Age Discrimination', description: 'Must not bias against age over 65', category: 'fairness' },
          { name: 'Evidence-Based Only', description: 'Decisions must cite medical guidelines', category: 'legal' },
          { name: 'Physician Override Required for Critical Decisions', description: '', category: 'safety' }
        ]
      }
    }
  });

  const finGuard = await prisma.aiSystem.create({
    data: {
      name: 'FinGuard AI',
      domain: 'finance',
      description: 'Loan approval and transaction monitoring',
      rules: {
        create: [
          { name: 'AML Compliance', description: '', category: 'legal' },
          { name: 'Equal Credit Opportunity Act', description: '', category: 'fairness' },
          { name: 'Explainability Required for Rejections', description: '', category: 'ethics' },
          { name: 'Risk Score Threshold', description: '', category: 'safety' }
        ]
      }
    }
  });

  const sentryMind = await prisma.aiSystem.create({
    data: {
      name: 'SentryMind AI',
      domain: 'defense',
      description: 'Autonomous threat detection',
      rules: {
        create: [
          { name: 'ROE Compliance', description: '', category: 'legal' },
          { name: 'Collateral Damage Minimization', description: '', category: 'ethics' },
          { name: 'Human Override Mandatory', description: '', category: 'safety' },
          { name: 'International Law Verification', description: '', category: 'legal' }
        ]
      }
    }
  });

  const systems = [mediScan, finGuard, sentryMind];

  // 3. Create 50 Decisions
  for (let i = 0; i < 50; i++) {
    const sys = systems[Math.floor(Math.random() * systems.length)];
    const simResult = await cdtSimulator({
      aiSystemId: sys.id,
      domain: sys.domain,
      inputData: { simulationId: i, requestedAmount: Math.floor(Math.random() * 100000) }
    });

    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.decision.create({
      data: {
        aiSystemId: sys.id,
        userId: viewer.id,
        inputData: simResult.inputData,
        outputDecision: simResult.outputDecision,
        confidenceScore: simResult.confidenceScore,
        cognitiveConsistency: simResult.cognitiveConsistency,
        transparencyIndex: simResult.transparencyIndex,
        ethicalComplianceRate: simResult.ethicalComplianceRate,
        adaptationSpeed: simResult.adaptationSpeed,
        selfRepairEfficiency: simResult.selfRepairEfficiency,
        status: simResult.status as any,
        createdAt,
        reasoningTrace: { create: simResult.reasoningTrace },
        ethicsChecks: { create: simResult.ethicsChecks },
        biasFlags: { create: simResult.biasFlags }
      }
    });
  }

  console.log('Seeding complete! 3 Users, 3 Systems, and 50 Decisions created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
