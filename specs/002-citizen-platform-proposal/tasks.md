# Tasks: Propuesta de plataforma ciudadana

**Input**: `specs/002-citizen-platform-proposal/plan.md`, `spec.md` (aprobada), `research.md`, `data-model.md`, `contracts/platform-section.md`, `quickstart.md`.

**Tests**: Obligatorios y PRIMERO (track T4). Toda tarea de Playwright en fase 2 debe ejecutarse y fallar por ausencia de la feature antes de cualquier cambio de producto. No modificar `spec.md`. `[P]` solo cuando archivos disjuntos y sin dependencias incompletas. Diagramas SVG: propiedad exclusiva de diagramas (Claude, orquestador humano-supervisado); otros seats no dibujan ilustraciones.

## Phase 1: Setup (sin rebootstrap)

**Purpose**: preservar contrato aprobado y establecer línea base.

- [ ] T001 Registrar hash de `specs/002-citizen-platform-proposal/spec.md` y ejecutar `npm run test:e2e` para línea base (incluidos los 16 casos efectivos existentes de `tests/landing.spec.ts`); si falla antes de cambios, diagnosticar sin alterar spec ni confundir falla basal con rojo TDD.
- [ ] T002 Ejecutar `speckit.analyze` sobre `specs/002-citizen-platform-proposal/` antes de cualquier código; resolver inconsistencias del plan/tasks sin cambiar spec aprobada, o detenerse si requieren nueva aprobación humana.

## Phase 2: Foundational — todos los tests primero (bloqueante)

**Purpose**: añadir pruebas de US1/US2 y FR-007/FR-008 y conservar salida roja por feature ausente; NINGUNA implementación hasta cerrar T010. Pruebas en un mismo archivo se redactan secuencialmente, no `[P]`.

- [ ] T003 Crear `tests/platform.spec.ts` con aserciones de US1: exactamente cinco `#plataforma article`, orden de títulos correspondiente a las cinco propuestas de `data-model.md`, y para cada una SVG inline, h3, promesa y descripción en jerarquía DOM; probar `section.roles` → `#plataforma` → `section.territory`.
- [ ] T004 Ampliar `tests/platform.spec.ts` con US1: link «Plataforma» en nav desktop y móvil, `href="#plataforma"` con destino único, activación mediante teclado y foco/indicador visible, sin romper apertura/cierre de menú móvil.
- [ ] T005 Ampliar `tests/platform.spec.ts` con US1: no overflow de sección/documento en 360, 390, 768, 1024 y 1440 px; a 200 % de texto en 390 px, tarjetas legibles sin recorte/solape.
- [ ] T006 Ampliar `tests/platform.spec.ts` con US2: cinco SVG con viewBox fijo y `aria-hidden="true"`, sin `<image>` ni recursos externos, y DOM de tarjetas con texto suficiente; con reduced motion ningún diagrama anima; sin JS cinco tarjetas y cinco SVG visibles en fallback.
- [ ] T007 Ampliar `tests/platform.spec.ts` con FR-007/FR-008: cero intentos de red cross-origin usando eventos de request capturados desde antes de `goto`, ningún enlace externo en la sección, ningún nombre de funcionario/cifra institucional/norma específica (revisión de contenido aprobado contra lista prohibida), texto de propuesta futura y ausencia de `.platform-facts`.
- [ ] T008 Actualizar test de ocho a nueve `main > section` en `tests/landing.spec.ts` antes de agregar sección; mantener el resto de pruebas previas inalteradas.
- [ ] T009 Ejecutar `npm run test:e2e` y conservar salida textual en evidencia del gate: rojos por `#plataforma`/enlace/tarjetas/fallback ausentes y conteo 8→9; si falta Chrome o servidor, corregir entorno y repetir antes de proceder.
- [ ] T010 Confirmar que T003–T008 cubren US1/US2 y FR-007/FR-008 y que el rojo de T009 es por contrato aún no implementado; prohibido relajar pruebas para obtener verde en `tests/platform.spec.ts` o `tests/landing.spec.ts`.

**Checkpoint**: tests redactados, rojo válido guardado; desbloquea implementación. Se pueden redactar checks en archivos separados por agentes distintos SOLO si se acuerdan rutas disjuntas; esta lista usa un único archivo y un solo dueño.

