# AGENTS.md — Squads de construcción de Landing Gob Perú

Cómo se **construye** este proyecto con **agentes reales, en paralelo, cada uno con su modelo**.

Complementa `PROJECT_INSTRUCTIONS.md`: ese define el sistema multi-agente **simulado** (un solo modelo rotando roles PLANNER/ORCHESTRATOR/GATE/WORKERS). Este documento define cómo instanciar esos roles como **agentes de verdad** vía la herramienta `Agent` (o el runner de workflows para fan-out grande), model-tiered.

> **Distinción clave (no confundir):** los **agentes de construcción** (este doc) son quienes *hacen* el software. Si Landing Gob Perú tiene agentes o pipelines **en runtime**, esos son arquitectura del producto y viven en F1. Cosas distintas. Confundirlas produce diseños donde el orquestador de build se filtra al runtime.

---

## 1. Organización mínima viable (3 capas)

Ajusta los seats a lo que Landing Gob Perú realmente necesita: **borra el seat que no tenga trabajo**, no lo dejes vacío.

| Capa | Seat | Tier | Misión |
|---|---|---|---|
| **Gestión** | **PLANNER** | `heavy` | **produce los subtasks**: descompone la fase en subtareas con criterio de terminado, ordena dependencias, asigna seat y tier a cada una, declara qué **NO** entra |
| | **ORCHESTRATOR** | `heavy` | **delega**: spawnea los agentes según el plan, aplica la disciplina del gate, consolida outputs, **escribe los archivos**, mantiene `STATE.md`, prepara el gate humano. No implementa, no juzga |
| | Product Owner | `build` | backlog en ninguno, prioridad valor/esfuerzo, alcance del MVP, change requests |
| **Dev / Calidad** | Solution Architect / Tech Lead | `heavy` | coherencia arquitectónica, ADRs, review cross-squad |
| | Engineering (spawnea sub-workers por subsistema) | `build` default, `heavy` en subsistemas de alta ambigüedad o `bulk` en volumen | un sub-worker por subsistema del diagrama de F1 |
| | WORKER-TEST | `build` | escribe y corre tests contra la spec. **Nunca el mismo agente que construyó** |
| | **GATE — pregunta QA** (¿funciona?) | `heavy` + `build` | correctitud, tests, casos borde, regresión. Ver §3 |
| | **GATE — pregunta PROYECTO** (¿era lo que tocaba?) | `heavy` + `build` | alcance, trazabilidad, ADRs, coherencia cross-artefacto, `STATE.md`. Ver §3 |
| | DevOps | `build` | entrega automatizada, observabilidad, monitoreo de costo |
| **Contexto externo** | Investigación / dominio | `build` o `heavy` | fuentes de verdad del dominio, normativa, estado del arte, benchmarks |
| **Cross-cutting** | **Experto-crux (on-call)** | `expert` | ver §4 |

> **PLANNER y ORCHESTRATOR pueden ser la misma instancia `heavy`** — el loop principal cambiando de sombrero. Son roles distintos, no necesariamente agentes distintos: la separación existe para que el plan quede explícito antes de delegar, no para gastar dos contextos. Se separan en `Agent` distintos solo si la fase es grande. Lo que **nunca** comparte instancia con ellos es quien evalúa (§3).

---

## 2. Tiering de modelos

**Esta tabla es el único lugar del repo donde un tier se ata a un modelo concreto.** El resto de los documentos y la skill `/squad` razonan en tiers; cambiar de modelo se hace acá y en ningún otro lado. Un documento del andamiaje que nombre un modelo fuera de esta tabla está mal escrito: repórtalo.

| Tier | Modelo | Para qué |
|---|---|---|
| `bulk` | `<tier bulk: volumen y tareas mecanicas>`, o script (sin LLM) | formato, deduplicación, plumbing, clasificación trivial |
| `build` | `<tier build: construccion, tests y recoleccion de evidencia del gate>` | la mayoría del código y de los artefactos, los tests, y la **recolección de evidencia** del gate |
| `heavy` | `<tier heavy: arquitectura y veredicto de las dos preguntas del gate (QA y PROYECTO)>` | arquitectura, PLANNER, ORCHESTRATOR, y el **veredicto** de las dos preguntas del gate |
| `expert` | `<tier expert on-call, presupuesto contado, solo para el crux>` | 2–3 decisiones por fase (§4) |

> Completa la columna "Modelo" en el bootstrap y **verifica los ids vigentes antes de usarlos**. El catálogo de modelos cambia más rápido que este documento.

Reglas:
- Lo que un script puede hacer, no lo hace un LLM.
- Lo que el tier `build` resuelve, no sube a `heavy`. **El tier `heavy` no gasta contexto en plumbing** — recibe evidencia ya recolectada y juzga.
- El tier `expert` no hace volumen.

