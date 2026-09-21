# Ciclo de Spec Kit dentro del harness

Spec Kit es el backend opcional de especificación de features. No reemplaza el triage,
los seats, la memoria ni los gates del harness. Un proyecto que activa Spec Kit no activa
OpenSpec: sostener dos contratos y dos listas de tareas para la misma feature está prohibido.

## Autoridad

- `.specify/memory/constitution.md`: principios específicos de Spec Kit.
- `specs/<feature>/spec.md`: contrato aprobado de la feature.
- `plan.md`, `research.md`, `data-model.md`, `contracts/`: diseño técnico.
- `tasks.md`: trabajo de la feature.
- `.harness/events.jsonl`: aprobaciones, análisis, convergencia, skips y adjudicaciones.
- Agent Harness: track, seats, TDD y veredictos independientes.

## Secuencia

### T4

1. Triage.
2. `/speckit-constitution` una vez por proyecto.
3. `/speckit-specify` y `/speckit-clarify`.
4. Aprobación humana; el harness registra los hashes.
5. `/speckit-plan`, `/speckit-tasks` y `/speckit-analyze`.
6. El planner añade seat, tier, `done_criteria` y `named_verification`; no duplica tareas.
7. El verificador escribe primero una prueba que falla; el constructor implementa.
8. `/speckit-converge`; si agrega tareas, se repite implementación.
9. Gate QA, luego gate de alcance, con jueces distintos.

### T3

Corre solo cuando se modifica el contrato aprobado, una decisión o una superficie entre
módulos. Si la spec vigente ya cubre exactamente el cambio, se registra el skip y su motivo.

### T0, T1 y T2

Spec Kit no corre. T0 es mecánico, T1 parte de una causa conocida y T2 entrega un hallazgo.

## Invariantes

- `analyze` es obligatorio antes de implementar.
- `converge` aporta evidencia; nunca firma GO.
- Quien construye no aprueba la spec ni juzga los gates.
- Cambiar un artefacto aprobado invalida su hash y exige nueva aprobación.
- Los comandos `/speckit-*` se invocan en el chat del agente, no en la terminal.
- El harness no copia ni modifica templates internos de Spec Kit.
