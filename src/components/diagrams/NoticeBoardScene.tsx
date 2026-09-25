import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch } from './relief'
import { makeIso, rect } from './iso'
import type { Point3 } from './iso'

// Publicar: un tablero de avisos apoyado sobre dos patas, con la hoja semanal clavada al centro entre notas menores.
// La chincheta de la hoja semanal es el acento sólido: el corte de los lunes, fijado a la vista de todos.
const ID = 'board'
const { iso, poly, prism } = makeIso([0, 0])

// Tablero: W a lo ancho (x), cara de H de alto que mira a +y, inclinada TILT grados hacia atrás desde su borde
// inferior (y = Y0, z = Z0). T es el espesor, hacia −y.
const BOARD = { w: 108, h: 76, t: 4, tilt: 12, y0: 0, z0: 6 }
const tilt = (BOARD.tilt * Math.PI) / 180
const back = BOARD.h * Math.sin(tilt)
const rise = BOARD.h * Math.cos(tilt)
const top = { y: BOARD.y0 - back, z: BOARD.z0 + rise }

const face = poly([
  [0, BOARD.y0, BOARD.z0], [BOARD.w, BOARD.y0, BOARD.z0], [BOARD.w, top.y, top.z], [0, top.y, top.z],
])
const rightEdge = poly([
  [BOARD.w, BOARD.y0, BOARD.z0], [BOARD.w, BOARD.y0 - BOARD.t, BOARD.z0],
  [BOARD.w, top.y - BOARD.t, top.z], [BOARD.w, top.y, top.z],
])
const topEdge = poly([[0, top.y, top.z], [BOARD.w, top.y, top.z], [BOARD.w, top.y - BOARD.t, top.z], [0, top.y - BOARD.t, top.z]])
// Matriz de la cara inclinada: u a lo ancho (x) y v hacia abajo por la cara, con origen en su esquina superior
// izquierda (misma construcción que la pantalla de la laptop en la escena 1).
const faceMatrix = (() => {
  const [tx, ty] = iso(0, top.y, top.z)
  const vx = -Math.sin(tilt)
  const vy = Math.sin(tilt) / 2 + 1.118 * Math.cos(tilt)
  return `matrix(1 .5 ${vx.toFixed(4)} ${vy.toFixed(4)} ${tx} ${ty})`
})()

// Patas: dos tacos sobre el piso que sostienen el borde inferior y se alargan hacia atrás.
const FEET = [16, BOARD.w - 16].map((x) => prism(rect(x, BOARD.y0 - 8, 12, 26, 0), 0, BOARD.z0))
const shadow = poly(rect(BOARD.w / 2 + 3, BOARD.y0 - 8 + 3, BOARD.w + 4, 30, 0).map(([x, y]) => [x, y, 0] as Point3))

// Contenido de la cara (u, v): marco, corcho, hoja semanal y notas menores.
const FRAME = 6
const WEEK = { u: 34, v: 10, w: 40, h: 55, turn: -2.5 }
const DAYS = [0, 1, 2, 3, 4].map((index) => 20 + index * 7.4)
const NOTES = [
  { u: 11, v: 12, w: 19, h: 21, turn: 5 },
  { u: 80, v: 15, w: 19, h: 19, turn: -6 },
  { u: 13, v: 42, w: 17, h: 19, turn: -3 },
  { u: 82, v: 44, w: 15, h: 17, turn: 4 },
] as const

function Pin({ cx, cy, accent = false }: { cx: number; cy: number; accent?: boolean }): JSX.Element {
  return (
    <g>
      <ellipse className="nb-pin-shadow" cx={cx + 1.6} cy={cy + 2} rx={accent ? 4 : 3.2} ry={accent ? 3 : 2.4} />
      <circle className={accent ? 'dg-accent nb-pin' : 'nb-pin--plain'} cx={cx} cy={cy} r={accent ? 4.4 : 2.6} />
    </g>
  )
}

export function NoticeBoardScene(): JSX.Element {
  return (
    <svg className="diagram scene" viewBox="-20.89 -111.61 165.78 185" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      <polygon className="nb-shadow" points={shadow} />
      {FEET.map((foot, index) => (
        <g key={index}>
          {foot.sides.map((side) => (
            <g key={side.points}>
              <polygon className="nb-under" points={side.points} />
              <polygon className="dg-hatch" points={side.points} fill={hatch(ID, side.tone === 'left' ? 'light' : 'mid')} />
            </g>
          ))}
          <polygon className="dg-plaque" points={foot.top} />
        </g>
      ))}
      {/* Tablero: canto derecho, canto superior y cara */}
      <polygon className="nb-under" points={rightEdge} />
      <polygon className="dg-hatch" points={rightEdge} fill={hatch(ID, 'mid')} />
      <polygon className="dg-plaque" points={topEdge} />
      <polygon className="dg-plaque" points={face} />
      <g transform={faceMatrix}>
        <rect className="nb-cork" x={FRAME} y={FRAME} width={BOARD.w - FRAME * 2} height={BOARD.h - FRAME * 2} fill={hatch(ID, 'light')} />
        {NOTES.map((note) => (
          <g key={note.u} transform={`rotate(${note.turn} ${note.u + note.w / 2} ${note.v})`}>
            <rect className="dg-plaque nb-note" x={note.u} y={note.v} width={note.w} height={note.h} />
            <path className="nb-ink" d={[7, 11, 15].filter((y) => y < note.h - 3).map((y) => `M${note.u + 3} ${note.v + y}H${note.u + note.w - 4}`).join('')} />
            <Pin cx={note.u + note.w / 2} cy={note.v + 3} />
          </g>
        ))}
        {/* Hoja semanal: título, y un renglón por día hábil con su casilla. La hoja y su chincheta van en grupos
            propios sin atributo transform: el motion desclava la hoja, la cambia por la nueva y la vuelve a clavar. */}
        <g transform={`rotate(${WEEK.turn} ${WEEK.u + WEEK.w / 2} ${WEEK.v})`}>
          <g className="nb-week">
            <rect className="dg-plaque" x={WEEK.u} y={WEEK.v} width={WEEK.w} height={WEEK.h} />
            <path className="nb-rule" d={`M${WEEK.u + 5} ${WEEK.v + 10}H${WEEK.u + WEEK.w - 12}`} />
            {DAYS.map((y, index) => (
              <g key={y}>
                <rect className="nb-box" x={WEEK.u + 5} y={WEEK.v + y - 2.2} width="4.4" height="4.4" />
                <path className="nb-ink" d={`M${WEEK.u + 13} ${WEEK.v + y}H${WEEK.u + WEEK.w - 5 - (index % 2) * 7}`} />
              </g>
            ))}
            <g className="nb-week-pin">
              <Pin cx={WEEK.u + WEEK.w / 2} cy={WEEK.v + 3.6} accent />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}
