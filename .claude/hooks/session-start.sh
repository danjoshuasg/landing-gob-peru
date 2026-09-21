#!/usr/bin/env bash
# session-start.sh — hook SessionStart
#
# Que hace: inyecta al modelo, como contexto adicional, el contenido de STATE.md
# y las ultimas 3 entradas de runlog.md. Ademas graba el marcador de sesion
# (.claude/.session-marker) con el HEAD actual, que consume remind-runlog.sh.
#
# Contrato: recibe por stdin un JSON con session_id / transcript_path / cwd /
# hook_event_name. Devuelve por stdout un JSON con hookSpecificOutput.additionalContext.
# Evento VERIFICADO empiricamente.
#
# Degradacion: si falta STATE.md y runlog.md, no dice nada y sale 0.
# Nunca revienta la sesion.
#
# Supuesto de formato del runlog: entradas delimitadas por encabezados "## ",
# la MAS RECIENTE ARRIBA. Si tu runlog crece hacia abajo, invierte ENTRIES_FROM.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Drena stdin para no dejar el pipe colgado.
cat >/dev/null 2>&1 || true

STATE_FILE="$ROOT/STATE.md"
RUNLOG_FILE="$ROOT/runlog.md"
MARKER_DIR="$ROOT/.claude"
MARKER="$MARKER_DIR/.session-marker"

# Marcador de sesion: HEAD al arrancar. Best-effort, nunca bloquea.
if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  mkdir -p "$MARKER_DIR" 2>/dev/null || true
  git -C "$ROOT" rev-parse HEAD >"$MARKER" 2>/dev/null || true
  rm -f "$MARKER.reminded" "$MARKER.openspec" 2>/dev/null || true
fi

if [ ! -f "$STATE_FILE" ] && [ ! -f "$RUNLOG_FILE" ]; then
  exit 0
fi

python3 - "$STATE_FILE" "$RUNLOG_FILE" <<'PY' 2>/dev/null || exit 0
import json, os, sys

state_path, runlog_path = sys.argv[1], sys.argv[2]

STATE_MAX = 12000        # chars de STATE.md
ENTRY_MAX = 4000         # chars por entrada de runlog
ENTRIES_FROM = "top"     # "top" = la mas reciente arriba; "bottom" = al final
N_ENTRIES = 3

def read(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except OSError:
        return ""

def clip(text, limit):
    text = text.strip()
    if len(text) <= limit:
        return text
    return text[:limit].rstrip() + "\n[... truncado por el hook ...]"

parts = []

state = read(state_path)
if state.strip():
    parts.append("## STATE del proyecto (STATE.md)\n\n" + clip(state, STATE_MAX))

runlog = read(runlog_path)
if runlog.strip():
    entries, current = [], []
    for line in runlog.splitlines():
        if line.startswith("## "):
            if current:
                entries.append("\n".join(current))
            current = [line]
        elif current:
            current.append(line)
    if current:
        entries.append("\n".join(current))
    picked = entries[:N_ENTRIES] if ENTRIES_FROM == "top" else list(reversed(entries[-N_ENTRIES:]))
    if picked:
        body = "\n\n".join(clip(e, ENTRY_MAX) for e in picked)
        parts.append("## Ultimas %d entradas del runlog (runlog.md)\n\n%s" % (len(picked), body))

if not parts:
    sys.exit(0)

context = (
    "Contexto del proyecto inyectado automaticamente al arrancar la sesion.\n"
    "Es el estado vigente: leelo antes de proponer trabajo. Si contradice lo que "
    "el usuario pide, surface la contradiccion en vez de asumir.\n\n"
    + "\n\n---\n\n".join(parts)
)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": context,
    }
}, ensure_ascii=False))
PY

exit 0
