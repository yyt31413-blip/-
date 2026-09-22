import { typeValidationDesks } from '../tests/fixtures/typeValidationDesks.js'
import { calculateScores } from '../src/utils/scoring.js'
import { classifyOrder } from '../src/utils/typeClassification.js'

for (const [layout, items] of Object.entries(typeValidationDesks)) {
  const scores = calculateScores(items)
  const result = classifyOrder(scores, { items })
  console.log(JSON.stringify({
    layout,
    scores,
    typeScores: result.matchScores,
    primary: result.primary.name,
    secondary: result.secondary.name,
    confidence: result.confidence,
  }))
}
