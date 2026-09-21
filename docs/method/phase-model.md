# Modelo de fases y gates

Referencia del skill `new-software-project`. Define el esqueleto de proceso de
Landing Gob Perú: qué fases existen, qué produce cada una, cómo se sabe que terminó, cuándo
se salta, y quién autoriza avanzar.

Este modelo es agnóstico al tipo de solución (servicio web, análisis de datos, sistema con
componentes de IA, herramienta de línea de comandos, librería) y al stack. Si una sección
solo tiene sentido bajo un stack concreto, el modelo está mal aplicado.

---

## 1. Qué problema resuelve el modelo

Un proyecto de software falla por dos vías baratas de evitar:

1. **Se construye lo que no era.** Nadie escribió qué problema resolvía ni cómo se sabría
   que quedó resuelto.
2. **Se re-decide lo ya decidido.** No hay registro de qué se acordó, entonces cada semana
   se relitiga la misma discusión y el trabajo aguas abajo se deshace.

El modelo ataca ambas con un mecanismo único: **fases con criterio de salida observable y
un gate humano explícito**. Una fase no cierra porque "ya está", cierra porque su criterio
de salida se puede verificar y Daniel Santiváñez lo aprobó por escrito en `STATE.md`.

No es una metodología de estimación ni de ceremonias. Es un contrato de orden: qué tiene
que estar decidido antes de que sea barato decidir lo siguiente.

---

## 2. El invariante: seis fases

El esqueleto invariante es la secuencia de preguntas que todo proyecto de software responde,
en el orden en que responderlas es más barato:

| Fase | Pregunta que cierra |
|---|---|
| F0 | ¿Qué problema, de quién, y cómo sabremos que quedó resuelto? |
| F1 | ¿Qué forma tiene la solución y por qué esa y no otra? |
| F2 | ¿Cuál es exactamente la superficie por donde el mundo toca la solución? |
| F3 | ¿En qué orden se construye y cómo se verifica cada tramo? |
| F4 | Construir cada tramo hasta que su verificación pase. |
| F5 | ¿Cómo llega a quien lo usa, y cómo se revierte si sale mal? |

Son **seis**, no siete. Justificación del número:

- **F0 (problema y valor)** es irreductible. Es lo único que no se puede reconstruir a
  partir del código.
- **F1 (forma) y F2 (contrato) son fases distintas** aunque parezcan una. F1 decide
  *estructura y trade-offs* (qué piezas hay, cuál es responsable de qué, qué se sacrifica).
  F2 enumera *la superficie exacta y completa* (firmas, esquemas, comandos, pantallas,
  formatos, errores). Son eventos de aprobación separados porque se equivocan de forma
  distinta: F1 falla por trade-off mal elegido, F2 falla por hueco. Aprobar "monolito
  modular con cola de eventos" no es aprobar "estos 14 endpoints con estos 6 códigos de
  error".
- **El modelo de datos y los mockups no son fases.** Son *módulos del contrato* (F2). Un
  esquema de datos es el contrato con el consumidor de datos; un mockup es el contrato con
  el humano que opera. Un proyecto sin persistencia propia no tiene el primero, uno sin
  operador humano no tiene el segundo, y una librería tiene un tercero (la API pública)
  que ninguno de los dos cubre. Tratarlos como fases fijas sesga el modelo a "producto
  digital con base de datos y pantallas". Como módulos, el modelo cubre análisis, IA, CLI
  y librería sin inventar fases vacías.
- **F3 (plan) es fase propia** porque es el último punto barato para cortar alcance. Cortar
  en F4 cuesta código escrito.
- **F4 (construcción) y F5 (entrega) se separan** porque "funciona en mi máquina" y
  "un tercero lo reproduce" son criterios distintos, y el segundo es el que importa.

Colapsar F1+F2 produce arquitectura sin superficie enumerada, que es como se cuelan los
huecos de contrato. Separar más produce ceremonias sin decisión propia.

El modelo trae **seis fases por defecto** (F0–F5). Baja a cinco o cuatro según los saltos que declares en §5, y anota el número resultante donde el andamiaje lo pida.

---

## 3. Fichas de fase

