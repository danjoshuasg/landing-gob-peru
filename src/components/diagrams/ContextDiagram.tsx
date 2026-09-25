import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch, reliefBottom, reliefSide } from './relief'
import type { Rect } from './relief'

// La ficha del funcionario al centro y, separadas a su alrededor, sus fuentes: la resolución (izquierda), un
// periódico (derecha, arriba) y la declaración jurada (derecha, abajo), unidas a la ficha por conectores punteados
// en codo. El acento es la insignia de verificado de la ficha: un escudo en tinta sólida con su check.
const ID = 'context'
const CARD: Rect = { x: 196, y: 54, w: 104, h: 84 }
const RESOLUTION: Rect = { x: 40, y: 24, w: 88, h: 136 }
const PAPER: Rect = { x: 372, y: 18, w: 140, h: 70 }
const DECLARATION: Rect = { x: 384, y: 106, w: 116, h: 62 }

const pieces = [CARD, RESOLUTION, PAPER, DECLARATION]
const cardMid = CARD.y + CARD.h / 2

// Conectores en codo desde los bordes de la ficha hasta cada fuente (terminan en un punto sobre la fuente).
const CONNECTORS = [
  { d: `M${CARD.x} ${cardMid}H${RESOLUTION.x + RESOLUTION.w + 4}`, end: [RESOLUTION.x + RESOLUTION.w + 4, cardMid] },
  { d: `M${CARD.x + CARD.w + 4} ${CARD.y + 22}H${340}V${PAPER.y + PAPER.h / 2}H${PAPER.x}`, end: [PAPER.x, PAPER.y + PAPER.h / 2] },
  { d: `M${CARD.x + CARD.w + 4} ${CARD.y + CARD.h - 20}H${354}V${DECLARATION.y + DECLARATION.h / 2}H${DECLARATION.x}`, end: [DECLARATION.x, DECLARATION.y + DECLARATION.h / 2] },
] as const

const resolutionLines = [52, 60, 68, 76, 84, 92, 100, 108]
  .map((y, index) => `M${RESOLUTION.x + 10} ${y}H${RESOLUTION.x + RESOLUTION.w - 10 - (index % 3) * 9}`)
  .join('')
const paperColumns = [0, 1, 2].map((column) => PAPER.x + 42 + column * 32)
const paperLines = paperColumns
  .map((x, column) => [44, 51, 58, 65, 72].map((y, index) => `M${x} ${y}H${x + 26 - ((index + column) % 3) * 5}`).join(''))
  .join('')
const declarationLines = [118, 125, 132].map((y, index) => `M${DECLARATION.x + 22} ${y}H${DECLARATION.x + DECLARATION.w - 12 - index * 12}`).join('')
const SHIELD = { cx: CARD.x + CARD.w - 4, cy: CARD.y + 4 }
const shield = `M${SHIELD.cx} ${SHIELD.cy - 11}l10 4v7c0 7-5 11-10 13c-5-2-10-6-10-13v-7z`

export function ContextDiagram(): JSX.Element {
  return (
    <svg className="diagram" viewBox="0 0 494 172" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      {/* viewBox con origen en 0 0 (contrato): el recorte del contenido se aplica como traslación. */}
      <g transform="translate(-28 -6)">
        {CONNECTORS.map(({ d }) => (
          <path key={d} className="dg-wire dg-wire--dash" d={d} />
        ))}

        {pieces.map((piece) => (
          <g key={`${piece.x}-${piece.y}`}>
            <polygon className="dg-hatch" points={reliefSide(piece)} fill={hatch(ID, 'mid')} />
            <polygon className="dg-hatch" points={reliefBottom(piece)} fill={hatch(ID, 'mid')} />
            <rect className="dg-plaque" x={piece.x} y={piece.y} width={piece.w} height={piece.h} />
          </g>
        ))}

        {/* Ficha: retrato en contorno y datos. */}
        <rect className="dg-plaque" x={CARD.x + 10} y={CARD.y + 12} width="26" height="30" />
        <circle className="dg-outline" cx={CARD.x + 23} cy={CARD.y + 23} r="6" />
        <path className="dg-outline" d={`M${CARD.x + 14} ${CARD.y + 42}c0-6 4-9 9-9s9 3 9 9`} />
        <path className="dg-text" d={`M${CARD.x + 44} ${CARD.y + 18}H${CARD.x + CARD.w - 18}M${CARD.x + 44} ${CARD.y + 26}H${CARD.x + CARD.w - 26}M${CARD.x + 10} ${CARD.y + 54}H${CARD.x + CARD.w - 10}M${CARD.x + 10} ${CARD.y + 62}H${CARD.x + CARD.w - 18}M${CARD.x + 10} ${CARD.y + 70}H${CARD.x + CARD.w - 30}`} />

        {/* Resolución: encabezado, renglones y sello en contorno. */}
        <path className="dg-text dg-text--strong" d={`M${RESOLUTION.x + 10} ${RESOLUTION.y + 12}H${RESOLUTION.x + 56}`} />
        <path className="dg-text" d={resolutionLines} />
        <circle className="dg-seal-ring" cx={RESOLUTION.x + RESOLUTION.w - 22} cy={RESOLUTION.y + RESOLUTION.h - 20} r="10" />

        {/* Periódico: cabecera entre filetes, foto y columnas. */}
        <path className="dg-rule" d={`M${PAPER.x + 8} ${PAPER.y + 8}H${PAPER.x + PAPER.w - 8}M${PAPER.x + 8} ${PAPER.y + 19}H${PAPER.x + PAPER.w - 8}`} />
        <rect className="dg-cell" x={PAPER.x + 40} y={PAPER.y + 10.5} width={PAPER.w - 80} height="6" fill={hatch(ID, 'mid')} />
        <rect className="dg-plaque" x={PAPER.x + 8} y={PAPER.y + 25} width="28" height="36" fill={hatch(ID, 'light')} />
        <path className="dg-text" d={paperLines} />

        {/* Declaración jurada: casilla marcada, renglones y firma. */}
        <rect className="dg-plaque" x={DECLARATION.x + 8} y={DECLARATION.y + 8} width="8" height="8" />
        <path className="dg-mark" d={`M${DECLARATION.x + 9.5} ${DECLARATION.y + 12}l2 2l3.5 -4`} />
        <path className="dg-text" d={declarationLines} />
        <path className="dg-signature" d={`M${DECLARATION.x + 12} ${DECLARATION.y + 48}c6-8 10 4 14-2s6 6 11 0s8 3 13-1`} />
        <path className="dg-text" d={`M${DECLARATION.x + 10} ${DECLARATION.y + 52}H${DECLARATION.x + 62}`} />

        {/* Puntos de llegada de los conectores sobre cada fuente. */}
        {CONNECTORS.map(({ end: [x, y] }) => (
          <circle key={`${x}-${y}`} className="dg-pin" cx={x} cy={y} r="2.4" />
        ))}

        {/* Insignia de verificado de la ficha: el acento. */}
        <g className="dg-accent">
          <path d={shield} />
        </g>
        <path className="dg-seal-mark" d={`M${SHIELD.cx - 4} ${SHIELD.cy + 1}l3 3l5.5 -6`} />
      </g>
    </svg>
  )
}
