# Rúbricas del gate

Referencia del skill `new-software-project`. Define cómo se critica un artefacto antes de
que llegue al gate humano de Daniel Santiváñez.

Se usa junto con `docs/method/phase-model.md`, que define las fases y sus criterios de salida.
La rúbrica no reemplaza el criterio de salida: lo audita.

---

## 1. Las dos preguntas

Todo artefacto se somete a **dos preguntas distintas**, y son distintas porque se responden
con evidencia distinta y se cierran con umbrales distintos:

| Pregunta | Nombre | Se responde | Alcance |
|---|---|---|---|
| ¿Funciona? | **QA** | **Ejecutando**: corriendo la suite, revirtiendo la implementación, leyendo el artefacto contra sí mismo | correctitud, casos borde, regresión, buena formación, verificabilidad interna |
| ¿Era lo que tocaba? | **PROYECTO** | **Trazando**: ticket → archivo → línea, alcance declarado, `STATE.md`, otros artefactos | scope creep, trazabilidad, ADRs faltantes o contradichos, coherencia cross-artefacto |

Juntas en una sola lectura, la segunda pierde: la evidencia ejecutable es más vistosa y se
lleva la atención. La partición no es un checklist más largo — un checklist más largo no
cambia dónde mira quien lo lee. Es **dos veredictos separados**, cada uno con su propia
mitad de la rúbrica y su propio contador de iteraciones.

### Reglas de constitución

Valen para las dos preguntas, en cualquier modo:

1. **Independencia.** Quien evalúa no puede ser quien generó el artefacto. Si lo es, no es
   una revisión, es una relectura. Cuando el proceso corre con agentes, es una instancia
   distinta, sin el contexto de construcción.
2. **Nada llega al humano sin las dos preguntas respondidas.** Ni siquiera lo obvio. El gate
   humano decide sobre trade-offs, no sobre si el documento está completo.
3. **No se relitiga lo ya aprobado.** Antes de levantar un defecto, se revisa `STATE.md`
   (decisiones, supuestos, change requests). Señalar como defecto algo que fue una decisión
   de gate es un falso positivo, y los falsos positivos destruyen la señal más rápido que los
   defectos no encontrados.
4. **El gate no fija la agenda.** Un `NO-GO` puede señalar archivos fuera del alcance que
   Daniel Santiváñez declaró. Eso se reporta como deuda, no se persigue. El alcance lo fija el humano,
   no el hallazgo.

---

## 2. Estructura del gate: RECOLECTOR → JUEZ

El recurso escaso no es el modelo caro: es **su contexto**. La salida de herramientas es lo
que más contexto quema. De ahí la forma del gate:

| Sub-seat | Tier | Qué hace | Qué NO hace |
|---|---|---|---|
| **RECOLECTOR** | `build` | corre la suite, grepea, compila, trazea artefacto↔spec, llena el checklist de la rúbrica; devuelve **evidencia cruda con `archivo:línea` y salida textual pegada** | no juzga, no asigna severidad, no negocia con el generador |
| **JUEZ** | `heavy` | lee la evidencia, aplica la rúbrica, asigna severidad, firma `GO`/`NO-GO` | no recolecta; si le falta evidencia pide **una** pasada extra con la pregunta concreta |

Es una decisión de **asignación, no de ahorro**. Partir el gate cuesta más agentes. Lo que
mejora es la calidad del contexto por decisión cara: el juez gasta su ventana juzgando, no
leyendo `grep`.

### Las dos guardas

Sin ellas el diseño degrada a un linter caro:

1. **Evidencia textual, nunca resumen.** Si el RECOLECTOR parafrasea la salida, el JUEZ juzga
   una versión ya digerida. Parafrasear es defecto **del gate**, no del artefacto.
2. **El JUEZ no firma a ciegas.** Verifica por su cuenta lo que huela raro — un `git show`
   sale más barato que otra pasada — y **refuta** el hallazgo que no resista. Un hallazgo del
   RECOLECTOR que no sobrevive verificación se reporta como refutado; no se arregla.

En una corrida real de cinco gates, la guarda 2 hizo que los jueces refutaran **tres
hallazgos de sus propios recolectores**: un campo "desaparecido" que nunca había existido, un
conteo corrido en uno, y dos supuestas mentiras de bitácora que eran verdades fechadas. Un
solo agente haciendo ambas cosas habría "arreglado" defectos inexistentes.

