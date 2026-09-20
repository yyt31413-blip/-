export default function LayerControls({ selectedItem, itemCount, onUp, onDown, onFront, onBack }) {
  const atBottom = !selectedItem || selectedItem.zIndex === 1
  const atTop = !selectedItem || selectedItem.zIndex === itemCount
  return <div className="layer-controls" aria-label="文具图层控制">
    <div className="layer-current">图层操作 <span>{selectedItem ? `${selectedItem.name} · zIndex ${selectedItem.zIndex} / ${itemCount}` : '请先选择文具'}</span></div>
    <div className="layer-buttons">
      <button type="button" data-layer-action="up" disabled={atTop} onClick={onUp}>上移</button>
      <button type="button" data-layer-action="down" disabled={atBottom} onClick={onDown}>下移</button>
      <button type="button" data-layer-action="front" disabled={atTop} onClick={onFront}>置顶</button>
      <button type="button" data-layer-action="back" disabled={atBottom} onClick={onBack}>置底</button>
    </div>
  </div>
}
