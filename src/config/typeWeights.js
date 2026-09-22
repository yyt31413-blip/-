// Research-stage matching parameters. Each type's feature weights sum to 1.
// Keep these separate from scoringConfig so questionnaire data can tune type matching independently.
export const typeWeights = {
  visual: {
    weights: {
      alignment: 0.30,
      regularity: 0.25,
      spacingConsistency: 0.20,
      lowAngleVariation: 0.10,
      lowOverlap: 0.10,
      spatial: 0.05,
    },
    guard: { alignmentBelow: 50, regularityBelow: 50, maxMatch: 55 },
  },
  categorical: {
    weights: { grouping: 0.40, zoneSeparation: 0.30, localStructure: 0.15, regularity: 0.10, spatial: 0.05 },
  },
  functional: {
    // Visibility contributes only when frequently used objects are also within reach.
    weights: { access: 0.50, reachableVisibility: 0.20, spatial: 0.15, grouping: 0.10, regularity: 0.05 },
  },
  personal: {
    weights: { localStructure: 0.35, localGlobalContrast: 0.20, crossCategoryStructure: 0.20, spatial: 0.10, localAlignment: 0.10, lowRegularity: 0.05 },
    guard: { localStructureBelow: 50, maxMatch: 55 },
  },
  dynamic: {
    weights: { overlap: 0.30, angleVariation: 0.25, localStructure: 0.20, lowRegularity: 0.15, spatial: 0.10 },
    guard: { variationAverageAtLeast: 60, localStructureBelow: 50, maxMatch: 55 },
  },
  lowAttention: {
    strategyTypeIds: ['visual', 'categorical', 'functional', 'personal', 'dynamic'],
    strategyWeights: { highest: 0.65, secondHighest: 0.35 },
    // Randomness means weak organization signals, not rotation or overlap by themselves.
    randomnessWeights: {
      lowAlignment: 0.20,
      lowGrouping: 0.20,
      lowAccess: 0.20,
      lowLocalStructure: 0.20,
      lowRegularity: 0.10,
      lowSpacingConsistency: 0.10,
    },
    // Broad lack of strategy evidence is required before randomness raises TYPE 06.
    randomnessMidpoint: 70,
    randomnessAdjustmentWeight: 0.20,
  },
  confidence: {
    compositeBelow: 8,
    clearAbove: 15,
    labels: {
      composite: '具有明显复合倾向',
      mixed: '主类型与次级倾向均有体现',
      clear: '主类型倾向较明显',
    },
  },
}
