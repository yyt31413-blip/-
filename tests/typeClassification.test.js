import test from 'node:test'
import assert from 'node:assert/strict'
import { orderTypes } from '../src/data/orderTypes.js'
import { typeConfig } from '../src/config/typeConfig.js'
import { classifyOrder } from '../src/utils/typeClassification.js'

test('all six types have complete result and ticket copy', () => {
  assert.equal(orderTypes.length, 6)
  assert.equal(new Set(orderTypes.map((type) => type.number)).size, 6)
  for (const type of orderTypes) {
    assert.ok(type.name && type.english && type.description)
    assert.equal(type.keywords.length, 4)
  }
})

test('each reference profile resolves to its intended primary type', () => {
  for (const type of orderTypes) {
    const result = classifyOrder(typeConfig.profiles[type.id])
    assert.equal(result.primary.id, type.id)
    assert.notEqual(result.secondary.id, type.id)
  }
})
