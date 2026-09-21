# Contrato de los hooks del andamiaje

Referencia de los 4 hooks que instala `new-software-project`: que hacen, que los dispara,
como fallan, y como probarlos.

---

## ADVERTENCIA DE SEGURIDAD — leela antes de scaffoldear

Un `.claude/settings.json` con hooks **ejecuta codigo desde el primer arranque de la sesion,
sin pedir confirmacion**. No hay prompt de permisos para un hook: si el archivo esta ahi, corre.

Consecuencias operativas:

1. **El skill DEBE imprimir, al terminar el scaffold, la lista de hooks que instalo**, con
   evento, script y una linea de que hace cada uno. El usuario tiene que enterarse de que
   acaba de instalar codigo auto-ejecutable en su proyecto, y por que.
2. **Nada de secretos ni comandos literales de red en `settings.json`.** El archivo se
   commitea y se comparte; `settings.local.json` es el que queda fuera de git.
3. Los scripts se instalan en `.claude/hooks/` con permiso de ejecucion (`chmod +x`).
   Sin el bit de ejecucion el hook falla silenciosamente y el andamiaje parece funcionar.
4. Agrega al `.gitignore` los marcadores de sesion:
   `.claude/.session-marker`, `.claude/.session-marker.reminded`, `.claude/.session-marker.openspec`.
   Son estado local por maquina; commitearlos genera ruido y falsos recordatorios.

---

## Contrato comun

- Los hooks del proyecto viven en `.claude/settings.json`, con la forma:
  ```json
  {"hooks": {"<Evento>": [{"matcher": "<regex>",
    "hooks": [{"type": "command", "command": "...", "timeout": 10}]}]}}
  ```
- En el string `command`, **`$CLAUDE_PROJECT_DIR` SI expande** (se evalua en shell). VERIFICADO.
- **`${CLAUDE_SKILL_DIR}` NO es variable de entorno.** Solo se sustituye al cargar un `SKILL.md`.
  Un script que la lea como env var recibe vacio. No la uses dentro de scripts.
- El hook recibe por **stdin un JSON** con `session_id`, `transcript_path`, `cwd`,
  `hook_event_name`; en `PreToolUse` ademas `tool_name` y `tool_input`. VERIFICADO.
- **`exit 2` bloquea** la accion y el stderr llega al modelo como razon. VERIFICADO.
- **`exit 0` sigue.** El stdout puede ser JSON con
  `{"hookSpecificOutput": {"hookEventName": "...", "additionalContext": "..."}}`
  para inyectar contexto. VERIFICADO en SessionStart.
- **`jq` no esta garantizado en la maquina; `python3` si.** Todo parseo/armado de JSON va con python3.
- Los scripts derivan la raiz del proyecto de su **propia ubicacion**
  (`dirname "${BASH_SOURCE[0]}"/../..`), no de env vars ni del `cwd` del payload. Es lo unico
  deterministico cuando el modelo trabaja en un subdirectorio.

### Detalle de implementacion que muerde

El payload de stdin **no se puede pipear a `python3 -`** si el programa de python entra por
heredoc: compiten por stdin. Los scripts que necesitan las dos cosas vuelcan el payload a un
temporal (`mktemp` + `trap ... EXIT`) y le pasan la ruta a python por argv.

---

## 1. `session-start.sh` — evento `SessionStart`

**Estado del evento: VERIFICADO.**

| | |
|---|---|
| Dispara | al arrancar cualquier sesion en el proyecto |
| Matcher | `""` (todas) |
| Salida | JSON con `additionalContext` |
| Bloquea | nunca |

**Que hace.** Inyecta al modelo el contenido de `STATE.md` y las **ultimas 3 entradas** de
`runlog.md` (delimitadas por encabezados `## `, asumiendo la mas reciente arriba). Trunca:
12.000 chars de STATE, 4.000 por entrada de runlog. Ademas graba
`.claude/.session-marker` con el HEAD actual y borra los marcadores de recordatorio previos.

**Como falla.** Si no existe ni `STATE.md` ni `runlog.md`, no imprime nada y sale 0. Si el
repo no es git, se saltea el marcador. Si python revienta, sale 0 sin contexto.

**Si tu runlog crece hacia abajo** (mas reciente al final), cambia `ENTRIES_FROM = "top"` por
`"bottom"` dentro del script.

---

## 2. `guard-protected.sh` — evento `PreToolUse`

**Estado del evento: VERIFICADO.**

| | |
|---|---|
| Dispara | antes de cada `Write` o `Edit` |
| Matcher | `Write\|Edit` |
| Salida | stderr + `exit 2` cuando bloquea |
| Bloquea | si |

