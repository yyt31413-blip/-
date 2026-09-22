import test from 'node:test'
import assert from 'node:assert/strict'
import { DESK_HEIGHT, DESK_WIDTH } from '../src/data/stationery.js'
import { getOccupiedRegion } from '../src/utils/geometry.js'
import { calculateScores } from '../src/utils/scoring.js'
import { classifyOrder } from '../src/utils/typeClassification.js'
import { typeValidationDesks } from './fixtures/typeValidationDesks.js'

const results = Object.fromEntries(Object.entries(typeValidationDesks).map(([id, items]) => {
  const scores = calculateScores(items)
  return [id, { items, scores, classification: classifyOrder(scores, { items }) }]
}))

test('six hand-built desks keep all rotated stationery on the actual desk', () => {
  assert.equal(Object.keys(results).length, 6)
  for (const { items, scores, classification } of Object.values(results)) {
    assert.equal(items.length, 10)
    for (const item of items) {
      const { left, top, right, bottom } = getOccupiedRegion(item).bounds
      assert.ok(left >= -1e-8 && top >= -1e-8 && right <= DESK_WIDTH + 1e-8 && bottom <= DESK_HEIGHT + 1e-8, item.id)
    }
    for (const value of [...Object.values(scores), ...Object.values(classification.matchScores)]) {
      assert.ok(Number.isInteger(value) && value >= 0 && value <= 100)
    }
    assert.equal(classification.confidence.gap,
      classification.matchScores[classification.primary.id] - classification.matchScores[classification.secondary.id])
  }
})

test('hand-built desk evidence resolves all six intended primary types', () => {
  for (const [expected, { classification }] of Object.entries(results)) {
    assert.equal(classification.primary.id, expected, expected)
  }
  assert.ok(results.visual.scores.alignment > results.functional.scores.alignment)
  assert.ok(results.categorical.scores.grouping > results.personal.scores.grouping)
  assert.ok(results.categorical.scores.zoneSeparation > results.personal.scores.zoneSeparation)
  assert.ok(results.functional.scores.access > results.visual.scores.access)
  assert.ok(results.personal.scores.localStructure > 60)
  assert.equal(results.personal.scores.overlap, 0)
  assert.ok(results.dynamic.scores.overlap > 50 && results.dynamic.scores.localStructure > 50)
  assert.equal(results.lowAttention.scores.localStructure, 0)
  assert.ok(results.lowAttention.classification.matchScores.lowAttention >
    results.personal.classification.matchScores.lowAttention)
})
