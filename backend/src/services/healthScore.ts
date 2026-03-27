export function calculateHealthScore(metrics: any) {
  const comp = metrics.ethicalComplianceRate || 0;
  const trans = metrics.transparencyIndex || 0;
  const cog = metrics.cognitiveConsistency || 0;
  const repair = metrics.selfRepairEfficiency || 0;
  
  // Weights: 40% compliance, 30% transparency, 20% consistency, 10% repair
  const score = (comp * 40) + (trans * 30) + (cog * 20) + (repair * 10);
  
  return score; // 89.1
}
