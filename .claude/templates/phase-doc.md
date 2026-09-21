<!--
PLANTILLA DE DOCUMENTO DE FASE, proyecto Landing Gob Perú.

Ruta de destino:
  phases/{{PHASE_ID}}-<slug-de-fase>/{{DOC_NUMBER}}-{{DOC_SLUG}}.md

Convención de nombre de archivo: NN-<slug>.md
  - NN es un contador de dos dígitos, DENSO, empieza en 00 dentro de cada fase.
  - <slug> en inglés, kebab-case, describe el contenido, no la fase.
  - Sin huecos. Si un documento se retira, se renumera el rango o se deja un stub que
    explique el retiro. Ver docs/method/id-conventions.md, sección de deuda a prevenir.

Cómo usar la plantilla:
  1. Rellena la cabecera completa. Ningún campo de la cabecera queda vacío ni con TBD.
  2. Borra las secciones que no apliquen. Una sección vacía es peor que su ausencia.
  3. Borra estos comentarios antes de guardar.
  4. Las secciones 6 (Criterio de salida) y 7 (Qué NO cubre) no se borran nunca.
-->

# {{PHASE_ID}}: {{DOC_TITLE}}

**Fase:** {{PHASE_ID}} ({{PHASE_NAME}})
**Artefacto:** {{ARTIFACT_ID}} ({{ARTIFACT_NAME}})
**Versión:** {{VERSION}} ({{STATUS}})
**Fecha:** {{DOC_DATE}}
**Fuentes:** {{SOURCES}}
**Alcance:** {{SCOPE}}

<!--
Cabecera, campo por campo:

  Fase        identificador y nombre de la fase, ej. "F2 (Contrato)".
  Artefacto   identificador estable del artefacto, F<n>-A<n>, más su nombre legible.
              El identificador nunca cambia aunque el archivo se renombre.
  Versión     entero que sube con cada regeneración, más el estado entre paréntesis:
              draft | in_eval | approved | rejected | implemented | superseded.
              En MINUSCULA: es el mismo enum que `estado` en STATE.md, y el artefacto
              tiene UN estado. Ver docs/method/state-schema.md, clave `artefactos`.
              Si la versión subió por un change request, cítalo aquí:
              "3 (approved, rebase por CR-007)".
              Subir la versión NO es lo mismo que superseder: si este documento se
              reescribe sigue siendo el mismo artefacto y solo sube el número; si otro
              artefacto lo reemplaza, este pasa a `superseded` y el nuevo nace en `draft`
              con su propio identificador (y su cabecera lleva la línea "Supera a:").
  Fecha       ISO YYYY-MM-DD. Fecha de esta versión, no del original.
  Fuentes     de qué artefactos aguas arriba deriva este documento, por identificador.
              Si deriva de una fuente externa, nómbrala con su versión.
              Un documento sin fuentes en una fase distinta de F0 es sospechoso.
  Alcance     qué porción del sistema cubre, en una frase. Recorta expectativas.

Líneas opcionales de cabecera. Inclúyelas solo si aportan:

  **Decisiones que refleja:** ADR-NNNN, ADR-NNNN
  **IDs que posee este doc:** rango de identificadores que este documento asigna en
                              exclusiva, ej. "REQ-DATA-01 a REQ-DATA-14"
  **Invariantes que respeta:** invariantes del proyecto que este documento no puede violar
  **Supera a:** identificador del ARTEFACTO que este reemplaza, si aplica. Es el otro
                lado del `superseded`: el reemplazado queda con ese estado apuntando aquí,
                y este apunta allá. Los dos lados se escriben, o el enlace queda cojo
-->

---

## 0. Resumen

<!-- Cinco líneas como máximo. Qué decide este documento y qué desbloquea. Alguien que solo
     lea esta sección tiene que poder decir si le afecta. -->

---

## 1. Contexto

<!-- De dónde viene este documento y qué problema del proceso cierra. Si es una regeneración,
     resume qué cambió respecto de la versión anterior y por qué. -->

