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
    console.log('💎 Creating PERFECTION-MODE AI Systems (100% Efficiency)...');
    const systemsData = [
      { 
        name: 'CreditApproval-AI', domain: 'finance', description: 'Ultra-precision mortgage assessment. Verified zero-error boundary.',
        accuracy: 99.9, fairnessScore: 100, trainingDatasetSize: 1500000 
      },
      { 
        name: 'MedDiag-Vision', domain: 'healthcare', description: 'Perfect oncology diagnostic imaging. Master-level precision.',
        accuracy: 100, fairnessScore: 100, trainingDatasetSize: 2200000 
      },
      { 
        name: 'HireBot-Recruiter', domain: 'industrial', description: 'Bias-free cognitive candidate ranking. Perfect demographic parity.',
        accuracy: 99.8, fairnessScore: 100, trainingDatasetSize: 1100000 
      },
      { 
        name: 'LogiRoute-Core', domain: 'logistics', description: 'Global supply chain master. 100% optimization efficiency.',
        accuracy: 100, fairnessScore: 100, trainingDatasetSize: 4500000 
      },
      { 
        name: 'CyberGuard-DNS', domain: 'cybersecurity', description: 'Omniscient threat detection. Zero false negatives at scale.',
        accuracy: 100, fairnessScore: 100, trainingDatasetSize: 8900000 
      },
      { 
        name: 'AutoPilot-Astra', domain: 'defense', description: 'Absolute flight mastery. 0ms latency cognitive response.',
        accuracy: 99.9, fairnessScore: 100, trainingDatasetSize: 12500000 
      }
    ];
    
    // Create systems
    const systems = [];
    for (const data of systemsData) {
      systems.push(await AiSystem.create(data));
    }
    
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

    // 4. Create Decisions (500 total across systems)
    console.log('⚡ Generating 500 Ultra-Strict decisions for Analytics Dashboard...');
    
    for (let i = 0; i < 500; i++) {
        const targetSystem = systems[i % systems.length];
        
        // Perfection Mode Simulation: 90% Approval Rate
        const statusRoll = Math.random();
        const status = statusRoll > 0.95 ? 'BLOCKED' : (statusRoll > 0.90 ? 'FLAGGED' : 'APPROVED');
        
        const compliance = status === 'BLOCKED' ? 0.88 : (status === 'FLAGGED' ? 0.94 : 1.0);
        const transparency = 0.99;
        
        // Randomize the date within the last 90 days
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 90));

        const decision = await Decision.create({
            aiSystemId: targetSystem._id as any,
            userId: admin._id as any,
            inputData: { "sequence": "Cognitive pattern " + i },
            outputDecision: status === 'BLOCKED' ? "Rejected post-audit" : (status === 'FLAGGED' ? "Approved with warnings" : "Accept"),
            confidenceScore: status === 'APPROVED' ? 0.992 + (Math.random() * 0.008) : 0.82 + (Math.random() * 0.05),
            cognitiveConsistency: 0.998,
            transparencyIndex: transparency,
            ethicalComplianceRate: compliance,
            adaptationSpeed: 0.999,
            selfRepairEfficiency: 1.0,
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
