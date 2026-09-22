import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'
import { scoringConfig } from '../config/scoringConfig.js'
import { doItemsOverlap, getCenterDistance, getItemCenter, getOccupiedRegion } from './geometry.js'

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
const toScore = (value) => Math.round(clamp01(value) * 100)
const proximity = (distance, limit) => clamp01(1 - distance / limit)
const pairs = (items) => items.flatMap((item, index) => items.slice(index + 1).map((other) => [item, other]))

function pointInsidePolygon(point, corners) {
  return corners.every((corner, index) => {
    const next = corners[(index + 1) % corners.length]
    return (next.x - corner.x) * (point.y - corner.y) - (next.y - corner.y) * (point.x - corner.x) >= -1e-8
  })
}

// Sample the item's rotated footprint. A point covered by several higher layers counts once.
function coveredFraction(item, items, sampleGrid) {
  const itemIndex = items.indexOf(item)
  const itemLayer = Number.isFinite(item.zIndex) ? item.zIndex : itemIndex + 1
  const upperPolygons = items.flatMap((other, index) => {
    if (other === item) return []
    const layer = Number.isFinite(other.zIndex) ? other.zIndex : index + 1
    return layer > itemLayer || (layer === itemLayer && index > itemIndex)
      ? [getOccupiedRegion(other).corners] : []
  })
  if (upperPolygons.length === 0) return 0

  const [topLeft, topRight, , bottomLeft] = getOccupiedRegion(item).corners
  let covered = 0
  for (let row = 0; row < sampleGrid; row += 1) {
    for (let column = 0; column < sampleGrid; column += 1) {
      const u = (column + 0.5) / sampleGrid
      const v = (row + 0.5) / sampleGrid
      const point = {
        x: topLeft.x + u * (topRight.x - topLeft.x) + v * (bottomLeft.x - topLeft.x),
        y: topLeft.y + u * (topRight.y - topLeft.y) + v * (bottomLeft.y - topLeft.y),
      }
      if (upperPolygons.some((corners) => pointInsidePolygon(point, corners))) covered += 1
    }
  }
  return covered / (sampleGrid * sampleGrid)
}

function highFrequencyItems(items, config) {
  return items.filter((item) => config.highFrequencyIds.includes(item.id))
}

// Visibility is separate from access so the functional type can weigh it explicitly.
export function scoreHighFrequencyVisibility(items, config = scoringConfig.access) {
  const highFrequency = highFrequencyItems(items, config)
  if (highFrequency.length === 0) return 0
  return toScore(mean(highFrequency.map((item) => 1 - coveredFraction(item, items, config.sampleGrid))))
}

export function scoreAccess(items, config = scoringConfig.access) {
  const highFrequency = highFrequencyItems(items, config)
  if (highFrequency.length === 0) return 0
  const operationCenter = {
    x: DESK_WIDTH * config.operationCenter.xRatio,
    y: DESK_HEIGHT * config.operationCenter.yRatio,
  }
  return toScore(mean(highFrequency.map((item) => {
    const center = getItemCenter(item)
    const distance = Math.hypot(center.x - operationCenter.x, center.y - operationCenter.y)
    const visible = 1 - config.occlusionPenalty * coveredFraction(item, items, config.sampleGrid)
    return proximity(distance, config.maxDistance) * visible
  })))
}

function nearbyGroups(items, linkDistance) {
  const unseen = new Set(items)
  const groups = []
  for (const item of items) {
    if (!unseen.has(item)) continue
    unseen.delete(item)
    const group = [item]
    for (let index = 0; index < group.length; index += 1) {
      for (const other of [...unseen]) {
        if (getCenterDistance(group[index], other) <= linkDistance) {
          unseen.delete(other)
          group.push(other)
        }
      }
    }
    groups.push(group)
  }
  return groups
}

function orientationAgreement(items) {
  return Math.hypot(
    mean(items.map((item) => Math.cos(item.rotation * Math.PI / 180))),
    mean(items.map((item) => Math.sin(item.rotation * Math.PI / 180))),
  )
}

function groupAlignment(group, tolerance) {
  return mean(pairs(group).map(([a, b]) => {
    const first = getItemCenter(a)
    const second = getItemCenter(b)
    return proximity(Math.min(Math.abs(first.x - second.x), Math.abs(first.y - second.y)), tolerance)
  }))
}

