import test from 'node:test'
import assert from 'node:assert/strict'
import { initialItems } from '../src/data/stationery.js'
import { metrics, debugMetrics } from '../src/data/metrics.js'
import { calculateScores } from '../src/utils/scoring.js'
import { classifyOrder } from '../src/utils/typeClassification.js'
import {
  scoreAccess, scoreLocalStructure, scoreAngleVariation,
  scoreSpacingConsistency, scoreZoneSeparation,
} from '../src/utils/analysisScoring.js'

const item = (id, x, y, rotation = 0, category = 'electronics', zIndex = 1) =>
  ({ id, x, y, width: 60, height: 40, rotation, category, zIndex })

test('high-frequency objects score higher near the lower center and lose credit when covered from above', () => {
  const near = item('phone', 470, 492)
  const far = item('phone', 30, 30)
  const covering = { ...item('book', 460, 482, 0, 'reading', 2), width: 80, height: 60 }
  assert.ok(scoreAccess([near]) > scoreAccess([far]))
  assert.ok(scoreAccess([near, covering]) < scoreAccess([near, { ...covering, zIndex: 0 }]))
  assert.equal(scoreAccess([item('book', 470, 492, 0, 'reading')]), 0)
})

test('two compact local groups beat one connected cluster and scattered objects', () => {
  const twoGroups = [
    item('a', 100, 100), item('b', 170, 100), item('c', 240, 100),
    item('d', 600, 400), item('e', 670, 400), item('f', 740, 400),
  ]
  const oneGroup = twoGroups.map((entry, index) => ({ ...entry, x: 100 + index * 70, y: 100 }))
  const scattered = twoGroups.map((entry, index) => ({ ...entry, x: 20 + index * 180, y: 50 + index % 2 * 430 }))
  assert.ok(scoreLocalStructure(twoGroups) > scoreLocalStructure(oneGroup))
  assert.ok(scoreLocalStructure(twoGroups) > scoreLocalStructure(scattered))
})

test('angle variation follows circular direction rather than raw degree spread', () => {
  const same = [0, 0, 0, 0].map((angle, index) => item(String(index), 100 + index * 100, 100, angle))
  const varied = [0, 90, 180, 270].map((angle, index) => item(String(index), 100 + index * 100, 100, angle))
  assert.equal(scoreAngleVariation(same), 0)
  assert.equal(scoreAngleVariation(varied), 100)
  assert.equal(scoreAngleVariation([item('a', 0, 0, 0), item('b', 100, 0, 360)]), 0)
})

test('consistent gaps between rotated footprints score above irregular gaps', () => {
  const even = [100, 200, 300, 400].map((x, index) => item(String(index), x, 100))
  const uneven = [100, 170, 380, 700].map((x, index) => item(String(index), x, 100))
  assert.ok(scoreSpacingConsistency(even) > scoreSpacingConsistency(uneven))
  assert.equal(scoreSpacingConsistency(even.map((entry) => ({ ...entry, x: 300 }))), 0)
})

test('category zones need both within-category cohesion and between-category separation', () => {
  const separated = [
    item('a', 100, 100), item('b', 140, 100), item('c', 180, 100),
    item('d', 700, 400, 0, 'writing'), item('e', 740, 400, 0, 'writing'), item('f', 780, 400, 0, 'writing'),
  ]
  const mixed = [
    item('a', 100, 100), item('b', 500, 100), item('c', 900, 100),
    item('d', 130, 100, 0, 'writing'), item('e', 530, 100, 0, 'writing'), item('f', 930, 100, 0, 'writing'),
  ]
  assert.ok(scoreZoneSeparation(separated) > scoreZoneSeparation(mixed))
})

test('ten analysis scores are live while results and six-type classification still use five base scores', () => {
  const scores = calculateScores(initialItems)
  assert.equal(metrics.length, 5)
  assert.equal(debugMetrics.length, 10)
  for (const { key } of debugMetrics) assert.ok(Number.isInteger(scores[key]) && scores[key] >= 0 && scores[key] <= 100)
  const base = Object.fromEntries(metrics.map(({ key }) => [key, scores[key]]))
  assert.deepEqual(classifyOrder(scores), classifyOrder(base))

  const reordered = initialItems.map((entry) => ({ ...entry, zIndex: 11 - entry.zIndex }))
  const reorderedScores = calculateScores(reordered)
  for (const { key } of metrics) assert.equal(reorderedScores[key], scores[key])
})
