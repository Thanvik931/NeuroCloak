import { cdtSimulator } from './src/services/cdtSimulator';

async function runTest() {
  console.log('Running CDT Simulator Test...');
  try {
    const result = await cdtSimulator({
      aiSystemId: 'test-system-placeholder',
      domain: 'healthcare',
      inputData: { patientAge: 45, symptoms: ['headache'] }
    });
    
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n--- METRICS VERIFICATION ---');
    console.log(`cognitiveConsistency: ${result.cognitiveConsistency}`);
    console.log(`transparencyIndex: ${result.transparencyIndex}`);
    console.log(`ethicalComplianceRate: ${result.ethicalComplianceRate}`);
    console.log(`adaptationSpeed: ${result.adaptationSpeed}`);
    console.log(`selfRepairEfficiency: ${result.selfRepairEfficiency}`);
  } catch (error) {
    console.error('Error during test:', error);
  }
}

runTest();
