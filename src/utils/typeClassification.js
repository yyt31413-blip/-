import { orderTypes } from '../data/orderTypes.js'
import { typeWeights } from '../config/typeWeights.js'
import { scoreCrossCategoryStructure, scoreHighFrequencyVisibility, scoreLocalAlignment } from './analysisScoring.js'

const clampScore = (value) => Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
const roundScore = (value) => Math.round(clampScore(value))

function weightedAverage(weights, features) {
  const entries = Object.entries(weights)
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0)
  if (totalWeight <= 0) return 0
  return entries.reduce((sum, [key, weight]) => sum + weight * clampScore(features[key]), 0) / totalWeight
}

export function calculateLocalGlobalContrast(scores) {
  return clampScore(scores.localStructure) - clampScore(scores.regularity)
}

function getMatchingFeatures(scores, context) {
  const feature = Object.fromEntries([
    'alignment', 'grouping', 'regularity', 'overlap', 'spatial',
    'access', 'localStructure', 'angleVariation', 'spacingConsistency', 'zoneSeparation',
  ].map((key) => [key, clampScore(scores[key])]))

  // The final desk supplies true layer-aware visibility and local alignment.
  // Explicit context values also let research fixtures test the weights without a desk.
  feature.highFrequencyVisibility = clampScore(context.visibility ??
    (context.items ? scoreHighFrequencyVisibility(context.items) : feature.access))
  feature.reachableVisibility = feature.highFrequencyVisibility * feature.access / 100
  feature.localAlignment = clampScore(context.localAlignment ??
    (context.items ? scoreLocalAlignment(context.items) : feature.localStructure))
  feature.crossCategoryStructure = clampScore(context.crossCategoryStructure ??
    (context.items ? scoreCrossCategoryStructure(context.items) : 0))
  feature.localGlobalContrast = clampScore(calculateLocalGlobalContrast(feature))
  feature.lowAngleVariation = 100 - feature.angleVariation
  feature.lowOverlap = 100 - feature.overlap
  feature.lowRegularity = 100 - feature.regularity
  return feature
}

export function calculateStrategyStrength(matchScores, config = typeWeights.lowAttention) {
  const [highest = 0, secondHighest = 0] =
    config.strategyTypeIds
      .map((id) => clampScore(matchScores[id])).sort((a, b) => b - a)
  return config.strategyWeights.highest * highest + config.strategyWeights.secondHighest * secondHighest
}

export function calculateTypeMatches(scores, context = {}, config = typeWeights) {
  const feature = getMatchingFeatures(scores, context)
  const matchScores = {}
  for (const id of config.lowAttention.strategyTypeIds) {
    matchScores[id] = roundScore(weightedAverage(config[id].weights, feature))
  }

  const visualGuard = config.visual.guard
  if (feature.alignment < visualGuard.alignmentBelow && feature.regularity < visualGuard.regularityBelow) {
    matchScores.visual = Math.min(matchScores.visual, visualGuard.maxMatch)
  }
  const personalGuard = config.personal.guard
  if (feature.localStructure < personalGuard.localStructureBelow) {
    matchScores.personal = Math.min(matchScores.personal, personalGuard.maxMatch)
  }
  const dynamicGuard = config.dynamic.guard
  if ((feature.overlap + feature.angleVariation) / 2 >= dynamicGuard.variationAverageAtLeast &&
      feature.localStructure < dynamicGuard.localStructureBelow) {
    matchScores.dynamic = Math.min(matchScores.dynamic, dynamicGuard.maxMatch)
  }

  // TYPE 06 is calculated after the five positive strategies; overlap alone is not randomness.
  const lowAttention = config.lowAttention
  const randomness = weightedAverage(lowAttention.randomnessWeights, {
    lowAlignment: 100 - feature.alignment,
    lowGrouping: 100 - feature.grouping,
    lowAccess: 100 - feature.access,
    lowLocalStructure: 100 - feature.localStructure,
    lowRegularity: 100 - feature.regularity,
    lowSpacingConsistency: 100 - feature.spacingConsistency,
  })
  const strategyStrength = calculateStrategyStrength(matchScores, lowAttention)
  matchScores.lowAttention = roundScore(100 - strategyStrength +
    lowAttention.randomnessAdjustmentWeight * (randomness - lowAttention.randomnessMidpoint))
  return matchScores
}

// A match-score gap expresses relative tendency, never scientific accuracy.
export function calculateConfidence(primaryScore, secondaryScore, config = typeWeights.confidence) {
  const gap = Math.max(0, roundScore(primaryScore) - roundScore(secondaryScore))
  const level = gap < config.compositeBelow ? 'composite' : gap > config.clearAbove ? 'clear' : 'mixed'
  return { gap, level, label: config.labels[level] }
}

// Rank all six weighted matches, retaining the exact scores for future research calibration.
export function classifyOrder(scores, context = {}, config = typeWeights) {
  const matchScores = calculateTypeMatches(scores, context, config)
  const ranked = orderTypes.map((type, index) => ({ type, index, match: matchScores[type.id] }))
    .sort((a, b) => b.match - a.match || a.index - b.index)
  return {
    matchScores,
    primary: ranked[0].type,
    secondary: ranked[1].type,
    confidence: calculateConfidence(ranked[0].match, ranked[1].match, config.confidence),
  }
}
