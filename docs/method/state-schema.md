# Esquema de `STATE.md`

`STATE.md` es el **estado vivo** del proyecto: lo que sigue siendo cierto hoy. Un agente
que abre el repo sin contexto debe poder leerlo entero y saber dónde está el proyecto,
qué está aprobado, qué está pendiente de decisión y qué supuestos sostienen todo.

Es un único bloque YAML dentro de un `.md`. El Markdown de alrededor es cabecera humana;
el bloque YAML es lo que se parsea y se cita.

## Convención: el YAML va sin tildes

El bloque YAML se escribe deliberadamente **sin caracteres acentuados**. No es descuido:
el contenido se busca con grep, se difea y se inyecta en prompts de agentes, y los acentos
introducen variantes de matching y ruido de encoding. Los títulos Markdown fuera del bloque
sí llevan tildes normales. Nadie debe "corregir la ortografía" del YAML.

## Las claves

**`proyecto`** — nombre humano. Constante durante toda la vida del repo.

**`fase_activa`** — la fase en curso, una sola. Cambia solo cuando un gate abre la siguiente.

**`gates_aprobados`** — lista de gates cerrados con su fecha. Un rebase de una fase ya
aprobada se anota como entrada adicional en la misma línea de esa fase, no reemplaza la
original: interesa la historia de aprobaciones, no solo la última.

**`gate_pendiente`** — un único string: qué se somete al humano **ahora** y con qué
evidencia. Es la clave que más se degrada. Debe responder tres cosas: qué se produjo, qué
verificación independiente pasó, y qué decisión concreta se pide. Cuando el gate se aprueba,
su contenido no se archiva aquí: se resume en `gates_aprobados`, la narrativa se va al
runlog, y el campo se reescribe con el gate siguiente (o se vacía).

**`modo_gates`** — `uno` o `dos`. Constante del proyecto, se declara en el bootstrap y se
cambia solo con una decisión registrada (ADR o gate), nunca sobre la marcha.

Todo proyecto responde **dos preguntas** antes del gate humano: *¿funciona?* (QA) y *¿era lo
que tocaba?* (PROYECTO). Lo que este campo decide es cuántos agentes las responden.

- `uno` (default) — un evaluador tier `heavy` emite **dos veredictos separados**, uno por
  pregunta, cada uno contra su mitad de la rúbrica. Una sola instancia, dos firmas.
- `dos` (opt-in) — dos gates en serie, cada uno partido en RECOLECTOR (tier `build`, reúne
  evidencia) → JUEZ (tier `heavy`, firma). Jueces distintos entre sí. Cuatro agentes por
  artefacto.

El default es `uno` a propósito: el motor de dos gates **nunca corrió sobre código real**, y
un proyecto de seis archivos no amortiza cuatro agentes por artefacto. Ver
`docs/method/rubrics.md` §4.

**`scrum_backend`** — dónde vive el backlog externo. Debe tolerar que no exista: con
`tool: ninguno` el resto de subclaves se omite y `uso` apunta a la ruta del backlog dentro
del repo. Cuando hay tracker, se registra **dónde** viven las credenciales, nunca su valor.
Ningún token, key o id de acceso entra jamás a este archivo.

**`artefactos`** — inventario de todo lo producido, con id `F<n>-A<n>` (fase + índice dentro
de la fase). El id no se reusa ni se renumera aunque el artefacto quede superado.

- `estado` ∈ `[draft|in_eval|approved|rejected|implemented|superseded]`. **En minúscula,
  siempre.** Es el mismo enum que la cabecera de los documentos de fase
  (`.claude/templates/phase-doc.md`): un artefacto tiene **un** estado, y dos archivos que lo
  escriben distinto terminan discrepando sobre el mismo `F<n>-A<n>`.

  `draft` = existe pero no pasó evaluación. `in_eval` = en evaluación ahora mismo, sin
  importar cuál de las dos preguntas esté corriendo. `approved` = pasó gate humano.
  `rejected` = el humano lo rechazó; se conserva la entrada con la causa raíz, porque un
  rechazo es información. `implemented` = existe en el producto, no solo en el documento.
  `superseded` = otro artefacto lo reemplazó; se conserva la entrada con el puntero al que
  lo reemplaza.

  El enum no se parte por pregunta. "Pasó QA y espera PROYECTO" se lee de los dos campos de
  veredicto, no de un estado nuevo: agregar `in_qa`/`in_proyecto` duplicaría información que
  ya está escrita y abriría la posibilidad de que se contradigan.
- **`version` y `superseded` no son lo mismo, y confundirlos borra historia.** Si el mismo
  artefacto se reescribe, sube `version` y el estado no cambia: sigue siendo `F2-A1`. Si un
  artefacto **distinto** lo reemplaza, `F2-A1` pasa a `superseded` apuntando a `F2-A5`, y
  `F2-A5` nace en `draft` con su propia numeración. Marcar como `superseded` lo que era una
  versión nueva fragmenta un artefacto en dos ids; subir `version` cuando en realidad lo
  reemplazó otro artefacto esconde que hubo un cambio de identidad.
- `version` sube en cada rebase o reescritura sustantiva, no por correcciones de typo.
- `veredicto_qa` y `veredicto_proyecto` — la firma de cada pregunta, con la iteración en que
  cerró: `"GO en iter 2"`, `"pendiente"`, `"pendiente (cierre de fase)"`, `"NO-GO iter 1"`.
  En artefacto no ejecutable, `veredicto_qa` admite `"N/A - sin artefacto ejecutable"`, que
  es un veredicto declarado, no un campo vacío. Con `modo_gates: uno` los llena el mismo
  evaluador; con `dos`, cada juez el suyo.
