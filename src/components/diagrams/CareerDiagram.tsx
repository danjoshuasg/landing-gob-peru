import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch, reliefBottom, reliefSide } from './relief'
import type { Rect } from './relief'

// Una regla de tiempo con fichas de cargo clavadas por alfileres. La última es el cargo actual: va rayada y, en la
// regla, el marcador de ubicación en tinta sólida señala "hoy". Sin años ni cifras: solo marcas.
const ID = 'career'
const RULER: Rect = { x: 28, y: 146, w: 296, h: 12 }
const CARD = { w: 52, h: 40 }
const STOPS = [
  { cx: 64, top: 34 },
  { cx: 134, top: 64 },
  { cx: 204, top: 30 },
  { cx: 274, top: 58, current: true },
] as const
const cards = STOPS.map(({ cx, top, ...rest }) => ({
  rect: { x: cx - CARD.w / 2, y: top, w: CARD.w, h: CARD.h } as Rect,
  cx,
  current: 'current' in rest,
}))
const ticks = Array.from({ length: 37 }, (_, index) => RULER.x + 4 + index * 8)
  .map((x, index) => `M${x} ${RULER.y}V${RULER.y + (index % 4 === 0 ? 6 : 3)}`)
  .join('')
const PIN = cards[cards.length - 1].cx

export function CareerDiagram(): JSX.Element {
  return (
    <svg className="diagram" viewBox="0 0 336 184" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      {/* viewBox con origen en 0 0 (contrato): el recorte del contenido se aplica como traslación. */}
      <g transform="translate(-16 -2)">
        <polygon className="dg-hatch" points={reliefSide(RULER)} fill={hatch(ID, 'mid')} />
        <polygon className="dg-hatch" points={reliefBottom(RULER)} fill={hatch(ID, 'mid')} />
        <rect className="dg-plaque" x={RULER.x} y={RULER.y} width={RULER.w} height={RULER.h} />
        <path className="dg-tick" d={ticks} />
        {/* La trayectoria sigue: flecha hacia adelante al final de la regla. */}
        <path className="dg-wire" d={`M${RULER.x + RULER.w + 6} ${RULER.y + RULER.h / 2}H${RULER.x + RULER.w + 20}`} />
        <path className="dg-arrow" d={`M${RULER.x + RULER.w + 16} ${RULER.y + RULER.h / 2 - 4}L${RULER.x + RULER.w + 22} ${RULER.y + RULER.h / 2}L${RULER.x + RULER.w + 16} ${RULER.y + RULER.h / 2 + 4}`} />

        {cards.map(({ rect, cx, current }) => (
          <g key={cx}>
            <path className="dg-wire" d={`M${cx} ${rect.y + rect.h + 4}V${RULER.y - (current ? 12 : 3)}`} />
            <polygon className="dg-hatch" points={reliefSide(rect)} fill={hatch(ID, 'mid')} />
            <polygon className="dg-hatch" points={reliefBottom(rect)} fill={hatch(ID, 'mid')} />
            <rect className="dg-plaque" x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill={current ? hatch(ID, 'light') : undefined} />
            <rect className="dg-plaque" x={rect.x + 7} y={rect.y + 8} width="10" height="10" />
            <path className="dg-text" d={`M${rect.x + 22} ${rect.y + 10}H${rect.x + rect.w - 7}M${rect.x + 22} ${rect.y + 16}H${rect.x + rect.w - 13}M${rect.x + 7} ${rect.y + 27}H${rect.x + rect.w - 9}M${rect.x + 7} ${rect.y + 33}H${rect.x + rect.w - 17}`} />
          </g>
        ))}
        {/* Alfileres de las fichas pasadas, clavados en la regla. */}
        {cards.slice(0, -1).map(({ cx }) => (
          <circle key={cx} className="dg-pin" cx={cx} cy={RULER.y - 2} r="2.6" />
        ))}

        {/* Hoy: marcador de ubicación en tinta sólida sobre la regla. */}
        <g className="dg-accent">
          <path d={`M${PIN} ${RULER.y}c-3-5-7-8-7-12a7 7 0 1 1 14 0c0 4-4 7-7 12z`} />
        </g>
        <circle className="dg-seal-mark" cx={PIN} cy={RULER.y - 12} r="2.4" />
      </g>
    </svg>
  )
}