Cada fase vive en `phases/F<n>-<slug>/` y sus documentos siguen la convención
`NN-<slug>.md` (ver `docs/method/id-conventions.md`).

### F0: Problema y valor

**Directorio:** `phases/F0-problema/`
**Propósito:** fijar qué se resuelve, para quién, con qué restricciones, y qué número
declarará el éxito o el fracaso.

**Artefactos de salida:**

| Archivo | Contenido |
|---|---|
| `00-contexto-y-valor.md` | Problema, a quién le duele, qué se hace hoy sin esto, por qué vale resolverlo, modelo de sostenibilidad si aplica |
| `01-actores.md` | Quién usa, quién opera, quién decide, quién paga. Contexto real de uso, no demografía |
| `02-recorridos.md` | Los recorridos de extremo a extremo del actor principal. Camino feliz más al menos dos fallos |
| `03-requisitos.md` | Requisitos funcionales y no funcionales, uno por línea, cada uno verificable. Cada NFR con métrica y método de medición |
| `04-alcance.md` | Casos de uso priorizados, corte de la primera versión, y la lista explícita de lo que queda fuera |

**Criterio de salida (observable):**

1. Cada requisito es falsable: existe una observación que lo declara incumplido.
2. Cada requisito no funcional tiene número, unidad y método de medición nombrado.
3. Existe al menos un criterio de éxito del proyecto con número y fecha de medición.
4. Existe la lista de lo que está fuera de alcance, escrita, no implícita.
5. Ningún requisito nombra una tecnología. Si la nombra, o es una restricción real y se
   declara como restricción con su motivo, o es solución camuflada y se reescribe.

**Cuándo se salta:** nunca. Se comprime. En un proyecto de una semana F0 puede ser un solo
archivo de una página, pero existe. Saltarla es el modo de falla número uno del catálogo.

---

### F1: Forma de la solución

**Directorio:** `phases/F1-forma/`
**Propósito:** decidir la estructura de la solución y dejar registrado por qué esa y no las
alternativas.

**Artefactos de salida:**

| Archivo | Contenido |
|---|---|
| `00-vista-general.md` | Las piezas, qué hace cada una, cómo se comunican, dónde están los límites |
| `01-decisiones.md` | Índice de los ADR abiertos en esta fase. Los ADR viven en `decisions/` |
| `02-nfr-a-mecanismo.md` | Tabla: cada requisito no funcional de F0 contra el mecanismo concreto que lo sostiene |
| `03-riesgos.md` | Riesgos técnicos con probabilidad, impacto y mitigación asignada |

**Criterio de salida (observable):**

1. Toda decisión estructural relevante tiene un ADR con al menos dos opciones evaluadas,
   la decisión y sus consecuencias negativas escritas. Un ADR sin consecuencia negativa
   está incompleto.
2. Cada pieza nombrada tiene una responsabilidad única enunciable en una frase.
3. Cada requisito no funcional de F0 traza a un mecanismo concreto, o se declara
   explícitamente que no está sostenido y por qué se acepta.
4. Todo lo que quede fuera del alcance de la primera versión pero deba seguir siendo posible
   está registrado como costura, con la restricción que la mantiene viva.

**Cuándo se salta:** cuando la forma está impuesta y no hay decisión que tomar. Casos reales:
extensión dentro de un sistema existente cuya estructura no se toca, o mandato
organizacional sobre el stack y la topología. En ese caso no se salta el registro: se abre
un único ADR "forma heredada" que enumera qué se hereda, de dónde, y qué queda fuera de
discusión, y se avanza a F2. Si al escribirlo aparece una decisión no tomada, F1 no era
saltable.

---

### F2: Contrato

**Directorio:** `phases/F2-contrato/`
**Propósito:** enumerar de forma completa la superficie por donde el mundo toca la solución,
incluyendo los fallos.

Esta fase se compone de **módulos**. Se corren solo los que aplican. Ver §4.

**Artefactos de salida:** un documento por módulo aplicable, numerado en orden de
dependencia. Nombres sugeridos: `00-datos.md`, `01-interfaz-maquina.md`,
`02-interfaz-humana.md`, `03-calidad.md`.

**Criterio de salida (observable):**

