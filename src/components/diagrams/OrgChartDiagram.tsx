import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'

// Organigrama en placas: cima institucional con frontón, los tres poderes y, bajo el central, tres cargos. El cargo
// del medio lleva el busto en tinta sólida: quién ocupa ese cargo hoy. Las placas tienen relieve (cantos rayados).
const DEPTH = 4
const ID = 'org'
const fill = (tone: 'light' | 'mid' | 'cross') => `url(#${ID}-h-${tone})`

type Plaque = { x: number; y: number; w: number; h: number; lines: number; current?: boolean }

const TOP: Plaque = { x: 138, y: 20, w: 84, h: 32, lines: 2 }
const POWERS: Plaque[] = [22, 142, 262].map((x) => ({ x, y: 72, w: 76, h: 28, lines: 2 }))
const ROLES: Plaque[] = [
  { x: 82, y: 128, w: 56, h: 46, lines: 3 },
  { x: 152, y: 128, w: 56, h: 46, lines: 0, current: true },
  { x: 222, y: 128, w: 56, h: 46, lines: 3 },
]
const BUST = { cx: 180, cy: 144 }

const side = ({ x, y, w, h }: Plaque) => `${x + w},${y} ${x + w + DEPTH},${y + DEPTH} ${x + w + DEPTH},${y + h + DEPTH} ${x + w},${y + h}`
const bottom = ({ x, y, w, h }: Plaque) => `${x},${y + h} ${x + DEPTH},${y + h + DEPTH} ${x + w + DEPTH},${y + h + DEPTH} ${x + w},${y + h}`
const textLines = ({ x, y, w, lines }: Plaque) =>
  Array.from({ length: lines }, (_, index) => `M${x + 8} ${y + 10 + index * 6}H${x + w - 8 - index * 10}`).join('')

function PlaqueShape({ plaque }: { plaque: Plaque }): JSX.Element {
  return (
    <g>
      <polygon className="dg-hatch" points={side(plaque)} fill={fill('mid')} />
      <polygon className="dg-hatch" points={bottom(plaque)} fill={fill('mid')} />
      <rect className="dg-plaque" fill={plaque.current ? fill('light') : undefined} x={plaque.x} y={plaque.y} width={plaque.w} height={plaque.h} />
      <path className="dg-text" d={textLines(plaque)} />
    </g>
  )
}

export function OrgChartDiagram(): JSX.Element {
  return (
    <svg className="diagram" viewBox="0 0 336 184" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      {/* viewBox con origen en 0 0 (contrato): el recorte del contenido se aplica como traslación. */}
      <g transform="translate(-16 -2)">
        <polygon className="dg-plaque" fill={fill('light')} points={`${TOP.x + 6},${TOP.y} ${TOP.x + TOP.w / 2},${TOP.y - 12} ${TOP.x + TOP.w - 6},${TOP.y}`} />
        <PlaqueShape plaque={TOP} />
        <path className="dg-wire" d={`M180 ${TOP.y + TOP.h + DEPTH}V62M60 62H300M60 62V72M180 62V72M300 62V72`} />
        {POWERS.map((plaque) => (
          <PlaqueShape key={plaque.x} plaque={plaque} />
        ))}
        {/* Los poderes laterales siguen hacia niveles más profundos. */}
        <path className="dg-wire dg-wire--dash" d="M60 104V122M300 104V122" />
        <path className="dg-wire" d="M180 104V118M110 118H250M110 118V128M180 118V128M250 118V128" />
        {ROLES.map((plaque) => (
          <PlaqueShape key={plaque.x} plaque={plaque} />
        ))}
        <g className="dg-accent">
          <circle cx={BUST.cx} cy={BUST.cy} r="6.5" />
          <path d={`M${BUST.cx - 14} 166c0-9 6-14 14-14s14 5 14 14z`} />
        </g>
        <path className="dg-text dg-text--strong" d={`M${BUST.cx - 12} 170H${BUST.cx + 12}`} />
      </g>
    </svg>
  )
}
