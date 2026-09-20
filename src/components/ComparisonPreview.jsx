import { memo } from 'react'
import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'
import { getItemCenter } from '../utils/geometry.js'
import ItemArtwork from './ItemArtwork.jsx'
import TranslationArtwork from './TranslationArtwork.jsx'
import { getLayerOrder } from '../utils/layers.js'

function OriginalPreview({ items }) {
  return <svg className="comparison-canvas original-canvas" viewBox={`0 0 ${DESK_WIDTH} ${DESK_HEIGHT}`} role="img" aria-label="当前原始桌面排列">
    <rect width={DESK_WIDTH} height={DESK_HEIGHT} fill="#e3e3df" />
    {getLayerOrder(items).map((item) => {
      const center = getItemCenter(item)
      return <g key={item.id} transform={`translate(${center.x} ${center.y}) rotate(${item.rotation})`}>
        <svg x={-item.width / 2} y={-item.height / 2} width={item.width} height={item.height} viewBox="0 0 100 100" preserveAspectRatio="none"><ItemArtwork id={item.id} /></svg>
        <text x="0" y="4" textAnchor="middle" fontSize="12" fill="#444" stroke="#e6e5e1" strokeWidth="3" paintOrder="stroke">{item.name}</text>
      </g>
    })}
  </svg>
}

export function VisualPreview({ translation }) {
  return <svg className="comparison-canvas visual-canvas" viewBox={`0 0 ${translation.width} ${translation.height}`} role="img" aria-label="由当前桌面生成的抽象视觉图形">
    <TranslationArtwork translation={translation} />
  </svg>
}

function ComparisonPreview({ items, translation }) {
  return <section className="comparison-section" aria-labelledby="comparison-title">
    <div className="comparison-heading"><div><p className="eyebrow">VISUAL TRANSLATION / 01</p><h2 id="comparison-title">原始桌面 / 视觉转译</h2></div><p>同一位置，同一比例，不同视觉语言。</p></div>
    <div className="comparison-grid">
      <figure><figcaption><span>01</span> 原始桌面 <small>ORIGINAL DESK</small></figcaption><OriginalPreview items={items} /></figure>
      <figure><figcaption><span>02</span> 视觉转译 <small>ABSTRACT COMPOSITION</small></figcaption><VisualPreview translation={translation} /></figure>
    </div>
  </section>
}

export default memo(ComparisonPreview)
