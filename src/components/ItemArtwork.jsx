// Temporary, replaceable vector drawings for the ten fixed objects.
export default function ItemArtwork({ id }) {
  const common = { fill: '#e6e5e1', stroke: '#242424', strokeWidth: 2 }
  const shapes = {
    laptop: <><rect x="4" y="4" width="92" height="73" rx="2" {...common}/><rect x="9" y="9" width="82" height="62" fill="#cdccc7" stroke="#777"/><path d="M0 80H100L96 96H4Z" {...common}/><path d="M25 88H75" stroke="#888"/></>,
    phone: <><rect x="10" y="2" width="80" height="96" rx="8" {...common}/><rect x="16" y="12" width="68" height="75" fill="#cac9c4" stroke="#777"/><circle cx="50" cy="93" r="2" fill="#444"/></>,
    book: <><rect x="5" y="3" width="91" height="94" {...common}/><path d="M15 3V97M22 23H75M22 31H68" stroke="#777" strokeWidth="2"/></>,
    notebook: <><rect x="7" y="3" width="89" height="94" {...common}/><path d="M18 3V97M30 29H78M30 40H78M30 51H70" stroke="#8a8985" strokeWidth="1.5"/>{[17,30,43,56,69,82].map(y=><circle key={y} cx="10" cy={y} r="2" fill="#555"/>)}</>,
    pen: <><path d="M3 35L10 24H82L97 50L82 76H10Z" {...common}/><path d="M82 24V76M14 36H67" stroke="#777" strokeWidth="2"/><path d="M3 35L0 50L3 65" fill="#777"/></>,
    ruler: <><rect x="1" y="13" width="98" height="74" {...common}/>{Array.from({length: 17},(_,i)=><path key={i} d={`M${7+i*5.4} 13V${i%2?29:39}`} stroke="#777" strokeWidth="1.5"/>)}</>,
    cup: <><circle cx="50" cy="50" r="46" {...common}/><circle cx="50" cy="50" r="34" fill="#bdbcb7" stroke="#777" strokeWidth="2"/><circle cx="50" cy="50" r="27" fill="#d3d2ce"/></>,
    headphones: <><path d="M15 57V45C15 5 85 5 85 45V57" fill="none" stroke="#242424" strokeWidth="11"/><rect x="4" y="50" width="24" height="37" rx="6" {...common}/><rect x="72" y="50" width="24" height="37" rx="6" {...common}/></>,
    eraser: <><path d="M9 15H76L94 38L78 82H12L2 56Z" {...common}/><path d="M9 15L29 38H94M29 38L12 82" fill="none" stroke="#888" strokeWidth="2"/></>,
    notes: <><path d="M3 4H97V79L78 96H3Z" {...common}/><path d="M78 96V79H97M17 23H75M17 35H65" fill="none" stroke="#888" strokeWidth="2"/></>,
  }
  return <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">{shapes[id] ?? <rect x="4" y="4" width="92" height="92" {...common} />}</svg>
}
