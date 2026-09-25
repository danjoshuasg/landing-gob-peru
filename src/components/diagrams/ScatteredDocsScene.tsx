import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch } from './relief'
import { makeIso, rect } from './iso'
import type { Point2, Point3 } from './iso'

// Información dispersa: una carpeta, un periódico doblado, una laptop abierta y mini resmas repartidas en el piso,
// con giros distintos. Una sola resma lleva la pestaña sólida: el dato que se busca, perdido entre lo demás.
const ID = 'scattered'
const { iso, poly, topFace, prism } = makeIso([210, 124])

type Kind = 'ream' | 'folder' | 'paper'
type Item = { key: string; kind: Kind; x: number; y: number; w: number; d: number; turn: number; h: number; accent?: boolean }

const ITEMS: Item[] = [
  { key: 'folder', kind: 'folder', x: -112, y: -48, w: 70, d: 50, turn: -12, h: 5 },
  { key: 'paper', kind: 'paper', x: 42, y: -88, w: 64, d: 44, turn: 16, h: 2.4 },
  { key: 'r1', kind: 'ream', x: -108, y: 46, w: 36, d: 48, turn: 20, h: 10 },
  { key: 'r2', kind: 'ream', x: -6, y: 84, w: 36, d: 48, turn: -10, h: 8 },
  { key: 'r3', kind: 'ream', x: 104, y: 62, w: 36, d: 48, turn: 28, h: 9, accent: true },
]

// Laptop sin giro: base de LAPTOP.w × LAPTOP.d y pantalla abierta hacia atrás SCREEN.tilt grados desde la bisagra
// (borde trasero de la base).
const LAPTOP = { x: -12, y: -8, w: 72, d: 48, h: 3 }
const SCREEN = { h: 46, tilt: 15, t: 2 }
const tilt = (SCREEN.tilt * Math.PI) / 180
const back = SCREEN.h * Math.sin(tilt)
const rise = SCREEN.h * Math.cos(tilt)
const hinge = { y: LAPTOP.y, z: LAPTOP.h }
const screenFront = poly([
  [LAPTOP.x, hinge.y, hinge.z], [LAPTOP.x + LAPTOP.w, hinge.y, hinge.z],
  [LAPTOP.x + LAPTOP.w, hinge.y - back, hinge.z + rise], [LAPTOP.x, hinge.y - back, hinge.z + rise],
])
const screenEdge = poly([
  [LAPTOP.x + LAPTOP.w, hinge.y, hinge.z], [LAPTOP.x + LAPTOP.w, hinge.y - SCREEN.t, hinge.z],
  [LAPTOP.x + LAPTOP.w, hinge.y - SCREEN.t - back, hinge.z + rise], [LAPTOP.x + LAPTOP.w, hinge.y - back, hinge.z + rise],
])
// Matriz de la cara inclinada de la pantalla: u a lo ancho (x) y v hacia abajo por la cara, con origen en su esquina
// superior izquierda. Así la interfaz se dibuja en coordenadas planas de la pantalla.
const screenMatrix = (() => {
  const [tx, ty] = iso(LAPTOP.x, hinge.y - back, hinge.z + rise)
  const vx = -Math.sin(tilt)
  const vy = Math.sin(tilt) / 2 + 1.118 * Math.cos(tilt)
  return `matrix(1 .5 ${vx.toFixed(4)} ${vy.toFixed(4)} ${tx} ${ty})`
})()
// Interfaz de búsqueda de funcionarios: barra con lupa y tres resultados (avatar, nombre y cargo); el primero,
// enmarcado como seleccionado. Sin tinta sólida: el acento de la escena es la pestaña de la resma.
const UI = { w: LAPTOP.w, h: SCREEN.h }
const RESULTS = [22, 30.5, 39] as const

const base = prism(rect(LAPTOP.x + LAPTOP.w / 2, LAPTOP.y + LAPTOP.d / 2, LAPTOP.w, LAPTOP.d, 0), 0, LAPTOP.h)
const baseFace = topFace([LAPTOP.x, LAPTOP.y, LAPTOP.h])
const KEYS = Array.from({ length: 4 }, (_, row) => `M8 ${8 + row * 6}H${LAPTOP.w - 8}`).join('')

// De atrás hacia adelante: la profundidad en isométrica crece con x + y. La laptop entra en su lugar del orden.
const LAPTOP_DEPTH = LAPTOP.x + LAPTOP.w / 2 + LAPTOP.y + LAPTOP.d / 2
const ORDER = [...ITEMS.map((item) => ({ depth: item.x + item.y, item })), { depth: LAPTOP_DEPTH, item: null }]
  .sort((a, b) => a.depth - b.depth)

const shadowOf = (x: number, y: number, w: number, d: number, turn: number) =>
  poly(rect(x + 3, y + 3, w + 4, d + 4, turn).map(([px, py]) => [px, py, 0] as Point3))

// Contenido del techo en coordenadas locales de la pieza (u a lo ancho, v a lo profundo).
function Content({ item }: { item: Item }): JSX.Element {
  const { w, d } = item
  if (item.kind === 'paper') {
    const columns = [0, 1, 2].map((column) => 8 + column * 19)
    return (
      <>
        <path className="sc-rule" d={`M5 6H${w - 5}M5 13H${w - 5}`} />
        <path className="sc-ink" d={columns.map((x) => [19, 24, 29, 34].map((y) => `M${x} ${y}H${x + 14}`).join('')).join('')} />
        <path className="sc-fold" d={`M${w / 2} 2V${d - 2}`} />
      </>
    )
  }
  if (item.kind === 'folder') return <rect className="sc-label" x={w / 2 - 14} y={d / 2 - 6} width="28" height="12" rx="1.5" />
  return <path className="sc-ink" d={[7, 13, 19, 25, 31, 37].map((y, index) => `M6 ${y}H${w - 6 - (index % 3) * 6}`).join('')} />
}