### `modo_gates`: cuántos agentes responden las dos preguntas

Declarado en `STATE.md`. Las dos preguntas se responden siempre; esto decide con cuántos
agentes.

**`uno` (default).** Un evaluador tier `heavy` responde las dos preguntas y emite **dos
veredictos separados**. Los seats colapsan en una instancia, pero **las dos guardas
sobreviven**: sigue obligado a pegar la salida textual en vez de parafrasearla, y a refutar
su propio hallazgo cuando no resiste. Lo que se pierde es la independencia entre capas, no la
disciplina.

**`dos` (opt-in).** Dos gates en serie:

```
WORKER produce
   ↓
GATE-QA         RECOLECTOR (build) → JUEZ (heavy) firma GO/NO-GO
   ↓ GO
GATE-PROYECTO   RECOLECTOR (build) → JUEZ' (heavy, otra instancia) firma GO/NO-GO
   ↓ GO
GATE HUMANO → APRUEBO
```

Serie, no paralelo: al gate de proyecto solo llega lo que pasó QA. Los jueces son instancias
separadas — quien firma QA no firma PROYECTO. Un `NO-GO` rebota al generador, no al humano.

**Por qué el default es `uno`.** El motor de dos gates **nunca corrió sobre código real**: su
evidencia salió de una corrida sobre su propia documentación, n=1. Cuatro agentes por
artefacto en un proyecto de seis archivos es ceremonia sin evidencia que la sostenga. Mover
el default exige calibrar primero con un ticket de código. Subir a `dos` es una decisión con
dueño: se registra, no se improvisa.

### Cuándo corre cada pregunta

| | Cuándo |
|---|---|
| **QA** | por artefacto, siempre |
| **PROYECTO** | al **cierre de fase**, sobre el conjunto de artefactos, antes del gate humano |

PROYECTO corre sobre el conjunto porque la coherencia cross-artefacto — la mitad de su
alcance — solo es auditable con los artefactos juntos. El gate del artefacto 1 no puede ver
el 3.

**Escape declarado:** PROYECTO corre por artefacto cuando ese artefacto va a ser **insumo de
trabajo paralelo**, es decir cuando revertirlo después cuesta más que auditarlo ahora. El
escape se declara en el plan de la fase, con el motivo. Un escape no declarado es el gate
fijando su propia agenda.

---

## 3. Anatomía del veredicto

Se emite un objeto, no prosa. Uno **por pregunta**:

```json
{
  "artefacto": "<ID-ARTEFACTO>",
  "fase": "F<n>",
  "gate": "QA",
  "iteracion": 1,
  "veredicto": "NO-GO",
  "defectos": [
    {
      "n": 1,
      "severidad": "BLOCKER",
      "criterio": "<criterio de la rúbrica que se incumple>",
      "detalle": "<qué dice el artefacto y por qué está mal>",
      "escenario": "<situación concreta en la que esto produce un resultado equivocado>",
      "evidencia": "<archivo:línea, o el comando y su salida textual>",
      "fix": "<el cambio mínimo que lo cierra>"
    }
  ],
  "verificado_limpio": ["<criterios que se revisaron y pasaron>"],
  "metodo": "<con qué se midió cada afirmación de este veredicto>",
  "refutados": ["<hallazgos del RECOLECTOR que no sobrevivieron verificación>"]
}
```

`gate` ∈ `QA | PROYECTO`. Con `modo_gates: uno` se emiten los dos objetos igual, uno por
pregunta.

**`verificado_limpio` es obligatorio.** Un veredicto que solo lista defectos no dice qué se
revisó, y no se distingue de una revisión superficial que encontró lo primero que vio.

**`metodo` es obligatorio.** Toda afirmación del veredicto declara con qué se midió. Sin
método, la afirmación no es verificable — y un gate que se auto-certifica con un método más
débil que su propio claim es el antipatrón que más caro salió (§7).

**`refutados` no se omite cuando está vacío.** Un JUEZ que nunca refuta nada está firmando lo
que le sirvieron.

---

## 4. Severidades, ciclo y regla de parada

### Severidades

