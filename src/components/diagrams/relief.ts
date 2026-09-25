// Relieve de grabado común a los diagramas: cada pieza plana muestra su canto derecho e inferior, rayados, con la
// misma profundidad en los cinco dibujos.
export const DEPTH = 4

export type Rect = { x: number; y: number; w: number; h: number }

export const reliefSide = ({ x, y, w, h }: Rect, depth = DEPTH) =>
  `${x + w},${y} ${x + w + depth},${y + depth} ${x + w + depth},${y + h + depth} ${x + w},${y + h}`

export const reliefBottom = ({ x, y, w, h }: Rect, depth = DEPTH) =>
  `${x},${y + h} ${x + depth},${y + h + depth} ${x + w + depth},${y + h + depth} ${x + w},${y + h}`

export const hatch = (id: string, tone: 'light' | 'mid' | 'cross') => `url(#${id}-h-${tone})`
