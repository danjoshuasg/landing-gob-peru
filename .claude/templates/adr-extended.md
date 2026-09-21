# {{ADR_NUMBER}} — {{ADR_TITLE}}

**Fecha:** {{ADR_DATE}}
**Estado:** proposed
**Decisores:** Daniel Santiváñez
**Ticket:** WI-### (ninguno)
**Formaliza:** <id de la propuesta de cambio / spec / RFC que esta decisión formaliza, con la fecha en que se escribió>
**Supersedes (parcial):** <qué parte exacta de qué ADR o spec previo queda sin efecto — y, en la misma línea, qué NO queda sin efecto. Borrar si no supersede nada.>
**Superseded por:** <NNNN, y qué parte de este ADR quedó sin efecto. El otro lado del supersede: cuando escribas un ADR que reemplace a este, el mismo commit agrega esta línea aquí y le cambia el Estado. Un supersede registrado de un solo lado deja el ADR viejo pareciendo vigente. Borrar mientras no aplique.>
**Fases afectadas:** <F# (qué entrega de esa fase se toca)>
**Trazabilidad:** <ids de propuestas, tickets, ADRs, supuestos y riesgos relacionados, separados por comas>

Usa esta forma extendida solo cuando la decisión cumple al menos una de estas condiciones:
enmienda una decisión ya aceptada, se adopta por tramos, cruza más de una fase, o llega con
objeciones bloqueantes que hay que adjudicar por escrito. Si no cumple ninguna, usa
`adr-short.md.tmpl` — un ADR largo por defecto entierra la decisión.

## Contexto

Qué se propuso, quién objetó y con qué evidencia. Fechas explícitas: una decisión que se
re-decidió a los dos días tiene que dejar ver las dos fechas.

Cuando hay objeciones bloqueantes, cada una se adjudica en su propio párrafo con veredicto,
no se resume:

**Adjudicación 1: <veredicto en una frase, afirmativo>.** La evidencia que sostiene el
veredicto. Si hay un precedente interno (un rechazo previo, un bug ya cerrado, una revisión
que ya dijo que no), cítalo con su ticket: un ADR que reintroduce por diseño una clase de
error ya cerrada tiene que decirlo.

**Adjudicación 2: <veredicto>.** Ídem. Si una objeción resultó ser incorrecta, dilo con la
misma claridad que si hubiera sido correcta.

**Colisión de vocabulario (si aplica):** si esta decisión introduce un término que ya
significa otra cosa en un ADR previo, elige otro término aquí y explica la diferencia. No
reutilices vocabulario tomado.

## Decisión

La decisión, con su alcance enmendado respecto de lo que se propuso originalmente. Di
explícitamente qué parte de la propuesta se aplica, qué parte se difiere y qué parte se
retira por incorrecta.

**Invariante transversal, sin excepción:** <la regla que ningún tramo puede violar. Si no
existe una, borra el bloque en vez de inventarla.>

### Tramo 1 (<ticket>, ahora)

Patrón de decisión por tramos: se adopta ahora lo que se apoya en superficie ya verificada,
y se difiere lo caro, lo no verificado o lo peligroso. Un tramo no es una fase del proyecto
ni una etapa de negocio: es la secuencia de adopción de esta decisión, y todos los tramos
pueden ocurrir dentro de una sola fase.

- **<Qué se construye ahora>:** <alcance exacto>.
- **Superficie nueva del Tramo 1 (lista exhaustiva).** Enumera *todo* lo que se crea:
  - <artefacto nuevo 1>
  - <artefacto nuevo 2>

  Nada más. Siguen siendo non-goals y no se crean ni como stub: <lista de lo que NO se
  construye>. Si en una iteración anterior afirmaste "cero superficie nueva" y ya no es
  cierto, retira la afirmación aquí en vez de dejarla en pie.
- **Por qué el Tramo 1 sigue siendo seguro pese a la superficie nueva.** El argumento real,
  no el eslogan: qué guard explícito protege cada artefacto nuevo y qué clase de error
  conocida no se reabre.
- **Desviaciones declaradas.** Si el Tramo 1 se aparta de algo ya aprobado (un contrato, un
  texto, un diseño), decláralo aquí, con el valor viejo y el nuevo, y márcalo como pendiente
  de ratificación. Este ADR declara la desviación; no edita el artefacto aprobado.

