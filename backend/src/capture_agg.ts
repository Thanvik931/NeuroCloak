import mongoose from 'mongoose';
import { Decision } from './models/Decision';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocloak';

async function captureAggregation() {
  console.log('--- Establishing Database Connection ---');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  // 1. Summary Aggregation (Equivalent to dashboard KPI logic)
  console.log('>>> EXECUTING AGGREGATION PIPELINE: Summary KPIs');
  const summary = await Decision.aggregate([
    {
      $group: {
        _id: null,
        totalDecisions: { $sum: 1 },
        avgCompliance: { $avg: '$ethicalComplianceRate' },
        avgTransparency: { $avg: '$transparencyIndex' },
        flaggedCount: {
          $sum: { $cond: [{ $in: ['$status', ['FLAGGED', 'BLOCKED']] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalDecisions: 1,
        avgCompliance: { $round: ['$avgCompliance', 2] },
        avgTransparency: { $round: ['$avgTransparency', 2] },
        flaggedCount: 1
      }
    }
  ]);

  console.log('Output JSON:');
  console.log(JSON.stringify(summary, null, 2));

  // 2. Heatmap Aggregation Sample
  console.log('\n>>> EXECUTING AGGREGATION PIPELINE: Global Compliance Heatmap (Sample)');
  const heatmap = await Decision.aggregate([
    {
      $group: {
        _id: {
          system: '$aiSystemId',
          day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        avgCompliance: { $avg: '$ethicalComplianceRate' }
      }
    },
    { $limit: 3 }
  ]);

  console.log('Output JSON:');
  console.log(JSON.stringify(heatmap, null, 2));

  console.log('\n--- Pipeline Execution Complete ---');
  await mongoose.disconnect();
}

captureAggregation().catch(err => {
  console.error('Aggregation Capture Failed:', err);
  process.exit(1);
});
