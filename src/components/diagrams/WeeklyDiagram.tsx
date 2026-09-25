import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch, reliefBottom, reliefSide } from './relief'
import type { Rect } from './relief'

// Calendario de escritorio con la semana: el lunes (día de corte) lleva el disco en tinta sólida y, en su columna, los
// renglones del resumen que se publica; de martes a viernes, marcas de alta, baja y rotación; el fin de semana, rayado
// (no se valida). A la izquierda, el talón del resumen semanal, con la flecha que sale de la columna del lunes.
const ID = 'weekly'
const BOARD: Rect = { x: 216, y: 36, w: 280, h: 132 }
const COL = BOARD.w / 7
const HEAD = { y: BOARD.y + 8, h: 14 }
const DAYS_Y = BOARD.y + 30
const CELLS = { y: BOARD.y + 44, h: BOARD.h - 52 }
const RINGS = [251, 291, 331, 381, 421, 461]
const SHEET: Rect = { x: 56, y: 46, w: 112, h: 112 }

type Mark = 'up' | 'down' | 'swap'
// Marcas por día (martes a viernes). Solo formas, sin cifras ni textos.
const WEEK: Mark[][] = [['up', 'down'], ['up'], ['swap'], ['down', 'up']]
const ROWS: Mark[] = ['up', 'down', 'swap', 'up', 'down']

const arrow = (mark: Mark, x: number, y: number) => {
  if (mark === 'up') return `M${x} ${y + 5}V${y - 5}M${x - 3} ${y - 2}L${x} ${y - 5}L${x + 3} ${y - 2}`
  if (mark === 'down') return `M${x} ${y - 5}V${y + 5}M${x - 3} ${y + 2}L${x} ${y + 5}L${x + 3} ${y + 2}`
  return `M${x - 6} ${y - 2.5}H${x + 5}M${x + 2} ${y - 5}L${x + 5} ${y - 2.5}L${x + 2} ${y}M${x + 6} ${y + 2.5}H${x - 5}M${x - 2} ${y}L${x - 5} ${y + 2.5}L${x - 2} ${y + 5}`
}
const cellMarks = WEEK.map((marks, day) => {
  const cx = BOARD.x + COL * (day + 1) + COL / 2
  return marks.map((mark, index) => arrow(mark, cx + (index - (marks.length - 1) / 2) * 12, CELLS.y + 28)).join('')
}).join('')
const grid = Array.from({ length: 6 }, (_, index) => `M${BOARD.x + COL * (index + 1)} ${DAYS_Y - 6}V${CELLS.y + CELLS.h}`).join('')
const dayTicks = Array.from({ length: 6 }, (_, index) => {
  const cx = BOARD.x + COL * (index + 1) + COL / 2
  return `M${cx - 6} ${DAYS_Y}H${cx + 6}`
}).join('')
const MONDAY_LINES = [0, 1, 2, 3]
  .map((index) => `M${BOARD.x + 9} ${CELLS.y + 16 + index * 12}H${BOARD.x + COL - 9 - (index % 2) * 7}`)
  .join('')
const ARROW_Y = CELLS.y + 34
const sheetRows = ROWS.map((mark, index) => {
  const y = SHEET.y + 26 + index * 17
  return { mark: arrow(mark, SHEET.x + 14, y), line: `M${SHEET.x + 26} ${y}H${SHEET.x + SHEET.w - 12 - (index % 3) * 12}` }
})

export function WeeklyDiagram(): JSX.Element {
  return (
    <svg className="diagram" viewBox="0 0 470 154" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      {/* viewBox con origen en 0 0 (contrato): el recorte del contenido se aplica como traslación. */}
      <g transform="translate(-44 -24)">
        <polygon className="dg-hatch" points={reliefSide(BOARD)} fill={hatch(ID, 'mid')} />
        <polygon className="dg-hatch" points={reliefBottom(BOARD)} fill={hatch(ID, 'mid')} />
        <rect className="dg-plaque" x={BOARD.x} y={BOARD.y} width={BOARD.w} height={BOARD.h} />
        <rect className="dg-plaque" x={BOARD.x + 8} y={HEAD.y} width={BOARD.w - 16} height={HEAD.h} fill={hatch(ID, 'mid')} />
        {/* Fin de semana rayado: no se valida. */}
        <rect className="dg-cell" x={BOARD.x + COL * 5} y={CELLS.y} width={COL * 2} height={CELLS.h} fill={hatch(ID, 'light')} />
        <path className="dg-grid" d={`${grid}M${BOARD.x} ${CELLS.y}H${BOARD.x + BOARD.w}`} />
        <path className="dg-text" d={dayTicks} />
        <path className="dg-mark" d={cellMarks} />
        {/* Anillas de la encuadernación sobre el borde superior. */}
        {RINGS.map((x) => (
          <rect key={x} className="dg-ring" x={x - 3} y={BOARD.y - 7} width="6" height="13" rx="3" />
        ))}

        {/* Lunes: día de corte. */}
        <g className="dg-accent">
          <circle cx={BOARD.x + COL / 2} cy={DAYS_Y} r="7" />
        </g>
        <path className="dg-seal-mark" d={`M${BOARD.x + COL / 2 - 3} ${DAYS_Y}l2 2l4 -4.5`} />

        {/* El lunes publica: renglones del resumen en su columna y flecha hacia el talón. */}
        <path className="dg-text dg-text--strong" d={MONDAY_LINES} />
        <path className="dg-wire" d={`M${BOARD.x - 6} ${ARROW_Y}H${SHEET.x + SHEET.w + 14}`} />
        <path className="dg-arrow" d={`M${SHEET.x + SHEET.w + 16} ${ARROW_Y - 4}L${SHEET.x + SHEET.w + 10} ${ARROW_Y}L${SHEET.x + SHEET.w + 16} ${ARROW_Y + 4}`} />

        <polygon className="dg-hatch" points={reliefSide(SHEET)} fill={hatch(ID, 'mid')} />
        <polygon className="dg-hatch" points={reliefBottom(SHEET)} fill={hatch(ID, 'mid')} />
        <rect className="dg-plaque" x={SHEET.x} y={SHEET.y} width={SHEET.w} height={SHEET.h} />
        <path className="dg-perforation" d={`M${SHEET.x + 4} ${SHEET.y + 10}H${SHEET.x + SHEET.w - 4}`} />
        {sheetRows.map(({ mark, line }) => (
          <g key={line}>
            <path className="dg-mark" d={mark} />
            <path className="dg-text" d={line} />
          </g>
        ))}
      </g>
    </svg>
  )
}
