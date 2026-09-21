# Contrato de sustitución de placeholders

Referencia del skill `new-software-project`. Define qué se sustituye, cuándo, y
qué archivos toca. Si escribes o modificas una plantilla, esta es la regla.

---

## 1. Las dos clases

Todo placeholder tiene la misma forma: dos llaves de apertura, el nombre en
MAYUSCULAS_CON_GUION_BAJO, dos llaves de cierre. Hay exactamente dos clases, y la
diferencia es **cuándo se resuelve**.

> Este documento escribe la sintaxis en prosa en vez de mostrarla literal, salvo
> en las tablas donde hace falta. Si la escribiera literal en cada mención, el
> verificador de la sección 5 se detectaría a sí mismo y reportaría placeholders
> sin resolver que en realidad son ejemplos.

**Clase A — de scaffolding.** Se resuelven **una sola vez**, cuando el skill crea
el proyecto. Son datos que valen para todo el repo y no cambian por documento. El
scaffolder los sustituye en todos los archivos que instala. Después del bootstrap
no debe quedar ni uno solo sin resolver.

**Clase B — de autoría.** Se quedan **literales** en el archivo instalado, a
propósito. Viven en plantillas que se copian una vez por uso — un ADR nuevo, un
documento de fase nuevo, un change nuevo — y los rellena quien escribe ese
documento, que puede ser meses después del bootstrap.

El error que este contrato existe para evitar es sustituir la clase B en tiempo
de scaffolding. Si el scaffolder resuelve `{{DOC_DATE}}` al crear el proyecto,
la fecha del bootstrap queda horneada en la cabecera de **todos** los documentos
de fase futuros, y cada documento nace mintiendo sobre cuándo se escribió.

---

## 2. Clase A — el scaffolder las sustituye

| Placeholder | Qué es | Ejemplo |
|---|---|---|
| `{{PROJECT_NAME}}` | Nombre humano del proyecto | `Atlas` |
| `{{PROJECT_SLUG}}` | kebab-case, nombre de carpeta y de repo | `atlas` |
| `{{PROJECT_PITCH}}` | Qué es, en una línea | `Reconciliación de pagos entre dos sistemas que no se hablan.` |
| `{{DATE}}` | Fecha del bootstrap, ISO | `2026-07-18` |
| `{{OWNER}}` | Quién decide. El que dice `APRUEBO F<n>` | `Dan` |
| `{{TRACKER}}` | Backlog externo, o `ninguno` | `Linear` |
| `{{TICKET_PREFIX}}` | Prefijo de ticket. Omitible si no hay tracker | `ATL` |
| `{{PHASE_COUNT}}` | Cuántas fases tiene el proyecto | `6` |
| `{{MODEL_CHEAP}}` | Tier `bulk`: volumen, extracción, tareas mecánicas | |
| `{{MODEL_BUILD}}` | Tier `build`: construcción del día a día, tests, y la **recolección de evidencia** de los gates | |
| `{{MODEL_HEAVY}}` | Tier `heavy`: arquitectura, y el **veredicto** de las dos preguntas del gate (QA y PROYECTO) | |
| `{{MODEL_EXPERT}}` | Tier `expert` on-call, presupuesto contado, solo para el crux | |
| `{{VERIFY_SUITE_REF}}` | Dónde está declarada la suite de verificación del proyecto | `core/Makefile: make all` |
| `{{RELEASE_SCOPE}}` | Alcance del release en curso | `MVP` |
| `{{NEXT_RELEASE}}` | Dónde se difiere lo que queda fuera | `Release-2` |

Sobre los cuatro `{{MODEL_*}}`: son **tiers, no proveedores**. Los cuatro tiers se
llaman `bulk`, `build`, `heavy` y `expert`, y ese es su nombre en todo el
andamiaje. Se declaran en `AGENTS.md` durante el bootstrap y se revisan cuando
cambie el catálogo de modelos disponible.

**La tabla de `AGENTS.md` §2 es el único lugar del proyecto generado donde un
tier se ata a un modelo concreto.** El resto del andamiaje razona en tiers.
Cambiar de modelo debe ser editar esa tabla y nada más; si hay que cazar nombres
de modelo por diez archivos, el doc empieza a mentir en cuanto sale un modelo
nuevo. Un documento del andamiaje que nombre un modelo concreto fuera de esa
tabla está mal escrito: repórtalo.