1. Para cada módulo aplicable, la superficie está enumerada completa: no hay elemento
   descrito como "y los demás casos".
2. Todo elemento del contrato incluye su comportamiento en fallo, no solo el camino feliz.
3. Cero marcadores de pendiente en las firmas. Un pendiente en el cuerpo del documento es
   deuda registrada; un pendiente en la firma es un hueco que se paga en F4.
4. Cada elemento del contrato traza a un requisito o caso de uso de F0. Un elemento sin
   origen es alcance colado y se elimina o se justifica.
5. Cada requisito de F0 marcado como obligatorio está cubierto por al menos un elemento del
   contrato. Los huecos se listan como gaps con identificador, no se descubren en F4.

**Cuándo se salta:** entera, casi nunca. Si ningún módulo de §4 aplica, la solución no tiene
superficie propia y probablemente F1 ya la describió: fusiona F1 y F2 en un solo gate y
regístralo en `STATE.md` como fusión declarada, no como salto silencioso.

---

### F3: Plan verificable

**Directorio:** `phases/F3-plan/`
**Propósito:** partir el contrato en tramos construibles, cada uno con su criterio de
aceptación, y fijar el corte de la primera versión.

**Artefactos de salida:**

| Archivo | Contenido |
|---|---|
| `00-backlog.md` | Unidades de trabajo con criterio de aceptación verificable, estimación relativa y dependencias. Espejo en ninguno si existe |
| `01-secuencia.md` | Orden de construcción, qué desbloquea qué, corte de la primera versión con la hipótesis que valida |
| `02-definicion-de-terminado.md` | Qué significa "terminado" para una unidad de trabajo en este proyecto |

**Criterio de salida (observable):**

1. Cada unidad de trabajo tiene criterio de aceptación redactado como observación, no como
   intención. "El comando devuelve código 2 y escribe el motivo en la salida de error" pasa;
   "maneja bien los errores" no.
2. Cada unidad de trabajo traza a un elemento del contrato de F2.
3. El corte de la primera versión está defendido: qué hipótesis valida y qué se aprende si
   falla.
4. La definición de terminado es la misma para todas las unidades y es verificable por
   alguien que no las construyó.

**Cuándo se salta:** cuando todo el trabajo cabe en un solo tramo verificable de extremo a
extremo, es decir cuando el criterio de salida de F2 y el criterio de aceptación del trabajo
completo son el mismo enunciado. Umbral práctico: si el plan tendría menos de tres unidades
de trabajo, no es un plan. En ese caso el criterio de salida de F2 hace de plan y se declara
el salto en `STATE.md`.

---

### F4: Construcción

**Directorio:** el código vive donde corresponda al proyecto. La fase registra su avance en
`STATE.md` y en ninguno, no en documentos de fase nuevos.
**Propósito:** construir cada tramo hasta que su verificación pase, sin desviarse del
contrato en silencio.

**Artefactos de salida:** por tramo, en este orden:

1. Especificación del tramo, derivada de F2 y F3, con entradas, salidas y casos borde.
2. Verificación escrita antes que el código, que falla sin él.
3. Implementación.
4. Registro de la verificación ejecutada, reproducible con un comando.

**Criterio de salida (observable), por tramo:**

1. La verificación del tramo se ejecuta y pasa, y falla si se revierte la implementación.
2. Cero desviación no declarada respecto al contrato de F2. Toda desviación es un change
   request registrado, no un comentario en el código.
3. Los casos borde enumerados en la especificación tienen verificación propia.
4. La verificación la puede correr un tercero con un comando documentado, sin conocimiento
   tácito.

**Cuándo se salta:** nunca. Es el trabajo.

**Iteración:** F4 es la única fase que se recorre en ciclo. Cada tramo cierra con su propia
verificación y su propio registro; el gate humano de F4 puede ser por tramo o por conjunto
de tramos, y se declara al abrir la fase.

---

### F5: Entrega

**Directorio:** `phases/F5-entrega/`
**Propósito:** que la solución llegue a quien la usa, de forma reproducible y reversible.

**Artefactos de salida:**

