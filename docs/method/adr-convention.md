# Convención de ADRs — Landing Gob Perú

Un ADR registra una decisión no obvia y su costo. Es documento de auditoría: se escribe una
vez, se versiona con el código, y se enmienda con otro ADR, nunca reescribiendo la historia.

## Cuándo se escribe un ADR

Cuando la decisión cumple **las dos** condiciones:

1. Tiene al menos 2 opciones reales (si solo hay un camino, no hay decisión que registrar).
2. Revertirla más tarde cuesta trabajo, no solo un commit.

Ejemplos que califican: elegir un mecanismo de persistencia, definir un modelo de
autorización, aceptar una dependencia externa, cambiar el modelo de negocio, adoptar por
tramos algo ya aprobado. Ejemplos que no: nombres de variables, formato, cualquier cosa que
un linter pueda imponer.

Si la decisión enmienda una decisión ya aceptada, se adopta por tramos, cruza más de una
fase, o llega con objeciones bloqueantes → forma extendida (`adr-extended.md.tmpl`). En
cualquier otro caso → forma corta (`adr-short.md.tmpl`). Por defecto, corta.

## Dónde viven

**Un solo directorio: `decisions/`, en la raíz del repo.** Sin subcarpetas, sin excepciones,
sin ADRs anidados dentro de la carpeta de una fase, de una spec, de un change o de una
herramienta.

Motivo: el valor de un ADR es que se encuentre. Un ADR que vive en otro sitio no aparece en
un `ls decisions/`, no entra en el conteo de numeración, y se convierte en un hueco
silencioso (ver Deuda A). Una herramienta externa que sugiera su propia carpeta de decisiones
no gana la discusión: el ADR va a `decisions/` y, si hace falta, la herramienta recibe un
enlace.

## Numeración y naming

- Formato de archivo: `decisions/NNNN-<slug-kebab>.md`.
- `NNNN` = 4 dígitos con ceros a la izquierda, **secuencial, sin huecos**, empezando en
  `0001`. El número se asigna cuando el ADR se crea, no cuando se acepta.
- El slug es kebab-case en inglés o español según la convención del repo, corto y sin fecha:
  describe la decisión, no el ticket. `0007-postgres-como-cola.md`, no
  `0007-WI-142.md`.
- El H1 repite el número: `# NNNN — <título>`. Número de archivo y número del H1 deben
  coincidir siempre.
- El número **nunca se reutiliza ni se renumera**, ni siquiera si el ADR se rechaza. Un ADR
  rechazado se queda con su número y su estado `rejected`; renumerar rompe todos los enlaces
  entrantes.

**Cómo se reserva el número sin carreras:** el siguiente número es `max(existentes) + 1`
calculado sobre `decisions/` **más** las ramas abiertas. Si dos ramas reclaman el mismo
número, quien mergea segundo renumera su propio archivo antes del merge (aún no hay enlaces
entrantes) y actualiza su H1.

## Estados y transiciones

Estados válidos, en la línea `**Estado:**`:

| Estado | Significado |
|---|---|
| `proposed` | Escrito, pendiente de aprobación. Puede editarse libremente. |
| `accepted` | Aprobado. A partir de aquí solo se enmienda con otro ADR. |
| `rejected` | Se evaluó y se decidió no hacerlo. Se conserva: el "no" también es historia. |
| `superseded` | Reemplazado por un ADR posterior. |
| `deprecated` | Ya no aplica y nada lo reemplaza (el contexto que lo motivó desapareció). |

Transiciones permitidas:

```
proposed ──> accepted ──> superseded
   │                 └──> deprecated
   └──────> rejected
```

Nada vuelve a `proposed`. Nada salta directo a `superseded` sin pasar por `accepted`.

Reglas de transición:

- Un ADR pasa a `accepted` solo cuando Daniel Santiváñez lo aprueba. Si el proyecto tiene gates de
  fase, la aprobación es parte del gate.