### 1.1 Cambios respecto a la versión anterior

<!-- Solo si versión > 1. Tabla corta: qué cambió, qué lo motivó (CR-NNN o defecto del
     gate, con su pregunta: QA o PROYECTO), qué artefactos aguas abajo quedan afectados.
     Borra la sección en la v1. -->

| Cambio | Motivo | Impacto aguas abajo |
|---|---|---|
| | | |

---

## 2. Contenido

<!-- El cuerpo real. Estructúralo como pida el artefacto: tablas, enumeraciones, diagramas
     como código, esquemas. Reglas que aplican siempre:

     - Cada elemento sustantivo lleva identificador si otros documentos lo van a referenciar.
     - Cada afirmación es verificable o está marcada como supuesto.
     - Los números llevan unidad y origen.
     - Los diagramas van como código en el repositorio, no como imagen suelta.
-->

---

## 3. Trazabilidad

<!-- Obligatoria en toda fase distinta de F0. Es lo que hace auditable el documento y lo que
     permite calcular el radio de impacto de un cambio. Dos direcciones:

     Hacia arriba: cada elemento de aquí, contra su origen.
     Hacia abajo:  cada elemento obligatorio del origen, contra su cobertura aquí.
                   Los huecos se listan, no se omiten.
-->

| Elemento de este doc | Origen | Cómo se verificará |
|---|---|---|
| | | |

**Sin cobertura:**

<!-- Elementos del origen que este documento no cubre, con su motivo o su identificador de
     gap. Un origen sin cobertura y sin registro es un hueco que se paga construyendo. -->

---

## 4. Decisiones, supuestos y riesgos

### 4.1 Decisiones tomadas aquí

<!-- Decisiones estructurales que este documento fija. Cada una con al menos dos opciones
     evaluadas y sus consecuencias negativas. Si la decisión es relevante, promuévela a un
     ADR en decisions/ y cítala aquí por identificador. -->

| ID | Decisión | Alternativa descartada | Consecuencia negativa aceptada |
|---|---|---|---|
| | | | |

### 4.2 Supuestos

<!-- Lo que este documento da por cierto sin poder demostrarlo. Cada supuesto con
     identificador A<n>, dueño y estado de validación. Se registran en STATE.md. -->

| ID | Supuesto | Dueño | Validado |
|---|---|---|---|
| | | | |

### 4.3 Riesgos

| ID | Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|---|
| | | | | |

---

## 5. Preguntas abiertas y gaps

<!-- Lo que falta decidir, con dueño. Un gap registrado es deuda; un gap no registrado es
     una sorpresa. Cada uno con identificador para poder citarlo desde otro documento. -->

| ID | Pregunta o gap | Bloquea | Dueño |
|---|---|---|---|
| | | | |

---

## 6. Criterio de salida

<!-- No se borra nunca. Checklist verificable de cuándo este documento está terminado.
     Deriva del criterio de salida de la fase, en docs/method/phase-model.md, aterrizado a
     este artefacto. Cada línea la tiene que poder comprobar alguien que no lo escribió. -->

- [ ] <condición observable 1>
- [ ] <condición observable 2>
- [ ] Sin pendientes en las firmas o definiciones que otros documentos consumen
- [ ] Trazabilidad completa en ambas direcciones, con los huecos listados
- [ ] Sin contradicción con las decisiones ya aprobadas en `STATE.md`

---

## 7. Qué NO cubre este documento

<!-- No se borra nunca. Sin esta sección el lector asume cobertura que no existe. Nombra
     dónde vive cada cosa que queda fuera, si vive en algún lado. -->

- <fuera de alcance 1>, cubierto en <documento o fase, o "sin cubrir todavía">
- <fuera de alcance 2>

---

## 8. Bitácora

| Versión | Fecha | Cambio | Veredicto QA | Veredicto PROYECTO | Gate |
|---|---|---|---|---|---|
| 1 | {{DOC_DATE}} | Versión inicial | | | |