// Resma desordenada: una pila de hojas sueltas, cada una con su pequeño giro y desplazamiento, de abajo hacia arriba.
const SHEET_H = 1.4
const JITTER = [
  { dx: -5, dy: 3, turn: -12 },
  { dx: 4, dy: -3, turn: 9 },
  { dx: -2, dy: 5, turn: -5 },
  { dx: 5, dy: 1, turn: 12 },
  { dx: -4, dy: -4, turn: -8 },
  { dx: 2, dy: 3, turn: 6 },
  { dx: 0, dy: 0, turn: 0 },
] as const
const sheetsOf = (item: Item) => {
  const count = Math.max(2, Math.round(item.h / 1.5))
  return JITTER.slice(JITTER.length - count).map((jitter, index) => ({ ...jitter, z: index * SHEET_H }))
}

function Piece({ item }: { item: Item }): JSX.Element {
  const stack = item.kind === 'ream' ? sheetsOf(item) : [{ dx: 0, dy: 0, turn: 0, z: 0 }]
  const top = stack[stack.length - 1]
  const height = item.kind === 'ream' ? SHEET_H : item.h
  const corners: Point2[] = rect(item.x + top.dx, item.y + top.dy, item.w, item.d, item.turn + top.turn)
  const [cx, cy] = corners[0]
  const face = topFace([cx, cy, top.z + height], item.turn + top.turn)
  const sheet = ({ dx, dy, turn, z }: (typeof stack)[number]) => {
    const solid = prism(rect(item.x + dx, item.y + dy, item.w, item.d, item.turn + turn), z, height)
    return (
      <g key={z}>
        {solid.sides.map((side) => (
          <polygon key={side.points} className="dg-hatch" points={side.points} fill={hatch(ID, side.tone === 'left' ? 'light' : 'mid')} />
        ))}
        <polygon className="dg-plaque" points={solid.top} fill={item.kind === 'folder' ? hatch(ID, 'light') : undefined} />
      </g>
    )
  }
  // La hoja superior, con su contenido (y en una resma la pestaña), va en su propio grupo sin atributo transform:
  // el motion la levanta y la desliza. El periódico entero es una sola "hoja superior".
  return (
    <g>
      {stack.slice(0, -1).map(sheet)}
      <g className={`sc-top sc-top--${item.key}`}>
        {sheet(top)}
        {[item].filter((it) => it.kind === 'folder').map((it) => (
          <polygon key={it.key} className="dg-plaque" transform={face} points="8,0 10,-7 30,-7 32,0" />
        ))}
        <g transform={face}>
          <Content item={item} />
          {/* El dato buscado: pestaña sólida que sobresale de la hoja superior de una sola resma. */}
          {[item].filter((it) => it.accent).map((it) => (
            <rect key={it.key} className="dg-accent sc-found" x={it.w - 4} y="10" width="14" height="10" rx="1.4" />
          ))}
        </g>
      </g>
    </g>
  )
}

function Laptop(): JSX.Element {
  return (
    <g>
      {base.sides.map((side) => (
        <polygon key={side.points} className="dg-hatch" points={side.points} fill={hatch(ID, side.tone === 'left' ? 'light' : 'mid')} />
      ))}
      <polygon className="dg-plaque" points={base.top} />
      <path className="sc-ink" transform={baseFace} d={KEYS} />
      <rect className="sc-label" transform={baseFace} x={LAPTOP.w / 2 - 11} y={LAPTOP.d - 13} width="22" height="9" rx="1.5" />
      <polygon className="dg-hatch" points={screenEdge} fill={hatch(ID, 'mid')} />
      <polygon className="dg-plaque" points={screenFront} />
      <g transform={screenMatrix}>
        <rect className="sc-panel" x="4" y="3.5" width={UI.w - 8} height={UI.h - 7} rx="1.5" />
        <rect className="sc-search" x="9" y="6.5" width={UI.w - 18} height="6" rx="3" />
        <circle className="sc-lens" cx="13.5" cy="9.5" r="1.6" />
        <path className="sc-lens" d="M14.6 10.6l1.5 1.5" />
        <path className="sc-ink sc-ink--screen sc-query" d={`M19 9.5H${UI.w - 34}`} />
        <rect className="sc-selected" x="8" y={RESULTS[0] - 4} width={UI.w - 16} height="8.5" rx="1.5" />
        {RESULTS.map((y, index) => (
          <g key={y} className={`sc-result sc-result--${index + 1}`}>
            <circle className="sc-avatar" cx="13" cy={y + 0.5} r="2.4" />
            <path className="sc-ink sc-ink--screen" d={`M18 ${y - 0.8}H${UI.w - 24}M18 ${y + 1.8}H${UI.w - 34}`} />
          </g>
        ))}
      </g>
    </g>
  )
}

export function ScatteredDocsScene(): JSX.Element {
  return (
    <svg className="diagram scene" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      <g className="sc-shadows">
        {ITEMS.map(({ key, x, y, w, d, turn }) => (
          <polygon key={key} className="sc-shadow" points={shadowOf(x, y, w, d, turn)} />
        ))}
        <polygon className="sc-shadow" points={shadowOf(LAPTOP.x + LAPTOP.w / 2, LAPTOP.y + LAPTOP.d / 2, LAPTOP.w, LAPTOP.d, 0)} />
      </g>
      {ORDER.map(({ item }) => (item ? <Piece key={item.key} item={item} /> : <Laptop key="laptop" />))}
    </svg>
  )
}
