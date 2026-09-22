// Shared display metadata for the five scores; calculations remain in utils/scoring.js.
export const metrics = [
  { key: 'alignment', english: 'ALIGNMENT', chinese: '对齐程度' },
  { key: 'grouping', english: 'GROUPING', chinese: '分类聚集' },
  { key: 'regularity', english: 'REGULARITY', chinese: '规则程度' },
  { key: 'overlap', english: 'OVERLAP', chinese: '重叠 / 动态容错' },
  { key: 'spatial', english: 'SPATIAL', chinese: '空间利用' },
]

// These five experimental dimensions appear only in the development panel.
// The result page and ticket keep using the five base metrics above.
export const debugMetrics = [
  ...metrics,
  { key: 'access', english: 'ACCESS', chinese: '高频物品取用' },
  { key: 'localStructure', english: 'LOCAL STRUCTURE', chinese: '局部小组合' },
  { key: 'angleVariation', english: 'ANGLE VARIATION', chinese: '角度变化' },
  { key: 'spacingConsistency', english: 'SPACING CONSISTENCY', chinese: '间距一致性' },
  { key: 'zoneSeparation', english: 'ZONE SEPARATION', chinese: '类别分区' },
]
