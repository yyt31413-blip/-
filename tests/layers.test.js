import test from 'node:test'
import assert from 'node:assert/strict'
import { initialItems } from '../src/data/stationery.js'
import { getFinalDeskState, doItemsOverlap } from '../src/utils/geometry.js'
import { calculateScores } from '../src/utils/scoring.js'
import { metrics } from '../src/data/metrics.js'
import { createVisualTranslation } from '../src/utils/visualTranslation.js'
import { normalizeLayers, bringToFront, getLayerOrder } from '../src/utils/layers.js'

const level = (items, id) => items.find((item) => item.id === id).zIndex
const assertContinuous = (items) => assert.deepEqual(items.map((item) => item.zIndex).sort((a, b) => a - b), Array.from({ length: items.length }, (_, index) => index + 1))

test('selecting or starting a drag moves that item to the top with bounded layers', () => {
  let items = bringToFront(initialItems, 'phone')
  assert.equal(level(items, 'phone'), items.length)
  assert.equal(getLayerOrder(items).at(-1).id, 'phone')
  assert.equal(bringToFront(items, 'phone'), items)
  for (let index = 0; index < 40; index += 1) {
    items = bringToFront(items, index % 2 ? 'phone' : 'book')
    assertContinuous(items)
  }
  assert.equal(getLayerOrder(items).at(-1).id, 'phone')
  assert.deepEqual(items.map((item) => item.id), initialItems.map((item) => item.id))
  const irregular = initialItems.map((item, index) => ({ ...item, zIndex: 100 + index * 5 }))
  assertContinuous(bringToFront(irregular, 'laptop'))
})

test('drag and rotation preserve the selected top layer until another item is selected', () => {
  let items = bringToFront(initialItems, 'laptop')
  items = items.map((item) => item.id === 'laptop' ? { ...item, x: 160, y: 120, rotation: 45 } : item)
  assert.equal(level(items, 'laptop'), items.length)
  assert.equal(getLayerOrder(items).at(-1).id, 'laptop')
  items = bringToFront(items, 'book')
  assert.equal(level(items, 'book'), items.length)
  assert.equal(level(items, 'laptop'), items.length - 1)
})

test('automatic layer edits preserve geometry, five base scores, and overlap results', () => {
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

test('translation retains automatic layer order and a fresh test restores initial layers', () => {
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
  assert.deepEqual(items.map((item) => item.zIndex), initialItems.map((item) => item.zIndex))
})