// Used only by the personal-order matching model; the ten public metrics stay unchanged.
export function scoreLocalAlignment(items, config = scoringConfig.localStructure) {
  if (items.length === 0) return 0
  const groups = nearbyGroups(items, config.linkDistance).filter((group) => group.length >= config.minGroupSize)
  const coverage = groups.reduce((count, group) => count + group.length, 0) / items.length
  return toScore(coverage * mean(groups.map((group) => groupAlignment(group, config.alignmentTolerance))))
}

export function scoreLocalStructure(items, config = scoringConfig.localStructure) {
  const groups = nearbyGroups(items, config.linkDistance).filter((group) => group.length >= config.minGroupSize)
  if (groups.length < config.minGroups || groups.length > config.maxGroups) return 0
  const coverage = groups.reduce((count, group) => count + group.length, 0) / items.length
  const groupQuality = mean(groups.map((group) => {
    const groupPairs = pairs(group)
    const cohesion = mean(groupPairs.map(([a, b]) => proximity(getCenterDistance(a, b), config.cohesionDistance)))
    const alignment = groupAlignment(group, config.alignmentTolerance)
    const { weights } = config
    return weights.cohesion * cohesion + weights.alignment * alignment + weights.orientation * orientationAgreement(group)
  }))
  const interGroupDistances = pairs(groups).map(([first, second]) =>
    Math.min(...first.flatMap((a) => second.map((b) => getCenterDistance(a, b)))))
  const separation = mean(interGroupDistances.map((distance) => clamp01(distance / config.separationDistance)))
  return toScore(coverage * (groupQuality + config.weights.separation * separation))
}

export function scoreAngleVariation(items, config = scoringConfig.angleVariation) {
  if (items.length < 2) return 0
  // Circular variance treats 0° and 360° as the same direction.
  return toScore((1 - orientationAgreement(items)) / config.maxVariation)
}

function pointToSegmentDistance(point, start, end) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared === 0 ? 0 : clamp01(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared)
  return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy)
}

// Shortest visible gap between the actual rotated rectangles, rather than their center points.
function edgeGap(first, second) {
  if (doItemsOverlap(first, second)) return 0
  const firstCorners = getOccupiedRegion(first).corners
  const secondCorners = getOccupiedRegion(second).corners
  const cornerToEdges = (corners, other) => corners.flatMap((point) => other.map((start, index) =>
    pointToSegmentDistance(point, start, other[(index + 1) % other.length])))
  return Math.min(...cornerToEdges(firstCorners, secondCorners), ...cornerToEdges(secondCorners, firstCorners))
}

export function scoreSpacingConsistency(items, config = scoringConfig.spacingConsistency) {
  if (items.length < config.minItems) return 0
  const nearestGaps = items.map((item) => Math.min(...items.filter((other) => other !== item).map((other) => edgeGap(item, other))))
  const averageGap = mean(nearestGaps)
  if (averageGap === 0) return 0
  const deviation = Math.sqrt(mean(nearestGaps.map((gap) => (gap - averageGap) ** 2)))
  return toScore(proximity(deviation / averageGap, config.cvLimit) * clamp01(averageGap / config.minimumGap))
}

export function scoreZoneSeparation(items, config = scoringConfig.zoneSeparation) {
  const categories = new Map()
  for (const item of items) {
    if (!categories.has(item.category)) categories.set(item.category, [])
    categories.get(item.category).push(item)
  }
  if (categories.size < 2) return 0
  const zones = [...categories.values()].map((members) => {
    const centers = members.map(getItemCenter)
    const center = { x: mean(centers.map((point) => point.x)), y: mean(centers.map((point) => point.y)) }
    return { members, center, radius: mean(centers.map((point) => Math.hypot(point.x - center.x, point.y - center.y))) }
  })
  const withinCategory = zones.flatMap((zone) => pairs(zone.members))
  if (withinCategory.length === 0) return 0
  const cohesion = mean(withinCategory.map(([a, b]) => proximity(getCenterDistance(a, b), config.cohesionDistance)))
  const separation = mean(pairs(zones).map(([a, b]) => {
    const centerDistance = Math.hypot(a.center.x - b.center.x, a.center.y - b.center.y)
    return clamp01(Math.max(0, centerDistance - a.radius - b.radius) / config.targetGap)
  }))
  return toScore(cohesion * separation)
}

export function calculateAnalysisScores(items) {
  return {
    access: scoreAccess(items),
    localStructure: scoreLocalStructure(items),
    angleVariation: scoreAngleVariation(items),
    spacingConsistency: scoreSpacingConsistency(items),
    zoneSeparation: scoreZoneSeparation(items),
  }
}
