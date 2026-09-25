import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch, reliefBottom, reliefSide } from './relief'
import type { Rect } from './relief'

// La ficha del funcionario unida por un eslabón a la resolución que respalda su cargo. Detrás de la resolución, su
// copia archivada; en su pie, el sello en tinta sólida: la prueba.
const ID = 'proof'
const CARD: Rect = { x: 36, y: 52, w: 92, h: 104 }
const DOC: Rect = { x: 196, y: 24, w: 112, h: 148 }
const COPY: Rect = { x: DOC.x + 8, y: DOC.y + 8, w: DOC.w, h: DOC.h }
const FOLD = 16
const SEAL = { cx: 278, cy: 148, r: 12 }
const LINK_Y = CARD.y + CARD.h / 2

const docOutline = `M${DOC.x} ${DOC.y}H${DOC.x + DOC.w - FOLD}L${DOC.x + DOC.w} ${DOC.y + FOLD}V${DOC.y + DOC.h}H${DOC.x}Z`
const docFold = `M${DOC.x + DOC.w - FOLD} ${DOC.y}V${DOC.y + FOLD}H${DOC.x + DOC.w}Z`
const docLines = [56, 64, 72, 80, 88, 96, 104, 112]
  .map((y, index) => `M${DOC.x + 12} ${y}H${DOC.x + DOC.w - 12 - (index % 3) * 9}`)
  .join('')
const cardLines = `M${CARD.x + 42} ${CARD.y + 16}H${CARD.x + CARD.w - 10}M${CARD.x + 42} ${CARD.y + 24}H${CARD.x + CARD.w - 18}M${CARD.x + 42} ${CARD.y + 32}H${CARD.x + CARD.w - 24}M${CARD.x + 10} ${CARD.y + 58}H${CARD.x + CARD.w - 10}M${CARD.x + 10} ${CARD.y + 66}H${CARD.x + CARD.w - 16}M${CARD.x + 10} ${CARD.y + 74}H${CARD.x + CARD.w - 28}`
// Retrato de la ficha en contorno: el acento sólido queda reservado al sello.
const portrait = { cx: CARD.x + 22, cy: CARD.y + 20, r: 7 }

// Enlace: dos eslabones en cápsula, inclinados −30° y cruzados en sus puntas (la forma que se lee como "vínculo").
const LINK = { w: 36, h: 15, angle: -30 }
const LINKS = [
  { cx: 153, cy: LINK_Y + 5 },
  { cx: 177, cy: LINK_Y - 5 },
] as const

export function ProofDiagram(): JSX.Element {
  return (
    <svg className="diagram" viewBox="0 0 336 184" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      {/* viewBox con origen en 0 0 (contrato): el recorte del contenido se aplica como traslación. */}
      <g transform="translate(-16 -2)">
        {/* Copia archivada detrás de la resolución. */}
        <rect className="dg-plaque" x={COPY.x} y={COPY.y} width={COPY.w} height={COPY.h} fill={hatch(ID, 'light')} />

        <polygon className="dg-hatch" points={reliefSide(CARD)} fill={hatch(ID, 'mid')} />
        <polygon className="dg-hatch" points={reliefBottom(CARD)} fill={hatch(ID, 'mid')} />
        <rect className="dg-plaque" x={CARD.x} y={CARD.y} width={CARD.w} height={CARD.h} />
        <rect className="dg-plaque" x={CARD.x + 10} y={CARD.y + 10} width="24" height="28" />
        <circle className="dg-outline" cx={portrait.cx} cy={portrait.cy} r={portrait.r} />
        <path className="dg-outline" d={`M${portrait.cx - 9} ${CARD.y + 38}c0-7 4-10 9-10s9 3 9 10`} />
        <path className="dg-text" d={cardLines} />

        <path className="dg-plaque" d={docOutline} />
        <path className="dg-plaque" d={docFold} fill={hatch(ID, 'mid')} />
        <path className="dg-text dg-text--strong" d={`M${DOC.x + 12} ${DOC.y + 16}H${DOC.x + 66}`} />
        <path className="dg-text" d={docLines} />

        {/* La cadena une la ficha con la norma; sus puntas quedan a pocas unidades de cada hoja. */}
        {LINKS.map(({ cx, cy }) => (
          <g key={cx} transform={`rotate(${LINK.angle} ${cx} ${cy})`}>
            <rect className="dg-link" x={cx - LINK.w / 2} y={cy - LINK.h / 2} width={LINK.w} height={LINK.h} rx={LINK.h / 2} />
            <rect className="dg-link dg-link--inner" x={cx - LINK.w / 2 + 4} y={cy - LINK.h / 2 + 4} width={LINK.w - 8} height={LINK.h - 8} rx={(LINK.h - 8) / 2} />
          </g>
        ))}

        <g className="dg-accent">
          <circle cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r} />
        </g>
        <circle className="dg-seal-ring" cx={SEAL.cx} cy={SEAL.cy} r={SEAL.r + 3.5} />
        <path className="dg-seal-mark" d={`M${SEAL.cx - 5} ${SEAL.cy}l3.5 3.5l6.5 -7`} />
      </g>
    </svg>
  )
}