| Severidad | Definición operativa | Efecto |
|---|---|---|
| **BLOCKER** | Aprobarlo induce trabajo que habrá que deshacer, viola un invariante declarado del proyecto, o hace indecidible el criterio de salida de la fase | Bloquea el gate. Se arregla antes de seguir |
| **MAJOR** | Defecto real que degrada el artefacto o su trazabilidad, pero no invalida las decisiones aguas abajo | Bloquea `GO`. Se arregla en la iteración |
| **MINOR** | Mejora sin consecuencia aguas abajo. Redacción, orden, un ejemplo que ayudaría | No bloquea. Se difiere con registro explícito |

**Regla del escenario.** Todo `BLOCKER` y todo `MAJOR` lleva un escenario concreto: entrada
o situación específica, y el resultado equivocado que produce. Un defecto sin escenario es
una opinión y baja automáticamente a `MINOR`. Esta regla es lo que separa una rúbrica de una
lista de preferencias.

**Regla del diferimiento.** Un `MINOR` diferido no desaparece: se anota en el registro del
artefacto con su identificador, para que exista cuando alguien pregunte por qué el documento
tiene ese defecto. Los `MINOR` acumulados de varias fases se cierran en tandas dedicadas, no
de a uno.

### Veredicto

```
GO      si  0 BLOCKER  y  0 MAJOR
NO-GO   en cualquier otro caso
```

Los `MINOR` no impiden `GO`. Se listan igual.

### Regla de parada: 3 es techo, no meta

**Máximo 3 iteraciones por pregunta, por artefacto.** QA y PROYECTO llevan presupuestos
**separados** contra el mismo artefacto (`iteraciones_qa` / `iteraciones_proyecto`).

- **Iteración 1**: veredicto sobre el artefacto original.
- **Iteración 2**: veredicto sobre el artefacto corregido. Se verifica que los defectos
  anteriores estén cerrados **y que la corrección no haya introducido otros**. Este segundo
  chequeo no es ceremonia: en la corrida de referencia, los fixes de tres BLOCKER
  introdujeron un MAJOR nuevo.
- **Iteración 3**: última. Mismo criterio.

**El gate cierra en cuanto una ronda no devuelve ni BLOCKER ni MAJOR.** El techo de 3 no es
una cuota que haya que gastar. Los `MINOR` **no compran otra iteración**: se arrastran como
deuda declarada al gate humano.

Sin esta regla escrita, un orquestador obediente itera hasta agotar el presupuesto y
convierte el cortacircuito en checklist. La señal de que ya dejó de pagar es concreta: cuando
una ronda solo discute conteos, aritmética o redacción, cerrarlo es la decisión correcta, no
la floja.

Si agotadas las 3 el veredicto sigue en `NO-GO`, **no se fuerza una cuarta**. Se escala a
Daniel Santiváñez con:

1. El defecto que no cierra, con su escenario.
2. Las opciones en conflicto, con el costo de cada una.
3. La recomendación del gate y por qué el generador no la aplicó.

La escalada no es un fracaso del proceso, es su salida diseñada. Tres iteraciones sin
converger casi siempre significa que hay una decisión de producto o de trade-off que ningún
agente puede tomar, y forzar una cuarta iteración solo produce un artefacto que esconde el
desacuerdo.

**Excepción de re-pase.** Si la corrección de la última iteración es exactamente el `fix` que
el gate escribió, y viene acompañada de la verificación que lo demuestra, no se exige un pase
completo adicional. Se registra que no se re-corrió y por qué.

**Conflicto entre preguntas.** Si QA da `GO` y PROYECTO da `NO-GO` por una razón de fondo (o
al revés) y el tier `heavy` no lo cierra, es un gatillo de escalada al tier `expert`, no una
cuarta iteración.

---

## 5. Reparto de criterios: la regla

Cada criterio pertenece a **una** de las dos preguntas. La regla que decide:

> Un criterio es de **QA** si su falla se manifiesta **dentro** del artefacto: está mal
> formado, no es verificable, no corre.
>
> Un criterio es de **PROYECTO** si su falla se paga **fuera**: aguas abajo alguien construye
> lo equivocado, o contradice algo ya aprobado.

