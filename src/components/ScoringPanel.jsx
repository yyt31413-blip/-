import { memo } from 'react'
import { debugMetrics } from '../data/metrics.js'
import { orderTypes } from '../data/orderTypes.js'

function ScoringPanel({ scores, classification }) {
  return (
    <aside className="scoring-panel" aria-label="实时秩序评分">
      <div className="scoring-heading"><span>实时指标</span><span>00—100</span></div>
      <p className="scoring-note">实验参数 / 开发预览</p>
      {debugMetrics.map(({ key, chinese, english }, index) => (
        <div className="score-row" key={key}>
          <div className="score-meta"><span>{String(index + 1).padStart(2, '0')} / {english}</span><strong>{scores[key]}</strong></div>
          <div className="score-label">{chinese}</div>
          <div className="score-track" aria-label={`${chinese} ${scores[key]} 分`}><span style={{ width: `${scores[key]}%` }} /></div>
        </div>
      ))}
      <div className="type-debug" aria-label="实时类型匹配">
        <div className="scoring-heading"><span>六类匹配</span><span>TYPE SCORE</span></div>
        {orderTypes.map((type) => <div className="type-debug-row" key={type.id}><span>TYPE {type.number} / {type.name}</span><strong>{classification.matchScores[type.id]}</strong></div>)}
        <div className="type-debug-summary"><span>PRIMARY</span><strong>{classification.primary.name}</strong></div>
        <div className="type-debug-summary"><span>SECONDARY</span><strong>{classification.secondary.name}</strong></div>
        <div className="type-debug-summary"><span>CONFIDENCE</span><strong>{classification.confidence.label} / 差 {classification.confidence.gap}</strong></div>
      </div>
      <p className="scoring-footnote">分数描述当前排列特征，不代表优劣。</p>
    </aside>
  )
}

export default memo(ScoringPanel)
