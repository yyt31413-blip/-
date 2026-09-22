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

// Selecting an item moves it to the front without ever growing zIndex beyond
// the number of desk items. Source array order and item geometry stay intact.
export function bringToFront(items, id) {
  const ordered = getLayerOrder(items)
  const from = ordered.findIndex((item) => item.id === id)
  if (from < 0) return normalizeLayers(items)
  if (from !== ordered.length - 1) ordered.push(...ordered.splice(from, 1))
  return assignContinuousLayers(items, ordered)
}
