# Template de prompt por ticket

El artefacto más reusable del repo. Para cualquier cambio de código de Landing Gob Perú, reusa este esqueleto cambiando **solo el nombre del cambio y su ticket `WI-##`**, respetando el orden `blocked-by` del backlog.

La suite de verificación (paso 4) se declara **una sola vez** en `<sin definir; lo fija F2>` y este prompt la invoca por referencia. Cuando el stack cambie, se edita ahí y no aquí.

---

## El prompt

```
Implementa el ticket <WI-##> (cambio <nombre-del-cambio>).

1. CARGA CONTEXTO: los invariantes del proyecto + el cambio completo (spec, diseño,
   tareas y criterios de aceptación) + las fuentes de F1/F2/F3 que el cambio cite +
   AGENTS.md + PROJECT_INSTRUCTIONS.md. Si el backend es Spec Kit, carga los paths que
   entrega `harness speckit context --for planner`; no copies los artefactos a otro
   backlog. No asumas nada: lo que no esté escrito se pregunta o se declara ASSUMPTION.

2. MARCA EN EL TRACKER: en ninguno, pon <WI-##> y sus sub-tickets en
   "In Progress" antes de escribir código. Las credenciales salen del entorno, nunca del
   prompt ni de un archivo versionado.

3. IMPLEMENTA test-first, en slices delgados, con scope quirúrgico. Cada Requirement o
   Scenario de la spec es un criterio de aceptación, no una sugerencia. Construye sobre la
   fundación existente sin romper los invariantes declarados. Si el entorno tiene
   restricciones (sin red, sin acceso a un servicio, dependencias congeladas), respétalas
   en vez de rodearlas.

4. VERIFICA CON EVIDENCIA REAL: corre la suite de verificación declarada en
   <sin definir; lo fija F2> y pega su salida. Evidencia real = comandos ejecutados y su output,
   no una afirmación de que pasarían. Como mínimo la suite debe cubrir:
   (a) el proyecto construye desde limpio;
   (b) los tests pasan, incluidos los que escribiste en el paso 3 y que fallaban antes;
   (c) el backend de specs completa su validación (`analyze` antes de construir y
       `converge` antes de los gates cuando el backend es Spec Kit);
   (d) los invariantes del proyecto se verifican de forma automatizada, no por inspección;
   (e) si el cambio toca una dependencia externa (almacenamiento, red, otro servicio), un
       test de integración contra la dependencia REAL, no un mock.

5. GATE ADVERSARIAL INDEPENDIENTE — DOS PREGUNTAS: un agente aparte, con contexto fresco,
   que NO participó en la implementación. Responde las dos por separado, cada una con su
   veredicto GO/NO-GO y defectos numerados (BLOCKER/MAJOR/MINOR, cada uno con escenario
   concreto y evidencia archivo:línea):
   - QA (¿funciona?): contra las specs, los invariantes, seguridad y cobertura. Que
     **ejecute un intento de romperlo** (un probe de exploit, un input malicioso, un caso
     borde), no que solo lea el diff. La salida de los comandos va **pegada textual**;
     parafrasearla es defecto del gate, no del cambio.
   - PROYECTO (¿era lo que tocaba?): mapea el ticket a archivo y línea, lista lo tocado
     fuera del alcance declarado, decisiones tomadas sin ADR, inconsistencias de nombres o
     IDs contra lo ya aprobado.
   No firmes a ciegas: verifica por tu cuenta lo que huela raro y **refuta** el hallazgo
   que no resista. Máximo 3 iteraciones **por pregunta**; 3 es techo, no meta — cierra en
   cuanto una ronda no traiga BLOCKER ni MAJOR, y los MINOR se difieren como deuda en vez
   de comprar otra vuelta. Si no converge, escala al humano con las opciones en conflicto.

6. CIERRA Y PASA AL GATE HUMANO: actualiza el tracker, STATE.md y runlog.md; commitea en
   una rama (NUNCA en la rama principal), mensaje conventional. Luego **para antes del
   merge** y presenta a Daniel Santiváñez: build, tests, evidencia del paso 4, **los dos veredictos
   del gate** con sus iteraciones, y los MINOR diferidos. El merge lo autoriza el humano.

RESTRICCIONES: solo este cambio; no adelantes trabajo de releases futuros; no toques otros
cambios ni refactorices de paso.
```

---

## Cómo adaptarlo

- **`<sin definir; lo fija F2>`** es el único punto atado al stack. Apúntalo al archivo donde vive la lista concreta de comandos de verificación (por ejemplo un `Makefile`, un `justfile`, un script `scripts/verify.sh`, o una sección del CONTRIBUTING). Si ese archivo no existe todavía, créalo en el primer ticket: es más barato que repetir comandos en cada prompt.
- **Restricciones de entorno** (paso 3): si el entorno de trabajo tiene límites estables (offline, sin acceso a cierto servicio, cache de dependencias congelado), escríbelos una vez en `<sin definir; lo fija F2>` o en `AGENTS.md` y referéncialos. No los repitas por ticket.
- **Los invariantes** (pasos 1, 3, 5) son los de la sección 2 de `PROJECT_INSTRUCTIONS.md`. Cítalos por id. Un invariante que no se puede verificar automáticamente (paso 4d) es un invariante que se va a romper.
- **No relajes el paso 5.** Un gate corrido por el mismo agente que implementó no es adversarial: valida su propio razonamiento. Contexto fresco y agente distinto, siempre.
- **No fusiones las dos preguntas del paso 5 en una.** Juntas, la segunda pierde: la evidencia ejecutable es más vistosa y se lleva la atención, y el alcance termina sin auditar. Dos veredictos escritos, aunque los firme el mismo agente. Si el proyecto corre con `modo_gates: dos` en `STATE.md`, además son agentes distintos, cada uno partido en RECOLECTOR (reúne evidencia) → JUEZ (firma).