`{{RELEASE_SCOPE}}` y `{{NEXT_RELEASE}}` aparecen en las plantillas de change, pero
son constantes **del proyecto**, no de cada change: el alcance del release no cambia
por propuesta. Por eso son de clase A. Como el bootstrap no los conoce todavía,
entran con un marcador explícito y se enmiendan en F3.

`{{VERIFY_SUITE_REF}}` no se puede resolver en el bootstrap: en F0 todavía no
existe suite. Se instala con el valor literal `<sin definir; lo fija F2>` y se
enmienda cuando el contrato exista. Es la única de clase A que arranca con un
valor de relleno declarado.

---

## 3. Clase B — quedan literales

Se agrupan por la plantilla donde viven. **Ninguno se sustituye en el bootstrap.**

**ADRs** (`adr-short`, `adr-extended`): `{{ADR_NUMBER}}`, `{{ADR_TITLE}}`, `{{ADR_DATE}}`.

**Documentos de fase** (`phase-doc`): `{{PHASE_ID}}`, `{{PHASE_NAME}}`,
`{{DOC_NUMBER}}`, `{{DOC_SLUG}}`, `{{DOC_TITLE}}`, `{{DOC_DATE}}`,
`{{ARTIFACT_ID}}`, `{{ARTIFACT_NAME}}`, `{{VERSION}}`, `{{STATUS}}`,
`{{SOURCES}}`, `{{SCOPE}}`.

**Changes de spec** (`change/*`): `{{CHANGE_SLUG}}`, `{{CAPABILITY_SLUG}}`,
`{{FEATURE_NAME}}`.

**QA manual** (`QA-manual`): `{{TICKET_ID}}`, `{{FEATURE_NAME}}`, `{{PHASE_ID}}`.

Un mismo concepto usa **un solo nombre** en todas las plantillas. `{{PHASE_ID}}`
es el identificador de fase en todas partes. No existe un `PHASE` a secas como
sinónimo suyo, y `PHASE_NAME` no es un sinónimo sino otro dato: el nombre legible
de la fase. Tres nombres para la misma cosa es como empiezan las sustituciones
incompletas — una plantilla usa uno, el scaffolder sustituye otro, y el tercero
queda crudo en el archivo instalado.

---

## 4. Qué archivos toca la sustitución

**Todos los que el skill instala, sin mirar la extensión.**

El sufijo `.tmpl` marca el rol del archivo en el skill, no si lleva placeholders:
se quita al copiar (`STATE.md.tmpl` → `STATE.md`). Pero los documentos de
`docs/method/` **también llevan placeholders de clase A** y también se sustituyen,
aunque no tengan sufijo. Atar la sustitución a la extensión deja
`commit-convention.md` y `anti-patterns.md` instalados con las llaves visibles.

Regla para quien escriba plantillas nuevas: no asumas que `.tmpl` significa "este
tiene placeholders" ni que su ausencia significa lo contrario.

---

## 5. Verificación posterior al scaffolding

El skill corre esto al terminar y falla ruidosamente si algo no cuadra:

```bash
# 1. No debe quedar ningun placeholder de clase A sin resolver.
grep -rn -E '\{\{(PROJECT_NAME|PROJECT_SLUG|PROJECT_PITCH|DATE|OWNER|TRACKER|TICKET_PREFIX|PHASE_COUNT|MODEL_CHEAP|MODEL_BUILD|MODEL_HEAVY|MODEL_EXPERT|VERIFY_SUITE_REF|RELEASE_SCOPE|NEXT_RELEASE)\}\}' . \
  && echo "FALLO: quedaron placeholders de scaffolding sin sustituir" || echo "ok"

# 2. Los de clase B SI deben seguir ahi, y solo dentro de plantillas de autoria.
#    Si aparecen fuera de esas rutas, alguien copio una plantilla a mano y la dejo cruda.
#    docs/method/placeholders.md se excluye porque ES este documento: nombra los
#    placeholders en sus tablas y se instala VERBATIM, sin sustituir, justamente
#    para que la columna que define el contrato no quede pisada.
grep -rln -E '\{\{[A-Z_]+\}\}' . \
  | grep -v -E '^\./\.claude/templates/' \
  | grep -v -x './docs/method/placeholders.md'

# 3. Ningun placeholder inventado fuera de las dos listas de este documento.
grep -rhoE '\{\{[A-Z_]+\}\}' . | sort -u
```

El chequeo 1 es el que atrapa el fallo más caro: un proyecto que arranca con
`{{OWNER}}` literal en el README y nadie lo nota hasta que alguien externo lo lee.
