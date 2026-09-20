import test from 'node:test'
import assert from 'node:assert/strict'
import { initialItems } from '../src/data/stationery.js'
import { getOverlapArea } from '../src/utils/geometry.js'
import { calculateScores, scoreAlignment, scoreGrouping, scoreRegularity, scoreOverlap, scoreSpatial } from '../src/utils/scoring.js'

const item = (id, x, y, rotation = 0, category = 'electronics') =>
  ({ id, x, y, width: 60, height: 40, rotation, category })

test('all scores are finite 0–100 integers for the fixed desk and extreme layouts', () => {
  const layouts = [
    initialItems,
    initialItems.map((entry, index) => ({ ...entry, x: 430 + index % 3 * 10, y: 270 + Math.floor(index / 3) * 10, rotation: index * 15 })),
    initialItems.map((entry) => ({ ...entry, rotation: 180 })),
  ]
  for (const layout of layouts) {
    const scores = calculateScores(layout)
    assert.deepEqual(Object.keys(scores), ['alignment', 'grouping', 'regularity', 'overlap', 'spatial'])
    for (const value of Object.values(scores)) assert.ok(Number.isInteger(value) && value >= 0 && value <= 100)
  }
})

test('shared rows and columns raise alignment', () => {
  const row = [item('a', 100, 100), item('b', 240, 100), item('c', 380, 100), item('d', 520, 100)]
  const scattered = [item('a', 100, 100), item('b', 235, 230), item('c', 480, 310), item('d', 700, 445)]
  assert.ok(scoreAlignment(row) > scoreAlignment(scattered))
})

test('only same-category distances control grouping', () => {
  const together = [item('a', 100, 100), item('b', 150, 100), item('c', 200, 100), item('cup', 900, 500, 0, 'daily')]
  const apart = [item('a', 100, 100), item('b', 500, 100), item('c', 850, 500), item('cup', 900, 500, 0, 'daily')]
  assert.ok(scoreGrouping(together) > scoreGrouping(apart))
})

test('even spacing and common orientation raise regularity', () => {
  const grid = [item('a', 200, 150), item('b', 400, 150), item('c', 200, 350), item('d', 400, 350)]
  const uneven = [item('a', 50, 40), item('b', 480, 180, 55), item('c', 490, 190, 175), item('d', 600, 400, 270)]
  assert.ok(scoreRegularity(grid) > scoreRegularity(uneven))
})

test('overlap area and score respond to translation and rotation', () => {
  const first = { ...item('a', 100, 100), width: 100, height: 100 }
  const second = { ...item('b', 150, 100), width: 100, height: 100 }
  assert.equal(getOverlapArea(first, second), 5000)
  assert.equal(scoreOverlap([first, { ...second, x: 300 }]), 0)
  assert.ok(scoreOverlap([first, second]) > 0)
  const turned = { ...second, rotation: 45 }
  assert.ok(getOverlapArea(first, turned) > 0)
  assert.ok(Math.abs(getOverlapArea(first, turned) - getOverlapArea(turned, first)) < 1e-7)
  assert.ok(scoreOverlap([first, turned]) > scoreOverlap([first, second]))
})

test('spatial use responds to occupied area and dispersion without double-counting overlap', () => {
  const clustered = initialItems.map((entry, index) => ({ ...entry, x: 430 + index % 3 * 10, y: 270 + Math.floor(index / 3) * 10 }))
  assert.ok(scoreSpatial(initialItems) > scoreSpatial(clustered))
})