---

## 3. El gate: dos preguntas

Un artefacto se somete a **dos preguntas distintas**, y son distintas porque se responden con evidencia distinta:

| Pregunta | Se responde | Cuándo corre |
|---|---|---|
| **QA** — ¿funciona? | **ejecutando**: suite con su salida pegada, el test revertido que falla sin el código, casos borde, el diff | por artefacto |
| **PROYECTO** — ¿era lo que tocaba? | **trazando**: ticket → archivo → línea, lo tocado fuera del alcance, decisiones sin ADR, coherencia de IDs y nombres, estado de `STATE.md` | al cierre de fase, sobre el conjunto |

Juntas en una sola lectura, la segunda pierde: la evidencia ejecutable es más vistosa y se lleva la atención. Un checklist más largo no cambia dónde mira quien lo lee.

PROYECTO corre sobre el conjunto porque la coherencia cross-artefacto solo se audita con todo a la vista. **Escape declarado:** por artefacto cuando ese artefacto va a ser insumo de trabajo paralelo, o sea cuando revertirlo después cuesta más que auditarlo ahora.

### Cuántos agentes: `modo_gates` en `STATE.md`

**`uno` (default).** Un agente `heavy` independiente responde las dos preguntas y firma **dos veredictos separados**, cada uno contra su mitad de la rúbrica.

**`dos` (opt-in).** Dos gates en serie, cada uno partido en dos capas:

| Sub-seat | Tier | Qué hace | Qué NO hace |
|---|---|---|---|
| **RECOLECTOR** | `build` | corre, grepea, compila, trazea; devuelve **evidencia cruda con `archivo:línea` y salida textual pegada** | no juzga, no asigna severidad |
| **JUEZ** | `heavy` | lee la evidencia, aplica la rúbrica, asigna severidad, firma `GO`/`NO-GO` | no recolecta |

```
WORKER-BUILD → WORKER-TEST
      ↓
   QA:        RECOLECTOR (build) → JUEZ (heavy)
      ↓ GO
   PROYECTO:  RECOLECTOR (build) → JUEZ' (heavy, otra instancia)
      ↓ GO
   GATE HUMANO → Daniel Santiváñez aprueba
```

Partir el gate es una decisión de **asignación, no de ahorro**: cuesta más agentes. Lo que mejora es la calidad del contexto por decisión cara — el juez gasta su ventana juzgando, no leyendo `grep`. **El default es `uno`** porque este motor todavía no está calibrado sobre código real; subir a `dos` es una decisión con dueño, registrada.

### Las dos guardas (valen en los dos modos)

1. **Evidencia textual, nunca resumen.** Parafrasear la salida es defecto **del gate**, no del artefacto.
2. **No se firma a ciegas.** Verifica por tu cuenta lo que huela raro y **refuta** el hallazgo que no resista. Un hallazgo que no sobrevive verificación se reporta refutado, no se arregla.

### Reglas duras

1. **Independencia:** quien recolecta y quien firma no pueden haber construido ni testeado ese artefacto, ni ser la instancia que planeó u orquestó.
2. Con `modo_gates: dos`, **jueces distintos**: quien firma QA no firma PROYECTO.
3. **Máx 3 iteraciones por pregunta, por artefacto**, con presupuestos separados (`iteraciones_qa` / `iteraciones_proyecto`).
4. **3 es techo, no meta.** Cierra en cuanto una ronda no devuelve ni BLOCKER ni MAJOR. Los MINOR **no compran otra iteración**: se arrastran como deuda declarada al gate humano. Una ronda que solo discute conteos ya dejó de pagar.
5. **La iteración 2 revisa cierre + regresión**, no solo cierre: arreglar un BLOCKER e introducir un MAJOR nuevo es común.
6. **Nada llega al humano con una sola pregunta respondida.**
7. `NO-GO` **rebota al generador**, no al humano.
8. **El gate no fija la agenda.** Un `NO-GO` sobre archivos fuera del alcance declarado se reporta como deuda, no se persigue.

---

## 4. Experto-crux (on-call)

El tier experto **no** es workhorse. Se invoca **solo para el crux** — 2–3 llamadas por fase. Gatillos (basta ≥1):

- ADR **irreversible y contestado**.
- **Pivote** de alcance, mercado o modelo de negocio.
- **Go/no-go** de gate de fase.
- **Deadlock** gate↔generador tras 3 iteraciones.
- **Conflicto entre las dos preguntas** (QA da `GO`, PROYECTO da `NO-GO` por razón de fondo, o al revés) que el tier `heavy` no cierra.
- Adjudicación de **correctness contestada** que ni el tier `heavy` ni una herramienta determinística cierran.