| Archivo | Contenido |
|---|---|
| `00-procedimiento.md` | Cómo se lleva desde cero a operativo. Ejecutable por un tercero |
| `01-observabilidad.md` | Qué señal dice que está sano y cuál dice que está roto, con umbral |
| `02-reversion.md` | Cómo se vuelve al estado anterior, en cuánto tiempo, y quién lo autoriza |
| `03-costos-y-limites.md` | Costo recurrente estimado con supuestos explícitos, y los límites conocidos |

**Criterio de salida (observable):**

1. Un tercero reproduce la entrega desde cero siguiendo el procedimiento escrito, sin
   preguntar. Esto se verifica ejecutándolo, no leyéndolo.
2. Existe al menos una señal que se degrada cuando la solución falla en lo que importa,
   no solo cuando falla la infraestructura.
3. La reversión está escrita y su tiempo estimado está declarado.
4. El costo recurrente está estimado con supuestos escritos, o se declara que no aplica.

**Cuándo se salta:** se salta el *despliegue* cuando no hay entorno que operar. Un análisis
puntual, un informe, una decisión documentada. No se salta la *entrega*: en ese caso los
artefactos son el handoff, dónde vive el resultado, quién lo mantiene, cómo se regenera y
con qué insumos. Un resultado que nadie puede regenerar no está entregado.

---

## 4. Módulos del contrato (F2)

Se corre un módulo si su condición aplica. Se declara explícitamente cuáles no aplican y
por qué; el silencio no cuenta como decisión.

| Módulo | Aplica cuando | Qué enumera | No aplica cuando |
|---|---|---|---|
| **C-DATOS** | La solución persiste o transforma datos con estructura propia | Entidades, relaciones, claves, invariantes, ciclo de vida, volúmenes estimados, datos sensibles y su tratamiento, versionado | Los datos son de un sistema ajeno y este proyecto no define su forma |
| **C-MAQUINA** | Otro programa consume la solución | Operaciones, entradas, salidas, errores, límites, compatibilidad. Endpoints, comandos y banderas, firmas públicas, formatos de archivo o eventos, según qué sea la solución | No hay consumidor programático |
| **C-HUMANO** | Un humano opera la solución directamente | Superficies de interacción, estados de cada una, transiciones, qué ve el usuario cuando algo falla o tarda | Solo la consume otro programa |
| **C-CALIDAD** | La salida no es determinista o su corrección es graduable | Definición operativa de "correcto", conjunto de evaluación con su origen, umbral de aceptación, y qué se hace bajo el umbral | La corrección es binaria y la cubre la verificación de F4 |

**Escalera de C-HUMANO.** Cuando aplica, se construye en tres pasos, cada uno con su
sub-gate, sin saltarse ninguno:

1. **Baja fidelidad**: estructura y contenido, sin estética. Responde "qué información hay y
   en qué orden".
2. **Estructura navegable, sin identidad**: se puede recorrer, sin decisiones de marca.
   Responde "el recorrido funciona".
3. **Identidad aplicada**: se aplican los tokens de diseño declarados.

El orden importa porque cada paso hace visible una clase de error distinta, y la estética
temprana bloquea la crítica estructural. Aplica igual a una interfaz gráfica, a una interfaz
de texto en terminal o al diseño de la salida de un comando.

**C-CALIDAD es el módulo que más se olvida.** Cualquier componente cuya salida se juzga por
grado (una recomendación, una extracción, una clasificación, un resumen, una heurística de
ranking) necesita su umbral declarado antes de F4. Sin él, F4 no tiene criterio de salida y
la discusión de "está lo bastante bien" ocurre después de construido, que es cuando ya no se
puede perder.

---

## 5. Tabla de saltos

| Fase | Se salta | Condición | Qué se registra igual |
|---|---|---|---|
| F0 | Nunca | Se comprime a un documento | Todo |
| F1 | Sí | Forma impuesta, sin decisión que tomar | ADR "forma heredada" |
| F2 | Solo por módulo | Ver §4 | Los módulos descartados, con motivo |
| F3 | Sí | El trabajo es un solo tramo verificable | El criterio de salida de F2 hace de plan |
| F4 | Nunca | Es el trabajo | Todo |
| F5 | Solo el despliegue | No hay entorno que operar | El handoff, siempre |

