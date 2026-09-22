import { VisualPreview } from './ComparisonPreview.jsx'
import OrderTicket from './OrderTicket.jsx'
import { metrics } from '../data/metrics.js'

export default function ResultPage({ record, onBack, onHome, onRestart }) {
  const { primary, secondary } = record.classification

  return <main className="result-page">
    <header className="site-header"><button className="wordmark" onClick={onHome}>齐与乱 <span>ORDER / DISORDER</span></button><span>结果档案 / {record.orderId}</span></header>
    <div className="result-body">
      <div className="result-intro"><p className="eyebrow">YOUR ORDER / RESEARCH RECORD</p><span>{record.orderId}</span></div>
      <section className="result-hero" aria-labelledby="result-title">
        <div><p className="result-type-number">TYPE {primary.number}</p><h1 id="result-title">{primary.name}</h1><p className="result-english">{primary.english}</p></div>
        <div className="result-secondary"><span>SECONDARY / 次级倾向</span><strong>{secondary.name}</strong><small>{secondary.english}</small></div>
      </section>
      <div className="result-keywords"><span>关键词 / KEYWORDS</span><p>{primary.keywords.join('  /  ')}</p></div>
      <p className="result-description">{primary.description}</p>
      <p className="result-method-note">{record.classification.confidence.label}。依据本次桌面几何数据生成的实验性归类，类型参数可随研究数据调整。</p>
      <section className="result-analysis" aria-label="五项指标与视觉转译">
        <div className="result-metrics"><div className="result-section-heading"><span>01 / 基础指标</span><small>FIVE BASE INDICATORS</small></div>
          {metrics.map(({ key, english, chinese }) => <div className="result-metric" key={key}><span>{english}<small>{chinese}</small></span><strong>{record.scores[key]}</strong><div className="result-metric-line"><i style={{ width: `${record.scores[key]}%` }} /></div></div>)}
        </div>
        <div className="result-visual"><div className="result-section-heading"><span>02 / 视觉转译</span><small>GEOMETRIC TRANSLATION</small></div><VisualPreview translation={record.translation} /><p>原始位置、比例、朝向与叠放关系保留于几何图形中。</p></div>
      </section>
      <section className="ticket-section" aria-labelledby="ticket-title"><div className="ticket-heading"><div><p className="eyebrow">ORDER COGNITION TICKET</p><h2 id="ticket-title">秩序认知票据</h2></div></div><p className="ticket-swipe-hint">左右滑动查看完整票据</p><div className="ticket-scroll"><OrderTicket record={record} /></div></section>
      <div className="result-footer-actions"><button className="text-button" onClick={onBack}>← 返回桌面调整</button><button className="restart-button" onClick={onRestart}>重新测试 <span aria-hidden="true">↗</span></button><button className="text-button" onClick={onHome}>返回首页</button></div>
    </div>
  </main>
}
