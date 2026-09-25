import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch } from './relief'
import { makeIso, rect } from './iso'
import type { Point3 } from './iso'

// Validar: una hoja oficial en el piso con la impresión del sello y, al lado, el sello de goma recién usado. El check
// impreso es el acento sólido: el cambio ya confirmado por una persona.
const ID = 'stamp'
const { iso, poly, topFace, prism } = makeIso([0, 0])

// Hoja apenas girada: u a lo ancho (SHEET.w), v a lo largo (SHEET.d), con origen en su esquina (−w/2, −d/2).
const SHEET = { x: 0, y: 0, w: 80, d: 112, h: 1.6, turn: -8 }
const sheet = prism(rect(SHEET.x, SHEET.y, SHEET.w, SHEET.d, SHEET.turn), 0, SHEET.h)
const [sheetX, sheetY] = rect(SHEET.x, SHEET.y, SHEET.w, SHEET.d, SHEET.turn)[0]
const sheetFace = topFace([sheetX, sheetY, SHEET.h], SHEET.turn)
const sheetShadow = poly(rect(SHEET.x + 3, SHEET.y + 3, SHEET.w + 4, SHEET.d + 4, SHEET.turn).map(([x, y]) => [x, y, 0] as Point3))
const LINES = [24, 30, 36, 42, 48].map((v, index) => `M8 ${v}H${SHEET.w - 8 - (index % 3) * 7}`).join('')

// Impresión: marco del sello (trazo) y check sólido, con el giro leve de un sello puesto a mano.
const PRINT = { u: 46, v: 76, size: 26, turn: -10 }
const CHECK = '4.9,13 8.4,10 11.4,13.2 18.2,5.4 21.4,8.4 11.4,19.6'

// Punto de la hoja (coordenadas locales u, v) llevado al piso.
const onSheet = (u: number, v: number): [number, number] => {
  const a = (SHEET.turn * Math.PI) / 180
  return [sheetX + u * Math.cos(a) - v * Math.sin(a), sheetY + u * Math.sin(a) + v * Math.cos(a)]
}

// Sello de goma recién levantado sobre su impresión, con el mismo giro que la marca: almohadilla de caucho, base,
// cuello cilíndrico y perilla. HOVER es la altura de la cara de caucho sobre la hoja.
const [stampX, stampY] = onSheet(PRINT.u + PRINT.size / 2, PRINT.v + PRINT.size / 2)
const STAMP = { x: stampX, y: stampY, turn: SHEET.turn + PRINT.turn, hover: 28 }
const PAD = prism(rect(STAMP.x, STAMP.y, 28, 28, STAMP.turn), STAMP.hover, 2.4)
const BASE = prism(rect(STAMP.x, STAMP.y, 32, 32, STAMP.turn), STAMP.hover + 2.4, 8)
// Sombra del sello sobre la hoja: la separación entre la goma y el papel que se acaba de sellar.
const stampShadow = poly(rect(STAMP.x + 2, STAMP.y + 2, 30, 30, STAMP.turn).map(([x, y]) => [x, y, SHEET.h] as Point3))
const NECK = { r: 5.2, z0: STAMP.hover + 10.4, h: 30 }
const KNOB = { r: 12, z: STAMP.hover + 49 }

// Cilindro vertical: en esta isométrica un círculo del piso de radio r es una elipse de semiejes r√2 y r√2/2.
function Cylinder({ x, y, z, r, h }: { x: number; y: number; z: number; r: number; h: number }): JSX.Element {
  const [sx, sy] = iso(x, y, z)
  const rx = r * Math.SQRT2
  const ry = rx / 2
  const top = sy - h * 1.118
  const side = `M${sx - rx} ${top}V${sy}A${rx} ${ry} 0 0 0 ${sx + rx} ${sy}V${top}Z`
  return (
    <g>
      <path className="st-under" d={side} />
      <path className="dg-hatch" d={side} fill={hatch(ID, 'mid')} />
      <ellipse className="dg-plaque" cx={sx} cy={top} rx={rx} ry={ry} />
    </g>
  )
}

function Knob(): JSX.Element {
  const [cx, cy] = iso(STAMP.x, STAMP.y, KNOB.z)
  const r = KNOB.r
  return (
    <g>
      <circle className="st-under" cx={cx} cy={cy} r={r} />
      <circle className="st-shade" cx={cx} cy={cy} r={r} fill={hatch(ID, 'mid')} />
      {/* Luz arriba a la izquierda: un disco de papel desplazado deja el rayado solo como medialuna abajo a la derecha. */}
      <circle className="st-under" cx={cx - 2} cy={cy - 2.4} r={r - 2.6} />
      <circle className="st-outline" cx={cx} cy={cy} r={r} />
    </g>
  )
}

function Solid({ solid, light = 'light', mid = 'mid' }: { solid: ReturnType<typeof prism>; light?: 'light' | 'mid' | 'cross'; mid?: 'light' | 'mid' | 'cross' }): JSX.Element {
  return (
    <g>
      {solid.sides.map((side) => (
        <g key={side.points}>
          <polygon className="st-under" points={side.points} />
          <polygon className="dg-hatch" points={side.points} fill={hatch(ID, side.tone === 'left' ? light : mid)} />
        </g>
      ))}
      <polygon className="dg-plaque" points={solid.top} />
    </g>
  )
}

export function StampScene(): JSX.Element {
  return (
    <svg className="diagram scene" viewBox="-126.8 -101.37 253.6 185" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      <polygon className="st-shadow" points={sheetShadow} />
      {/* Hoja */}
      {sheet.sides.map((side) => (
        <polygon key={side.points} className="dg-hatch" points={side.points} fill={hatch(ID, side.tone === 'left' ? 'light' : 'mid')} />
      ))}
      <polygon className="dg-plaque" points={sheet.top} />
      <polygon className="st-shadow" points={stampShadow} />
      <g transform={sheetFace}>
        <path className="st-rule" d={`M8 9H${SHEET.w / 2}M8 14H${SHEET.w / 2 - 10}`} />
        <path className="st-ink" d={LINES} />
        <path className="st-rule" d={`M8 ${SHEET.d - 10}H28`} />
        <g transform={`translate(${PRINT.u} ${PRINT.v}) rotate(${PRINT.turn} ${PRINT.size / 2} ${PRINT.size / 2})`}>
          <g className="st-print">
            <rect className="st-ring" width={PRINT.size} height={PRINT.size} rx="3" />
            <polygon className="dg-accent" points={CHECK} />
          </g>
        </g>
      </g>
      {/* Sello */}
      <g className="st-stamp">
        <Solid solid={PAD} light="cross" mid="cross" />
        <Solid solid={BASE} />
        <Cylinder x={STAMP.x} y={STAMP.y} z={NECK.z0} r={NECK.r} h={NECK.h} />
        <Knob />
      </g>
    </svg>
  )
}
