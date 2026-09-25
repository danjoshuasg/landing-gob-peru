import type { JSX } from 'react'

// Rayados de grabado compartidos por los diagramas: claro, medio y cruzado, en la tinta de la marca. El id se
// prefija por diagrama para que varios SVG en la misma página no choquen.
export function HatchDefs({ id }: { id: string }): JSX.Element {
  return (
    <defs>
      <pattern id={`${id}-h-light`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path className="dg-hatch-line" d="M0 0V4" />
      </pattern>
      <pattern id={`${id}-h-mid`} width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path className="dg-hatch-line" d="M0 0V2.6" />
      </pattern>
      <pattern id={`${id}-h-cross`} width="2.6" height="2.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path className="dg-hatch-line" d="M0 0V2.6M0 0H2.6" />
      </pattern>
    </defs>
  )
}