**Que bloquea y por que.**

| Regla | Condicion | Razon |
|---|---|---|
| ADR aceptado | ruta bajo `decisions/` (o nombre `NNNN-*.md`) **y** el cuerpo tiene `**Estado:**` en uno de los tres estados congelados: `accepted`, `superseded` o `deprecated` | un ADR aceptado es registro historico; editarlo borra la evidencia de por que se decidio |
| Metodologia | basename `PROJECT_INSTRUCTIONS.md` | las reglas del proceso las cambia el OWNER en el gate, no una tarea en curso |
| Runlog | basename `runlog.md` **y** `tool_name == "Write"` | `Write` sobreescribe el archivo entero; la bitacora solo se apenda con `Edit` |

Cada bloqueo manda al modelo **que se bloqueo, por que, y que hacer en su lugar**
(crear un ADR que supersede / llevarlo al gate / usar `Edit`). Un guard que solo dice "no"
hace que el modelo reintente variantes de lo mismo.

**Como falla.** Si el JSON no parsea, si falta `file_path`, o si el archivo todavia no existe
(ADR nuevo), **no bloquea**. Un guard roto no puede frenar el trabajo.

**Comportamiento verificado** (9 casos, todos correctos):
bloquea ADR accepted con Edit / deja pasar ADR proposed / bloquea PROJECT_INSTRUCTIONS /
bloquea runlog+Write / deja pasar runlog+Edit / deja pasar ADR nuevo inexistente /
deja pasar JSON basura / deja pasar payload sin file_path / resuelve rutas relativas contra la raiz.

---

## 3. `check-convention.sh` — evento `PostToolUse`

**Estado del evento: VERIFICADO.** Dispara al completarse la herramienta y su
`additionalContext` llega al modelo: comprobado escribiendo un archivo fuera de convencion
en una sesion real, con el modelo citando el aviso de vuelta.

Aun asi el script esta escrito a prueba de que el evento no dispare: en ese caso no cambia
nada, y cuando dispara solo AVISA (sale 0 siempre, nunca bloquea).

| | |
|---|---|
| Dispara | despues de cada `Write` o `Edit` |
| Matcher | `Write\|Edit` |
| Salida | JSON con `additionalContext`; si el canal se ignora, queda como texto en stdout |
| Bloquea | **nunca** (siempre `exit 0`) |

**Que avisa.** (cuatro reglas)
1. Archivo en `phases/` cuyo basename no cumple `NN-<slug>.md` (dos digitos, kebab-case).
   Exentos: `README.md`, `index.md`, `CLAUDE.md`, `AGENTS.md`.
2. ADR en `decisions/` que rompe la numeracion: **hueco** en la secuencia o **numero duplicado**.
3. Archivo `NNNN-*.md` con encabezado `**Estado:**` escrito **fuera** de `decisions/`.

Son avisos, no bloqueos: una convencion de nombres no justifica frenar el trabajo, pero
si justifica que el modelo lo sepa antes de seguir escribiendo hermanos mal nombrados.

**Como falla.** Fuera del proyecto, sin `file_path`, o con JSON invalido: sale 0 en silencio.

---

## 4. `remind-runlog.sh` — evento `Stop`

**Estado del evento: VERIFICADO, con una salvedad de visibilidad.** `Stop` dispara al
cerrar el turno y el hook produce su mensaje. La salvedad: en headless (`claude -p`) el
texto NO aparece en la salida del comando. Se verifico por dos vias indirectas: el archivo
`.session-marker.reminded` quedo con el HEAD posterior al commit (solo lo escribe este hook,
asi que corrio), y reproduciendo a mano el estado exacto del cierre el hook emitio el
recordatorio completo. Si dependes de verlo en headless, no lo veras; en sesion interactiva
es donde tiene sentido.

Lo que sigue SIN medir es por que canal exacto se entrega la salida de un `Stop`. Por eso el
script imprime **texto plano** en stdout (no JSON) y **nunca usa `exit 2`**: bloquear un
`Stop` puede dejar la sesion en bucle.

| | |
|---|---|
| Dispara | al terminar el turno |
| Matcher | `""` |
| Salida | texto plano en stdout |
| Bloquea | nunca |

**Que recuerda.**

- **A)** Entraron commits desde que arranco la sesion (`HEAD` != `.claude/.session-marker`)
  **y** `runlog.md` no aparece ni en esos commits ni en el working tree.
- **B)** Hay changes de openspec con **todas** las tareas marcadas (`- [x]`, ningun `- [ ]`)
  que siguen sin archivar.