- Al superseder, **se editan los dos archivos**: el viejo agrega `**Superseded por:** NNNN`
  y cambia su estado; el nuevo agrega `**Supersedes:** NNNN`. Un supersede parcial se
  declara con `**Supersedes (parcial):**` y dice explícitamente qué parte del ADR viejo
  **no** queda sin efecto.
- El cuerpo de un ADR `accepted` no se reescribe para "corregirlo". Se escribe uno nuevo.
- **Al cerrar el proyecto ningún ADR queda en `proposed`.** Cada uno termina en `accepted`,
  `rejected`, `superseded` o `deprecated`.

## Deudas que esta convención previene

Las dos vienen de un proyecto real. Las dos son silenciosas: nada falla, solo se pierde la
trazabilidad.

### Deuda A — ADR extraviado fuera de `decisions/`

**Qué pasó:** un ADR se escribió dentro de la carpeta de una herramienta de specs
(`<tool>/decisions/`) en vez de en `decisions/`. Quedó invisible para cualquiera que listara
el directorio canónico, y su número quedó ocupado sin que nadie lo viera, produciendo la
Deuda B como efecto secundario.

**Cómo se detecta** (debe devolver vacío):

```bash
find . -name '[0-9][0-9][0-9][0-9]-*.md' \
  -not -path './decisions/*' -not -path './.git/*'
```

**Cómo se evita:**

- Regla de directorio único, arriba, sin excepciones por herramienta.
- El comando anterior corre en cada gate de fase y en CI. Cualquier resultado bloquea.
- Cuando una herramienta genera su propia carpeta de decisiones, el archivo se mueve a
  `decisions/` en el mismo commit y se deja un enlace, no una copia.

### Deuda B — hueco en la numeración

**Qué pasó:** la secuencia saltó de `0012` a `0014`; el `0013` existía, pero fuera de
`decisions/` (Deuda A). Un lector del directorio canónico solo ve un número faltante y no
puede distinguir entre "se perdió un ADR", "se abandonó un borrador" y "alguien se equivocó
al contar".

**Cómo se detecta** (debe devolver vacío):

```bash
ls decisions/ | grep -oE '^[0-9]{4}' | sort -n | awk '
  NR==1 && $1+0!=1 { print "falta 0001"; }
  NR>1 && $1+0 != prev+1 { for (i=prev+1; i<$1+0; i++) printf "hueco: %04d\n", i }
  { prev=$1+0 }'
```

**Cómo se evita:**

- El comando corre en cada gate de fase y en CI, junto al de la Deuda A. Los dos son un solo
  check: un hueco casi siempre significa un archivo extraviado.
- Un ADR abandonado antes de aprobarse **no se borra**: se marca `rejected` con una línea de
  contexto. Borrar el archivo es lo que crea el hueco.
- Un hueco solo se cierra moviendo el archivo real a su sitio. **Nunca** renumerando los ADRs
  posteriores ni creando un archivo relleno.

## Checklist de revisión de un ADR

- [ ] Vive en `decisions/`, nombre `NNNN-<slug-kebab>.md`.
- [ ] El número del archivo coincide con el del H1 y no deja hueco en la secuencia.
- [ ] **Mínimo 2 opciones consideradas**, cada rechazada con razón concreta.
- [ ] La opción elegida está marcada como tal.
- [ ] Consecuencias incluye al menos un costo aceptado, no solo beneficios.
- [ ] Estado es uno de los cinco válidos y la transición es legal.
- [ ] Si supersede algo, los dos archivos están editados y el alcance parcial es explícito.
- [ ] Lo no verificado dice **no verificado**.
- [ ] No hay secretos, credenciales ni datos personales en el texto.

## Por qué los metadatos no van en frontmatter YAML

Estos ADRs viven en un repo de código y se leen en el render de la forja, donde un bloque
de frontmatter aparece como una tabla cruda o directamente no aparece. Por eso los
metadatos van como líneas en negrita bajo el H1: se leen igual en el archivo plano, en el
navegador y en un diff.

Si algún día estos ADRs se indexan en un sistema de notas que exija frontmatter, se agrega
en la ingesta. No al revés: el formato lo manda el lugar donde se leen a diario.
