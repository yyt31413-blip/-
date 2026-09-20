import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'
import { getItemCenter, getOccupiedRegion, doItemsOverlap } from './geometry.js'
import { getLayerOrder } from './layers.js'

// The module changes the visual vocabulary only; geometry remains in desk units.
const MODULES = {
  laptop: 'large_rectangle',
  phone: 'narrow_rectangle',
  book: 'long_rectangle',
  notebook: 'medium_rectangle',
  pen: 'thin_rectangle',
  ruler: 'long_bar',
  cup: 'circle',
  headphones: 'arc',
  eraser: 'small_rectangle',
  notes: 'square',
}

const GUIDE_TOLERANCE = 18
const MAX_GUIDES = 12

function clusterGuides(entries, axis, kind) {
  const groups = []
  for (const entry of [...entries].sort((a, b) => a.value - b.value)) {
    const group = groups.find((candidate) => Math.abs(entry.value - candidate.position) <= GUIDE_TOLERANCE)
    if (group) {
      group.values.push(entry.value)
      group.ids.add(entry.id)
      group.position = group.values.reduce((sum, value) => sum + value, 0) / group.values.length
    } else {
      groups.push({ axis, kind, position: entry.value, values: [entry.value], ids: new Set([entry.id]) })
    }
  }
  return groups.filter((group) => group.ids.size >= 2).map(({ axis: groupAxis, kind: groupKind, position, ids }) => ({
    axis: groupAxis, kind: groupKind, position, itemIds: [...ids],
  }))
}

// Only repeated edges/centers form a guide; their positions come from the user's arrangement.
function getAlignmentGuides(items) {
  const features = [
    ['x', 'left', (item) => getOccupiedRegion(item).bounds.left],
    ['x', 'center', (item) => getItemCenter(item).x],
    ['x', 'right', (item) => getOccupiedRegion(item).bounds.right],
    ['y', 'top', (item) => getOccupiedRegion(item).bounds.top],
    ['y', 'center', (item) => getItemCenter(item).y],
    ['y', 'bottom', (item) => getOccupiedRegion(item).bounds.bottom],
  ]
  return features.flatMap(([axis, kind, getValue]) =>
    clusterGuides(items.map((item) => ({ id: item.id, value: getValue(item) })), axis, kind),
  ).sort((a, b) => b.itemIds.length - a.itemIds.length).slice(0, MAX_GUIDES)
}

export function createVisualTranslation(items) {
  return {
    width: DESK_WIDTH,
    height: DESK_HEIGHT,
    guides: getAlignmentGuides(items),
    // SVG elements render from bottom to top using the persistent layer state.
    modules: getLayerOrder(items).map((item, layer) => ({
      id: item.id,
      category: item.category,
      kind: MODULES[item.id] ?? 'rectangle',
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      center: getItemCenter(item),
      rotation: item.rotation,
      zIndex: item.zIndex ?? layer + 1,
      layer,
      occupiedRegion: getOccupiedRegion(item),
      overlapsWith: items.filter((other) => other.id !== item.id && doItemsOverlap(item, other)).map((other) => other.id),
    })),
  }
}
