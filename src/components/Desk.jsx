import { useRef } from 'react'
import DeskItem from './DeskItem.jsx'
import { DESK_WIDTH, DESK_HEIGHT } from '../data/stationery.js'
import { clampItem } from '../utils/geometry.js'

export default function Desk({ items, selectedId, onChange, onSelect }) {
  const deskRef = useRef(null)
  const dragRef = useRef(null)

  function handlePointerDown(event, id) {
    if (event.button !== 0 || dragRef.current) return
    const item = items.find((entry) => entry.id === id)
    const rect = deskRef.current.getBoundingClientRect()
    // Remember the grab point in desk units so a window resize does not jump the item.
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      offsetX: (event.clientX - rect.left) * DESK_WIDTH / rect.width - item.x,
      offsetY: (event.clientY - rect.top) * DESK_HEIGHT / rect.height - item.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    onSelect(id)
  }

  function handlePointerMove(event) {
    const drag = dragRef.current
    if (!drag || event.pointerId !== drag.pointerId) return
    const rect = deskRef.current.getBoundingClientRect()
    const x = (event.clientX - rect.left) * DESK_WIDTH / rect.width - drag.offsetX
    const y = (event.clientY - rect.top) * DESK_HEIGHT / rect.height - drag.offsetY
    onChange(drag.id, (item) => clampItem({ ...item, x, y }))
  }

  function handlePointerEnd(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null
  }

  return (
    <div ref={deskRef} className="desk" aria-label="虚拟桌面"
      onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd} onLostPointerCapture={handlePointerEnd}>
      <div className="desk-corner desk-corner-top">DESK / 01</div>
      {items.map((item) => (
        <DeskItem key={item.id} item={item} selected={selectedId === item.id}
          onPointerDown={handlePointerDown} onSelect={onSelect} />
      ))}
      <div className="desk-corner desk-corner-bottom">1000 × 625</div>
    </div>
  )
}
