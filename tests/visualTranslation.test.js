import test from 'node:test'
import assert from 'node:assert/strict'
import { initialItems, DESK_WIDTH, DESK_HEIGHT } from '../src/data/stationery.js'
import { getItemCenter, getOccupiedRegion } from '../src/utils/geometry.js'
import { createVisualTranslation } from '../src/utils/visualTranslation.js'
import { calculateScores } from '../src/utils/scoring.js'

test('all ten modules retain source geometry, category, and layer order', () => {
  const translation = createVisualTranslation(initialItems)
  assert.deepEqual([translation.width, translation.height], [DESK_WIDTH, DESK_HEIGHT])
  assert.equal(translation.modules.length, 10)
  for (const [index, original] of initialItems.entries()) {
    const module = translation.modules[index]
    assert.deepEqual(
      [module.id, module.category, module.x, module.y, module.width, module.height, module.rotation, module.zIndex, module.layer],
      [original.id, original.category, original.x, original.y, original.width, original.height, original.rotation, original.zIndex, index],
    )
    assert.deepEqual(module.center, getItemCenter(original))
    assert.deepEqual(module.occupiedRegion, getOccupiedRegion(original))
  }
  assert.deepEqual(translation.modules.map((module) => module.kind), [
    'large_rectangle', 'narrow_rectangle', 'long_rectangle', 'medium_rectangle',
    'thin_rectangle', 'long_bar', 'circle', 'arc', 'small_rectangle', 'square',
  ])
})

test('moving and rotating objects changes the corresponding modules and overlap relationship', () => {
  const items = initialItems.map((item) => ({ ...item }))
  items[1].x = items[0].x + 30
  items[1].y = items[0].y + 30
  items[1].rotation = 45
  let translation = createVisualTranslation(items)
  assert.equal(translation.modules[1].rotation, 45)
  assert.ok(translation.modules[0].overlapsWith.includes('phone'))
  assert.ok(translation.modules[1].overlapsWith.includes('laptop'))
  items[1].x = 900
  items[1].y = 450
  translation = createVisualTranslation(items)
  assert.equal(translation.modules[0].overlapsWith.includes('phone'), false)
})

test('guides appear only for repeated geometry and follow moved positions', () => {
  const items = [
    { id: 'a', category: 'paper', x: 100, y: 100, width: 50, height: 50, rotation: 0 },
    { id: 'b', category: 'paper', x: 300, y: 100, width: 50, height: 50, rotation: 0 },
  ]
  const first = createVisualTranslation(items)
  assert.ok(first.guides.some((guide) => guide.axis === 'y' && guide.kind === 'top' && guide.position === 100))
  items[1].y = 250
  const second = createVisualTranslation(items)
  assert.equal(second.guides.some((guide) => guide.axis === 'y'), false)
})

test('adding or removing a stationery item keeps scoring and translation valid', () => {
  const extra = { id: 'clip', name: '回形针', category: 'writing', x: 910, y: 480, width: 40, height: 35, rotation: 15 }
  const expanded = [...initialItems, extra]
  const reduced = initialItems.filter((item) => item.id !== 'cup')
  assert.equal(createVisualTranslation(expanded).modules.at(-1).kind, 'rectangle')
  assert.equal(createVisualTranslation(reduced).modules.length, 9)
  for (const items of [expanded, reduced]) {
    assert.ok(Object.values(calculateScores(items)).every((value) => Number.isInteger(value) && value >= 0 && value <= 100))
  }
})
