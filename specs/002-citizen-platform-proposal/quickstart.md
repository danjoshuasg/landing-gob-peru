# Quickstart: validación de propuesta de plataforma

Esta feature aún no está implementada. Revisar [plan](plan.md), [modelo](data-model.md) y [contrato](contracts/platform-section.md).

## Prerrequisitos

Node/npm, `npm ci`, Chrome local disponible para Playwright (`playwright.config.ts`); puerto 4173 libre. `spec.md` aprobada, sin editar.

## Secuencia test-first

1. Antes de tocar `src/`, `index.html` o CSS: agregar `tests/platform.spec.ts` y actualizar en `tests/landing.spec.ts` el conteo esperado de secciones 8→9. Ejecutar `npm run test:e2e`; guardar salida que pruebe fallas esperadas por ausencia de sección/tarjetas/nav/fallback. Fallas por navegador ausente o servidor roto no cuentan como rojo útil.
2. Después de integrar sección y diagramas (Claude), ejecutar:

```bash
npm run typecheck
npm run build
npm run test:e2e
```

**Esperado**: cero errores TS/build, nuevos tests y suite anterior verdes; registrar salida textual y número real de tests.

## Escenarios E2E

- Escritorio y móvil: enlace «Plataforma» va a `#plataforma`; exactamente cinco tarjetas en orden, cada una con SVG, título, promesa y descripción; menú mantiene foco y escape.
- En 360, 390, 768, 1024 y 1440 px: sin overflow horizontal; a 200 % de texto, sin solapes ni recortes.
- Con JS deshabilitado: cinco tarjetas y cinco SVG decorativos visibles. Con reduced motion: diagramas estáticos, scroll sin animación significativa. Sin motion inicial en cualquier preferencia.
- Registrar solicitudes de navegador: cero intentos a orígenes externos. Comprobar texto de propuesta en desarrollo, periodicidad, validación humana y exclusiones; sin nombres, cifras institucionales no aprobadas, leyes/normas ni enlaces externos.
- Evaluador visual independiente: ocultar títulos/descripciones y confirmar que cinco diagramas literales son diferentes entre sí y no copian imágenes existentes.

## Auditoría y gates

Servir build local (`npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`) y auditar Lighthouse en Chrome móvil (ancho 360 px); guardar versión, URL, parámetros e informe. Accesibilidad, SEO y buenas prácticas ≥95 cada una; no asumir que ya cumplen. Revisores independientes del generador firman QA (funciona) y PROYECTO (alcance) por separado; UNKNOWN no es GO. Si «JS falla» implica JS habilitado pero render roto, pedir aclaración humana antes de certificar edge case.