## Phase 3: User Story 1 — comprender las cinco propuestas (P1) 🎯 MVP

**Goal**: sección, navegación y cinco tarjetas legibles en orden fijo y responsive.

**Independent Test**: T003–T005, T008 y pruebas anteriores de `tests/landing.spec.ts` pasan; sección navegable en 360 px.

### Implementation for User Story 1

- [ ] T011 [US1] Añadir a `src/App.tsx` entrada `navItems` «Plataforma» → `#plataforma` usada por ambos menús; respetar foco y cierre actuales.
- [ ] T012 [US1] Añadir en `src/App.tsx` datos estáticos de cinco propuestas con `order` entero único 1–5, `title` obligatorio, `promise` de una frase y `description` breve obligatoria; respetar exactamente orden y prohibiciones de `data-model.md`; texto prospectivo, no servicio activo.
- [ ] T013 [US1] Renderizar en `src/App.tsx` `section#plataforma` entre roles y territory, cinco `<article>` con SVG → h3 → promesa → descripción y texto suficiente sin diagrama; integrar SVG solo tras entrega del seat diagramas, sin dibujarlos. Reusar observer `[data-reveal]` sin ocultar contenido sin JS.
- [ ] T014 [US1] Crear reglas responsive en `src/styles/global.css` para `#plataforma` con `--paper`, `--ink`, `--wine`, `--display` (títulos), `--sans` (cuerpo); mantener 360–1440 y zoom 200 % sin overflow/focus recortado.
- [ ] T015 [US1] Ejecutar pruebas T003–T005 y regresión `tests/landing.spec.ts`; pendiente de T016–T020 para verificar SVG/fallback completo. Registrar resultados sin marcar verde si faltan diagramas.

## Phase 4: User Story 2 — diagramas literales (P2)

**Goal**: cinco símbolos distinguibles cuyo significado también está en el texto.

**Independent Test**: T006 en `tests/platform.spec.ts` + revisión visual independiente ocultando texto.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Diagramas (Claude): dibujar `src/components/diagrams/OrgChartDiagram.tsx` sin props, SVG inline viewBox fijo, `aria-hidden="true"`, grabado de organigrama solo `var(--wine)` sobre `var(--paper)`, sin motion ni recursos externos; no tocar `src/App.tsx`.
- [ ] T017 [P] [US2] Diagramas (Claude): dibujar `src/components/diagrams/ProofDiagram.tsx` sin props, SVG inline viewBox fijo, `aria-hidden="true"`, documento sellado distinguible solo `var(--wine)` sobre `var(--paper)`, sin motion ni recursos externos; no tocar `src/App.tsx`.
- [ ] T018 [P] [US2] Diagramas (Claude): dibujar `src/components/diagrams/CareerDiagram.tsx` sin props, SVG inline viewBox fijo, `aria-hidden="true"`, trayectoria distinguible solo `var(--wine)` sobre `var(--paper)`, sin motion ni recursos externos; no tocar `src/App.tsx`.
- [ ] T019 [P] [US2] Diagramas (Claude): dibujar `src/components/diagrams/WeeklyDiagram.tsx` sin props, SVG inline viewBox fijo, `aria-hidden="true"`, calendario semanal distinguible solo `var(--wine)` sobre `var(--paper)`, sin motion ni recursos externos; no tocar `src/App.tsx`.
- [ ] T020 [P] [US2] Diagramas (Claude): dibujar `src/components/diagrams/ContextDiagram.tsx` sin props, SVG inline viewBox fijo, `aria-hidden="true"`, carpeta documental distinguible solo `var(--wine)` sobre `var(--paper)`, sin motion ni recursos externos; no tocar `src/App.tsx`.
- [ ] T021 [US2] Diagramas (Claude): entregar en `index.html` cinco copias SVG decorativas estáticas sincronizadas con T016–T020 dentro de un `<noscript>` con cinco tarjetas y texto equivalente a `src/App.tsx`; preservar el fallback previo y encabezado. Solo Claude dibuja SVG; coordinar lectura del texto final tras T012, no escribir en paralelo sobre `index.html`.
- [ ] T022 [US2] Integrar componentes ya entregados en `src/App.tsx` (un SVG por tarjeta, sin props), verificar orden y atributos; el integrador NO edita SVG de ilustración.
- [ ] T023 [US2] Ejecutar T006 en `tests/platform.spec.ts` (incluido sin JS y reduced motion), pedir revisión visual independiente ocultando texto y comparar cinco símbolos e imágenes preexistentes; registrar dictamen y refutar hallazgos falsos.

