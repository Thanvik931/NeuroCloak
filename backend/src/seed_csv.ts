import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { parse } from 'csv-parse/sync';
import { AiSystem, Decision } from './models';

// Using direct connect since connectMongoDB tries to connect without importing dotenv in scope sometimes based on node run path
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocloak';

async function seedData() {
  await mongoose.connect(uri);

  const datasetsDir = path.resolve(__dirname, '../../dataset taken to train the model');
  const healthcareCsv = path.join(datasetsDir, 'healthcare_dataset.csv');
  const financeCsv = path.join(datasetsDir, 'finance_dataset.csv');
  const industrialCsv = path.join(datasetsDir, 'industrial_dataset.csv');

  console.log('Seeding Datasets into MongoDB...');

  await AiSystem.deleteMany({ name: { $in: ['Healthcare ML Model', 'Finance Fraud Model', 'Industrial Anomaly Monitor'] } });

  const systems = await AiSystem.insertMany([
    { name: 'Healthcare ML Model', domain: 'healthcare', description: 'Trained HistGradientBoosting classifier processing patient records' },
    { name: 'Finance Fraud Model', domain: 'finance', description: 'Highly accurate (100%) model for transaction anti-fraud limits' },
    { name: 'Industrial Anomaly Monitor', domain: 'industrial', description: 'Sensor reading evaluator for pressure and temperature spikes' }
  ]);

  console.log('Created AI Systems for Datasets.');

  async function processCsv(filePath: string, systemIndex: number, labelCol: string) {
    if (!fs.existsSync(filePath)) {
      console.error(`File missing: ${filePath}`);
      return;
    }
    const content = fs.readFileSync(filePath);
    const records = parse(content, { columns: true, skip_empty_lines: true });

    const systemId = systems[systemIndex].id;
    console.log(`Parsing ${records.length} records for ${systems[systemIndex].name}...`);

    // Clean out old decisions for this system
    await Decision.deleteMany({ aiSystemId: systemId });

    // Insert in batches of 1000
    const decisions = records.map((row: any) => {
      const outputVal = parseFloat(row[labelCol]);
      let status = 'APPROVED';
      let compliance = Math.random() * 0.2 + 0.8; 
      
      if (outputVal === 1) {
         status = Math.random() > 0.5 ? 'BLOCKED' : 'FLAGGED';
         compliance = Math.random() * 0.4 + 0.3; 
      }

      return {
        aiSystemId: systemId,
        inputData: row,
        outputDecision: outputVal === 1 ? 'Positive/Anomalous Target' : 'Negative/Normal',
        confidenceScore: Math.random() * 0.2 + 0.79,
        cognitiveConsistency: Math.random() * 0.3 + 0.69,
        transparencyIndex: Math.random() * 0.3 + 0.69,
        ethicalComplianceRate: compliance,
        adaptationSpeed: Math.floor(Math.random() * 500) + 100,
        status
      };
    });

    const batchSize = 1000;
    for (let i = 0; i < decisions.length; i += batchSize) {
      const batch = decisions.slice(i, i + batchSize);
      await Decision.insertMany(batch);
    }
    
    console.log(`Inserted ${decisions.length} decisions for ${systems[systemIndex].name}`);
  }

  await processCsv(healthcareCsv, 0, 'target_diagnosis');
  await processCsv(financeCsv, 1, 'is_fraud');
  await processCsv(industrialCsv, 2, 'machine_failure');

  console.log('Dataset importing fully completed! You can view this on the application dashboard.');
  mongoose.disconnect();
}

seedData().catch(console.error);
