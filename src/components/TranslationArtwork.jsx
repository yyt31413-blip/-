import TranslatedShape from './TranslatedShape.jsx'

// Shared SVG artwork for live comparison, result preview, and the ticket.
export default function TranslationArtwork({ translation }) {
  return <g>
    <rect width={translation.width} height={translation.height} fill="#f0f0ed" />
    {translation.guides.map((guide, index) => guide.axis === 'x'
      ? <line key={index} x1={guide.position} x2={guide.position} y1="0" y2={translation.height} stroke="#b6b6b1" strokeWidth="1" strokeDasharray="4 9" />
      : <line key={index} x1="0" x2={translation.width} y1={guide.position} y2={guide.position} stroke="#b6b6b1" strokeWidth="1" strokeDasharray="4 9" />)}
    {translation.modules.map((module) => <TranslatedShape key={module.id} module={module} />)}
    <rect x="1" y="1" width={translation.width - 2} height={translation.height - 2} fill="none" stroke="#777" strokeWidth="2" />
  </g>
}
