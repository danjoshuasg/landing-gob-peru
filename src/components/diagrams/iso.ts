// Proyección isométrica para las escenas 3D en tinta de la marca. Luz fija arriba a la izquierda: el techo va en
// papel, la cara que mira a +y (izquierda) con rayado claro y la que mira a +x (derecha) con rayado medio.
export type Point2 = readonly [x: number, y: number]
export type Point3 = readonly [x: number, y: number, z: number]
export type Side = { points: string; tone: 'left' | 'right' }

const Z_SCALE = 1.118
const round = (value: number) => Number(value.toFixed(2))

export function makeIso(origin: Point2) {
  const iso = (x: number, y: number, z = 0): Point2 => [
    round(origin[0] + x - y),
    round(origin[1] + (x + y) / 2 - z * Z_SCALE),
  ]
  const poly = (points: readonly Point3[]) => points.map((point) => iso(...point).join(',')).join(' ')
  // Matriz de la cara superior con origen en `corner` y giro `turn` (grados) en el plano del piso.
  const topFace = (corner: Point3, turn = 0) => {
    const [tx, ty] = iso(...corner)
    return `matrix(1 .5 -1 .5 ${tx} ${ty}) rotate(${turn})`
  }
  // Prisma sobre un polígono del piso: techo y solo las caras que miran a la cámara (nx + ny > 0).
  const prism = (points: readonly Point2[], z: number, h: number) => {
    const area = points.reduce((sum, [x1, y1], index) => {
      const [x2, y2] = points[(index + 1) % points.length]
      return sum + x1 * y2 - x2 * y1
    }, 0)
    const sides: Side[] = []
    points.forEach(([x1, y1], index) => {
      const [x2, y2] = points[(index + 1) % points.length]
      const nx = area > 0 ? y2 - y1 : y1 - y2
      const ny = area > 0 ? x1 - x2 : x2 - x1
      if (nx + ny <= 0) return
      sides.push({ points: poly([[x1, y1, z], [x2, y2, z], [x2, y2, z + h], [x1, y1, z + h]]), tone: ny >= nx ? 'left' : 'right' })
    })
    return { top: poly(points.map(([x, y]) => [x, y, z + h] as Point3)), sides }
  }
  return { iso, poly, topFace, prism }
}

// Rectángulo girado en el piso, centrado en (x, y); el primer vértice es la esquina (−w/2, −d/2).
export function rect(x: number, y: number, w: number, d: number, turn: number): Point2[] {
  const a = (turn * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  return [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(
    ([u, v]) => [x + u * cos - v * sin, y + u * sin + v * cos] as Point2,
  )
}
