# Convenciones de identificadores

Referencia del skill `new-software-project`. Define los espacios de nombres de
identificadores de Landing Gob Perú, por qué existen, y las reglas de higiene que evitan la
deuda más común.

---

## 1. Para qué sirven

Un identificador estable convierte una afirmación en algo citable. Eso habilita tres cosas
que sin identificadores no se pueden hacer:

1. **Trazabilidad bidireccional.** Se puede preguntar "de dónde salió esto" y "qué depende
   de esto", y ambas preguntas tienen respuesta mecánica.
2. **Radio de impacto de un cambio.** Un change request puede enumerar exactamente qué
   artefactos invalida, porque los elementos afectados tienen nombre.
3. **Auditoría del gate.** La pregunta PROYECTO puede verificar cobertura sin interpretar
   prosa: los requisitos obligatorios de F0 son una lista de identificadores, y o están
   cubiertos o no. Un gate que traza contra identificadores devuelve evidencia; uno que traza
   contra prosa devuelve impresiones.

Sin identificadores todo eso se hace leyendo y recordando, que es exactamente lo que falla a
las seis semanas.

---

## 2. Reglas generales

Aplican a todos los espacios de nombres.

1. **Un dueño por rango.** Cada rango de identificadores lo asigna un solo documento. Dos
   documentos que asignan en el mismo rango producen colisión, y la colisión se descubre
   tarde. La cabecera de cada documento declara su rango en `IDs que posee este doc`.
2. **Asignación monotónica.** El siguiente identificador es el siguiente número libre del
   registro. Nunca se busca "un hueco donde meterlo".
3. **Nunca se recicla.** Un identificador retirado queda retirado. Su número no se reasigna
   a otra cosa, nunca, aunque nada lo referencie hoy. Reciclar convierte una referencia vieja
   en una referencia silenciosamente equivocada, que es peor que una rota.
4. **El retiro se registra.** Cuando un elemento muere, se anota dónde vivía, que está
   retirado, y por qué. Una línea basta.
5. **El identificador sobrevive al renombre.** Si el archivo cambia de nombre o el elemento
   cambia de redacción, el identificador se conserva. Cambiar el identificador equivale a
   borrar el elemento y crear otro.
6. **`STATE.md` es el registro central.** Decisiones, supuestos, riesgos y change requests
   viven ahí. Un identificador de esos espacios que no está en `STATE.md` no existe.

---

## 3. Espacios de nombres

### Obligatorios

| Patrón | Qué identifica | Quién lo asigna | Dónde se registra |
|---|---|---|---|
| `F<n>-A<n>` | Artefacto de fase | El orquestador al abrir el artefacto | `STATE.md`, sección `artefactos` |
| `ADR-NNNN` | Decisión estructural | Quien la toma, al escribirla | `decisions/NNNN-<slug>.md` más `STATE.md` |
| `A<n>` | Supuesto sin validar | Quien lo declara | `STATE.md`, sección `assumptions` |
| `R<n>` | Riesgo | Quien lo identifica | `STATE.md`, sección `riesgos` |
| `CR-NNN` | Change request | Quien lo propone | `STATE.md`, sección `change_requests` |

**`F<n>-A<n>`.** `F2-A1` es el artefacto 1 de la fase F2. El número de artefacto es
independiente del número de archivo: un artefacto puede ocupar varios archivos, y el orden de
archivos puede cambiar sin tocar el identificador del artefacto. Esta separación es
deliberada; ver §5.

**`ADR-NNNN`.** Cuatro dígitos, secuencia global, nunca por fase. Un ADR tiene estado:
`proposed`, `accepted`, `superseded`, `rejected`. Un ADR superado no se borra ni se edita en
su decisión: se marca `superseded` y se apunta al que lo reemplaza. El historial de por qué
se decidió mal una vez vale más que un archivo limpio.

**`A<n>`.** Un supuesto es algo que el proyecto da por cierto y no puede demostrar todavía.
Lleva dueño y estado de validación. Cuando se valida, no se borra: se marca validado, con
qué evidencia. Un supuesto que resultó falso se marca falso y dispara un `CR-NNN`.

**`R<n>`.** Riesgo con probabilidad, impacto y mitigación asignada. Un riesgo cuya mitigación
es "tener cuidado" no está mitigado.

**`CR-NNN`.** Un change request es el único mecanismo válido para modificar algo ya aprobado.
Enumera qué cambia, qué lo motivó, qué fases toca y qué artefactos invalida. Estados:
`propuesto`, `aceptado`, `aplicado`, `superado`, `rechazado`.

### Del trabajo

| Patrón | Qué identifica | Notas |
|---|---|---|
| `WI-###` | Unidad de trabajo en ninguno | Existe solo si hay backlog externo. Si ninguno es "ninguno", las unidades se identifican `WI-NNN` dentro de `phases/F3-plan/00-backlog.md` |
| `FR-<GRUPO>-<n>` | Requisito funcional | `<GRUPO>` es un código corto del área funcional, en mayúsculas |
| `NFR-<GRUPO>-<n>` | Requisito no funcional | Mismo criterio de agrupación |
| `UC<n>` | Caso de uso | Secuencia global del proyecto |

