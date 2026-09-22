import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'
import { scoringConfig } from '../config/scoringConfig.js'
import { calculateAnalysisScores } from './analysisScoring.js'
import { getItemCenter, getCenterDistance, getDistanceToDeskCenter, getOccupiedRegion, getOverallBounds, getOverlapArea } from './geometry.js'

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const proximity = (distance, tolerance) => clamp01(1 - distance / tolerance)
const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
const toScore = (fraction) => Math.round(clamp01(fraction) * 100)
const pairs = (items) => items.flatMap((item, index) => items.slice(index + 1).map((other) => [item, other]))

export function scoreAlignment(items, config = scoringConfig.alignment) {
  if (items.length < 2) return 0
  const pairScores = pairs(items).map(([first, second]) => {
    const a = getOccupiedRegion(first).bounds
    const b = getOccupiedRegion(second).bounds
    const ac = getItemCenter(first)
    const bc = getItemCenter(second)
    const differences = [
      Math.abs(a.left - b.left), Math.abs(a.right - b.right), Math.abs(ac.x - bc.x),
      Math.abs(a.top - b.top), Math.abs(a.bottom - b.bottom), Math.abs(ac.y - bc.y),
    ]
    return proximity(Math.min(...differences), config.tolerance)
  })
  return toScore(mean(pairScores))
}

export function scoreGrouping(items, config = scoringConfig.grouping) {
  const sameCategoryPairs = pairs(items).filter(([a, b]) => a.category === b.category)
  if (sameCategoryPairs.length === 0) return 0
  // The single lifestyle item has no within-category pair and is excluded.
  return toScore(mean(sameCategoryPairs.map(([a, b]) => proximity(getCenterDistance(a, b), config.maxDistance))))
}

export function scoreRegularity(items, config = scoringConfig.regularity) {
  if (items.length < 2) return 0
  const nearestDistances = items.map((item) => Math.min(...items.filter((other) => other.id !== item.id).map((other) => getCenterDistance(item, other))))
  const averageSpacing = mean(nearestDistances)
  const variance = mean(nearestDistances.map((distance) => (distance - averageSpacing) ** 2))
  const spacing = averageSpacing > 0 ? clamp01(1 - Math.sqrt(variance) / averageSpacing / config.spacingCvLimit) : 0
  // Circular mean treats 0° and 360° as the same orientation.
  const orientation = Math.hypot(
    mean(items.map((item) => Math.cos(item.rotation * Math.PI / 180))),
    mean(items.map((item) => Math.sin(item.rotation * Math.PI / 180))),
  )
  const center = {
    x: mean(items.map((item) => getItemCenter(item).x)),
    y: mean(items.map((item) => getItemCenter(item).y)),
  }
  const centerToCorner = Math.hypot(DESK_WIDTH / 2, DESK_HEIGHT / 2)
  const offset = Math.hypot(center.x - DESK_WIDTH / 2, center.y - DESK_HEIGHT / 2) / centerToCorner
  const balance = proximity(offset, config.balanceMaxOffset)
  const alignment = scoreAlignment(items) / 100
  const { weights } = config
  return toScore(weights.spacing * spacing + weights.orientation * orientation + weights.alignment * alignment + weights.balance * balance)
}

export function scoreOverlap(items, config = scoringConfig.overlap) {
  if (items.length < 2) return 0
  const overlaps = pairs(items).map(([a, b]) => ({ a, b, area: getOverlapArea(a, b) })).filter((pair) => pair.area > 0)
  if (overlaps.length === 0) return 0
  const involved = new Set(overlaps.flatMap(({ a, b }) => [a.id, b.id])).size / items.length
  const depth = mean(overlaps.map(({ a, b, area }) => clamp01(area / Math.min(a.width * a.height, b.width * b.height))))
  const angleDifference = mean(overlaps.map(({ a, b }) => {
    const difference = Math.abs((a.rotation - b.rotation + 360) % 360)
    return Math.min(difference, 360 - difference) / 180
  }))
  const { weights } = config
  return toScore(weights.itemCount * involved + weights.area * depth + weights.angle * angleDifference)
}

function pointInsideRegion(point, corners) {
  return corners.every((corner, index) => {
    const next = corners[(index + 1) % corners.length]
    return (next.x - corner.x) * (point.y - corner.y) - (next.y - corner.y) * (point.x - corner.x) >= 0
  })
}

// Sampling estimates union area, so overlapping objects do not count twice.
function estimateOccupiedRatio(items, config) {
  const polygons = items.map((item) => getOccupiedRegion(item).corners)
  let occupied = 0
  for (let row = 0; row < config.sampleRows; row += 1) {
    for (let column = 0; column < config.sampleColumns; column += 1) {
      const point = {
        x: (column + 0.5) * DESK_WIDTH / config.sampleColumns,
        y: (row + 0.5) * DESK_HEIGHT / config.sampleRows,
      }
      if (polygons.some((corners) => pointInsideRegion(point, corners))) occupied += 1
    }
  }
  return occupied / (config.sampleRows * config.sampleColumns)
}

export function scoreSpatial(items, config = scoringConfig.spatial) {
  if (items.length === 0) return 0
  const occupiedRatio = estimateOccupiedRatio(items, config)
  const occupied = proximity(Math.abs(occupiedRatio - config.targetOccupiedRatio), config.occupiedTolerance)
  const bounds = getOverallBounds(items)
  const extentRatio = bounds.width * bounds.height / (DESK_WIDTH * DESK_HEIGHT)
  const extent = proximity(Math.abs(extentRatio - config.targetExtentRatio), config.extentTolerance)
  const centerToCorner = Math.hypot(DESK_WIDTH / 2, DESK_HEIGHT / 2)
  const centerFraction = items.filter((item) => getDistanceToDeskCenter(item) <= centerToCorner * config.centerRadiusRatio).length / items.length
  const edgeFraction = items.filter((item) => {
    const region = getOccupiedRegion(item).bounds
    return Math.min(region.left, region.top, DESK_WIDTH - region.right, DESK_HEIGHT - region.bottom) <= config.edgeBand
  }).length / items.length
  const centerEdge = mean([
    proximity(Math.abs(centerFraction - config.targetCenterFraction), config.fractionTolerance),
    proximity(Math.abs(edgeFraction - config.targetEdgeFraction), config.fractionTolerance),
  ])
  const { weights } = config
  return toScore(weights.occupied * occupied + weights.extent * extent + weights.centerEdge * centerEdge)
}

export function calculateScores(items) {
  return {
    alignment: scoreAlignment(items),
    grouping: scoreGrouping(items),
    regularity: scoreRegularity(items),
    overlap: scoreOverlap(items),
    spatial: scoreSpatial(items),
    ...calculateAnalysisScores(items),
  }
}
