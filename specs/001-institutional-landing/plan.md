# Implementation Plan: Landing institucional editorial

**Branch**: `001-institutional-landing` | **Date**: 2026-09-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-institutional-landing/spec.md`

## Summary

Construir una landing institucional estática, editorial y responsive con React, TypeScript y Vite. La experiencia adapta la jerarquía visual de la referencia sin copiar sus recursos, integra tres ilustraciones locales en AVIF/WebP/JPEG y usa Source Serif 4 con Geist Sans. La implementación prioriza navegación interna válida, accesibilidad, degradación sin JavaScript, rendimiento y verificación visual independiente.

## Technical Context

**Language/Version**: TypeScript 5.x, ECMAScript 2022, CSS moderno

**Primary Dependencies**: React 19, React DOM 19, Vite 7, plugin React; Playwright para verificación end-to-end

**Storage**: N/A; contenido estático en código

**Testing**: TypeScript compiler, build de Vite y Playwright contra Chrome local

**Target Platform**: Navegadores modernos de escritorio y móvil; anchos verificados de 360 a 1440 px

**Project Type**: Aplicación web frontend estática de una sola página

**Performance Goals**: Lighthouse ≥95 en accesibilidad, SEO y buenas prácticas; sin recursos externos; imágenes responsive en AVIF/WebP

**Constraints**: Sin backend, CMS, autenticación, analítica ni destinos institucionales externos; sin datos oficiales inventados; maestros de imagen inmutables

**Scale/Scope**: Una landing, nueve bloques narrativos, una navegación desktop/mobile y tres recursos visuales principales

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Pre-research | Post-design | Evidence / action |
|---|---|---|---|
| Veracidad institucional | OPEN | PASS WITH WORK | El test T007 debe observar el correo ficticio antes de T013; el hallazgo bloquea el release hasta verificar CTA internos. |
| Imágenes provistas | PASS WITH WORK | PASS WITH WORK | Maestros en `public/images/source/`; derivados optimizados y hashes de maestros por verificar. |
| Accesibilidad responsive | PASS WITH WORK | PASS WITH WORK | Pruebas Playwright para teclado, menú, overflow, contraste, zoom 200 % y reduced motion. |
| Rendimiento medible | PASS WITH WORK | PASS WITH WORK | Build, auditoría de requests y Lighthouse en gate final. |
| Verificación independiente | PASS | PASS | Worker de tests separado; gate QA y alcance con agentes que no construyeron. |
| Spec Kit | PASS | PASS | Spec aprobada; clarify sin ambigüedades críticas; plan, tasks y analyze obligatorios. |

No existen violaciones constitucionales justificadas. La implementación parcial previa a la instalación del harness queda registrada como desviación de proceso y debe converger contra esta especificación.

## Project Structure

### Documentation (this feature)

```text
specs/001-institutional-landing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

No se crea `contracts/` porque la feature no expone ni consume APIs externas.

### Source Code (repository root)

```text
public/
├── fonts/
└── images/
    ├── source/
    └── optimized/

src/
├── components/
│   └── Picture.tsx
├── styles/
│   └── global.css
├── App.tsx
└── main.tsx

tests/
└── landing.spec.ts

index.html
package.json
playwright.config.ts
```

**Structure Decision**: Proyecto frontend único. Se conserva una estructura deliberadamente pequeña porque la landing no tiene dominio persistente, servicios ni rutas múltiples. Se extraen componentes adicionales solo si reducen complejidad observable; no se fragmenta por ceremonia.

## Phase 0: Research Decisions

Las decisiones y alternativas están documentadas en [research.md](./research.md):

1. Pareja tipográfica local: Source Serif 4 + Geist Sans.
2. Pipeline de imágenes: maestros JPEG inmutables, derivados AVIF/WebP con `picture`.
3. Estrategia de interacción: navegación por anclas; menú móvil accesible.
4. Estrategia de movimiento: mejora progresiva; contenido visible sin JavaScript.
5. Estrategia de prueba: Playwright sobre Chrome local más typecheck/build.
6. Estrategia de contenido: copy conceptual y CTA internos hasta recibir datos oficiales.

