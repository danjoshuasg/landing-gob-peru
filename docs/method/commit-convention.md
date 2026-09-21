# Convención de commits

Proyecto: Landing Gob Perú — Owner: Daniel Santiváñez — Tracker: ninguno

## Formato

```
tipo(FASE[,TICKET]): descripcion en minuscula, imperativa o descriptiva
```

- `tipo` — qué clase de cambio es (lista abajo).
- `FASE` — la fase del proceso a la que pertenece el artefacto: `F0`…`F5`.
  Admite subfases (`F3.1`, `F3.2`) y variantes de rebase (`F0v2`).
- `TICKET` — opcional, `WI-###` del backlog en ninguno.
  Admite sufijos cuando el mismo ticket se retoma: `WI-355-v2`,
  `WI-359-hardening`.
- Cuando el trabajo pertenece a una unidad de spec y no a un ticket suelto, el
  segundo campo puede ser el nombre de esa unidad en kebab-case en vez del ticket:
  `feat(F4,platform-foundation): ...`.
- La descripción va en español, minúscula inicial, sin punto final, sin relleno.
  Dice **qué quedó hecho**, no qué se intentó.

### Ejemplos del patrón

```
feat(F0): actores, recorridos y requisitos verificables
feat(F1): vista de componentes + ADR-0003 <decision de forma>
fix(F1): CR-002 realinea F1 con lo que F2 dejó fijado en el contrato
feat(F2): contrato de la superficie de uso + modos de error
feat(F4,WI-357): <unidad de trabajo> + CR-013
fix(F4,WI-359-hardening): cierra los MINOR diferidos del review
docs(F4): registra merge de WI-357 a main
chore(F3): pausa F3 — Daniel Santiváñez rechaza el plan, se replantea el orden de tramos
```

## Tipos observados

| Tipo | Cuándo |
|---|---|
| `feat` | Artefacto nuevo o capacidad nueva. Es el tipo por defecto de un entregable de fase. |
| `fix` | Corrige o realinea algo ya entregado (típicamente tras un change request o un hardening post-review). |
| `docs` | Actualiza documentación de proceso: `STATE.md`, `runlog.md`, `README.md`, registro de un merge. No toca entregables. |
| `chore` | Movimientos de proceso: bootstrap del repo, gates, pausas de fase, andamiaje. |

Cuatro tipos bastan. No agregues `refactor`/`style`/`perf` salvo que el proyecto
tenga volumen de código suficiente para que la distinción sirva a alguien.

## El commit especial de gate

Cada vez que el owner aprueba una fase y se abre la siguiente, hay **un commit
dedicado** que no entrega nada:

```
chore(FN->FN+1): gate FN aprobado, abre FN+1
```

Con contexto de qué se aprobó y cómo se llama la fase que abre:

```
chore(F1->F2): gate F1 aprobado (ADR-0002..0007 accepted), abre F2 (Contrato)
chore(F2->F3): gate F2 aprobado (ADR-0008..0010 accepted), abre F3 (Plan verificable)
```

Reglas del commit de gate:

- Es **atómico**: solo el cambio de estado (`STATE.md`, `runlog.md`, apertura de
  la carpeta de la fase nueva). Nunca mezcla entregables.
- Solo se escribe **después** de que Daniel Santiváñez aprobó, nunca de forma anticipada.
- Si el gate se rechaza, el commit es `chore(FN): pausa FN — <motivo>` y la
  descripción dice qué se decidió hacer en vez de continuar.

Como resultado, `git log --oneline --grep='^chore(F'` reconstruye la línea de
tiempo de decisiones del proyecto sin abrir ningún documento.

## Por qué la fase va en el mensaje

El motivo no es cosmético.

1. **Trazabilidad artefacto ↔ fase sin depender de un tracker externo.** El
   backlog en ninguno puede cambiar de herramienta, perder permisos, migrar
   de workspace o directamente no existir. El repo sobrevive a todo eso. Con la
   fase en el mensaje, `git log --oneline --grep='(F2'` te da todo lo que produjo
   una fase, en orden, para siempre, sin credenciales.

2. **Contesta "¿por qué existe este archivo?".** `git log --oneline <archivo>`
   devuelve la fase que lo pidió. En un proceso por fases con gates, saber que un
   documento salió de F1 y no de F4 cambia cómo lo lees: te dice qué información
   había disponible cuando se escribió.

3. **Hace visible el trabajo fuera de fase.** Si aparecen commits sin fase, o de
   una fase ya cerrada por gate, eso es una señal: o el gate se cerró antes de
   tiempo, o hay trabajo que nadie planificó. Un log sin scope no muestra nada.

4. **El ticket es opcional; la fase no.** Un ticket puede no existir (trabajo de
   proceso, un fix pequeño, bootstrap). Una fase siempre existe, porque el
   proyecto siempre está en alguna. Por eso la fase es el campo obligatorio y el
   ticket el opcional, y no al revés.

## Verificación

```bash
# Todo lo producido por una fase
git log --oneline --grep='(F2'

# La línea de tiempo de gates
git log --oneline --grep='gate .* aprobado'

# Todo lo tocado por un ticket, incluidos sus rebases y hardenings
git log --oneline --grep='WI-357'

# Commits sin scope de fase (deberían ser casi ninguno)
git log --oneline | grep -vE '^[0-9a-f]+ (feat|fix|docs|chore)\('
```
