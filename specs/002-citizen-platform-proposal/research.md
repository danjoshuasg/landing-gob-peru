# Research: propuesta de plataforma

Sin NEEDS CLARIFICATION técnicos para planear. La profundidad exacta de cargos requiere validación editorial.

## Integración React/Vite

- **Decision**: sección `#plataforma` en `src/App.tsx` y un `navItems` compartido para ambos menús; sin paquetes nuevos.
- **Rationale**: reutiliza la SPA editorial y sus anchors.
- **Alternatives considered**: router/página separada (sobrecoste).

## CSS y diagramas

- **Decision**: tokens `--paper`, `--wine`, `--display`, `--sans` existentes; cinco SVG inline de tinta única, componentes sin props y viewBox fijo; propiedad exclusiva de diagramas (Claude, orquestador humano-supervisado).
- **Rationale**: respeta imágenes y fuentes locales como referencia.
- **Alternatives considered**: raster/CDN/librería de iconos (rompen contrato).

## Progressive enhancement

- **Decision**: sin motion inicial; reutilizar el IntersectionObserver de `[data-reveal]` para React. Ampliar el fallback `<noscript>` de `index.html` con cinco tarjetas y SVG estáticos, sincronizados con React.
- **Rationale**: el observer ya cubre reduced motion y ausencia de IO, pero `index.html` solo presenta un h1 sin JS.
- **Alternatives considered**: SSR/prerender (más complejidad), omitir fallback (incumple spec).
- **Límite**: noscript no resuelve errores de JS habilitado antes del render; confirmar interpretación de «JS falla» con humano antes de certificar cumplimiento completo.

## Tests y contenido

- **Decision**: Playwright test-first, comprobar rojo antes de implementación; conservar las pruebas previas, actualizar el conteo de ocho a nueve secciones; Lighthouse ≥95 en build local reproducible.
- **Rationale**: ya hay Chrome local y pruebas de layout, fuentes, imágenes, semántica y menú. Interceptar intentos cross-origin, no solo responses.
- **Alternatives considered**: snapshots aislados (no prueban layout ni red).
- **Decision**: narrar propuesta futura con corte lunes, validación hasta viernes, verificación humana, tres poderes y exclusión de organismos autónomos; no inventar límite de profundidad, composición o autoridades.
- **Rationale**: spec aplaza confirmación de composición exacta; constitución prohíbe inventar hechos.
- **Alternatives considered**: números de niveles y funcionarios hipotéticos (prohibidos).