Si superas ~3 llamadas al experto por fase, algo se está mal-escalando abajo: revisa por qué el tier `heavy` no cierra.

> Cada vez que el experto atrape algo que los tiers de abajo no vieron, **anótalo como precedente** (una línea: qué falló, quién lo atrapó, qué regla nueva sale). Esos precedentes son la justificación de la capa adversarial y alimentan las rúbricas de `docs/method/rubrics.md`.

---

## 5. Frontera agente / humano

Equipo mínimo viable ≠ 100% agentes. Declara aquí los toques humanos irreemplazables de Landing Gob Perú:

- **Daniel Santiváñez / gate** → aprueba gates de fase y pivotes. No delegable. Es el gate final, después de las dos preguntas.
- **Autoridad de dominio** → la persona cuyo juicio experto no se puede sustituir con un modelo (validación de correctitud, criterio profesional, responsabilidad legal). Nombra el rol concreto o borra la línea.
- **Relación externa** → cierre con clientes, proveedores o instituciones. El agente prepara el material; la persona cierra.

El resto = agentes.

---

## 6. Los loops que hacen girar la organización

1. **Delivery** (obligatorio): **PLANNER** produce los subtasks → **ORCHESTRATOR** los delega → Engineering construye → WORKER-TEST prueba → **QA (¿funciona?)** → **PROYECTO (¿era lo que tocaba?)** → **gate humano**. Fase-driven (F0–F5).
2. **Calidad / flywheel** (opcional; borra si no aplica): uso → feedback → curación → activo verificado → mejor producto → menos cómputo por unidad de valor. Si Landing Gob Perú tiene un activo que mejora con el uso, este loop es el moat; descríbelo explícitamente.
3. **Demanda** (opcional; borra si no aplica): señal externa (usuario, cliente, stakeholder) → Product Owner → backlog. Cierra el ciclo entre lo que se construye y lo que alguien pidió.

Pegamento cross-capa: **`STATE.md` + ninguno**. Un solo estado, sin silos. Si un dato vive en dos lados, uno de los dos está mentira.

---

## 7. Cómo correr un squad (mecánica con la herramienta `Agent`)

- **Paralelo real:** varios `Agent` en un mismo mensaje corren concurrente, cada uno con su `model`. Lanza en paralelo los subsistemas independientes; el subsistema del que todos dependen (fundación, contratos, esquema) va **primero y solo**.
- **Herencia de contexto vs. tiering:** un sub-agente que hereda el contexto del orquestador normalmente **ignora el override de modelo** y corre en el modelo del padre. Úsalo solo cuando necesites el contexto completo y te sirva ese modelo. Para tiering real usa un agente de contexto fresco que respete `model`, con brief explícito y autocontenido.
- **Patrón por artefacto:** generador → **QA (agente independiente, adversarial)** → … → **PROYECTO al cierre de fase** → gate humano. Máx **3 iteraciones por pregunta**; 3 es techo, no meta. Si no converge, escala al humano con las opciones en conflicto.
- **Las preguntas no van en paralelo entre sí** (QA → PROYECTO es serie), pero **dentro** de una pregunta la recolección de evidencia sí puede paralelizarse por eje (tests / trazabilidad / coherencia) antes de entregar a quien firma.
- **Runner de workflows** (opt-in explícito) para orquestar decenas de agentes de forma determinística: pipeline con barrera por artefacto, loop-until-dry, verify adversarial. Consume muchos tokens; justifícalo.
- **No escribir en paralelo el mismo archivo:** los workers devuelven contenido y el orquestador consolida y escribe, o cada worker escribe su propio archivo. Nunca dos escritores sobre un path.
- **Brief de worker:** objetivo, entradas exactas (rutas), formato de salida, restricciones, y qué NO tocar. Un worker sin "qué no tocar" expande el scope.

---

## 8. Regla de oro

**Quien produce no juzga.** El PLANNER produce los subtasks y el ORCHESTRATOR los delega (pueden ser la misma instancia `heavy`); quien evalúa es **siempre** un agente aparte, sin el contexto de construcción — si no, no es adversarial: revisa su propio razonamiento y lo confirma.

Y son **dos preguntas, no una**: **QA si funciona, PROYECTO si era lo que tocaba.** El tier `heavy` firma, el `build` trae la evidencia, el `expert` solo aparece en el crux, el humano cierra. **Nada llega al humano con una sola pregunta respondida**, y el orquestador nunca salta el gate.

---

## 9. Skill asociada

`/squad` (en `.claude/skills/squad/`) ejecuta este modelo para una tarea o fase concreta: el PLANNER produce los subtasks, el ORCHESTRATOR los delega a workers en paralelo, cada artefacto responde las dos preguntas del gate, escala el crux al tier `expert`, y presenta al gate humano. Borra esta sección si no instalas la skill.
