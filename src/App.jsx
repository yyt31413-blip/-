import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import Desk from './components/Desk.jsx'
import ScoringPanel from './components/ScoringPanel.jsx'
import ComparisonPreview from './components/ComparisonPreview.jsx'
import ResultPage from './components/ResultPage.jsx'
import { initialItems } from './data/stationery.js'
import { clampItem, getFinalDeskState } from './utils/geometry.js'
import { calculateScores } from './utils/scoring.js'
import { createVisualTranslation } from './utils/visualTranslation.js'
import { classifyOrder } from './utils/typeClassification.js'
import { createOrderId } from './utils/orderId.js'
import { normalizeLayers, bringToFront } from './utils/layers.js'

const freshItems = () => normalizeLayers(initialItems.map((item) => ({ ...item })))

export default function App() {
  const [page, setPage] = useState('home')
  const [items, setItems] = useState(freshItems)
  const [selectedId, setSelectedId] = useState(null)
  const [result, setResult] = useState(null)
  const finishingRef = useRef(false)
  const selectedItem = items.find((item) => item.id === selectedId)
  const scores = useMemo(() => page === 'desk' ? calculateScores(items) : null, [items, page])
  const classification = useMemo(() => page === 'desk' && scores ? classifyOrder(scores, { items }) : null, [items, page, scores])
  const translation = useMemo(() => page === 'desk' ? createVisualTranslation(items) : null, [items, page])

  // The result and a new round always begin at the top, even if the user finished below the fold.
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [page])

  function changeItem(id, update) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id)
      if (index < 0) return current
      const nextItem = update(current[index])
      if (nextItem.x === current[index].x && nextItem.y === current[index].y && nextItem.rotation === current[index].rotation) return current
      const next = [...current]
      next[index] = nextItem
      return next
    })
  }

  function selectItem(id) {
    setSelectedId(id)
    // Pointer down also covers the start of a drag; a later click is harmless
    // because bringToFront returns the current state when this item is already on top.
    setItems((current) => bringToFront(current, id))
  }

  function rotateSelected(direction) {
    if (!selectedId) return
    changeItem(selectedId, (item) => clampItem({ ...item, rotation: (item.rotation + direction * 15 + 360) % 360 }))
  }

  function resetSession() {
    setItems(freshItems())
    setSelectedId(null)
    setResult(null)
    finishingRef.current = false
  }

  function startTest() {
    resetSession()
    setPage('desk')
  }

  function returnHome() {
    resetSession()
    setPage('home')
  }

  function returnToDesk() {
    setResult(null)
    finishingRef.current = false
    setPage('desk')
  }

  function resetDesk() {
    resetSession()
  }

  function finishDesk() {
    if (finishingRef.current) return
    finishingRef.current = true
    const snapshot = { ...getFinalDeskState(items), scores }
    setResult({
      orderId: createOrderId(),
      snapshot,
      scores,
      classification,
      translation,
    })
    setPage('result')
  }

  if (page === 'home') return (
    <main className="home-page">
      <header className="site-header"><span>Q / L</span><span>秩序认知交互测试</span><span>01 — 02</span></header>
      <section className="home-content">
        <p className="eyebrow">AN INTERACTIVE STUDY OF ORDER</p>
        <h1>齐<span className="title-separator">与</span>乱</h1>
        <p className="english-title">ORDER <span>/</span> DISORDER</p>
        <div className="home-rule" />
        <p className="intro">请按照你认为最舒适、最有秩序的方式，<br />重新排列桌面上的物品。</p>
        <button className="primary-button" onClick={startTest}>开始整理 <span aria-hidden="true">↗</span></button>
      </section>
      <footer className="home-footer"><span>同一物象，多重秩序</span><span>SCROLL LESS · OBSERVE MORE</span></footer>
    </main>
  )

  if (page === 'result' && result) return <ResultPage record={result} onBack={returnToDesk} onHome={returnHome} onRestart={startTest} />

  return (
    <main className="experiment-page">
      <header className="site-header"><button className="wordmark" onClick={returnHome}>齐与乱 <span>ORDER / DISORDER</span></button><span>桌面实验 / 01</span></header>
      <div className="experiment-heading"><div><p className="eyebrow">ARRANGE THE OBJECTS</p><h1>整理你的桌面<span className="heading-dot">.</span></h1></div><p>拖动物品调整位置，选中物品后可旋转。<br />物品可以重叠，排列没有标准答案。</p></div>
      <div className="experiment-layout">
        <Desk items={items} selectedId={selectedId} onChange={changeItem} onSelect={selectItem} />
        <ScoringPanel scores={scores} classification={classification} />
      </div>
      <div className="controls">
        <div className="selection-controls"><span className="control-label">当前选中</span><strong>{selectedItem?.name ?? '请选择一件物品'}</strong><button disabled={!selectedItem} onClick={() => rotateSelected(-1)} aria-label="逆时针旋转15度">↶ <span>−15°</span></button><button disabled={!selectedItem} onClick={() => rotateSelected(1)} aria-label="顺时针旋转15度">↷ <span>+15°</span></button></div>
        <div className="action-controls"><button className="text-button" onClick={resetDesk}>重置桌面</button><button className="finish-button" onClick={finishDesk}>完成我的桌面 <span aria-hidden="true">→</span></button></div>
      </div>
      <ComparisonPreview items={items} translation={translation} />
    </main>
  )
}
