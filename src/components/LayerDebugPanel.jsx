import { getLayerOrder } from '../utils/layers.js'

export default function LayerDebugPanel({ items, selectedId }) {
  return <details className="layer-debug">
    <summary>图层调试 · 物品名称 / zIndex</summary>
    <div className="layer-debug-list">
      {[...getLayerOrder(items)].reverse().map((item) => <div key={item.id}
        data-item-id={item.id}
        className={item.id === selectedId ? 'is-current' : ''}>
        <span>{item.name}</span><strong>{item.zIndex}</strong>
      </div>)}
    </div>
  </details>
}
