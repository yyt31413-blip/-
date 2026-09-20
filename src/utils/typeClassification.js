import { orderTypes } from '../data/orderTypes.js'
import { typeConfig } from '../config/typeConfig.js'

// Nearest research profile provides a primary and a secondary tendency.
export function classifyOrder(scores, config = typeConfig) {
  const ranked = orderTypes.map((type) => {
    const profile = config.profiles[type.id]
    const distance = config.dimensions.reduce((sum, dimension) => {
      const difference = scores[dimension] - profile[dimension]
      return sum + config.weights[dimension] * difference ** 2
    }, 0)
    return { type, distance }
  }).sort((a, b) => a.distance - b.distance)
  return { primary: ranked[0].type, secondary: ranked[1].type }
}