El agrupador de requisitos es lo que hace legible la trazabilidad: `NFR-PERF-2` se ubica sin
abrir el documento. Los grupos se declaran en `phases/F0-problema/03-requisitos.md` y no se
inventan sobre la marcha.

### Opcionales, según módulos de contrato

Estos existen solo si el módulo correspondiente de F2 aplica. Ver `docs/method/phase-model.md`,
sección de módulos del contrato. Si el módulo no corre, el espacio de nombres no se crea.

| Patrón | Qué identifica | Aplica cuando |
|---|---|---|
| `S-<SUPERFICIE>-<NN>` | Superficie de interacción con un humano | Corre el módulo C-HUMANO |
| `OP-<GRUPO>-<NN>` | Operación de la interfaz de máquina | Corre el módulo C-MAQUINA |
| `E-<NOMBRE>` | Entidad del modelo de datos | Corre el módulo C-DATOS |
| `EV-<NN>` | Criterio o caso del conjunto de evaluación | Corre el módulo C-CALIDAD |

**Sobre `S-<SUPERFICIE>-<NN>`.** Es el patrón para nombrar cada punto donde un humano
interactúa con la solución. `<SUPERFICIE>` es un código corto de la audiencia o del contexto,
en mayúsculas, definido al abrir el módulo. Una superficie no es necesariamente una pantalla
gráfica: puede ser una vista de terminal, un formulario, un reporte, o la salida estructurada
de un comando. **Si la solución no tiene operador humano directo, este espacio de nombres no
se crea.** No inventes superficies para llenar el patrón.

Regla adicional para superficies: cada superficie enumera sus **estados**, y el estado se
cita como sufijo, `S-ADM-04/vacio`. Los estados no llevan numeración propia; se nombran.

---

## 4. Numeración de archivos dentro de una fase

Los documentos de fase se nombran `NN-<slug>.md`:

```
phases/F0-problema/00-contexto-y-valor.md
phases/F0-problema/01-actores.md
phases/F0-problema/02-recorridos.md
phases/F0-problema/03-requisitos.md
phases/F0-problema/04-alcance.md
```

- `NN` es un contador de dos dígitos, empieza en `00` en cada fase.
- El orden expresa dependencia de lectura, no cronología de escritura.
- `<slug>` en inglés, kebab-case, describe el contenido.

---

## 5. Deuda a prevenir: hueco en la numeración de archivos

**El problema.** En el proyecto de referencia, la carpeta de la primera fase salta de `04-` a
`06-`: no existe `05-`. Un documento se retiró y el número quedó vacío. Cualquiera que abra la
carpeta pierde tiempo preguntándose si falta un archivo, si está sin commitear, o si se
borró por error. La respuesta no está escrita en ninguna parte, así que la duda vuelve cada
vez que alguien nuevo mira la carpeta.

**La regla.** Los números de archivo y los identificadores semánticos se comportan de forma
opuesta, y confundirlos es el origen de la deuda:

| | Número de archivo `NN-` | Identificador semántico (`ADR-NNNN`, `S-<SUP>-<NN>`, `UC<n>`) |
|---|---|---|
| Qué expresa | Orden de lectura dentro de una carpeta | Identidad de un elemento |
| Se referencia desde fuera | No | Sí |
| Debe ser denso | **Sí, sin huecos** | No, los huecos son normales |
| Se puede renumerar | **Sí, libremente** | **Nunca** |
| Al retirar un elemento | Se cierra el hueco renumerando | El número queda reservado para siempre |

**Procedimiento cuando se retira un documento de fase:**

1. Renumera los archivos posteriores para cerrar el hueco. Es una operación barata: son
   nombres de archivo, no identidades.
2. Actualiza las referencias al archivo renombrado. Las referencias por identificador de
   artefacto `F<n>-A<n>` no se tocan, porque el identificador no cambió.
3. Anota el retiro en la bitácora del documento que absorbió su contenido, o en `STATE.md` si
   no lo absorbió ninguno.

**Si renumerar no es viable** porque hay referencias externas al nombre de archivo, deja un
stub en el número vacío con una sola línea que diga que el documento se retiró, cuándo, por
qué, y dónde vive su contenido ahora. Un hueco explicado cuesta una línea; un hueco mudo
cuesta una pregunta cada vez.

**El caso simétrico.** Cuando se retira un elemento con identificador semántico, se hace lo
contrario: el número se reserva, se documenta el retiro donde vivía el elemento, y no se
recicla. Ejemplo de anotación correcta:

```
S-ADM-07 retirado (decisión de gate 2026-09-20): la confirmación que vivía aquí se
absorbió en S-ADM-12. El número 07 queda reservado, no se recicla.
```

---

## 6. Checklist de higiene

Antes de cerrar cualquier gate:

- [ ] Todo identificador nuevo está registrado en `STATE.md` o en el documento que posee su
      rango.
- [ ] Ningún documento asigna identificadores en un rango que no declara poseer.
- [ ] Ningún identificador retirado fue reasignado.
- [ ] Los números de archivo `NN-` de cada carpeta de fase son densos, sin huecos, o el hueco
      tiene su stub.
- [ ] Toda referencia cruzada apunta a un identificador que existe.
- [ ] Los espacios de nombres opcionales que se crearon corresponden a módulos de contrato
      que efectivamente corrieron.
- [ ] Ningún ADR quedó en estado `proposed` con su gate ya aprobado.
