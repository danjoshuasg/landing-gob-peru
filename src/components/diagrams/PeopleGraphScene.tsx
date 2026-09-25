import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch } from './relief'
import { makeIso } from './iso'
import type { Point2 } from './iso'

// Una lectura común: el organigrama como un grafo de personas. Figuras de persona (base, torso y cabeza, simétricas
// al girar, así que se dibujan de frente sin romper la isométrica) con un chip de cargo encima, unidas por aristas a la
// altura del torso: una raíz al fondo, dos en el segundo nivel y cuatro al frente. La persona que se rastrea va en tinta
// sólida, con su chip sólido y un anillo en la base: el resultado del árbol de búsqueda.
const ID = 'people'
const { iso } = makeIso([200, 158])

// Filas con x + y constante: en isométrica quedan horizontales en pantalla.
const along = (sum: number, spread: number): Point2 => [sum / 2 + spread / 2, sum / 2 - spread / 2]

type Node = { key: string; at: Point2; scale: number; accent?: boolean }
const NODES: Node[] = [
  { key: 'root', at: along(-118, 0), scale: 1.3 },
  { key: 'a', at: along(-30, -100), scale: 1.15 },
  { key: 'b', at: along(-30, 100), scale: 1.15 },
  { key: 'a1', at: along(62, -156), scale: 1.02 },
  { key: 'a2', at: along(62, -52), scale: 1.02, accent: true },
  { key: 'b1', at: along(62, 52), scale: 1.02 },
  { key: 'b2', at: along(62, 156), scale: 1.02 },
]
const EDGES = [['root', 'a'], ['root', 'b'], ['a', 'a1'], ['a', 'a2'], ['b', 'b1'], ['b', 'b2']] as const
const byKey = Object.fromEntries(NODES.map((node) => [node.key, node]))
// De atrás hacia adelante: la profundidad crece con x + y.
const ORDER = [...NODES].sort((a, b) => a.at[0] + a.at[1] - (b.at[0] + b.at[1]))

// Centro del torso en pantalla: las aristas se unen ahí y el torso (pintado después) tapa su extremo.
const TORSO_MID = 11
const chest = (node: Node): Point2 => {
  const [x, y] = iso(...node.at)
  return [x, y - TORSO_MID * node.scale]
}

