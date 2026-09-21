---
name: squad
description: Orquesta un squad de agentes reales, model-tiered, para una tarea o fase de Landing Gob Perú. El PLANNER produce los subtasks, el ORCHESTRATOR los delega a workers en paralelo, y cada artefacto responde las dos preguntas del gate — QA (¿funciona?) y PROYECTO (¿era lo que tocaba?) — con evaluador independiente y máx 3 iteraciones por pregunta, escala el crux al tier experto, y presenta al gate humano. Usar cuando el usuario diga "arma/corre un squad", "orquesta esto con agentes", "fan-out multi-agente", o pida producir/rebasar un artefacto o una fase que amerite paralelizar. Lee AGENTS.md para el modelo completo.
---

# Squad — orquestacion multi-agente para Landing Gob Perú

Referencia del modelo de roles y tiers: **`AGENTS.md`** (raiz del proyecto).
Metodologia de fases: **`PROJECT_INSTRUCTIONS.md`**. Rubricas: **`docs/method/rubrics.md`**.
Estado vivo: **`STATE.md`**.

Leelos antes de lanzar nada.

## Tiers, no marcas

Esta skill razona en **tiers**: `bulk`, `build`, `heavy`, `expert`. El mapeo tier → modelo
concreto vive **solo** en `AGENTS.md` §2, para que cambiar de modelo sea editar una tabla y no
cazar nombres por todo el repo.

| Tier | Para que |
|---|---|
| `bulk` | formato, dedup, plumbing, clasificacion trivial. O un script, sin LLM |
| `build` | la mayoria del codigo y artefactos, los tests, y la **recoleccion de evidencia** del gate |
| `heavy` | planear, orquestar, y **firmar los veredictos** |
| `expert` | el crux, contado (ver Reglas duras) |

Cuando lances un `Agent`, resolve el tier contra `AGENTS.md` §2 y pasa ese `model`. Si un
prompt de esta skill nombra un modelo concreto, esta mal escrito: reportalo.

## Cuando NO usar

- **Tarea trivial o conversacional** → hacela directo. Montar fan-out para algo secuencial y
  chico es desperdicio: mas overhead de coordinacion que trabajo real.
- **El cuello es planeamiento, no throughput.** Si el "que" no esta claro, aclaralo primero.
  Mas agentes en paralelo solo producen mas output malo mas rapido.

Right-sizear la herramienta al trabajo es parte de la disciplina.

## Cadena

```
PLANNER (heavy) produce subtasks  →  ORCHESTRATOR (heavy) delega
   ↓            (pueden ser la misma instancia; los gates nunca)
WORKER-BUILD (build, N en paralelo)  →  WORKER-TEST (build, agente distinto)
   ↓
QA — ¿funciona?               por artefacto
   ↓ GO
PROYECTO — ¿era lo que tocaba?   al cierre de fase, sobre el conjunto
   ↓ GO
GATE HUMANO → aprobacion explicita de Daniel Santiváñez
```

`NO-GO` rebota al WORKER-BUILD, no al humano. **Max 3 iteraciones por pregunta, por
artefacto**, con presupuestos separados. Cada una cierra en cuanto una ronda no devuelve
BLOCKER ni MAJOR.

**PLANNER y ORCHESTRATOR son roles distintos, no necesariamente agentes distintos.** Por
defecto es la misma instancia `heavy` cambiando de sombrero: la separacion existe para que el
plan quede explicito antes de delegar, no para gastar dos contextos. Se separan en `Agent`
distintos solo si la fase es grande. Lo que **nunca** comparte instancia con ellos es quien
evalua.

## Flujo

### 1. Encuadra (PLANNER, `heavy`)

Lee `STATE.md`: fase activa, `modo_gates`, gate pendiente, riesgos, cambios en curso. Verifica
el estado REAL (git, el codigo, ninguno) antes de asumir el que dice el ticket — regenerar
trabajo ya aprobado es la forma mas cara de fallar. Si el pedido contradice el estado,
**surface la contradiccion**, no la resuelvas en silencio.

Declara que vas a producir, que **NO** entra, y el `done_criteria` de cada subtarea.

### 2. Descompone (PLANNER produce; ORCHESTRATOR delega)