## Phase 5: FR-007/FR-008 — presentación futura y contenido permitido

**Goal**: presentar la plataforma como propuesta futura, sin datos prohibidos ni la franja retirada por la enmienda.

**Independent Test**: T007 en `tests/platform.spec.ts`; comprobar ausencia de `.platform-facts` y contenido prohibido.

### Tareas retiradas por la enmienda aprobada

- [ ] T024 [RETIRADA — enmienda FR-005/FR-006] Añadir en `src/App.tsx` `ScopeStatement` editorial: Gobierno Nacional, Ejecutivo/Legislativo/Judicial, alcance por niveles de cargos sin inventar profundidad numérica; exclusión de organismos constitucionales autónomos; confirmar con humano si necesita límite exacto por poder.
- [ ] T025 [RETIRADA — enmienda FR-005/FR-006] Añadir en `src/App.tsx` `UpdateCycle`: propuesta en desarrollo, corte semanal lunes con cambios validados hasta viernes, confirmación humana previa; no afirmar actualizaciones operativas. Sin nombres, cifras institucionales no provistas, normas ni links externos.
- [ ] T026 [RETIRADA — enmienda FR-005/FR-006] Sincronizar texto del fallback de `index.html` con T024–T025 después de cerrar escrituras de diagramas (Claude), sin tocar los SVG; ejecutar T007 de `tests/platform.spec.ts` y revisar intentos cross-origin.

## Phase 6: Polish & cross-cutting

- [ ] T027 Ejecutar `npm run typecheck`, `npm run build`, `npm run test:e2e` y guardar salidas en evidencia de gate; confirmar sin regresión de `tests/landing.spec.ts`, sin ajustar tests para ocultar fallas.
- [ ] T028 Servir build local con `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` y guardar informe Lighthouse reproducible ≥95 accesibilidad, SEO y buenas prácticas, registrando condiciones; si falla, corregir producto y repetir tests en `src/App.tsx`, `src/styles/global.css`, `index.html` según corresponda.
- [ ] T029 Ejecutar checklist de `specs/002-citizen-platform-proposal/quickstart.md`; QA independiente evalúa ejecución, PROYECTO independiente evalúa alcance/constitución y spec intacta, dos veredictos separados antes de gate humano; `UNKNOWN` no es GO. Consultar interpretación de falla JS habilitado y profundidad exacta antes de certificar esos puntos.

## Dependencies & execution order

- T001→T002→T003–T010: todos los tests de sección primero y rojo válido; bloquean T011–T023 y la retirada de `.platform-facts`.
- US1 T011→T012→T013→T014→T015. T013 puede preparar lugar del diagrama sin implementarlo y T015 será parcial hasta diagramas.
- US2 T016–T020 en paralelo SOLO archivos distintos y una vez conocida la dirección visual; T021 necesita T012 y los cinco diagramas; T022 necesita T013 y T016–T020; T023 después de T021–T022.
- T024–T026 retiradas por la enmienda; FR-007/FR-008 se verifican con T007 después de retirar `.platform-facts`.
- T027–T029 después de US1/US2 y FR-007/FR-008; QA y PROYECTO en serie por sus preguntas, independientes del generador.

## Parallel example

Después del rojo válido, cinco encargos a diagramas (Claude) T016–T020 pueden ejecutarse en paralelo cada uno en su propio archivo. El dueño de `src/App.tsx` debe secuenciar T011–T013 y T022; el dueño de `index.html` ejecuta T021 sin T026, retirada por la enmienda. No hay bootstrap de infraestructura ni base de datos.

## Implementation strategy

**MVP**: US1 entrega sección navegable y texto; no declarar feature final sin US2 diagramas y FR-007/FR-008 verificados. Entrega incremental: primero pruebas rojas; US1 → US2 → retirar `.platform-facts` → suite/auditoría/gates. No iniciar implementación en esta ejecución: este archivo es backlog, no cambios de código.
