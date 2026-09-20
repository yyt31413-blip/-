const outline = { stroke: '#292929', strokeWidth: 1.7 }

// Shapes use each object's exact source footprint; details provide a distinct module language.
export default function TranslatedShape({ module }) {
  const { width: w, height: h, kind } = module
  let graphic
  switch (kind) {
    case 'large_rectangle':
      graphic = <><rect width={w} height={h} fill="#666" {...outline}/><rect x={w * .08} y={h * .12} width={w * .35} height={h * .68} fill="#dededb"/><rect x={w * .49} y={h * .12} width={w * .43} height={h * .68} fill="#8d8d89"/></>
      break
    case 'narrow_rectangle':
      graphic = <><rect width={w} height={h} fill="#303030"/><rect x={w * .22} y={h * .12} width={w * .56} height={h * .38} fill="#a3a39f"/><rect x={w * .22} y={h * .58} width={w * .56} height={h * .27} fill="#d1d1cd"/></>
      break
    case 'long_rectangle':
      graphic = <><rect width={w} height={h} fill="#b8b8b4" {...outline}/><rect x={w * .08} y="0" width={w * .1} height={h} fill="#555"/><rect x={w * .3} y={h * .15} width={w * .48} height={h * .13} fill="#e8e8e5"/><rect x={w * .3} y={h * .35} width={w * .3} height={h * .13} fill="#777"/></>
      break
    case 'medium_rectangle':
      graphic = <><rect width={w} height={h} fill="#d2d2ce" {...outline}/><rect x={w * .13} y="0" width={w * .1} height={h} fill="#777"/><rect x={w * .35} y={h * .2} width={w * .5} height={h * .08} fill="#777"/><rect x={w * .35} y={h * .35} width={w * .34} height={h * .08} fill="#a1a19d"/></>
      break
    case 'thin_rectangle':
      graphic = <><rect width={w} height={h} fill="#323232"/><rect x={w * .08} y={h * .32} width={w * .7} height={h * .36} fill="#a8a8a4"/></>
      break
    case 'long_bar':
      graphic = <><rect width={w} height={h} fill="#aaa9a5" {...outline}/><rect x={w * .07} y={h * .22} width={w * .56} height={h * .18} fill="#4c4c4c"/><rect x={w * .7} y={h * .22} width={w * .2} height={h * .18} fill="#e8e8e5"/></>
      break
    case 'circle':
      graphic = <><ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill="#4c4c4c"/><ellipse cx={w / 2} cy={h / 2} rx={w * .34} ry={h * .34} fill="#bebeba"/><ellipse cx={w / 2} cy={h / 2} rx={w * .2} ry={h * .2} fill="#e5e5e1"/></>
      break
    case 'arc':
      graphic = <><path d={`M${w * .08} ${h * .77} A${w * .42} ${h * .43} 0 0 1 ${w * .92} ${h * .77}`} fill="none" stroke="#474747" strokeWidth={Math.min(w, h) * .15}/><path d={`M${w * .22} ${h * .77} A${w * .28} ${h * .29} 0 0 1 ${w * .78} ${h * .77}`} fill="none" stroke="#b5b5b0" strokeWidth={Math.min(w, h) * .08}/></>
      break
    case 'small_rectangle':
      graphic = <><rect width={w} height={h} fill="#777" {...outline}/><path d={`M${w * .38} 0 V${h}`} stroke="#d8d8d4" strokeWidth="3"/></>
      break
    case 'square':
      graphic = <><rect width={w} height={h} fill="#e1e1dd" {...outline}/><rect x={w * .15} y={h * .17} width={w * .52} height={h * .24} fill="#777"/><rect x={w * .15} y={h * .51} width={w * .7} height={h * .13} fill="#b2b2ae"/></>
      break
    default:
      graphic = <rect width={w} height={h} fill="#888" {...outline}/>
  }
  return <g transform={`translate(${module.center.x} ${module.center.y}) rotate(${module.rotation}) translate(${-w / 2} ${-h / 2})`} style={{ mixBlendMode: 'multiply' }} opacity="0.78" data-item-id={module.id} data-z-index={module.zIndex}>{graphic}</g>
}