Un salto es una decisión con dueño. Se escribe en `STATE.md` con fecha y motivo, y lo
aprueba Daniel Santiváñez igual que un gate. Un salto no registrado es una fase olvidada.

---

## 6. Mecanismo de gate

Una fase cierra en tres pasos, en este orden, sin excepciones.

### Paso 1: verificación adversarial — las dos preguntas

Todo artefacto se somete a **dos preguntas** antes de llegar a Daniel Santiváñez, y quien las responde
es independiente de quien generó el artefacto:

| Pregunta | Se responde | Cuándo corre |
|---|---|---|
| **QA** — ¿funciona? | ejecutando | por artefacto |
| **PROYECTO** — ¿era lo que tocaba? | trazando | al cierre de fase, sobre el conjunto |

Cada pregunta tiene su mitad de la rúbrica (ver `docs/method/rubrics.md`) y emite su propio
veredicto `GO` / `NO-GO` con defectos numerados y su severidad.

PROYECTO corre sobre el conjunto porque la coherencia cross-artefacto solo se audita con los
artefactos juntos. **Escape declarado:** corre por artefacto cuando ese artefacto va a ser
insumo de trabajo paralelo, es decir cuando revertirlo después cuesta más que auditarlo
ahora. El escape se declara en el plan de la fase, con motivo.

Cuántos agentes responden las dos preguntas lo decide `modo_gates` en `STATE.md`: `uno`
(default, un evaluador `heavy` que emite dos veredictos separados) o `dos` (opt-in, dos gates
en serie, cada uno RECOLECTOR → JUEZ, jueces distintos). Ver `docs/method/rubrics.md` §2.

Máximo **3 iteraciones por pregunta, por artefacto**, con presupuestos separados. **3 es
techo, no meta:** cada pregunta cierra en cuanto una ronda no devuelve ni BLOCKER ni MAJOR.
Los MINOR no compran otra iteración; se arrastran como deuda declarada al gate humano. Si no
converge, no se fuerza una cuarta: escala a Daniel Santiváñez con las opciones en conflicto y el costo
de cada una.

### Paso 2: gate humano

Cuando todos los artefactos de la fase tienen `GO` en las dos preguntas, se presenta a
Daniel Santiváñez:

- Las decisiones tomadas en la fase y sus consecuencias.
- Los supuestos declarados y sin validar.
- Las preguntas abiertas.
- Los defectos menores diferidos, con su identificador.

Daniel Santiváñez responde con la frase exacta:

```
APRUEBO F<n>
```

Sin esa frase, la fase no cerró. No cuentan "va bien", "sigamos", ni el silencio. La frase
es explícita a propósito: es el único punto del proceso donde una persona asume la decisión,
y tiene que quedar registro de que la asumió.

Variantes válidas:

- `APRUEBO F<n>` cierra la fase completa.
- `APRUEBO F<n>.<m>` cierra un sub-gate (ver §7).
- `APRUEBO <ID-ARTEFACTO>` cierra un artefacto suelto sin cerrar la fase.

### Paso 3: registro en STATE.md

El gate aprobado se escribe en `STATE.md`, en `gates_aprobados`, con este contenido mínimo:

```yaml
gates_aprobados:
  - id: F<n>
    fecha: 2026-09-20
    veredicto_qa: "GO en iteración <k>"
    veredicto_proyecto: "GO en iteración <k>"
    aprobado_por: Daniel Santiváñez
    nota: "<qué quedó decidido y qué quedó diferido, en una o dos frases>"
```

Y se actualiza `fase_activa` a la siguiente fase.

**Regla dura:** `fase_activa` no avanza si el gate anterior no está en `gates_aprobados`.
Si hace falta trabajar en dos fases a la vez, se declara como anticipo con motivo, no se
finge que el gate ocurrió.

**Regla de la nota:** la nota del gate registra lo que se decidió, no lo que se hizo. Un
gate cuya nota es una lista de archivos escritos no sirve para nada dentro de seis semanas.

---

## 7. Sub-gates

Una fase con módulos o etapas internas puede tener sub-gates: `F2.1`, `F2.2`, `F3.1`. Un
sub-gate usa el mismo mecanismo completo, incluida la verificación adversarial y la frase de
aprobación.