El caso que confunde: un criterio se puede chequear leyendo solo el artefacto y aun así ser
de PROYECTO. Lo que decide no es *dónde se mira* sino *dónde se paga*. "¿El documento declara
qué no cubre?" se responde con el documento en la mano, pero su falla —el lector asume una
cobertura que no existe— se paga tres fases después. Es de PROYECTO.

---

## 6. Criterios transversales

Aplican a todo artefacto de toda fase. Se revisan siempre, antes que los criterios
específicos.

### QA — ¿funciona?

| Criterio | Pregunta | Falla típica |
|---|---|---|
| **Completitud** | ¿Hay algún "etcétera", "y los demás casos", o pendiente en una firma? | El hueco se descubre construyendo, ya caro |
| **Testabilidad** | ¿Cada afirmación tiene una observación que la declararía falsa? | "Debe ser rápido", "maneja bien los errores" |

En artefactos de documento la lista es corta a propósito. Que QA tenga poco que morder en F0
no significa que se salte: significa que su veredicto es `N/A` **declarado** o un `GO` sobre
buena formación y verificabilidad, y queda registrado igual.

### PROYECTO — ¿era lo que tocaba?

| Criterio | Pregunta | Falla típica |
|---|---|---|
| **Trazabilidad** | ¿Cada elemento tiene un origen identificable aguas arriba, y cada elemento obligatorio aguas arriba tiene cobertura aquí? | Elemento sin origen (alcance colado) o requisito obligatorio sin cobertura (hueco) |
| **No contradicción** | ¿Contradice una decisión, supuesto o invariante ya aprobado en `STATE.md`? | Dos documentos aprobados que dicen cosas incompatibles y nadie sabe cuál gana |
| **Honestidad de alcance** | ¿Lo que no está hecho o no está decidido se declara como tal? | Un supuesto presentado como hecho; un pendiente presentado como resuelto |
| **Sin solución camuflada** | ¿Hay una decisión de implementación disfrazada de requisito o de necesidad? | Se cierra el espacio de solución antes de la fase que debía decidirlo |
| **Consecuencia negativa** | ¿Cada decisión declara qué se pierde al tomarla? | Decisión sin costo escrito es decisión no evaluada |
| **Alcance del documento** | ¿El documento dice qué NO cubre? | El lector asume cobertura que no existe |

---

## 7. Criterios por fase

Se suman a los transversales. Son genéricos a propósito: sirven para un servicio, un
análisis, un componente de IA, una herramienta de línea de comandos o una librería.

La columna **P** indica a qué pregunta pertenece el criterio: **Q** = QA, **PR** = PROYECTO.

### F0: Problema y valor

| # | P | Criterio |
|---|---|---|
| 1 | Q | Cada requisito es verificable y no ambiguo. Existe la observación que lo declara incumplido |
| 2 | Q | Cada requisito no funcional tiene número, unidad y método de medición nombrado. Un NFR sin método de medición no se puede aprobar |
| 3 | Q | Existe al menos un criterio de éxito del proyecto con número y fecha de medición |
| 4 | Q | Los recorridos cubren el camino feliz y al menos dos modos de fallo |
| 5 | Q | Los actores están descritos por su contexto de uso, no por atributos decorativos |
| 6 | PR | Ningún requisito nombra tecnología, salvo declarado como restricción externa con motivo |
| 7 | PR | La lista de lo que queda fuera de alcance existe y es específica |

### F1: Forma de la solución

| # | P | Criterio |
|---|---|---|
| 1 | Q | Cada pieza tiene responsabilidad única enunciable en una frase, sin conjunciones que escondan dos responsabilidades |
| 2 | Q | Cada ADR evalúa al menos dos opciones reales. Una opción de paja no cuenta |
| 3 | Q | Existe comportamiento definido cuando una pieza falla o no está disponible |
| 4 | Q | Los riesgos técnicos tienen mitigación asignada, no solo enunciado |
| 5 | PR | La forma sostiene los NFR de F0. Existe la tabla que traza cada uno a un mecanismo, o la declaración explícita de que no está sostenido |
| 6 | PR | Cada ADR declara consecuencias negativas |
| 7 | PR | Nada de lo decidido contradice una restricción de F0 |

### F2: Contrato

