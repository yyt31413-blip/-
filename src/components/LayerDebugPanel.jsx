import { getLayerOrder } from '../utils/layers.js'

export default function LayerDebugPanel({ items, selectedId, onSelect }) {
  return <details className="layer-debug">
    <summary>图层调试 · 物品名称 / zIndex</summary>
    <div className="layer-debug-list">
      {[...getLayerOrder(items)].reverse().map((item) => <button type="button" key={item.id}
        data-item-id={item.id}
        className={item.id === selectedId ? 'is-current' : ''}
        aria-pressed={item.id === selectedId} onClick={() => onSelect(item.id)}>
        <span>{item.name}</span><strong>{item.zIndex}</strong>
      </button>)}
    </div>
  </details>
}
