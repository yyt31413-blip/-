// Layer numbers are state, independent of the source array order and item geometry.
export function getLayerOrder(items) {
  return items.map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => (a.item.zIndex ?? a.originalIndex + 1) - (b.item.zIndex ?? b.originalIndex + 1) || a.originalIndex - b.originalIndex)
    .map(({ item }) => item)
}

function assignContinuousLayers(items, ordered) {
  const levels = new Map(ordered.map((item, index) => [item.id, index + 1]))
  let changed = false
  const next = items.map((item) => {
    const zIndex = levels.get(item.id)
    if (item.zIndex === zIndex) return item
    changed = true
    return { ...item, zIndex }
  })
  return changed ? next : items
}

export function normalizeLayers(items) {
  return assignContinuousLayers(items, getLayerOrder(items))
}

function moveTo(items, id, destination) {
  const ordered = getLayerOrder(items)
  const from = ordered.findIndex((item) => item.id === id)
  if (from < 0) return normalizeLayers(items)
  const to = Math.min(ordered.length - 1, Math.max(0, destination(from, ordered.length)))
  if (from !== to) ordered.splice(to, 0, ...ordered.splice(from, 1))
  return assignContinuousLayers(items, ordered)
}

export const moveLayerUp = (items, id) => moveTo(items, id, (from) => from + 1)
export const moveLayerDown = (items, id) => moveTo(items, id, (from) => from - 1)
export const bringToFront = (items, id) => moveTo(items, id, (_, count) => count - 1)
export const sendToBack = (items, id) => moveTo(items, id, () => 0)