Parti la fase/tarea en artefactos **independientes**. Independientes significa **archivos
disjuntos**: si dos workers tocan el mismo archivo, o los fusionas o los serializas.

Mapea cada uno a un rol de `AGENTS.md` y a su tier:

- bulk / mecanico → `bulk`, o directamente un script sin LLM
- construir el artefacto → **WORKER-BUILD**, `build`
- probarlo → **WORKER-TEST**, `build` (nunca el mismo agente que construyo)
- planear y **firmar veredictos** → `heavy`
- **el crux** (pivote, decision irreversible y contestada, deadlock, conflicto entre las dos
  preguntas, correctness en disputa) → `expert`, budget 2–3 por fase

### 3. Fan-out (Round 1 — build + test)

Lanza los WORKER-BUILD independientes en **un mismo mensaje** para que corran en paralelo, con
`subagent_type: general-purpose` y el `model` del tier resuelto.

Cada brief lleva:
- las decisiones vigentes que lo condicionan (el worker arranca con contexto fresco: no sabe nada)
- las rutas **absolutas** de lo que tiene que leer
- **el spec inlineado en el prompt**, no solo la ruta: el worker que lee mucho antes de
  escribir es el que se cuelga; front-loadear el contexto es lo que hace que el fan-out corra
- el entregable exacto
- **"devolve el contenido, no escribas archivos"** — consolida el orquestador

Los WORKER-TEST corren detras de cada build, como agentes distintos. El chequeo del crux, si
aplica, corre en paralelo en este mismo round.

### 4. Las dos preguntas (Round 2)

Son **dos preguntas con evidencia y umbral distintos**, no un checklist mas largo. Cada una
emite su propio veredicto `GO` / `NO-GO` con defectos numerados BLOCKER / MAJOR / MINOR contra
su mitad de la rubrica (`docs/method/rubrics.md`).

**QA — ¿funciona?** Por artefacto. Se responde **ejecutando**: suite corriendo con su salida
**pegada** (no "parece que pasa"), el test revertido que efectivamente falla sin el codigo,
casos borde de la spec, mutation testing si es logica critica, el diff completo.

En artefacto no ejecutable (fases de documento): version reducida — ¿esta bien formado y es
internamente verificable? Si no hay nada que correr, se declara `QA: N/A — sin artefacto
ejecutable`, explicito. **No se omite el registro.**

**PROYECTO — ¿era lo que tocaba?** Al cierre de fase, sobre el **conjunto** de artefactos. Se
responde **trazando**: requerimiento/ticket → archivo → linea; lo que se toco **fuera** del
alcance declarado; decisiones tomadas sin ADR; inconsistencias de IDs/nombres contra
artefactos ya aprobados; estado de `STATE.md` y del runlog.

Corre sobre el conjunto porque la coherencia cross-artefacto — la mitad de su alcance — solo
se audita con todo a la vista. **Escape declarado:** por artefacto cuando ese artefacto va a
ser insumo de trabajo paralelo, o sea cuando revertirlo despues cuesta mas que auditarlo
ahora. Se declara en el plan, con motivo.

**Cuantos agentes las responden** lo dice `modo_gates` en `STATE.md`:

- **`uno`** (default): un agente `heavy` independiente responde las dos y firma dos veredictos
  separados.
- **`dos`** (opt-in): dos gates en serie, cada uno **RECOLECTOR** (`build`, reune evidencia
  cruda) → **JUEZ** (`heavy`, firma). Jueces distintos entre si.

Dale **todo** el diff, no un artefacto a la vez: la clase de defecto que solo este paso
encuentra es la incoherencia entre piezas, y esa solo se ve con todo en una mano.

### 5. Consolida y escribe

**Solo el orquestador escribe archivos.** Integra los drafts, aplica los fixes, escribe, y
verifica (<sin definir; lo fija F2> / lo que la fase exija). Actualiza `STATE.md`.

La iteracion 2 revisa **cierre + regresion**: que los defectos cerraron y que el fix no metio
otros. Arreglar BLOCKERs metiendo un MAJOR nuevo ya paso; por eso no alcanza con chequear
cierre.

### 6. Gate humano

