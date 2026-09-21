#!/usr/bin/env bash
# check-convention.sh — hook PostToolUse, matcher "Write"
#
# Evento VERIFICADO empiricamente: PostToolUse dispara, y su additionalContext llega
# al modelo. Comprobado en una sesion real escribiendo un archivo fuera de convencion;
# el modelo cito el aviso de vuelta.
#
# Aun asi el script esta escrito a prueba de que el evento no dispare: si eso pasa,
# no cambia nada; y cuando dispara, solo AVISA (exit 0 siempre, nunca bloquea).
#
# Que hace: avisa (NUNCA bloquea, siempre exit 0) cuando un archivo recien escrito
# rompe una convencion del andamiaje:
#   1. archivo en phases/ cuyo nombre no sigue NN-<slug>.md
#   2. ADR nuevo que rompe la numeracion secuencial (hueco o numero duplicado)
#   3. ADR (archivo NNNN-*.md con encabezado **Estado:**) escrito FUERA de decisions/
#
# Contrato: stdin = JSON con tool_name / tool_input. Sale 0 siempre.
# El aviso se emite como additionalContext; si el runtime ignora ese canal,
# queda como texto en stdout y tampoco rompe nada.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

PAYLOAD_FILE="$(mktemp "${TMPDIR:-/tmp}/hook-conv.XXXXXX")" || exit 0
trap 'rm -f "$PAYLOAD_FILE"' EXIT
cat >"$PAYLOAD_FILE" 2>/dev/null || true
[ -s "$PAYLOAD_FILE" ] || exit 0

python3 - "$ROOT" "$PAYLOAD_FILE" 2>/dev/null <<'PY' || exit 0
import json, os, re, sys

root, payload_file = sys.argv[1], sys.argv[2]

PHASES_DIR = "phases"
DECISIONS_DIR = "decisions"
PHASE_FILE_RE = re.compile(r"^\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
ADR_FILE_RE = re.compile(r"^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$")
ADR_NUM_RE = re.compile(r"^(\d{4})-.*\.md$")
EXEMPT = {"README.md", "index.md", "CLAUDE.md", "AGENTS.md"}

try:
    with open(payload_file, encoding="utf-8", errors="replace") as fh:
        payload = json.load(fh)
except Exception:
    sys.exit(0)

if not isinstance(payload, dict):
    sys.exit(0)

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
    sys.exit(0)
if rel.startswith(".."):
    sys.exit(0)          # fuera del proyecto, no opinamos

parts = rel.split(os.sep)
warnings = []

def head(n=40):
    try:
        with open(abspath, encoding="utf-8", errors="replace") as fh:
            return "".join(fh.readline() for _ in range(n))
    except OSError:
        return ""

# --- 1. nombre de archivo de fase -------------------------------------------
if parts[0] == PHASES_DIR and base.endswith(".md") and base not in EXEMPT:
    if not PHASE_FILE_RE.match(base):
        warnings.append(
            "CONVENCION (aviso, no bloqueante): '%s' no sigue el patron NN-<slug>.md "
            "de los artefactos de fase (dos digitos, guion, slug kebab-case en minuscula, "
            "sin tildes). Ejemplos validos: 00-contexto.md, 03-modelo-de-datos.md. "
            "El prefijo numerico es lo que da orden de lectura a la fase." % rel
        )

# --- 2 y 3. ADRs -------------------------------------------------------------
# ANCLADO A LA RAIZ, a proposito. Si esto aceptara `decisions/` a cualquier
# profundidad, un ADR en `<herramienta>/decisions/` contaria como bien ubicado y
# ademas la deteccion de huecos correria contra esa carpeta anidada, es decir
# contra una numeracion paralela. El error que la convencion existe para atrapar
# seria justo el que el detector no ve.
in_decisions = len(parts) > 1 and parts[0] == DECISIONS_DIR
num_match = ADR_NUM_RE.match(base)
body_head = head() if base.endswith(".md") else ""
smells_like_adr = bool(re.search(r"\*\*Estado:\*\*", body_head))

if base.endswith(".md") and num_match and smells_like_adr and not in_decisions:
    warnings.append(
        "CONVENCION (aviso, no bloqueante): '%s' parece un ADR (nombre NNNN-*.md con "
        "encabezado **Estado:**) pero quedo fuera de %s/. Los ADR viven todos en un solo "
        "directorio: es lo que hace que la numeracion sea unica y que el historial de "
        "decisiones se pueda leer de corrido. Movelo a %s/." % (rel, DECISIONS_DIR, DECISIONS_DIR)
    )

if in_decisions and base.endswith(".md") and base not in EXEMPT:
    if not ADR_FILE_RE.match(base):
        warnings.append(
            "CONVENCION (aviso, no bloqueante): '%s' no sigue el patron NNNN-<slug>.md "
            "de los ADR (cuatro digitos, guion, slug kebab-case). El numero es el "
            "identificador estable con el que otros documentos citan la decision." % rel
        )
    else:
        decisions_root = os.path.join(root, DECISIONS_DIR)
        nums = {}
        try:
            for fname in os.listdir(decisions_root):
                m = ADR_NUM_RE.match(fname)
                if m:
                    nums.setdefault(int(m.group(1)), []).append(fname)
        except OSError:
            nums = {}
        if nums:
            lo, hi = min(nums), max(nums)
            missing = [n for n in range(lo, hi + 1) if n not in nums]
            dupes = {n: v for n, v in nums.items() if len(v) > 1}
            if missing:
                warnings.append(
                    "CONVENCION (aviso, no bloqueante): la numeracion de %s/ tiene huecos: "
                    "falta(n) %s (rango actual %04d..%04d). Un hueco suele significar un ADR "
                    "borrado o un numero saltado; si una decision se abandono, el ADR se "
                    "queda con **Estado:** rejected o superseded, no se elimina."
                    % (DECISIONS_DIR, ", ".join("%04d" % n for n in missing), lo, hi)
                )
            if dupes:
                detail = "; ".join("%04d -> %s" % (n, ", ".join(sorted(v))) for n, v in sorted(dupes.items()))
                warnings.append(
                    "CONVENCION (aviso, no bloqueante): numero de ADR duplicado en %s/ (%s). "
                    "Dos ADR con el mismo numero rompen las referencias cruzadas; renumera el "
                    "nuevo al siguiente libre." % (DECISIONS_DIR, detail)
                )

if not warnings:
    sys.exit(0)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "PostToolUse",
        "additionalContext": "\n".join(warnings),
    }
}, ensure_ascii=False))
PY

exit 0
