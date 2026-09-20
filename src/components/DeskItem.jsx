import ItemArtwork from './ItemArtwork.jsx'
import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'

export default function DeskItem({ item, selected, onPointerDown, onSelect }) {
  return (
    <button
      type="button"
      className={`desk-item${selected ? ' is-selected' : ''}`}
      data-item-id={item.id}
      data-z-index={item.zIndex}
      aria-label={`${item.name}，点击选择，拖动排列`}
      aria-pressed={selected}
      onPointerDown={(event) => onPointerDown(event, item.id)}
      onClick={() => onSelect(item.id)}
      style={{
        left: `${item.x / DESK_WIDTH * 100}%`,
        top: `${item.y / DESK_HEIGHT * 100}%`,
        width: `${item.width / DESK_WIDTH * 100}%`,
        height: `${item.height / DESK_HEIGHT * 100}%`,
        transform: `rotate(${item.rotation}deg)`,
        zIndex: (item.zIndex ?? 1) + 1,
      }}
    >
      <ItemArtwork id={item.id} />
      <span className="item-name">{item.name}</span>
    </button>
  )
}
