import TranslationArtwork from './TranslationArtwork.jsx'
import { metrics } from '../data/metrics.js'

export default function OrderTicket({ record }) {
  const { primary, secondary } = record.classification
  const keywordText = primary.keywords.join('  /  ')
  return <svg className="order-ticket-svg" xmlns="http://www.w3.org/2000/svg" width="1400" height="520" viewBox="0 0 1400 520" role="img" aria-label={`${primary.name}秩序认知票据，编号${record.orderId}`} fontFamily="Arial, Microsoft YaHei, sans-serif">
    <rect width="1400" height="520" fill="#f3f3f0" />
    <rect x="1" y="1" width="1398" height="518" fill="none" stroke="#242424" strokeWidth="2" />
    <rect width="1400" height="62" fill="#242424" />
    <text x="48" y="40" fill="#fff" fontSize="24" fontWeight="700">齐与乱</text>
    <text x="168" y="39" fill="#d3d3d0" fontSize="16" letterSpacing="3">ORDER / DISORDER</text>
    <text x="1115" y="39" fill="#d3d3d0" fontSize="12" letterSpacing="2">RESEARCH RECORD</text>
    <line x1="1085" y1="62" x2="1085" y2="520" stroke="#777" strokeWidth="2" strokeDasharray="6 7" />
    <text x="48" y="105" fill="#555" fontSize="14" letterSpacing="3">ORDER TYPE {primary.number}</text>
    <text x="48" y="165" fill="#242424" fontSize="53" fontWeight="500">{primary.name}</text>
    <text x="50" y="201" fill="#555" fontSize="19" letterSpacing="2">{primary.english}</text>
    <line x1="48" y1="219" x2="515" y2="219" stroke="#aaa" strokeWidth="1" />
    <text x="48" y="247" fill="#777" fontSize="11" letterSpacing="2">KEYWORDS / 关键词</text>
    <text x="48" y="278" fill="#242424" fontSize="18">{keywordText}</text>
    <text x="48" y="319" fill="#777" fontSize="11" letterSpacing="2">FIVE BASE INDICATORS / 五项基础指标</text>
    {metrics.map(({ key, english }, index) => {
      const x = 48 + index * 99
      return <g key={key}>
        <line x1={x} y1="335" x2={x + 78} y2="335" stroke="#aaa" strokeWidth="1" />
        <text x={x} y="373" fill="#242424" fontSize="30">{record.scores[key]}</text>
        <text x={x} y="394" fill="#666" fontSize="10" letterSpacing=".5">{english}</text>
      </g>
    })}
    <text x="555" y="94" fill="#777" fontSize="11" letterSpacing="2">GEOMETRIC TRANSLATION / 几何转译</text>
    <g transform="translate(555 108) scale(0.49)"><TranslationArtwork translation={record.translation} /></g>
    <text x="555" y="433" fill="#777" fontSize="11" letterSpacing="1.5">ONE DESK / TEN OBJECTS / MULTIPLE ORDERS</text>
    <line x1="48" y1="448" x2="1038" y2="448" stroke="#aaa" strokeWidth="1" />
    <text x="48" y="472" fill="#777" fontSize="11" letterSpacing="2">TYPE NOTE</text>
    <text x="48" y="499" fill="#242424" fontSize="17">{primary.description}</text>
    <text x="1115" y="103" fill="#777" fontSize="11" letterSpacing="2">ORDER ID / 编号</text>
    <text x="1115" y="137" fill="#242424" fontSize="26" fontWeight="700">{record.orderId}</text>
    <line x1="1115" y1="165" x2="1361" y2="165" stroke="#aaa" strokeWidth="1" />
    <text x="1115" y="197" fill="#777" fontSize="11" letterSpacing="2">SECONDARY / 次级倾向</text>
    <text x="1115" y="233" fill="#242424" fontSize="26">{secondary.name}</text>
    <text x="1115" y="257" fill="#777" fontSize="12" letterSpacing="1">{secondary.english}</text>
    <line x1="1115" y1="289" x2="1361" y2="289" stroke="#aaa" strokeWidth="1" />
    <text x="1115" y="323" fill="#777" fontSize="11" letterSpacing="2">ARCHIVE / QI YU LUAN</text>
    <text x="1115" y="351" fill="#242424" fontSize="13">同一物象，多重秩序</text>
    {Array.from({ length: 24 }, (_, index) => <rect key={index} x={1115 + index * 10} y="403" width={index % 3 === 0 ? 5 : 2} height={index % 4 === 0 ? 57 : 44} fill="#242424" />)}
    <text x="1115" y="482" fill="#777" fontSize="10" letterSpacing="1.5">LOCAL EXPERIMENT RECORD</text>
  </svg>
}
