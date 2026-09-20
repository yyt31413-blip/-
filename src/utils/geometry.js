import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Item x/y are the unrotated rectangle's upper-left corner in desk coordinates.
export function getItemCenter(item) {
  return { x: item.x + item.width / 2, y: item.y + item.height / 2 }
}

export function getCenterDistance(first, second) {
  const a = getItemCenter(first)
  const b = getItemCenter(second)
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function getDistanceToDeskCenter(item) {
  const center = getItemCenter(item)
  return Math.hypot(center.x - DESK_WIDTH / 2, center.y - DESK_HEIGHT / 2)
}

// CSS rotation is clockwise in the desk's downward-positive y axis.
export function getOccupiedRegion(item) {
  const { x: centerX, y: centerY } = getItemCenter(item)
  const angle = item.rotation * Math.PI / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const halfWidth = item.width / 2
  const halfHeight = item.height / 2
  const corners = [
    [-halfWidth, -halfHeight], [halfWidth, -halfHeight],
    [halfWidth, halfHeight], [-halfWidth, halfHeight],
  ].map(([dx, dy]) => ({ x: centerX + dx * cos - dy * sin, y: centerY + dx * sin + dy * cos }))
  const xs = corners.map((point) => point.x)
  const ys = corners.map((point) => point.y)
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  const right = Math.max(...xs)
  const bottom = Math.max(...ys)
  return { corners, bounds: { left, top, right, bottom, width: right - left, height: bottom - top }, area: item.width * item.height }
}

// Separating Axis Theorem: compare actual rotated rectangles, not just their bounding boxes.
export function doItemsOverlap(first, second) {
  const firstCorners = getOccupiedRegion(first).corners
  const secondCorners = getOccupiedRegion(second).corners
  for (const corners of [firstCorners, secondCorners]) {
    for (let i = 0; i < 2; i += 1) {
      const edge = { x: corners[i + 1].x - corners[i].x, y: corners[i + 1].y - corners[i].y }
      const axis = { x: -edge.y, y: edge.x }
      const firstProjection = firstCorners.map((point) => point.x * axis.x + point.y * axis.y)
      const secondProjection = secondCorners.map((point) => point.x * axis.x + point.y * axis.y)
      // Edge contact has zero shared area and is not counted as overlap.
      if (Math.max(...firstProjection) <= Math.min(...secondProjection) + 1e-8 ||
          Math.max(...secondProjection) <= Math.min(...firstProjection) + 1e-8) return false
    }
  }
  return true
}

// Clip one convex rotated rectangle by the other to measure their shared area.
export function getOverlapArea(first, second) {
  if (!doItemsOverlap(first, second)) return 0
  let polygon = getOccupiedRegion(first).corners
  const clip = getOccupiedRegion(second).corners
  for (let i = 0; i < clip.length; i += 1) {
    const start = clip[i]
    const end = clip[(i + 1) % clip.length]
    const signedSide = (point) => (end.x - start.x) * (point.y - start.y) - (end.y - start.y) * (point.x - start.x)
    const input = polygon
    polygon = []
    for (let j = 0; j < input.length; j += 1) {
      const a = input[j]
      const b = input[(j + 1) % input.length]
      const sideA = signedSide(a)
      const sideB = signedSide(b)
      if ((sideA >= 0) !== (sideB >= 0)) {
        const t = sideA / (sideA - sideB)
        polygon.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
      }
      if (sideB >= 0) polygon.push(b)
    }
    if (polygon.length === 0) return 0
  }
  const signedArea = polygon.reduce((sum, point, index) => {
    const next = polygon[(index + 1) % polygon.length]
    return sum + point.x * next.y - next.x * point.y
  }, 0) / 2
  return Math.max(0, signedArea)
}

// This is the enclosing rectangle of all occupied regions, not their union area.
export function getOverallBounds(items) {
  if (items.length === 0) return null
  const regions = items.map(getOccupiedRegion)
  const left = Math.min(...regions.map((region) => region.bounds.left))
  const top = Math.min(...regions.map((region) => region.bounds.top))
  const right = Math.max(...regions.map((region) => region.bounds.right))
  const bottom = Math.max(...regions.map((region) => region.bounds.bottom))
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

// Clamp against the rotated corners so the item cannot leave the desk.
export function clampItem(item) {
  const region = getOccupiedRegion(item).bounds
  return {
    ...item,
    x: clamp(item.x, item.x - region.left, item.x + DESK_WIDTH - region.right),
    y: clamp(item.y, item.y - region.top, item.y + DESK_HEIGHT - region.bottom),
  }
}

// Snapshot is computed from current React state without rounding display values.
export function getFinalDeskState(items) {
  return {
    desk: { width: DESK_WIDTH, height: DESK_HEIGHT, coordinateUnit: 'desk_unit' },
    occupiedBounds: getOverallBounds(items),
    items: items.map((item) => {
      const center = getItemCenter(item)
      return {
        id: item.id,
        name: item.name,
        category: item.category,
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        centerX: center.x,
        centerY: center.y,
        rotation: item.rotation,
        zIndex: item.zIndex,
        overlapsWith: items.filter((other) => other.id !== item.id && doItemsOverlap(item, other)).map((other) => other.id),
        occupiedRegion: getOccupiedRegion(item),
        distanceToDeskCenter: getDistanceToDeskCenter(item),
      }
    }),
  }
}