// Figura de persona con su punto de apoyo en (0, 0); el grupo interior es el que crece en el motion.
function Person({ node }: { node: Node }): JSX.Element {
  const [px, py] = iso(...node.at)
  const s = node.scale
  // Sólidos en isométrica: toda sección horizontal circular se ve como elipse 2:1.
  const baseRx = 15 * s
  const baseRy = baseRx / 2
  const body = { rx: 9.5 * s, h: 21 * s }
  const bodyRy = body.rx / 2
  // Cilindro del cuerpo: costado entre la tapa (hombros) y el borde inferior delantero, apoyado en la base.
  const side = `M${-body.rx} ${-body.h}V0A${body.rx} ${bodyRy} 0 0 0 ${body.rx} 0V${-body.h}A${body.rx} ${bodyRy} 0 0 1 ${-body.rx} ${-body.h}Z`
  const sideLeft = `M${-body.rx} ${-body.h}V0A${body.rx} ${bodyRy} 0 0 0 0 ${bodyRy}V${-body.h + bodyRy}A${body.rx} ${bodyRy} 0 0 1 ${-body.rx} ${-body.h}Z`
  // Hombros: cúpula sobre el cilindro (arco superior y el borde delantero de la tapa); la cabeza se apoya encima.
  const domeH = 0.6 * body.rx
  const dome = `M${-body.rx} ${-body.h}A${body.rx} ${domeH} 0 0 1 ${body.rx} ${-body.h}A${body.rx} ${bodyRy} 0 0 1 ${-body.rx} ${-body.h}Z`
  const domeRight = `M0 ${-body.h - domeH}A${body.rx} ${domeH} 0 0 1 ${body.rx} ${-body.h}A${body.rx} ${bodyRy} 0 0 1 0 ${-body.h + bodyRy}Z`
  const head = { cy: -body.h - domeH - 6 * s, r: 7.5 * s }
  const chip = { w: 30, h: 10, y: head.cy - head.r - 15 }
  const tone = node.accent ? 'accent' : 'plain'
  return (
    <g transform={`translate(${px} ${py})`}>
      <ellipse className="pg-shadow" cx={2 * s} cy={1.5 * s} rx={baseRx + 3} ry={baseRy + 1.5} />
      <g className={`pg-grow pg-grow--${node.key}`}>
        {/* Base con espesor: canto rayado y tapa. */}
        <path className="pg-under" d={`M${-baseRx} 0V${3 * s}A${baseRx} ${baseRy} 0 0 0 ${baseRx} ${3 * s}V0Z`} />
        <path className="dg-hatch" d={`M${-baseRx} 0V${3 * s}A${baseRx} ${baseRy} 0 0 0 ${baseRx} ${3 * s}V0Z`} fill={hatch(ID, 'mid')} />
        <ellipse className="dg-plaque" cx="0" cy="0" rx={baseRx} ry={baseRy} />
        {/* Marca de visita del árbol de búsqueda (apagada en reposo). */}
        {[node].filter((n) => !n.accent).map((n) => (
          <ellipse key={n.key} className={`pg-visit pg-visit--${n.key}`} cx="0" cy="0" rx={baseRx + 4} ry={baseRy + 2} />
        ))}
        {[node].filter((n) => n.accent).map((n) => (
          <ellipse key={n.key} className="pg-ring" cx="0" cy="0" rx={baseRx + 5} ry={baseRy + 2.5} />
        ))}
        {/* Cuerpo cilíndrico: cara curva en sombra (derecha) e iluminada (izquierda), tapa de hombros clara. */}
        {/* Capa opaca de papel bajo los rayados: las aristas no se transparentan a través del cuerpo. */}
        <path className="pg-under" d={side} />
        <path className={`pg-body pg-body--${tone}`} d={side} fill={node.accent ? undefined : hatch(ID, 'mid')} />
        <path className={`pg-light pg-light--${tone}`} d={sideLeft} fill={node.accent ? undefined : hatch(ID, 'light')} />
        <path className="pg-outline" d={side} />
        <path className={`pg-cap pg-cap--${tone}`} d={dome} />
        <path className={`pg-dome-shade pg-dome-shade--${tone}`} d={domeRight} fill={node.accent ? undefined : hatch(ID, 'mid')} />
        <path className="pg-outline" d={dome} />
        {/* Cabeza esférica: creciente de sombra a la derecha. */}
        <circle className={`pg-head pg-head--${tone}`} cx="0" cy={head.cy} r={head.r} />
        <path className={`pg-head-shade pg-head-shade--${tone}`} d={`M${head.r * 0.2} ${head.cy - head.r * 0.98}A${head.r} ${head.r} 0 0 1 ${head.r * 0.2} ${head.cy + head.r * 0.98}A${head.r * 0.62} ${head.r} 0 0 0 ${head.r * 0.2} ${head.cy - head.r * 0.98}Z`} fill={node.accent ? undefined : hatch(ID, 'mid')} />
        <circle className="pg-outline" cx="0" cy={head.cy} r={head.r} />
        {/* Chip de cargo sobre la cabeza: punto y dos renglones; sólido en la persona rastreada. */}
        <rect className={`pg-chip pg-chip--${tone}`} x={-chip.w / 2} y={chip.y} width={chip.w} height={chip.h} rx={chip.h / 2} />
        <circle className={`pg-chip-dot pg-chip-dot--${tone}`} cx={-chip.w / 2 + 5} cy={chip.y + chip.h / 2} r="1.8" />
        <path className={`pg-chip-ink pg-chip-ink--${tone}`} d={`M${-chip.w / 2 + 10} ${chip.y + 3.6}H${chip.w / 2 - 5}M${-chip.w / 2 + 10} ${chip.y + 6.6}H${chip.w / 2 - 10}`} />
      </g>
    </g>
  )
}

export function PeopleGraphScene(): JSX.Element {
  return (
    <svg className="diagram scene" viewBox="0 0 400 240" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      {/* Cada arista se pinta después de la persona de la que sale (atrás) y antes de la que llega (adelante): nace de
          su pecho, con un punto de enganche, y entra en el torso de la otra a media altura. */}
      {ORDER.map((node) => (
        <g key={node.key}>
          {/* La persona encontrada: debajo su versión normal (con marca de visita) y encima la pintada, que el motion
              despinta al empezar la búsqueda y vuelve a pintar al encontrarla. */}
          <Person node={{ ...node, accent: false }} />
          {[node].filter((n) => n.accent).map((n) => (
            <g key={n.key} className="pg-paint">
              <Person node={n} />
            </g>
          ))}
          {EDGES.filter(([from]) => from === node.key).map(([from, to]) => {
            const [x1, y1] = chest(byKey[from])
            const [x2, y2] = chest(byKey[to])
            return (
              <g key={to} className={`pg-edge pg-edge--${to}`}>
                <path className="pg-edge-line" d={`M${x1} ${y1}L${x2} ${y2}`} />
                <path className={`pg-trail pg-trail--${to}`} d={`M${x1} ${y1}L${x2} ${y2}`} />
                <circle className="pg-socket" cx={x1} cy={y1} r="2.2" />
              </g>
            )
          })}
        </g>
      ))}
    </svg>
  )
}
