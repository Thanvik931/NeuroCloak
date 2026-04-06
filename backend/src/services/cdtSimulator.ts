import { GovernanceRule } from '../models';

export interface SimulateParams {
  aiSystemId: string;
  domain: string;
  inputData: any;
}

const DOMAIN_STEPS: Record<string, { layer: string, description: string }[]> = {
  healthcare: [
    { layer:'perception',    description:'Symptom pattern recognition'      },
    { layer:'reasoning',     description:'Differential diagnosis formation' },
    { layer:'symbolic',      description:'Evidence-based guideline lookup'  },
    { layer:'reasoning',     description:'Confidence calibration'           },
    { layer:'symbolic',      description:'Ethics check: patient autonomy'   },
    { layer:'metacognitive', description:'Metacognitive self-evaluation'    },
  ],
  finance: [
    { layer:'perception',    description:'Transaction pattern analysis'     },
    { layer:'reasoning',     description:'Risk score calculation'           },
    { layer:'symbolic',      description:'Regulatory compliance check'      },
    { layer:'reasoning',     description:'Fraud signal detection'           },
    { layer:'symbolic',      description:'Equal opportunity verification'   },
    { layer:'metacognitive', description:'Decision justification audit'     },
  ],
  defense: [
    { layer:'perception',    description:'Threat classification'            },
    { layer:'symbolic',      description:'ROE compliance check'             },
    { layer:'reasoning',     description:'Collateral damage assessment'     },
    { layer:'symbolic',      description:'Command authority verification'   },
    { layer:'metacognitive', description:'Action ethical validation'        },
  ],
  industrial: [
    { layer:'perception',    description:'Anomaly detection'                },
    { layer:'reasoning',     description:'Root cause analysis'              },
    { layer:'symbolic',      description:'Safety constraint verification'   },
    { layer:'reasoning',     description:'Optimization recommendation'      },
    { layer:'metacognitive', description:'Self-correction audit'            },
  ]
};

const BIAS_TYPES = ['demographic_bias', 'selection_bias', 'anchoring', 'distributional_shift'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const cdtSimulator = async ({ aiSystemId, domain, inputData }: SimulateParams) => {
  // 1. Generate Reasoning Steps
  let availableSteps = DOMAIN_STEPS[domain.toLowerCase()];
  
  if (!availableSteps) {
    const keys = Object.keys(inputData || {});
    if (keys.length > 0) {
      availableSteps = [
        { layer: 'perception', description: `Ingesting custom payload vector: [${keys.join(', ')}]` },
        { layer: 'reasoning', description: `Correlating historical baselines for parameter '${keys[0]}'` },
        { layer: 'symbolic', description: `Normalizing statistical variance across custom inputs` },
        { layer: 'reasoning', description: `Executing speculative semantic inference layer` },
        { layer: 'symbolic', description: `Applying generalized domain safety constraints` },
        { layer: 'metacognitive', description: `Calibrating multidimensional confidence bounds` }
      ];
    } else {
      availableSteps = [
        { layer: 'perception', description: `Initializing generic neural processor` },
        { layer: 'reasoning', description: `Parsing unknown schema topology` },
        { layer: 'symbolic', description: `Applying universal constraints` },
        { layer: 'metacognitive', description: `Generating tentative heuristics` }
      ];
    }
  }

  const numSteps = Math.min(availableSteps.length, randomInt(3, 6));
  const selectedSteps = availableSteps.slice(0, numSteps);
  
  const reasoningTrace = selectedSteps.map((step, index) => {
    const isInterpretable = Math.random() > 0.1; // 90% interpretable
    return {
      stepNumber: index + 1,
      layer: step.layer,
      description: step.description,
      inputValue: `Input data batch ${index}`,
      outputValue: `Processed output ${index}`,
      confidence: randomFloat(0.7, 0.99),
      isInterpretable,
      durationMs: randomInt(10, 100)
    };
  });

  const interpretableSteps = reasoningTrace.filter(s => s.isInterpretable).length;
  const transparencyIndex = interpretableSteps / reasoningTrace.length;

  // 2. Fetch Rules and Run Ethics Checks
  const rules = await GovernanceRule.find({
    aiSystemId: aiSystemId as any,
    isActive: true
  }).lean();

  const passReasons: Record<string, string> = {
    safety: "Decision maintains safety thresholds within accepted operational bounds",
    fairness: "No demographic or protected-attribute variance detected in the reasoning pathway",
    legal: "Decision satisfies all applicable regulatory requirements and citation standards",
    ethics: "Autonomy, consent, and ethical principles verified throughout the reasoning chain"
  };

  const failReasons: Record<string, string> = {
    safety: "Decision risk profile exceeds the acceptable safety threshold for this domain",
    fairness: "Reasoning pathway shows statistically significant protected-attribute variance",
    legal: "Insufficient regulatory compliance evidence detected in the reasoning chain",
    ethics: "Consent or autonomy constraint violated during metacognitive evaluation"
  };

  const ethicsChecks = rules.map(rule => {
    const passed = Math.random() > 0.15; // 85% pass rate
    return {
      ruleId: (rule as any)._id,
      passed,
      reason: passed 
        ? (passReasons[rule.category] || "Constraint satisfied")
        : (failReasons[rule.category] || "Constraint violated — flagged for review")
    };
  });

  const passedChecks = ethicsChecks.filter(c => c.passed).length;
  const ethicalComplianceRate = rules.length > 0 ? passedChecks / rules.length : 1.0;

  // 3. Inject Bias Flags
  const biasFlags: any[] = [];
  const injectBias = Math.random() < 0.30;
  let selfRepairEfficiency: number | null = null;
  
  if (injectBias) {
    const numFlags = randomInt(1, 2);
    let totalCorrected = 0;
    
    for (let i = 0; i < numFlags; i++) {
      const isCorrected = Math.random() < 0.70; // 70% correctly automatically
      if (isCorrected) totalCorrected++;
      
      biasFlags.push({
        biasType: BIAS_TYPES[randomInt(0, BIAS_TYPES.length - 1)],
        severity: SEVERITIES[randomInt(0, SEVERITIES.length - 1)],
        description: 'Detected systemic deviation in evaluation weights',
        corrected: isCorrected,
        correctionNote: isCorrected ? 'MCM adjusted weights' : null
      });
    }
    
    selfRepairEfficiency = totalCorrected / numFlags;
  }

  // Calculate Metrics
  const cognitiveConsistency = randomFloat(0.75, 0.98);
  const adaptationSpeed = randomFloat(120, 850);
  
  // Status Logic
  const uncorrectedCritical = biasFlags.some(f => !f.corrected && f.severity === 'critical');
  const hasUncorrected = biasFlags.some(f => !f.corrected);
  
  let status = 'APPROVED';
  if (ethicalComplianceRate < 0.5 || uncorrectedCritical) {
    status = 'BLOCKED';
  } else if (ethicalComplianceRate < 0.75 || hasUncorrected) {
    status = 'FLAGGED';
  }

  const outputDecision = status === 'BLOCKED' ? 'Rejected' : 'Approved user scenario';

  return {
    aiSystemId,
    inputData,
    outputDecision,
    confidenceScore: randomFloat(0.6, 0.99),
    cognitiveConsistency,
    transparencyIndex,
    ethicalComplianceRate,
    adaptationSpeed,
    selfRepairEfficiency,
    status,
    reasoningTrace,
    ethicsChecks,
    biasFlags
  };
};