Presenta:
- que produjo cada worker
- el **veredicto de QA** y el **veredicto de PROYECTO**, con las iteraciones de cada uno
- el veredicto del chequeo de crux, si hubo
- la evidencia de verificacion
- los MINOR diferidos, con su identificador
- **las decisiones que solo el humano toma**, como forks concretos, no como preguntas abiertas

Espera aprobacion explicita antes de avanzar de fase. El OWNER es Daniel Santiváñez.

## Reglas duras

- **Quien revisa ≠ quien genero.** Ni quien recolecta ni quien firma pueden haber construido o
  testeado ese artefacto, ni ser la instancia que planeo/orquesto.
- **PLANNER y ORCHESTRATOR pueden compartir instancia `heavy`**; el gate **nunca** la comparte
  con ellos.
- Con `modo_gates: dos`, **jueces distintos**: quien firma QA no firma PROYECTO.
- **Serie, no paralelo:** QA → PROYECTO → humano. Dentro de una pregunta, la recoleccion si
  puede paralelizarse por eje (tests / trazabilidad / coherencia).
- **Nada llega al humano con una sola pregunta respondida.**
- **Evidencia textual, nunca resumen.** Parafrasear la salida en vez de pegarla es defecto
  **del gate**, no del artefacto.
- **No se firma a ciegas.** Verifica por tu cuenta lo que huela raro y **refuta** el hallazgo
  que no resista. Un hallazgo que no sobrevive verificacion se reporta refutado, no se arregla.
- **Todo claim declara con que metodo se midio.** Un "verificado: cero ocurrencias" medido con
  un grep case-sensitive sobre una sola extension no es una verificacion, es una impresion.
- **Max 3 iteraciones por pregunta, por artefacto. 3 es techo, no meta.** Cierra en cuanto una
  ronda no devuelve BLOCKER ni MAJOR. Los MINOR **no compran otra iteracion**: se arrastran
  como deuda declarada al gate humano. Si una ronda solo discute conteos o redaccion, el gate
  ya dejo de pagar — cerrarlo es la decision correcta, no la floja.
- **El gate no fija la agenda.** Un `NO-GO` puede señalar archivos fuera del alcance que
  Daniel Santiváñez declaro. Eso se **reporta como deuda**, no se persigue.
- **El tier `heavy` no hace plumbing** — recibe evidencia recolectada y juzga.
- **El tier `expert` no hace volumen** — solo el crux, budget 2–3 por fase. Si lo superas, algo
  se esta mal-escalando abajo.
- **El tier `bulk` nunca toca el gate ni los tests.**
- Si tu harness tiene un modo de sub-agente que **hereda** el modelo del padre, no sirve para
  tiering: usa el modo que acepta override de modelo, con brief explicito.
- **Nunca dos agentes escribiendo el mismo archivo en paralelo.**
- Lo compartido entre workers (tipos, mocks, utilidades, contratos de nombres) lo siembra el
  orquestador **antes** del fan-out. Ese seed es tambien el lugar para cerrar deuda de squads
  previos y para evitar que N workers dupliquen lo mismo.
- **Acorda el vocabulario antes del fan-out.** Mismo nombre para el mismo concepto en todas las
  secciones. Piezas paralelas que no lo comparten no encajan, y la ronda de unificacion cuesta
  mas que los diez minutos de acuerdo previo.

## Cierre

1. Actualiza `STATE.md`: artefactos con **ambos** veredictos y las iteraciones de cada
   pregunta, decisiones, riesgos, gate.
2. Si hubo una decision significativa, agrega un ADR en `decisions/` con el siguiente numero de
   la secuencia. Un ADR aceptado no se edita: se supersede con uno nuevo.
3. Agrega una entrada en `runlog.md` (arriba de todo): que se hizo, proximo paso, aprendizaje.
4. **Anota cuantos defectos cazo cada pregunta y cuantos se le escaparon al gate humano.** Sin
   ese conteo el motor no es falsable y se vuelve ceremonia. Es tambien la unica forma de saber
   si `modo_gates: dos` vale lo que cuesta.

El aprendizaje es la parte que compone. Escribi el que hubieras querido leer al empezar.
