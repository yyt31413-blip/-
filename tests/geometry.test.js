import test from 'node:test'
import assert from 'node:assert/strict'
import { initialItems, DESK_WIDTH, DESK_HEIGHT } from '../src/data/stationery.js'
import {
  getItemCenter, getCenterDistance, getDistanceToDeskCenter,
  getOccupiedRegion, doItemsOverlap, getOverallBounds,
  clampItem, getFinalDeskState,
} from '../src/utils/geometry.js'

const rectangle = (id, x, y, width = 100, height = 20, rotation = 0) =>
  ({ id, category: 'test', x, y, width, height, rotation })

test('centers and distances stay in desk coordinates after rotation', () => {
  const a = rectangle('a', 10, 20, 40, 20, 45)
  const b = rectangle('b', 50, 20, 40, 20, 0)
  assert.deepEqual(getItemCenter(a), { x: 30, y: 30 })
  assert.equal(getCenterDistance(a, b), 40)
  assert.equal(getDistanceToDeskCenter(rectangle('center', 450, 302.5)), 0)
})

test('overlap distinguishes crossing, separated, and edge-touching rectangles', () => {
  const a = rectangle('a', 100, 100)
  assert.equal(doItemsOverlap(a, rectangle('b', 150, 110)), true)
  assert.equal(doItemsOverlap(a, rectangle('b', 200, 100)), false)
  assert.equal(doItemsOverlap(a, rectangle('b', 300, 100)), false)
  assert.equal(doItemsOverlap(rectangle('a', 0, 0, 100, 20, 45), rectangle('b', 0, 0, 100, 20, -45)), true)
  // These rotated bounding boxes overlap, but the actual parallel strips do not.
  assert.equal(doItemsOverlap(rectangle('a', 0, 0, 100, 20, 45), rectangle('b', 0, 40, 100, 20, 45)), false)
})

test('rotated region, overall bounds, and drag clamping use actual corners', () => {
  const turned = rectangle('a', 100, 100, 80, 20, 90)
  const region = getOccupiedRegion(turned)
  assert.ok(Math.abs(region.bounds.left - 130) < 1e-9)
  assert.ok(Math.abs(region.bounds.right - 150) < 1e-9)
  assert.equal(region.area, 1600)
  const bounds = getOverallBounds([turned, rectangle('b', 200, 200, 30, 40)])
  assert.equal(bounds.left, 130)
  assert.equal(bounds.bottom, 240)
  assert.equal(getOverallBounds([]), null)
  for (const rotation of [0, 15, 45, 90, 135, 270]) {
    for (const [x, y] of [[-400, -300], [950, 600], [400, 300]]) {
      const placed = clampItem(rectangle('dragged', x, y, 100, 40, rotation))
      for (const corner of getOccupiedRegion(placed).corners) {
        assert.ok(corner.x >= -1e-9 && corner.x <= DESK_WIDTH + 1e-9)
        assert.ok(corner.y >= -1e-9 && corner.y <= DESK_HEIGHT + 1e-9)
      }
    }
  }
})

test('final snapshot includes all ten items and updates overlap after moving and rotating', () => {
  const items = initialItems.map((item) => ({ ...item }))
  items[1].x = items[0].x + 40
  items[1].y = items[0].y + 20
  items[1].rotation = 15
  const state = getFinalDeskState(items)
  assert.equal(state.items.length, 10)
  assert.equal(state.desk.width, DESK_WIDTH)
  assert.equal(state.items[1].rotation, 15)
  assert.equal(state.items[1].centerX, items[1].x + items[1].width / 2)
  assert.ok(state.items[0].overlapsWith.includes('phone'))
  assert.ok(state.items[1].overlapsWith.includes('laptop'))
  assert.equal(state.items[1].category, 'electronics')
  assert.equal(state.items[1].occupiedRegion.corners.length, 4)
  items[1].x = 900
  items[1].y = 480
  assert.equal(getFinalDeskState(items).items[0].overlapsWith.includes('phone'), false)
})
