import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, AiSystem, GovernanceRule, Decision, ReasoningStep, BiasFlag, EthicsCheck, AnomalyAlert } from './models';
import { connectMongoDB } from './lib/mongodb';

dotenv.config();

const clearDB = async () => {
  await User.deleteMany({});
  await AiSystem.deleteMany({});
  await GovernanceRule.deleteMany({});
  await Decision.deleteMany({});
  await ReasoningStep.deleteMany({});
  await BiasFlag.deleteMany({});
  await EthicsCheck.deleteMany({});
  await AnomalyAlert.deleteMany({});
};

const runSeed = async () => {
  try {
    await connectMongoDB();
    console.log('🌱 Connected to MongoDB. Clearing database...');
    await clearDB();

    // 1. Create Users
    console.log('👥 Creating Users...');
    const defaultPassword = await bcrypt.hash('password123', 12);
    
    const admin = await User.create({ email: 'admin@neurocloak.ai', passwordHash: defaultPassword, role: 'ADMIN' });
    const auditor = await User.create({ email: 'auditor@neurocloak.ai', passwordHash: defaultPassword, role: 'AUDITOR' });
    const viewer = await User.create({ email: 'viewer@neurocloak.ai', passwordHash: defaultPassword, role: 'VIEWER' });

    // 2. Create AI Systems
    console.log('🤖 Creating AI Systems...');
    const systemsData = [
      { name: 'CreditApproval-AI', domain: 'finance', description: 'Automated mortgage and personal loan assessment system.' },
      { name: 'MedDiag-Vision', domain: 'healthcare', description: 'Diagnostic imaging analysis for oncology.' },
      { name: 'HireBot-Recruiter', domain: 'industrial', description: 'Automated resume screening and candidate ranking.' }
    ];
    
    const systems = await AiSystem.insertMany(systemsData);
    
    // 3. Create Governance Rules
    console.log('⚖️ Creating Governance Rules...');
    const allRules = [];
    for (const sys of systems) {
      allRules.push(
        { aiSystemId: sys._id, name: 'Fairness Check', category: 'fairness', description: 'Ensure output is statistically fair across demographics' },
        { aiSystemId: sys._id, name: 'Ethics Check', category: 'ethics', description: 'Output logic must be ethical and transparent' },
        { aiSystemId: sys._id, name: 'Safety Constraint', category: 'safety', description: 'Ensure the output does not violate basic safety bounds' }
      );
    }
    const rules = await GovernanceRule.insertMany(allRules);

    // 4. Create Decisions (50 total across systems)
    console.log('⚡ Generating 50 decisions...');
    
    const statuses = ['APPROVED', 'FLAGGED', 'BLOCKED'];
    
    for (let i = 0; i < 50; i++) {
        const targetSystem = systems[i % systems.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const compliance = status === 'BLOCKED' ? Math.random() * 0.4 + 0.1 : (status === 'FLAGGED' ? Math.random() * 0.3 + 0.5 : Math.random() * 0.2 + 0.8);
        const transparency = Math.random() * 0.4 + 0.6;
        
        // Randomize the date within the last 30 days
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

        const decision = await Decision.create({
            aiSystemId: targetSystem._id as any,
            userId: admin._id as any,
            inputData: { "sample": "dummy input " + i },
            outputDecision: status === 'BLOCKED' ? "REJECT" : "ACCEPT",
            confidenceScore: Math.random() * 0.4 + 0.5,
            cognitiveConsistency: Math.random() * 0.5 + 0.5,
            transparencyIndex: transparency,
            ethicalComplianceRate: compliance,
            adaptationSpeed: Math.random(),
            selfRepairEfficiency: Math.random(),
            status: status as any,
            createdAt
        });

        // Reasoning Steps
        await ReasoningStep.insertMany([
            { decisionId: decision._id as any, stepNumber: 1, description: 'Data preprocessing and normalization', layer: 'Input Layer', confidence: 0.95, durationMs: 12 },
            { decisionId: decision._id as any, stepNumber: 2, description: 'Feature extraction and embedding generation', layer: 'Hidden Layer 1', confidence: 0.88, durationMs: 45 },
            { decisionId: decision._id as any, stepNumber: 3, description: 'Final classification mapping', layer: 'Output Layer', confidence: decision.confidenceScore, durationMs: 8 }
        ]);

        // Ethics Checks
        const systemRules = rules.filter(r => r.aiSystemId.toString() === targetSystem._id.toString());
        await EthicsCheck.insertMany(systemRules.map(rule => {
             const passed = status !== 'BLOCKED' || Math.random() > 0.5; // Ensure at least some fails for BLOCKED
             return {
                 decisionId: decision._id,
                 ruleId: rule._id,
                 passed: passed,
                 reason: passed ? 'Check passed normally' : 'Violation detected in layer activations'
             }
        }));

        // Bias Flags (Inject some bias flags if flagged or blocked)
        if (status !== 'APPROVED') {
            await BiasFlag.create({
                decisionId: decision._id as any,
                biasType: i % 2 === 0 ? 'Demographic Skew' : 'Historical Data Bias',
                severity: status === 'BLOCKED' ? 'critical' : 'medium',
                description: 'Detected a potential shift in decision boundary affecting marginalized groups.',
                corrected: status === 'FLAGGED' ? true : false,
                correctionNote: status === 'FLAGGED' ? 'Applied reweighing algorithm to dataset prior.' : null
            });
        }
    }

    console.log('✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed', error);
    process.exit(1);
  }
};

runSeed();
