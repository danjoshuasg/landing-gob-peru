#!/usr/bin/env bash
# guard-protected.sh — hook PreToolUse, matcher "Write|Edit"
#
# Que hace: bloquea (exit 2) escrituras sobre artefactos inmutables del proceso:
#   1. ADR con "**Estado:** accepted" en el cuerpo  -> no se edita, se supersede.
#   2. PROJECT_INSTRUCTIONS.md                      -> metodologia, cambia por decision del OWNER.
#   3. runlog.md con la herramienta Write           -> Write sobreescribe la bitacora entera.
#
# Contrato: recibe por stdin un JSON con tool_name y tool_input (que trae file_path).
# exit 2 bloquea la accion y manda el stderr al modelo como razon.
# Evento VERIFICADO empiricamente.
#
# Degradacion: si el JSON no parsea, si falta file_path, o si el archivo no existe,
# NO bloquea (exit 0). Un guard roto no puede frenar el trabajo.
#
# Nota de implementacion: el payload de stdin se vuelca a un temporal porque el
# programa de python entra por stdin via heredoc; no se pueden usar los dos a la vez.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PAYLOAD_FILE="$(mktemp "${TMPDIR:-/tmp}/hook-guard.XXXXXX")" || exit 0
trap 'rm -f "$PAYLOAD_FILE"' EXIT
cat >"$PAYLOAD_FILE" 2>/dev/null || true
[ -s "$PAYLOAD_FILE" ] || exit 0

REASON="$(python3 - "$ROOT" "$PAYLOAD_FILE" 2>/dev/null <<'PY' || true
import json, os, re, sys

root, payload_file = sys.argv[1], sys.argv[2]

try:
    with open(payload_file, encoding="utf-8", errors="replace") as fh:
        payload = json.load(fh)
except Exception:
    sys.exit(0)

if not isinstance(payload, dict):
    sys.exit(0)

tool = payload.get("tool_name") or ""
tin = payload.get("tool_input") or {}
if not isinstance(tin, dict):
    sys.exit(0)

path = tin.get("file_path") or tin.get("path") or ""
if not path:
    sys.exit(0)

abspath = os.path.normpath(path if os.path.isabs(path) else os.path.join(root, path))
base = os.path.basename(abspath)
try:
    rel = os.path.relpath(abspath, root)
except ValueError:
    rel = abspath

# Un archivo que TODAVIA NO EXISTE nunca se bloquea: crearlo es scaffolding, no
# edicion. Sin esta guarda el andamiaje se bloquea a si mismo, porque el settings.json
# queda instalado antes de que existan runlog.md y PROJECT_INSTRUCTIONS.md.
exists = os.path.isfile(abspath)

# --- Regla 2: metodologia del proyecto ---------------------------------------
if base == "PROJECT_INSTRUCTIONS.md" and exists:
    print(
        "BLOQUEADO: PROJECT_INSTRUCTIONS.md es la metodologia del proyecto "
        "(fases, rubricas, definicion de done). No se edita en linea desde una tarea.\n"
        "Que hacer en su lugar: si de verdad hay que cambiarla, escribi la propuesta "
        "de cambio (que regla, por que, que rompe) y llevala al gate humano; el OWNER "
        "decide y edita. Si solo queres registrar como se hizo algo, eso va en runlog.md."
    )
    sys.exit(0)

# --- Regla 3: el runlog solo se APENDA ---------------------------------------
if base == "runlog.md" and tool == "Write" and exists:
    print(
        "BLOQUEADO: runlog.md solo se APENDA, y Write sobreescribe el archivo entero "
        "(perderias toda la bitacora historica).\n"
        "Que hacer en su lugar: usa Edit para insertar la entrada nueva encima de la "
        "primera entrada existente, respetando el formato de las que ya estan."
    )
    sys.exit(0)

# --- Regla 1: ADR aceptado ---------------------------------------------------
looks_like_adr = (
    (os.sep + "decisions" + os.sep) in (abspath + os.sep)
    or re.match(r"^\d{4}-.+\.md$", base) is not None
)
if looks_like_adr and exists:
    try:
        with open(abspath, encoding="utf-8", errors="replace") as fh:
            text = fh.read()
    except OSError:
        text = ""
    # Los tres estados inmutables. Un ADR superseded o deprecated es tan historico
    # como uno accepted: sigue explicando por que se decidio lo que se decidio en su
    # momento. Solo proposed y rejected se editan libremente.
    frozen = re.search(r"\*\*Estado:\*\*\s*(accepted|superseded|deprecated)\b", text, re.IGNORECASE)
    if frozen:
        print(
            "BLOQUEADO: {path} es un ADR con **Estado:** {estado}. Un ADR en ese estado "
            "es registro historico inmutable: editarlo borra la evidencia de por que se "
            "decidio lo que se decidio.\n"
            "Que hacer en su lugar: crea un ADR NUEVO con el siguiente numero de la "
            "secuencia, que lo supersede (contexto, opciones, decision, consecuencias). "
            "En el ADR viejo la unica edicion legitima es que el OWNER agregue la linea "
            "'**Superseded por:** NNNN' y le cambie el estado. Si era solo una errata, "
            "pedila en el gate humano.".format(path=rel, estado=frozen.group(1).lower())
        )
        sys.exit(0)

sys.exit(0)
PY
)"

if [ -n "$REASON" ]; then
  printf '%s\n' "$REASON" >&2
  exit 2
fi

exit 0