### Tramo 2 (ticket futuro, no se construye ahora)

<Qué se difiere.> **Precondiciones duras, todas obligatorias antes de ejecutar:**

- **(a) <precondición verificable>.** Por qué sin esto el tramo no se puede ejecutar.
- **(b) <precondición empírica>.** Si la respuesta es no, el Tramo 2 **no se ejecuta** y el
  sistema se queda en el estado del Tramo 1. Eso no es un fracaso del ADR: es el ADR
  funcionando.
- **(c) <precondición de timing>.** Fuera de qué ventana de medición debe ocurrir, para no
  contaminar qué métrica.

Además, condiciones de contrato que el Tramo 2 hereda: <invariantes que el trabajo futuro no
puede relajar>.

Qué del Tramo 1 habilita al Tramo 2: <si el Tramo 1 construye algo que el Tramo 2 solo
relaja, dilo — evita rediseñar dos veces>.

## Opciones consideradas

**Regla dura: mínimo 2 opciones.** En la forma extendida, cada opción rechazada nombra la
objeción concreta que la mata, y las opciones legítimas se rechazan reconociendo su mérito.

- **(A) <la propuesta original, completa>.** **Rechazada por <objeción>.** <Razón concreta,
  con agravantes si los hay.>
- **(B) <la elegida>. ELEGIDA.** Qué porcentaje del valor buscado entrega, sobre qué
  superficie ya verificada se apoya, y qué difiere. **Coste de la reversibilidad:** <lo que
  se paga por poder revertir>.
- **(C) <no hacer nada>.** Rechazada. Di primero por qué la crítica es legítima (esta opción
  suele ser la de costo cero) y luego las razones concretas del rechazo.
- **(D) <alternativa técnicamente superior pero cara>.** Evaluada en serio y **no elegida
  ahora, conservada como candidata para el Tramo 2.** Por qué es correcta y por qué su costo
  no cabe en la ventana actual.

## Consecuencias

- **Positivas:** sobre qué superficie ya evaluada se apoya, qué gap real cierra, y qué
  propiedad del sistema queda intacta durante la ventana de medición.
- **Riesgos:** numerados, cada uno con su mitigación y con lo que queda como **residual**.
  Un riesgo que se acepta se escribe como aceptado, con el nombre de quién lo ratifica.
  **(1) <riesgo>:** <mitigación>, residual: <lo que no se elimina>.
  **(2) <riesgo introducido por esta misma decisión>:** decláralo como introducido, no lo
  presentes como preexistente.
  **(3) <cambio de comportamiento de algo que ya está vivo>:** qué prueba de regresión
  cambia por esto.
- **Actualiza en el estado del proyecto** (lo aplica quien orquesta; este ADR solo lo declara):
  - **<Propuesta previa>** pasa a alcance **ENMENDADO**, no "aplicado": qué se aplica, qué se
    difiere, qué racional se **retira** por incorrecto.
  - **Supuesto NUEVO:** "<enunciado falsable>". Estado: **no validado**. Test: <cómo se
    valida>. Dueño: <quién>.
  - **Riesgo NUEVO:** <enunciado>, relacionado con <riesgo previo>.
  - **Precondición de despliegue NUEVA:** <control operativo, etiquetado como operativo si
    no hay guard técnico que lo imponga>.

## Open Questions

Preguntas abiertas de verdad, no tareas. Cada una dice si **bloquea** o no, y quién y cuándo
la cierra. Una pregunta que ya se respondió en la Decisión se retira de aquí, no se deja
como fósil.

- **¿<pregunta>?** No bloquea: <por qué>. Se decide en <momento / ticket>.
- **¿<pregunta>?** Bloquea el Tramo 2. Dueño: <quién>.
- **<Dependencia cruzada>.** Qué otro trabajo tiene que converger con este y cuándo se
  sincronizan.
- **<Pregunta cuya respuesta no está verificada>.** Escribe **no verificado** y di con quién
  se confirma. El argumento de este ADR no debe depender de ella; si depende, no es una Open
  Question, es un bloqueante.