Cuándo conviene partir una fase en sub-gates:

- Los módulos tienen dueños distintos y avanzan a ritmos distintos.
- Una etapa temprana tiene que quedar fija antes de que la siguiente sea útil, como la
  escalera de C-HUMANO de §4.
- El artefacto es tan grande que un solo veredicto adversarial no da señal accionable.

Cuándo no: partir por comodidad de calendario. Un sub-gate sin criterio de salida propio es
una reunión.

---

## 8. Retroalimentación entre fases

Las fases son secuenciales en decisión, no en tiempo. Descubrir en F4 que F1 estaba mal es
normal; lo que no es normal es arreglarlo en silencio.

El mecanismo es el **change request**:

1. Se abre un `CR-NNN` con: qué cambia, qué lo motivó, qué fases toca, y qué artefactos
   quedan invalidados.
2. Se registra en `STATE.md` bajo `change_requests` con estado `propuesto`.
3. Los artefactos afectados se re-generan y vuelven a pasar por las dos preguntas. Un
   artefacto re-generado sube de versión y anota en su cabecera qué CR lo motivó.
4. El re-cierre de la fase afectada es un gate nuevo, con nombre propio, del tipo
   `F<n>-REBASE`. La aprobación original no se hereda.
5. El CR pasa a `aplicado`.

Un artefacto aprobado que se edita sin CR pierde su aprobación. Ese es todo el valor del
gate: si la aprobación no protege nada, no es una aprobación.

---

## 9. Antipatrones

| Antipatrón | Síntoma | Costo |
|---|---|---|
| Gate por cansancio | La fase cierra porque llevaba mucho abierta, no porque su criterio se cumpla | El criterio incumplido reaparece dos fases después, ya caro |
| Fase vacía por simetría | Se corre un módulo o fase que no aplica, para "completar el modelo" | Documento que nadie lee y que contradice al que sí importa |
| Contrato con puntos suspensivos | F2 aprobado con "y los demás casos" en alguna firma | El hueco se descubre a mitad de F4 y arrastra el diseño |
| Requisito con tecnología dentro | "El sistema debe usar <componente>" como requisito de F0 | Se cierra el espacio de solución antes de F1 y el ADR queda decorativo |
| Verificación escrita después | El código existe y luego se le escribe la prueba | La prueba se ajusta al código, no al contrato, y pasa siempre |
| Salto silencioso | Una fase no se corrió y tampoco se declaró | Nadie sabe si la decisión se tomó o se olvidó |
| Aprobación implícita | Se avanza sin la frase | No hay dueño de la decisión cuando se rompe |
| Gate complaciente | Todos los veredictos son `GO` a la primera | El gate no filtra nada; es teatro con un paso extra |
| Una sola pregunta | Se responde "¿funciona?" y se da por respondida "¿era lo que tocaba?" | La evidencia ejecutable es más vistosa y se lleva la atención; el alcance nunca se audita |
| Iterar hasta agotar el techo | La ronda 3 discute si son 9 o 10 | El techo de 3 se trata como cuota. Una ronda que solo discute aritmética ya dejó de pagar |

---

## 10. Mapa rápido

```
F0 problema y valor   ->  qué y para quién, con criterio de éxito medible
F1 forma              ->  estructura y trade-offs, con ADRs
F2 contrato           ->  superficie completa, por módulos aplicables
F3 plan               ->  tramos con criterio de aceptación y corte de v1
F4 construcción       ->  ciclo por tramo: spec, verificación, código, evidencia
F5 entrega            ->  reproducible por un tercero y reversible

cada artefacto:  generador  ->  QA: ¿funciona?          (máx 3 iter)
cada fase:       el conjunto ->  PROYECTO: ¿era lo que tocaba?  (máx 3 iter)
                             ->  APRUEBO F<n>  ->  STATE.md

  3 iteraciones es TECHO, no meta: cierra cuando una ronda no trae BLOCKER ni MAJOR
  quien evalua != quien genero, siempre

cambio tardío:  CR-NNN  ->  re-generar afectados  ->  gate F<n>-REBASE
```