| # | P | Criterio |
|---|---|---|
| 1 | Q | La superficie está enumerada completa por cada módulo aplicable |
| 2 | Q | Todo elemento incluye su comportamiento en fallo, no solo el camino feliz |
| 3 | Q | Si corrió C-DATOS: los invariantes de los datos están escritos, hay estimación de volumen, y los datos sensibles están identificados con su tratamiento |
| 4 | Q | Si corrió C-MAQUINA: los errores están enumerados con su condición de disparo, y la política de compatibilidad hacia adelante está declarada |
| 5 | Q | Si corrió C-HUMANO: cada superficie tiene sus estados completos incluyendo carga, vacío, error y sin permiso; la escalera de fidelidad se respetó sin saltarse pasos |
| 6 | Q | Si corrió C-CALIDAD: "correcto" está definido de forma operativa, el conjunto de evaluación tiene origen declarado, el umbral es un número, y existe la conducta bajo umbral |
| 7 | PR | Los módulos que no se corrieron están declarados con motivo |
| 8 | PR | Cada elemento traza a un requisito o caso de uso de F0 |
| 9 | PR | Cada requisito obligatorio de F0 tiene cobertura, o su hueco está registrado con identificador |
| 10 | PR | No hay contradicción entre módulos. Dos módulos que describen el mismo elemento dicen lo mismo |

### F3: Plan verificable

| # | P | Criterio |
|---|---|---|
| 1 | Q | Cada unidad de trabajo tiene criterio de aceptación redactado como observación |
| 2 | Q | Las estimaciones son relativas y comparables entre sí |
| 3 | Q | Las dependencias entre unidades están declaradas y el orden las respeta |
| 4 | Q | La definición de terminado es única, verificable por un tercero, e incluye verificación ejecutada |
| 5 | PR | Cada unidad traza a un elemento del contrato de F2 |
| 6 | PR | El corte de la primera versión está defendido: qué hipótesis valida, qué se aprende si falla |
| 7 | PR | Ninguna unidad de trabajo depende de una decisión que todavía no se tomó |

### F4: Construcción

| # | P | Criterio |
|---|---|---|
| 1 | Q | La verificación se escribió antes que el código y falla sin él. Esto se comprueba revirtiendo, no leyendo |
| 2 | Q | Los casos borde de la especificación tienen verificación propia |
| 3 | Q | La verificación es reproducible por un tercero con un comando documentado |
| 4 | Q | Cero funcionalidad aparente sin respaldo: nada que parezca operativo y no lo esté. Lo que no funciona todavía se presenta como no disponible, no se disimula |
| 5 | Q | Si aplica C-CALIDAD: la métrica medida cumple el umbral declarado en F2, con la evidencia |
| 6 | PR | La implementación cumple la especificación del tramo al cien por ciento, o la desviación está registrada como change request |
| 7 | PR | No hay elemento nuevo en la superficie que no esté en el contrato de F2 |

F4 es la fase donde QA tiene más que morder y donde el RECOLECTOR se gana el sueldo: suite
corriendo con su salida pegada, el test revertido que efectivamente falla, mutation testing
cuando el artefacto es lógica crítica, y el diff completo.

### F5: Entrega

| # | P | Criterio |
|---|---|---|
| 1 | Q | El procedimiento es reproducible: se ejecutó y funcionó, no solo se escribió |
| 2 | Q | La reversión está definida con tiempo estimado y autorizador |
| 3 | Q | Existe al menos una señal sobre la calidad del resultado, no solo sobre la salud de la infraestructura |
| 4 | Q | Los umbrales de alerta son números, no adjetivos |
| 5 | PR | El costo recurrente está estimado con supuestos explícitos, o se declara que no aplica |
| 6 | PR | Los límites conocidos y lo que queda sin cubrir están escritos |
| 7 | PR | Existe el handoff: dónde vive, quién lo mantiene, cómo se regenera |

---

## 8. Antipatrones

### Del veredicto

