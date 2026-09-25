# UI contract: platform section

Interfaz observable de la landing; sin endpoints ni persistencia. Basado en `spec.md` FR-001–FR-015 y SC-001–SC-008.

| Superficie | Obligación observable |
|---|---|
| Navegación | «Plataforma» en nav desktop y móvil, `href="#plataforma"`; un destino `section#plataforma` con título identificable; foco y menú existentes intactos. |
| Posición | `main > section#plataforma` tras `section.roles` y antes de `section.territory`; nueve secciones en total. |
| Tarjetas | Exactamente cinco `<article>` en orden del modelo. Cada uno: SVG → h3 título → promesa → descripción, semántica HTML real. |
| Diagramas | Cinco componentes diferentes sin props, cada `<svg>` inline tiene viewBox fijo y `aria-hidden="true"`; tinta única `var(--wine)` sobre `var(--paper)`; sin imagen raster, `<image>`, URLs, nombres accesibles redundantes ni dibujos de otro seat. |
| Texto | Propuesta en desarrollo; corte lunes validado hasta viernes, confirmación humana; tres poderes del Gobierno Nacional con alcance/depth validado y exclusión de organismos constitucionales autónomos. Sin nombres de funcionarios, cifras institucionales inventadas, normas ni enlaces externos. |
| Accesibilidad | Texto suficiente sin SVG; encabezados jerárquicos; links navegables por teclado y foco visible; tarjetas/diagramas visibles sin JS; nada animado con reduced motion (sin motion inicial). |
| Visual | Títulos `var(--display)`, cuerpo `var(--sans)`, fondo `var(--paper)`, tinta SVG `var(--wine)`; sin overflow desde 360 px ni a 200 % de fuente. |
| Red | Ninguna solicitud cross-origin; mantener fuentes e imágenes locales existentes. |

**Ownership**: diagramas (Claude, orquestador humano-supervisado) dibuja los cinco componentes SVG y copias estáticas decorativas para fallback sin JS; implementador de sección solo integra y estiliza. Confirmar mecanismo de sincronización para evitar divergencia.

**Verification**: Playwright redactado y rojo antes de código de producto, revisión visual independiente de diagramas con texto oculto, suite previa, typecheck/build, Lighthouse ≥95; gates separados QA/PROYECTO. `<noscript>` no cubre falla runtime de JS habilitado: consultar al humano antes de certificar esa interpretación.
