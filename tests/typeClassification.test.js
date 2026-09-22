import test from 'node:test'
import assert from 'node:assert/strict'
import { orderTypes } from '../src/data/orderTypes.js'
import { typeWeights } from '../src/config/typeWeights.js'
import {
  calculateLocalGlobalContrast, calculateStrategyStrength,
  calculateTypeMatches, classifyOrder,
} from '../src/utils/typeClassification.js'

const zeroScores = {
  alignment: 0, grouping: 0, regularity: 0, overlap: 0, spatial: 0,
  access: 0, localStructure: 0, angleVariation: 0,
  spacingConsistency: 0, zoneSeparation: 0,
}

test('six type records and configurable feature weights stay complete', () => {
  assert.deepEqual(orderTypes.map((type) => type.number), ['01', '02', '03', '04', '05', '06'])
  assert.equal(orderTypes[5].name, '低关注型')
  for (const type of orderTypes) {
    assert.ok(type.name && type.english && type.description)
    assert.equal(type.keywords.length, 4)
    if (type.id !== 'lowAttention') {
      const total = Object.values(typeWeights[type.id].weights).reduce((sum, weight) => sum + weight, 0)
      assert.ok(Math.abs(total - 1) < 1e-10)
    }
  }
})

test('visual rules combine six weighted features and cap weak global structure', () => {
  const strong = { ...zeroScores, alignment: 90, regularity: 80, spacingConsistency: 70, angleVariation: 10, overlap: 10, spatial: 60 }
  assert.equal(calculateTypeMatches(strong).visual, 82)
  const weakGlobal = { ...strong, alignment: 49, regularity: 49, spacingConsistency: 100, angleVariation: 0, overlap: 0, spatial: 100 }
  assert.equal(calculateTypeMatches(weakGlobal).visual, 55)
})

test('category and functional matching follow their configured weighted evidence', () => {
  const category = { ...zeroScores, grouping: 80, zoneSeparation: 70, localStructure: 60, regularity: 50, spatial: 40 }
  assert.equal(calculateTypeMatches(category).categorical, 69)
  const functional = { ...zeroScores, access: 80, spatial: 60, grouping: 40, regularity: 50 }
  assert.equal(calculateTypeMatches(functional, { visibility: 90 }).functional, 74)
  assert.ok(calculateTypeMatches(functional, { visibility: 90 }).functional >
    calculateTypeMatches(functional, { visibility: 0 }).functional)
})

test('personal matching rewards local-over-global contrast and requires local structure', () => {
  const personal = { ...zeroScores, localStructure: 80, regularity: 30, spatial: 50 }
  assert.equal(calculateLocalGlobalContrast(personal), 50)
  assert.equal(calculateLocalGlobalContrast({ localStructure: 30, regularity: 80 }), -50)
  assert.equal(calculateTypeMatches(personal, { localAlignment: 70 }).personal, 68)
  const weakLocal = { ...personal, localStructure: 49, regularity: 0, spatial: 100 }
  assert.equal(calculateTypeMatches(weakLocal, { localAlignment: 100 }).personal, 55)
})

test('dynamic matching requires some organization despite high overlap and rotation', () => {
  const organized = { ...zeroScores, overlap: 80, angleVariation: 70, localStructure: 70, regularity: 30, spatial: 50 }
  assert.equal(calculateTypeMatches(organized).dynamic, 71)
  const weakLocal = { ...organized, overlap: 100, angleVariation: 100, localStructure: 49, regularity: 0, spatial: 100 }
  assert.equal(calculateTypeMatches(weakLocal).dynamic, 55)
})

test('low attention follows the two strongest strategies plus a bounded randomness adjustment', () => {
  assert.equal(calculateStrategyStrength({ visual: 80, categorical: 50, functional: 20, personal: 10, dynamic: 0 }), 69.5)
  assert.equal(calculateStrategyStrength({ visual: 80, categorical: 50, functional: 20, personal: 10, dynamic: 0, lowAttention: 100 }), 69.5)
  const noAdjustment = {
    ...typeWeights,
    lowAttention: { ...typeWeights.lowAttention, randomnessAdjustmentWeight: 0 },
  }
  const matches = calculateTypeMatches(zeroScores, {}, noAdjustment)
  const firstFive = Object.fromEntries(Object.entries(matches).filter(([id]) => id !== 'lowAttention'))
  assert.equal(matches.lowAttention, Math.round(100 - calculateStrategyStrength(firstFive)))
  assert.ok(calculateTypeMatches(zeroScores).lowAttention > matches.lowAttention)
})

test('representative layouts rank all six types with distinct primary and secondary matches', () => {
  const examples = [
    ['visual', { ...zeroScores, alignment: 90, regularity: 80, spacingConsistency: 70, angleVariation: 10, overlap: 10, spatial: 60 }, {}],
    ['categorical', { ...zeroScores, grouping: 80, zoneSeparation: 70, localStructure: 60, regularity: 50, spatial: 40 }, {}],
    ['functional', { ...zeroScores, access: 80, spatial: 60, grouping: 40, regularity: 50 }, { visibility: 90 }],
    ['personal', { ...zeroScores, localStructure: 80, regularity: 30, spatial: 50 }, { localAlignment: 70 }],
    ['dynamic', { ...zeroScores, overlap: 80, angleVariation: 70, localStructure: 70, regularity: 30, spatial: 50 }, {}],
    ['lowAttention', zeroScores, {}],
  ]
  for (const [expected, scores, context] of examples) {
    const result = classifyOrder(scores, context)
    assert.deepEqual(Object.keys(result.matchScores), orderTypes.map((type) => type.id))
    for (const value of Object.values(result.matchScores)) assert.ok(Number.isInteger(value) && value >= 0 && value <= 100)
    assert.equal(result.primary.id, expected)
    assert.notEqual(result.primary.id, result.secondary.id)
    assert.ok(result.matchScores[result.primary.id] >= result.matchScores[result.secondary.id])
  }
})
