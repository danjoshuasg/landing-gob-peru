# Landing Gob Perú

Landing institucional editorial para presentar capacidad pública con una línea gráfica arquitectónica.

> Nombre de trabajo. Owner: Daniel Santiváñez. Arranque: 2026-09-20.

## Cómo se construye este proyecto (modelo de operación)

No se improvisa: se construye con un **sistema multi-agente simulado** definido en [`PROJECT_INSTRUCTIONS.md`](./PROJECT_INSTRUCTIONS.md).

- **PLANNER** descompone cada fase en subtareas con criterio de terminado, y declara qué no entra. **ORCHESTRATOR** las delega, mantiene el estado y decide handoffs.
- **GATE** responde dos preguntas distintas sobre cada artefacto, con veredicto `GO` / `NO-GO` separado y máx. 3 iteraciones por pregunta: **QA** (¿funciona? — se responde ejecutando, por artefacto) y **PROYECTO** (¿era lo que tocaba? — se responde trazando, al cierre de fase). Quien evalúa nunca es quien generó.
- **WORKERS** por fase: Analista, Arquitecto, Planificador, Constructor, Verificador, Operador. Son roles, no personas: se instancia solo el que tiene artefacto asignado en la fase activa.
- Metodología: **spec-driven + verificación declarada antes + construcción por tramos**. Cada fase cierra con **gate humano**: la frase literal `APRUEBO F<n>` de Daniel Santiváñez.

Cuando los roles se instancian como agentes reales en paralelo (con tiering de modelos), el modelo está en [`AGENTS.md`](./AGENTS.md).

### Fases

| # | Fase | Cierra la pregunta | Estado |
|---|------|--------------------|--------|
| F0 | Problema y valor | ¿Qué duele, para quién, y cómo sabremos que se resolvió? | — |
| F1 | Forma de la solución | ¿Qué forma toma, y por qué esa y no otra? | — |
| F2 | Contrato | ¿Cuál es la superficie estable contra la que se construye? | — |
| F3 | Plan verificable | ¿En qué orden, y cómo se sabe que cada pieza está hecha? | — |
| F4 | Construcción | ¿La pieza cumple el contrato, con evidencia? | — |
| F5 | Entrega | ¿Otro puede reproducir, operar y revertir esto? | — |

Estados: `—` (no iniciada), `en curso`, `aprobada` (con fecha del gate).

F0–F3 son secuenciales; **F4 es la única que se recorre en ciclo**, un tramo por vez; F5 puede solaparse con los últimos tramos de F4. Las fichas completas — artefactos, criterio de salida y cuándo se puede saltar una fase — están en `docs/method/phase-model.md`.

Comandos de operación (los ejecuta el Orchestrator): `/status`, `/fase N`, `/artefacto <n>`, `/eval <n>`, `/cr <desc>`, `/tramo start|close`, `/backlog`, `/riesgos`, `/decision <tema>`. El gate no es un comando: es la frase `APRUEBO F<n>` escrita por Daniel Santiváñez. Detalle en `PROJECT_INSTRUCTIONS.md` §7.

## Dónde vive cada cosa

- **Artefactos por fase** → `phases/F<N>-<nombre>/`.
- **Estado vivo del proyecto** → [`STATE.md`](./STATE.md) (lo mantiene el Orchestrator; se imprime con `/status`).
- **Bitácora de sesiones** → [`runlog.md`](./runlog.md).
- **Decisiones (ADRs)** → `decisions/NNNN-slug.md`. Versionadas con el código, no en el tracker externo.
- **Backend de especificación (opcional y exclusivo)** → si existe `.harness/spec-kit.json`, Spec Kit posee `constitution`, `spec.md`, `plan.md` y `tasks.md` de cada feature; si existe `openspec/`, OpenSpec posee changes y specs vigentes. Nunca se activan ambos para la misma aplicación.
- **Backlog y tramos** → backlog: **ninguno**. Unidades de trabajo: `WI-###`. **Se puebla en F3** (la fase que lo produce) y se consume en F4. Los ADRs NO van ahí: viven en `decisions/`.
  > Si el backlog dice `ninguno`, no hay tracker externo: las unidades viven en `phases/F3-plan/00-backlog.md` y se identifican igual, con `WI-###`. Borrá esta línea si sí hay tracker.
- **Prompt reusable por ticket** → [`TICKET-PROMPT.md`](./TICKET-PROMPT.md).

## Setup

Requisitos: Node.js 20 o superior, npm y Google Chrome local.

```bash
npm install
npm run dev
```

Verificación reproducible:

```bash
npm run typecheck
npm run build
npm run test:e2e
```

La implementación actual incluye 16 pruebas de navegador, variantes locales AVIF/WebP/JPEG y auditoría Lighthouse. La última ejecución obtuvo 100 en accesibilidad, SEO y buenas prácticas; la evidencia vive en `artifacts/`.

Este repositorio no contiene backend, CMS ni analítica. El frontend se despliega automáticamente en GitHub Pages. Los textos son una propuesta editorial y la franja superior declara que no es un canal oficial de atención. Los CTA permanecen como navegación interna hasta recibir destinos institucionales confirmados.

Las credenciales de cualquier servicio van en `.env`, que está gitignored. **Nunca** commitees claves.

## Despliegue

GitHub Pages publica automáticamente la rama `main` mediante `.github/workflows/deploy-pages.yml`.

Sitio: [https://danjoshuasg.github.io/landing-gob-peru/](https://danjoshuasg.github.io/landing-gob-peru/)

## Retomar en una sesión nueva

1. Pega `PROJECT_INSTRUCTIONS.md` como instrucciones de la sesión (o Project instructions).
2. Lee `STATE.md` para saber la fase activa y qué está aprobado o pendiente.
3. Lee la última entrada de `runlog.md`.
4. Continúa desde la fase activa con los comandos del Orchestrator.