**Idempotencia.** No repite el mismo aviso: deja constancia en
`.claude/.session-marker.reminded` (el HEAD ya avisado) y `.claude/.session-marker.openspec`
(la lista ya avisada). `session-start.sh` los borra al abrir sesion nueva.

**Como falla.** Sin repo git, sin marcador, sin `runlog.md` o sin `openspec/`: sale 0 en silencio.

**Comportamiento verificado del script** (no del evento): avisa una vez tras un commit sin
runlog / no repite en el mismo HEAD / calla si el runlog fue tocado en el working tree /
calla sin marcador.

---

## Como probar un hook

El metodo que funciono es un **canario**: una corrida real de Claude Code, no-interactiva,
en el directorio del proyecto, verificando un marcador observable.

```bash
cd /ruta/al/proyecto
claude -p "<prompt que fuerza el evento>" --model haiku
```

`-p` corre en modo no-interactivo, `--model haiku` lo hace barato. La sesion carga
`.claude/settings.json` del directorio, asi que los hooks del proyecto entran en juego.

**Por evento:**

| Evento | Prompt canario | Que verificar |
|---|---|---|
| `SessionStart` | `"repeti textualmente el valor de fase_activa que veas en el contexto"` | responde con el valor real de `STATE.md`, que no pudo saber de otro lado |
| `PreToolUse` | `"escribi la palabra HOLA al final de decisions/<un ADR accepted>"` | el modelo reporta que fue bloqueado, cita la razon, y el archivo **no cambio** (`git diff` limpio) |
| `PostToolUse` | `"crea el archivo phases/<fase>/archivo_mal_nombrado.md con una linea"` | el modelo menciona el aviso de convencion |
| `Stop` | commitea algo sin tocar el runlog, despues `"decime ok"` | el recordatorio aparece al cerrar el turno |

**Antes de sospechar del contrato, descarta lo aburrido:**

```bash
# 1. el script corre solo, con un payload a mano
echo '{"tool_name":"Edit","tool_input":{"file_path":"decisions/0001-x.md"}}' \
  | .claude/hooks/guard-protected.sh; echo "exit=$?"

# 2. tiene bit de ejecucion
ls -l .claude/hooks/

# 3. el settings.json es JSON valido
python3 -c "import json;json.load(open('.claude/settings.json'));print('ok')"

# 4. sintaxis de bash
for f in .claude/hooks/*.sh; do bash -n "$f" && echo "ok $f"; done
```

Un hook que "no dispara" casi siempre es: falta `chmod +x`, la ruta del `command` esta mal, o
el `matcher` no matchea el nombre real de la herramienta.

---

## Estado de verificacion — resumen honesto

**Verificado empiricamente (contrato del entorno):**
- expansion de `$CLAUDE_PROJECT_DIR` en el string `command`
- forma del payload de stdin (`session_id`, `transcript_path`, `cwd`, `hook_event_name`;
  `tool_name` + `tool_input` en PreToolUse)
- `exit 2` bloquea y el stderr llega al modelo
- `additionalContext` funciona en `SessionStart`
- disparo de `SessionStart` y de `PreToolUse`

**Verificado a nivel de script** (corridos contra un proyecto sintetico con payloads a mano;
16 casos entre las 4 herramientas, mas un proyecto vacio donde los 4 salen 0 en silencio):
logica de las 3 reglas del guard, seleccion de las 3 entradas del runlog, escritura y
limpieza de marcadores, las 3 reglas de convencion, deteccion de commits sin runlog,
deteccion de openspec sin archivar, y la idempotencia de ambos recordatorios.

**VERIFICADO en sesion real** (ademas de los tests de logica): que disparan los cuatro
eventos `SessionStart`, `PreToolUse`, `PostToolUse` y `Stop`; que `additionalContext` llega
al modelo en `SessionStart` y en `PostToolUse`; y que `exit 2` en `PreToolUse` bloquea la
accion y entrega el stderr como razon.

**SIN verificar (asumido del contrato documentado):**
- **por que canal se entrega la salida de `Stop`**: el hook corre y produce su texto, pero en
  headless (`claude -p`) ese texto no aparece en la salida del comando
- el efecto de `timeout` cuando se excede (si mata el hook, si lo reporta, si aborta la accion)
- si un `exit 2` en `Stop` bloquea el cierre del turno (por eso el script no lo usa jamas)

Cuando alguno se verifique, actualiza esta seccion **y** el comentario de cabecera del script
correspondiente. Los comentarios que dicen PENDIENTE DE VERIFICAR son el registro de lo que no
sabemos; borrarlos sin haber medido convierte una suposicion en un hecho falso.
