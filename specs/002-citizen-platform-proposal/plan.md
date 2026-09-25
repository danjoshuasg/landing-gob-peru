# Implementation Plan: Propuesta de plataforma ciudadana

**Branch**: `002-citizen-platform-proposal` (feature activa; checkout actual `main`) | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md) (aprobada, intocable)

**Input**: `specs/002-citizen-platform-proposal/spec.md`

## Summary

Añadir entre roles y territorio una sección editorial `#plataforma` con cinco tarjetas en orden fijo, enlaces de navegación desktop/móvil, y cinco diagramas SVG decorativos. React + TypeScript + Vite sin dependencias nuevas. Tests Playwright rojos antes de implementar. Los SVG los dibuja únicamente diagramas (Claude, orquestador humano-supervisado), no el implementador de la sección.

## Technical Context

**Language/Version**: TypeScript/JSX del proyecto (`package.json` declara `latest`; no cambiar versión).
**Primary Dependencies**: React, React DOM, Vite, TypeScript; ninguna nueva.
**Storage**: N/A; contenido estático editorial.
**Testing**: Playwright, `npm run test:e2e`, `npm run typecheck`, `npm run build`; auditoría Lighthouse reproducible.
**Target Platform**: Chrome local, viewports 360–1440 px.
**Project Type**: Landing web SPA con sección prerenderizada dentro de `#root` y fallback editorial `<noscript>` conservado.
**Performance Goals**: Lighthouse ≥95 en accesibilidad, SEO y buenas prácticas; cero solicitudes cross-origin.
**Constraints**: Spec aprobada intocable; sin backend/CMS/dependencias nuevas; SVG sin props, decorativo `aria-hidden="true"`, viewBox fijo, una tinta `var(--wine)` sobre `var(--paper)`; sin motion inicial ni SVG dibujados aquí.
**Scale/Scope**: Una sección, cinco tarjetas, cinco diagramas, una entrada nav compartida y texto prospectivo; sin persistencia.

## Constitution Check

*Gate antes de Phase 0; reevaluado tras Phase 1.*

| Principio | Plan / evidencia | Antes / después |
|---|---|---|
| I Veracidad | Propuesta no oficial; sin nombres, cifras institucionales no provistas, normas ni enlaces externos; no inventar profundidad de cargos. Test de contenido. | PASS / PASS |
| II Visual | Diagramas inline locales derivados de estética de imágenes entregadas; mantener originales y derivados AVIF/WebP existentes. | PASS / PASS |
| III Accesibilidad | HTML semántico, SVG ocultos a AT, foco visible, 360–1440 px, zoom 200 %, reduced motion, fallback sin JS. | PASS / PASS, verificación pendiente |
| IV Rendimiento | Sin paquetes externos, typecheck/build y Lighthouse ≥95 al entregar. | PASS / PASS, auditoría pendiente |
| V Verificación | Test-first rojo→verde, revisor independiente para gates QA y PROYECTO, evidencia reproducible; UNKNOWN no es GO. | PASS / PASS, gates pendientes |
| Producto/proceso | Landing estática React/TS/Vite; `clarify` ya registrado en spec; `analyze` antes de construir; cambio de hash requiere nueva aprobación. | PASS / PASS |

**Decisión humana (opción A)**: la sección se inyecta en `#root`, fuera de `<noscript>`, para que sea visible si JS está desactivado, tarda o falla. El encabezado editorial anterior permanece en `<noscript>`. React reemplaza el contenido al montar; sin JS no hay interactividad.

## Project Structure

### Documentation (this feature)

```text
specs/002-citizen-platform-proposal/
├── spec.md                   # aprobada; no editar
├── plan.md
├── research.md
├── data-model.md
├── contracts/platform-section.md
├── quickstart.md
└── tasks.md
```

### Source Code (repositorio; solo cambios FUTUROS)

```text
index.html                    # encabezado noscript conservado; sección inyectada por Vite
vite.config.ts                # prerender en transformIndexHtml (dev y build)
src/components/PlatformSection.tsx # fuente de tarjetas, textos y diagramas
src/App.tsx                  # navItems, sección entre roles y territory, reveal observer
src/components/diagrams/     # cinco SVG, dueño exclusivo: diagramas (Claude)
src/styles/global.css        # tokens y responsive
public/fonts/                # existentes; no tocar
tests/landing.spec.ts        # regresión y conteo nuevo
tests/platform.spec.ts       # tests de feature test-first
playwright.config.ts         # reutilizar Chrome y puerto 4173
```

**Structure Decision**: Proyecto único frontend. Datos de tarjetas estáticos en `PlatformSection`; navItems alimenta ambos menús. Mantener el observer global de `[data-reveal]`, con fallback visible si no hay IO o hay reduced motion. No añadir servicios ni almacenamiento. El plugin `transformIndexHtml` abre un servidor Vite en `middlewareMode`, carga `PlatformSection` con `ssrLoadModule`, renderiza con `renderToStaticMarkup` y cierra el servidor; funciona en dev y build. Inyecta la sección en `#root` junto al encabezado anterior; React reemplaza ese contenido al montar. No se duplican textos ni SVG.

## Design sequence

1. Modelar contenido/contrato UI en `data-model.md` y `contracts/platform-section.md`.
2. Escribir Playwright de orden/cantidad, navegación, overflow, origen de red, reduced motion, contenido prohibido, SVG, sin JS y 200 %. Modificar primero test de conteo 8→9, ejecutar y guardar rojo por feature ausente (no por entorno roto).
3. Construir sección y CSS en tokens existentes; presentarla como propuesta en construcción, sin alcance por poder, corte semanal ni validación humana (retirados por la enmienda del 2026-09-24; pasan a la spec 003). No inventar nombres, cifras, normas ni enlaces.
4. Diagramas (Claude) entrega cinco componentes sin props, SVG inline decorativos viewBox fijo tinta wine/paper: organigrama, documento sellado, trayectoria, calendario semanal y carpeta; dibujos distintos. El fallback renderiza los mismos componentes desde `PlatformSection`, sin copias. Sin motion inicial.
5. Suite completa, typecheck/build, Lighthouse y revisión visual independiente con texto oculto; gates separados QA/PROYECTO y gate humano. `analyze` Spec Kit antes de construir, no en este paso.

## Complexity Tracking

No hay violaciones constitucionales justificadas. La sección prerenderizada en `#root` se comprueba en el HTML de build y con el test sin JS.