Todos los desconocidos técnicos están resueltos. Contenido, identidad y publicación oficiales permanecen fuera de alcance, no como bloqueos.

## Phase 1: Design

### UI model

El modelo estático de navegación, secciones, recursos y principios está documentado en [data-model.md](./data-model.md). No hay persistencia ni transiciones de datos.

### Interaction contract

- La navegación desktop y móvil resuelve únicamente anclas existentes.
- El menú móvil declara estado, relación con el panel, cierre por enlace y `Escape`, y devuelve foco al disparador.
- El contenido es visible por defecto; JavaScript solo añade la clase que habilita animaciones.
- `prefers-reduced-motion` elimina transiciones y desplazamiento suave.
- Cada imagen usa AVIF, WebP y JPEG local con dimensiones explícitas.

### Verification design

| Named verification | Done criteria | Método |
|---|---|---|
| `typecheck-build` | Cero errores TypeScript y build reproducible | `npm run typecheck && npm run build` |
| `targeted-red-suite` | Los tests de correo ficticio, fallback sin JS y menú fallan por la causa esperada antes del fix | Playwright dirigido con salida literal preservada |
| `internal-link-audit` | Todos los `href="#…"` resuelven; cero `mailto:` y dominios ficticios | Playwright + inspección DOM |
| `responsive-overflow-matrix` | `scrollWidth <= clientWidth` en 360, 390, 768, 1024 y 1440 px | Playwright parametrizado |
| `keyboard-menu-contract` | Menú operable, `aria-expanded`, `aria-controls`, Escape, cierre por enlace y retorno de foco | Playwright keyboard |
| `image-delivery-audit` | Tres imágenes, alt no vacío, dimensiones y formatos modernos locales | Playwright DOM/network |
| `no-js-content-fallback` | El contenido permanece visible sin ejecutar JS | Captura HTML/CSS y test con scripting deshabilitado |
| `reduced-motion-contract` | Animaciones y smooth scroll desactivados | Emulación de reduced motion |
| `contrast-zoom-audit` | Contraste AA y zoom 200 % sin solapamientos ni controles inaccesibles | Lighthouse + Playwright con escala de texto |
| `source-integrity-audit` | Los tres maestros conservan su hash durante la implementación | `shasum -a 256 public/images/source/*` antes y después |
| `visual-review` | Sin recursos rotos, solapamientos ni regresiones en desktop/mobile | Screenshots de página completa + revisor independiente |
| `release-gate` | QA y alcance firman GO con evidencia | Harness gate en dos capas |

## Implementation Units

| Unit | Seat | Tier | Dependencies | Done criteria | Named verification |
|---|---|---|---|---|---|
| U1 Foundation repair | Engineering | build | Spec approval | TypeScript reconoce CSS/Vite; scripts y config de prueba operativos | `typecheck-build` |
| U2 TDD regression suite | WORKER-TEST | build | U1 | Tests reproducen correo ficticio, fallback JS y contrato móvil antes del fix | `targeted-red-suite` |
| U3 Navigation and progressive enhancement | Engineering | build | U2 red | CTA internos; menú accesible; contenido visible sin JS | `internal-link-audit`, `keyboard-menu-contract`, `no-js-content-fallback` |
| U4 Responsive visual integration | Engineering | build | U3 | Tres recursos integrados sin overflow en matriz | `responsive-overflow-matrix`, `image-delivery-audit` |
| U5 Typography and polish | Engineering | build | U4 | Jerarquía consistente, fuentes locales y reduced motion | `reduced-motion-contract`, `visual-review` |
| U6 Release verification | Independent gates | build + heavy | U1–U5 | Build verde, screenshots revisados, QA y alcance GO | `release-gate` |

## Out of Scope

- Backend, CMS, formularios conectados, autenticación y analítica.
- Dominio, hosting, despliegue y monitoreo productivo.
- Logos, autoridades, programas, cifras y contactos oficiales no suministrados.
- Regeneración o rediseño de las tres imágenes entregadas.
- Soporte para navegadores obsoletos sin CSS Grid, `picture` o fuentes WOFF2.

## Complexity Tracking

No hay violaciones constitucionales ni complejidad excepcional que justificar.
