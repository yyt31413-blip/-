import { memo } from 'react'
import { debugMetrics } from '../data/metrics.js'

function ScoringPanel({ scores }) {
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
    </aside>
  )
}

export default memo(ScoringPanel)
