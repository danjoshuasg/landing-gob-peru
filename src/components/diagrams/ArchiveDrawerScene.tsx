import type { JSX } from 'react'
import { HatchDefs } from './HatchDefs'
import { hatch } from './relief'
import { makeIso, rect } from './iso'
import type { Point3 } from './iso'

// Consultar: un archivador de tres cajones con el de arriba abierto. Entre las carpetas del cajón sube un documento:
// la hoja sólida es el acento, la fuente oficial que se saca para consultar.
const ID = 'archive'
const { iso, poly, prism } = makeIso([0, 0])

// Mueble: W a lo ancho del frente (y), D de fondo (x) visto desde el costado. El frente con los cajones mira a +x.
const CAB = { w: 48, d: 64, h: 92 }
const DRAWER = { h: 26, inset: 4 }
const DRAWERS = [4, 33, 62] as const
// Cajón superior abierto: sale OPEN unidades en x; el cuerpo es más angosto que el frente.
const OPEN = 34
const FRONT_T = 3
const BODY = { y0: 8, y1: CAB.d - 8, z0: DRAWERS[2] + 2, z1: DRAWERS[2] + 22 }
const FRONT = { x0: CAB.w + OPEN - FRONT_T, x1: CAB.w + OPEN, y0: DRAWER.inset, y1: CAB.d - DRAWER.inset, z0: DRAWERS[2], z1: DRAWERS[2] + DRAWER.h }

// Matriz de una cara vertical que mira a +x: u avanza hacia la derecha (−y) y v baja en z. Origen en la esquina
// superior izquierda de la cara.
const frontMatrix = (x: number, y: number, z: number) => {
  const [tx, ty] = iso(x, y, z)
  return `matrix(1 -.5 0 1.118 ${tx} ${ty})`
}

const body = prism(rect(CAB.w / 2, CAB.d / 2, CAB.w, CAB.d, 0), 0, CAB.h)
// Sombra solo bajo la huella del mueble: el cajón abierto está en el aire.
const shadow = poly(rect(CAB.w / 2 + 3, CAB.d / 2 + 3, CAB.w + 4, CAB.d + 4, 0).map(([x, y]) => [x, y, 0] as Point3))

// Carpetas en planos x = constante, con pestaña arriba; el documento va entre ellas, inclinado hacia afuera.
const FOLDERS = [5, 10, 22, 27].map((dx, index) => ({ x: CAB.w + dx, tab: index % 2 === 0 ? 10 : CAB.d - 34 }))
const DOC = { x: CAB.w + 15, y0: 14, y1: CAB.d - 14, z0: BODY.z0 + 2, z1: 118, lean: 6 }

const folderFace = (x: number, tab: number) => {
  const z1 = BODY.z1 + 4
  return poly([
    [x, 11, BODY.z0], [x, 11, z1], [x, tab, z1], [x, tab + 2, z1 + 4], [x, tab + 12, z1 + 4], [x, tab + 14, z1],
    [x, CAB.d - 11, z1], [x, CAB.d - 11, BODY.z0],
  ])
}

const docFace = poly([
  [DOC.x, DOC.y1, DOC.z0], [DOC.x, DOC.y0, DOC.z0], [DOC.x + DOC.lean, DOC.y0, DOC.z1], [DOC.x + DOC.lean, DOC.y1, DOC.z1],
])
// Matriz de la cara inclinada del documento: u hacia la derecha (−y), v baja por la hoja desde su borde superior.
const docMatrix = (() => {
  const [tx, ty] = iso(DOC.x + DOC.lean, DOC.y1, DOC.z1)
  const rise = DOC.z1 - DOC.z0
  const length = Math.hypot(DOC.lean, rise)
  const vx = -DOC.lean / length
  const vy = -DOC.lean / 2 / length + (1.118 * rise) / length
  return `matrix(1 -.5 ${vx.toFixed(4)} ${vy.toFixed(4)} ${tx} ${ty})`
})()
const NEAR_WALL = poly([[CAB.w, BODY.y1, BODY.z0], [FRONT.x0, BODY.y1, BODY.z0], [FRONT.x0, BODY.y1, BODY.z1], [CAB.w, BODY.y1, BODY.z1]])
const FRONT_SIDE = poly([[FRONT.x0, FRONT.y1, FRONT.z0], [FRONT.x1, FRONT.y1, FRONT.z0], [FRONT.x1, FRONT.y1, FRONT.z1], [FRONT.x0, FRONT.y1, FRONT.z1]])
const DOC_W = DOC.y1 - DOC.y0
const DOC_LINES = [10, 15, 20, 25].map((v, index) => `M5 ${v}H${DOC_W - 5 - (index % 2) * 8}`).join('')