- `iteraciones_qa` e `iteraciones_proyecto` — rondas consumidas **por cada pregunta**, contadas
  por separado. Cada una lleva su propio presupuesto de 3 contra el mismo artefacto: un
  artefacto que iteró dos veces por alcance y ninguna por correctitud cuenta una historia
  distinta a uno que hizo lo contrario, y un contador único borra esa distinción. Juntas son
  la métrica más honesta de cuánto costó el artefacto.
- `nota` dice **qué cambió en esta versión y por qué** (qué CR o gate lo motivó). No resume
  el contenido del artefacto: para eso está el artefacto.

**`decisiones`** — ADRs con id `ADR-NNNN` correlativo, nunca reusado. `estado` ∈
`[proposed|accepted]`. Aquí va solo el resumen de una línea; el texto completo vive en
`decisions/NNNN-*.md`. Una decisión superada no se borra: se le agrega la nota que apunta
a la que la reemplaza.

**`assumptions`** — id `A<n>`. Lo que el proyecto da por cierto sin haberlo probado.
`validado: false` es el estado normal y sano; pasa a `true` solo con evidencia. Cuando un
CR supera parcialmente un supuesto, el texto se enmienda in-place dejando constancia de qué
cláusula murió y por cuál decisión. Los supuestos no validados son la superficie de riesgo
real del proyecto: si la lista está toda en `true`, casi seguro alguien mintió.

**`notas_para_fase_siguiente`** — handoff de la fase en curso a la que viene. Existe para
no decidir en la fase equivocada: aquí se anota el input recibido y quién lo evalúa, no la
decisión. Se **vacía** cuando la fase siguiente arranca y absorbe las notas.

**`riesgos`** — id `R<n>`, con `prob` e `impacto`. Un riesgo neutralizado no se borra: se
marca como neutralizado **y en qué alcance**, porque casi siempre sigue vivo en otro plano
del sistema o en una fase posterior.

**`change_requests`** — id `CR-NNN` correlativo. Todo cambio sobre algo ya aprobado entra
por aquí. `estado` cubre el ciclo `propuesto → aceptado → aplicado`, más `aplicado (parcial)`,
`superado` y `ENMENDADO`. Un CR superado o enmendado se conserva con el puntero al que lo
reemplaza: el registro del debate es tan valioso como la conclusión.

**`backlog`** — un string: dónde vive, cuándo se pobló, desde qué fuente y en qué estado
global. Los items no viven aquí.

**`retro_acciones`** — acciones de retro pendientes. Vacía es un estado legítimo; anotar
desde qué fase se lleva el registro.

## Quién lo actualiza

El **orquestador** de la sesión, siempre. Nunca un worker paralelo: `STATE.md` es un archivo
compartido y dos escritores concurrentes lo corrompen o se pisan. Los workers reportan al
orquestador y él consolida.

## Cuándo se actualiza

Dos momentos, ambos obligatorios:

1. **Al cierre de cada sesión**, junto con la entrada de runlog, en el mismo commit. Estado
   y bitácora se mueven en pareja: un `STATE.md` actualizado sin entrada de runlog deja el
   "qué" sin el "cómo", y una entrada de runlog sin `STATE.md` deja el archivo mintiendo.
2. **En cada gate**, apenas el humano decide. El gate mueve `gate_pendiente`,
   `gates_aprobados`, el `estado` de los artefactos involucrados y, casi siempre, el
   `estado` de algún ADR.

Fuera de esos dos momentos también se toca cuando aparece un CR, un riesgo o un supuesto
nuevo: eso se registra cuando se descubre, no al final.

## El error típico: dejar que se vuelva un log

`STATE.md` degrada de una sola manera, y siempre igual: cada sesión **añade** narrativa a
`gate_pendiente` y a las notas de artefacto en vez de **reemplazar** la que quedó obsoleta.
El archivo crece, acumula pasado y termina siendo un runlog mal ordenado que ningún agente
lee entero y ningún humano audita.

La regla: **`STATE.md` responde "¿qué es cierto hoy?"; `runlog.md` responde "¿cómo llegamos
acá?"**. Si un texto está en pasado y ya no condiciona ninguna decisión futura, no pertenece
a `STATE.md`.

Síntomas de que está pasando:

- `gate_pendiente` describe tres gates, dos de ellos ya aprobados.
- Las notas de artefacto narran la sesión en la que se produjo el artefacto.
- Hay que leer el archivo entero para saber qué falta.
- Aparecen separadores del tipo "previo:", "contexto previo:" encadenando historia.

Cuando se detecta: mover la narrativa histórica a la entrada de runlog que le corresponde
y dejar en `STATE.md` solo el hecho vigente. Una clave que solo se puede entender leyendo
su propia historia ya es un log.

## Precauciones

- **Cero secretos.** Ni tokens, ni keys, ni ids de acceso, ni rutas a archivos de
  credenciales con su contenido. Se referencia dónde viven, nunca el valor.
- **Sin ids reusados.** `F<n>-A<n>`, `ADR-NNNN`, `A<n>`, `R<n>`, `CR-NNN` son namespaces de
  solo-crecer. Renumerar rompe todas las referencias cruzadas de artefactos y del runlog.
- **Un solo bloque YAML.** Debe seguir siendo parseable; si deja de serlo, deja de servir
  como fuente para agentes.
