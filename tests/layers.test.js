import test from 'node:test'
import assert from 'node:assert/strict'
import { initialItems } from '../src/data/stationery.js'
import { getFinalDeskState, doItemsOverlap } from '../src/utils/geometry.js'
import { calculateScores } from '../src/utils/scoring.js'
import { metrics } from '../src/data/metrics.js'
import { createVisualTranslation } from '../src/utils/visualTranslation.js'
import { normalizeLayers, moveLayerUp, moveLayerDown, bringToFront, sendToBack, getLayerOrder } from '../src/utils/layers.js'

const level = (items, id) => items.find((item) => item.id === id).zIndex
const assertContinuous = (items) => assert.deepEqual(items.map((item) => item.zIndex).sort((a, b) => a - b), Array.from({ length: items.length }, (_, index) => index + 1))

test('one-step controls swap only adjacent levels and remain bounded after repeated clicks', () => {
  let items = moveLayerUp(initialItems, 'book')
  assert.equal(level(items, 'book'), 4)
  assert.equal(level(items, 'notebook'), 3)
  assert.equal(level(items, 'phone'), 2)
  items = moveLayerDown(items, 'book')
  assert.equal(level(items, 'book'), 3)
  for (let index = 0; index < 30; index += 1) items = moveLayerUp(items, 'book')
  assert.equal(level(items, 'book'), items.length)
  for (let index = 0; index < 30; index += 1) items = moveLayerDown(items, 'book')
  assert.equal(level(items, 'book'), 1)
  assertContinuous(items)
  assert.deepEqual(items.map((item) => item.id), initialItems.map((item) => item.id))
})

test('front, back, and normalization keep unique consecutive levels', () => {
  let items = bringToFront(initialItems, 'phone')
  assert.equal(level(items, 'phone'), 10)
  assert.equal(getLayerOrder(items).at(-1).id, 'phone')
  items = sendToBack(items, 'phone')
  assert.equal(level(items, 'phone'), 1)
  assert.equal(getLayerOrder(items)[0].id, 'phone')
  assertContinuous(items)
  const irregular = initialItems.map((item, index) => ({ ...item, zIndex: 100 + index * 5 }))
  assertContinuous(normalizeLayers(irregular))
})

test('layer-only edits preserve geometry, all five scores, and overlap results', () => {
  const overlapped = initialItems.map((item) => ({ ...item }))
  overlapped[1].x = overlapped[0].x + 30
  overlapped[1].y = overlapped[0].y + 30
  const beforeScores = calculateScores(overlapped)
  const beforeOverlap = doItemsOverlap(overlapped[0], overlapped[1])
  const beforeGeometry = overlapped.map(({ id, x, y, width, height, rotation }) => ({ id, x, y, width, height, rotation }))
  const changed = bringToFront(overlapped, 'laptop')
  const afterScores = calculateScores(changed)
  for (const { key } of metrics) assert.equal(afterScores[key], beforeScores[key])
  assert.ok(afterScores.access < beforeScores.access)
  assert.equal(doItemsOverlap(changed[0], changed[1]), beforeOverlap)
  assert.deepEqual(changed.map(({ id, x, y, width, height, rotation }) => ({ id, x, y, width, height, rotation })), beforeGeometry)
  assert.equal(getFinalDeskState(changed).items[0].zIndex, 10)
})

test('translation order follows the saved levels through drag, rotation, and reset', () => {
  let items = bringToFront(initialItems, 'laptop')
  items = items.map((item) => item.id === 'laptop' ? { ...item, x: 160, y: 120, rotation: 45 } : item)
  let translated = createVisualTranslation(items)
  assert.equal(translated.modules.at(-1).id, 'laptop')
  assert.equal(translated.modules.at(-1).zIndex, 10)
  assert.equal(translated.modules.at(-1).rotation, 45)
  assert.equal(translated.modules.at(-1).x, 160)
  items = normalizeLayers(initialItems.map((item) => ({ ...item })))
  translated = createVisualTranslation(items)
  assert.equal(translated.modules[0].id, 'laptop')
  assert.equal(translated.modules[0].zIndex, 1)
})
