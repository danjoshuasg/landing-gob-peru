#!/usr/bin/env bash
# remind-runlog.sh — hook Stop
#
# Evento VERIFICADO empiricamente, con una salvedad de visibilidad: Stop dispara al
# cerrar el turno y este hook produce su recordatorio. PERO en headless (claude -p) el
# texto NO aparece en la salida del comando. Se comprobo por dos vias indirectas: el
# marcador .session-marker.reminded quedo con el HEAD posterior al commit (solo lo
# escribe este script, asi que corrio), y reproduciendo a mano el estado del cierre
# el hook emitio el mensaje completo.
#
# Por eso: imprime texto plano en stdout, NUNCA usa exit 2 (bloquear un Stop puede
# dejar la sesion en bucle) y siempre sale 0.
#
# Que hace: al terminar el turno, recuerda cerrar la contabilidad del proceso.
#   A) Hubo commits desde que arranco la sesion (HEAD != .claude/.session-marker)
#      y runlog.md no fue tocado ni en esos commits ni en el working tree.
#   B) Hay changes de openspec con todas las tareas marcadas pero sin archivar.
#
# Degradacion: sin repo git, sin marcador, sin runlog.md o sin openspec/, calla y sale 0.
# Idempotente: no repite el mismo aviso dos veces para el mismo HEAD
# (deja constancia en .claude/.session-marker.reminded).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MARKER="$ROOT/.claude/.session-marker"
REMINDED="$ROOT/.claude/.session-marker.reminded"
RUNLOG_REL="runlog.md"
OPENSPEC_CHANGES="$ROOT/openspec/changes"

cat >/dev/null 2>&1 || true    # drena stdin

MESSAGES=""
add_message() { MESSAGES="${MESSAGES}$1"$'\n\n'; }

# ---------------------------------------------------------------- A) commits sin runlog
HEAD_NOW=""
if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  HEAD_NOW="$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || true)"
fi

if [ -n "$HEAD_NOW" ] && [ -f "$MARKER" ] && [ -f "$ROOT/$RUNLOG_REL" ]; then
  HEAD_START="$(tr -d '[:space:]' <"$MARKER" 2>/dev/null || true)"
  ALREADY="$( (cat "$REMINDED" 2>/dev/null || true) | tr -d '[:space:]' )"

  # LINEA BASE MOVIL. No se compara contra el inicio de la sesion, sino contra el
  # ultimo punto ya evaluado. Si se comparara contra el inicio, bastaria con que el
  # runlog se hubiera tocado en el PRIMER commit para que la ventana entera diera
  # "tocado" y el hook callara en todos los commits siguientes, que es justo el caso
  # que este recordatorio existe para atrapar.
  BASE="$HEAD_START"
  if [ -n "$ALREADY" ] && git -C "$ROOT" cat-file -e "${ALREADY}^{commit}" 2>/dev/null; then
    BASE="$ALREADY"
  fi

  if [ -n "$BASE" ] && [ "$BASE" != "$HEAD_NOW" ]; then
    N_COMMITS="$(git -C "$ROOT" rev-list --count "$BASE..$HEAD_NOW" 2>/dev/null || echo 0)"
    if [ "$N_COMMITS" -gt 0 ] 2>/dev/null; then
      TOUCHED_IN_COMMITS="$(git -C "$ROOT" diff --name-only "$BASE" "$HEAD_NOW" -- "$RUNLOG_REL" 2>/dev/null || true)"
      TOUCHED_IN_TREE="$(git -C "$ROOT" status --porcelain -- "$RUNLOG_REL" 2>/dev/null || true)"
      if [ -z "$TOUCHED_IN_COMMITS" ] && [ -z "$TOUCHED_IN_TREE" ]; then
        add_message "RECORDATORIO: en esta sesion entraron ${N_COMMITS} commit(s) y ${RUNLOG_REL} no se toco.
La bitacora es lo que hace que la proxima sesion (u otra persona) entienda que se hizo y por que, sin releer el diff.
Agrega una entrada arriba de todo con: que se hizo, cual es el proximo paso, y que aprendizaje deja.
Revisa tambien si STATE.md quedo desactualizado."
      fi
      mkdir -p "$ROOT/.claude" 2>/dev/null || true
      printf '%s\n' "$HEAD_NOW" >"$REMINDED" 2>/dev/null || true
    fi
  fi
fi

# ------------------------------------------------- B) openspec implementado sin cerrar
if [ -d "$OPENSPEC_CHANGES" ]; then
  PENDING="$(python3 - "$OPENSPEC_CHANGES" 2>/dev/null <<'PY' || true
import os, re, sys

changes_dir = sys.argv[1]
UNCHECKED = re.compile(r"^\s*[-*]\s*\[\s\]", re.MULTILINE)
CHECKED = re.compile(r"^\s*[-*]\s*\[[xX]\]", re.MULTILINE)

names = []
try:
    entries = sorted(os.listdir(changes_dir))
except OSError:
    entries = []

for name in entries:
    if name.startswith(".") or name == "archive":
        continue
    tasks = os.path.join(changes_dir, name, "tasks.md")
    if not os.path.isfile(tasks):
        continue
    try:
        with open(tasks, encoding="utf-8", errors="replace") as fh:
            text = fh.read()
    except OSError:
        continue
    if CHECKED.search(text) and not UNCHECKED.search(text):
        names.append(name)

if names:
    print(", ".join(names))
PY
)"
  OPENSPEC_REMINDED="$ROOT/.claude/.session-marker.openspec"
  PREV_PENDING="$(cat "$OPENSPEC_REMINDED" 2>/dev/null || true)"
  if [ -n "$PENDING" ] && [ "$PENDING" != "$PREV_PENDING" ]; then
    mkdir -p "$ROOT/.claude" 2>/dev/null || true
    printf '%s' "$PENDING" >"$OPENSPEC_REMINDED" 2>/dev/null || true
    add_message "RECORDATORIO: estos changes de openspec tienen todas sus tareas marcadas pero siguen sin cerrar: ${PENDING}.
Un change implementado y no sincronizado deja las specs principales mintiendo sobre el sistema real.
Sincroniza los deltas a las specs y luego archiva el change."
  fi
fi

if [ -n "$MESSAGES" ]; then
  printf '%s' "$MESSAGES"
fi

exit 0
