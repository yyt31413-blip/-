let nextOrderNumber = 1

// A temporary in-memory serial; no result data is persisted or downloaded.
export function createOrderId() {
  const id = `OD-${String(nextOrderNumber).padStart(6, '0')}`
  nextOrderNumber += 1
  return id
}