| Antipatrón | Cómo se ve | Por qué mata el proceso |
|---|---|---|
| Revisión cosmética | Todos los defectos son de redacción u orden | Consume una iteración y no filtra riesgo |
| `GO` a la primera, siempre | Ningún artefacto encuentra defectos | El gate no filtra nada; es teatro |
| Inventar requisitos | Se exige algo que no está en F0 ni en la rúbrica | Alcance colado por la puerta de atrás |
| Relitigar el gate | Se marca como defecto una decisión ya aprobada en `STATE.md` | Falso positivo; erosiona la confianza en el veredicto |
| Severidad inflada | Todo es `BLOCKER` | Se pierde la capacidad de priorizar y el humano deja de leer |
| Defecto sin escenario | "Esto podría dar problemas" | No es accionable y no se puede verificar el arreglo |
| Corregir en vez de criticar | El gate reescribe el artefacto | Deja de ser independiente y ya no puede evaluar el resultado |
| No verificar el arreglo | La iteración 2 aprueba sin comprobar que el defecto cerró | La corrección puede no cerrar nada, o romper otra cosa |

### De la partición en dos capas

Estos aparecieron corriendo el motor sobre su propio cambio. Todos son propios.

| Antipatrón | Cómo se ve | Por qué mata el proceso |
|---|---|---|
| **RECOLECTOR que parafrasea** | La evidencia dice "la suite pasa" en vez de pegar el comando y su salida | El JUEZ juzga una versión ya digerida. Es defecto **del gate**, no del artefacto |
| **JUEZ que firma a ciegas** | Cero entradas en `refutados`, nunca corrió una verificación propia | Está firmando lo que le sirvieron. Un recolector equivocado le hace "arreglar" defectos inexistentes |
| **Auto-certificación con método más débil que el claim** | "Verificado: 0 marcas fuera de la tabla", medido con un `grep` case-sensitive y solo sobre `.md`. Había 4 violaciones vivas, una en el propio archivo que se declaraba única fuente | El claim suena verificado y no lo está. Por eso `metodo` es obligatorio en el veredicto (§3) |
| **Fixes que introducen defectos nuevos** | La iteración 2 solo chequea cierre, no regresión | Pasó literal: arreglar 3 BLOCKER metió 1 MAJOR nuevo |
| **Iterar hasta agotar el presupuesto** | La ronda 3 discute si son 9 o 10 | El techo se trata como cuota. Una ronda que solo discute aritmética ya dejó de pagar |
| **El gate fijando la agenda** | `NO-GO` por archivos fuera del alcance que Daniel Santiváñez declaró | El alcance lo fija el humano, no el hallazgo. Va como deuda reportada |
| **Números irreproducibles en el registro** | Conteos tomados de un estado intermedio que nunca se commiteó | Eran ciertos al escribirlos y dejaron de serlo. O se fecha explícito, o se escribe el comando, o no se escribe |
| **Marcas de modelo desparramadas** | Un documento del andamiaje nombra un modelo concreto | El mapeo tier→modelo vive en **una** tabla (`AGENTS.md` §2). Si no, el doc miente en cuanto sale un modelo nuevo |

### El límite honesto

Un juez levantó "falta un ADR" citando bien un precedente del repo, y estaba equivocado: la
frontera que violaba no estaba escrita en ningún archivo, vivía solo en la cabeza del humano.

**Los gates cazan lo que contradice al repo, no lo que contradice a un criterio que el repo
nunca declaró.** Cuando Daniel Santiváñez adjudica en contra de un gate, **eso se escribe** — si no,
el próximo gate lo vuelve a levantar.

---

## 9. Registro del resultado

Cada artefacto lleva en `STATE.md`, bajo `artefactos`:

```yaml
artefactos:
  - id: <ID-ARTEFACTO>
    fase: F<n>
    nombre: <slug>
    estado: draft | in_eval | approved | rejected | implemented | superseded
    version: <n>
    veredicto_qa: "GO en iter 2"
    veredicto_proyecto: "pendiente (cierre de fase)"
    iteraciones_qa: <n>
    iteraciones_proyecto: <n>
    nota: "<veredicto final, defectos cerrados, MINOR diferidos con su identificador>"
```

La `nota` es el registro que sobrevive a la sesión. Escribe qué se decidió y qué quedó
abierto, no qué se hizo.

**Registro obligatorio en el runlog:** cuántos defectos cazó cada pregunta y cuántos se le
escaparon al gate humano. Sin ese conteo el motor no es falsable y se vuelve ceremonia. Es
también la única forma de saber si `modo_gates: dos` valió lo que costó — la señal de que la
partición no compró nada es que el gate humano siga encontrando defectos del tipo "había que
saber qué buscar".