// Frente de un cajón cerrado sobre la cara del mueble: tarjetero arriba y tirador al centro.
function DrawerFront({ z }: { z: number }): JSX.Element {
  const w = CAB.d - DRAWER.inset * 2
  return (
    <g transform={frontMatrix(CAB.w, CAB.d - DRAWER.inset, z + DRAWER.h)}>
      <rect className="dg-plaque" width={w} height={DRAWER.h} />
      <rect className="ar-card" x={w / 2 - 8} y="5" width="16" height="6" />
      <rect className="ar-handle" x={w / 2 - 9} y="15" width="18" height="3.4" rx="1.7" />
    </g>
  )
}

export function ArchiveDrawerScene(): JSX.Element {
  const w = FRONT.y1 - FRONT.y0
  return (
    <svg className="diagram scene" viewBox="-78.55 -113.45 167.1 185" aria-hidden="true" focusable="false">
      <HatchDefs id={ID} />
      <polygon className="ar-shadow" points={shadow} />
      {/* Mueble */}
      {body.sides.map((side) => (
        <polygon key={side.points} className="dg-hatch" points={side.points} fill={hatch(ID, side.tone === 'left' ? 'light' : 'mid')} />
      ))}
      <polygon className="dg-plaque" points={body.top} />
      <DrawerFront z={DRAWERS[0]} />
      <DrawerFront z={DRAWERS[1]} />
      {/* Hueco del cajón superior: el cuerpo sale del mueble */}
      <polygon className="ar-slot" points={poly([[CAB.w, DRAWER.inset, DRAWERS[2]], [CAB.w, CAB.d - DRAWER.inset, DRAWERS[2]], [CAB.w, CAB.d - DRAWER.inset, DRAWERS[2] + DRAWER.h], [CAB.w, DRAWER.inset, DRAWERS[2] + DRAWER.h]])} fill={hatch(ID, 'cross')} />
      {/* Cajón abierto: interior en sombra, carpetas, documento, pared cercana y frente */}
      <g className="ar-drawer">
        <polygon className="dg-plaque" points={poly([[CAB.w, BODY.y0, BODY.z1], [FRONT.x0, BODY.y0, BODY.z1], [FRONT.x0, BODY.y1, BODY.z1], [CAB.w, BODY.y1, BODY.z1]])} />
        <polygon className="dg-hatch" points={poly([[CAB.w, BODY.y0, BODY.z1], [FRONT.x0, BODY.y0, BODY.z1], [FRONT.x0, BODY.y1, BODY.z1], [CAB.w, BODY.y1, BODY.z1]])} fill={hatch(ID, 'mid')} />
        {FOLDERS.filter((folder) => folder.x < DOC.x).map((folder) => (
          <polygon key={folder.x} className="dg-plaque" points={folderFace(folder.x, folder.tab)} />
        ))}
        <g className="ar-doc">
          <polygon className="dg-accent ar-sheet" points={docFace} />
          <path className="ar-doc-ink" transform={docMatrix} d={`M5 5H${DOC_W / 2}${DOC_LINES}`} />
        </g>
        {FOLDERS.filter((folder) => folder.x > DOC.x).map((folder) => (
          <polygon key={folder.x} className="dg-plaque" points={folderFace(folder.x, folder.tab)} />
        ))}
        {/* El rayado es transparente: papel opaco debajo para que no se vea lo que queda dentro del cajón. */}
        {[NEAR_WALL, FRONT_SIDE].map((points) => (
          <g key={points}>
            <polygon className="ar-under" points={points} />
            <polygon className="dg-hatch" points={points} fill={hatch(ID, 'light')} />
          </g>
        ))}
        <polygon className="dg-plaque" points={poly([[FRONT.x0, FRONT.y0, FRONT.z1], [FRONT.x1, FRONT.y0, FRONT.z1], [FRONT.x1, FRONT.y1, FRONT.z1], [FRONT.x0, FRONT.y1, FRONT.z1]])} />
        <g transform={frontMatrix(FRONT.x1, FRONT.y1, FRONT.z1)}>
          <rect className="dg-plaque" width={w} height={DRAWER.h} />
          <rect className="ar-card" x={w / 2 - 8} y="5" width="16" height="6" />
          <rect className="ar-handle" x={w / 2 - 9} y="15" width="18" height="3.4" rx="1.7" />
        </g>
      </g>
    </svg>
  )
}
