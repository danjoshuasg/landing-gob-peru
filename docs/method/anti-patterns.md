# Anti-patrones de andamiaje

Deudas estructurales observadas en un proyecto real que corrió este mismo proceso
por fases. Ninguna rompió el producto; todas degradaron la capacidad del equipo
(humano y agentes) de saber en qué estado estaba el proyecto.

Se documentan porque son **baratas de evitar al inicio y caras de arreglar
después**. Léelas al scaffoldear, no cuando ya te pasaron.

---

## 1. El sistema de specs queda a medias: se proponen cambios, nunca se sincronizan

**Síntoma.** El directorio de cambios propuestos acumula 20+ unidades, varias ya
implementadas y mergeadas a la rama principal. Pero el directorio de
especificaciones consolidadas está **vacío**, y el de archivo también. Nunca se
corrió el paso de sync ni el de archive.

**Costo.** No existe ningún lugar que diga cómo se comporta el sistema *hoy*.
Para responder "¿qué hace X actualmente?" hay que leer todas las propuestas y
reconstruir mentalmente cuáles se implementaron y cuáles no. La propuesta
describe una intención pasada, no el estado presente, y con el tiempo miente cada
vez más. Peor: no hay forma de distinguir una propuesta pendiente de una ya
implementada sin cruzar contra el log de git.

**Cómo evitarlo.**
- El ciclo completo es `proponer → implementar → sincronizar → archivar`. Un
  cambio implementado pero no sincronizado es trabajo **no terminado**.
- La definición de done del ticket incluye el archive. No es limpieza opcional
  para después.
- Regla de gate: no se aprueba una fase si el directorio de cambios contiene
  unidades ya mergeadas. Es una condición verificable en un comando, no una
  opinión.
- Chequeo periódico: comparar los cambios abiertos contra el log de merges. Si
  aparecen en el log y siguen abiertos, hay backlog de archive.

---

## 2. Un documento de decisión fuera de su directorio

**Síntoma.** Doce ADRs numerados en `decisions/`, y uno solo — el trece —
viviendo dentro de otro subsistema, en `<otro-dir>/decisions/`. Numeración
correlativa correcta, ubicación incorrecta.

**Costo.** Quien lista `decisions/` ve un hueco en la numeración y asume que la
decisión no se tomó, o que se borró. Las búsquedas por directorio no lo
encuentran. Cualquier índice, script o agente que recorra `decisions/` lo omite
en silencio — que es el peor modo de fallo: no hay error, solo ausencia.

**Cómo evitarlo.**
- **Un** directorio canónico de decisiones para todo el repo. Sin excepciones por
  subsistema, aunque la herramienta que generó el ADR sugiera otra ruta.
- Si una herramienta escribe ADRs en su propia carpeta, muévelo en el mismo
  commit. No lo dejes "por ahora".
- Chequeo barato: verificar que la numeración de `decisions/` no tenga huecos.
  Un hueco es un ADR extraviado o uno que nunca se escribió; ambos casos
  requieren acción.

---

## 3. Hueco en la numeración de los documentos de fase

**Síntoma.** Una fase con documentos `00-`, `01-`, `02-`, `03-`, `04-`, `06-`.
El `05-` no existe. Nadie recuerda si se planificó y se descartó, si se fusionó
con otro, o si simplemente se saltó el número al crear el siguiente.

**Costo.** El hueco es ambiguo por diseño y esa ambigüedad no caduca: en cada
revisión posterior alguien pregunta por el 05. Peor cuando el prefijo numérico se
usa como identificador (`F0-A5`) en otros documentos: aparecen referencias a un
artefacto que no existe, y no se sabe si es un error de escritura o un documento
perdido.

**Cómo evitarlo.**
- Los números son **posiciones ocupadas**, no etiquetas decorativas. Si un
  documento se descarta, deja el archivo con una línea: `Descartado el 2026-09-20.
  Motivo: … . Sustituido por: …`.
- No renumeres para tapar el hueco: romperías todas las referencias cruzadas
  existentes.
- Chequeo barato: verificar que cada directorio de fase tenga prefijos
  consecutivos desde `00-`.

---

## 4. Reglas de permisos acumuladas una a una, con comandos literales

**Síntoma.** El archivo de configuración local del agente acumula reglas de
permiso de a una, cada vez que aparece un prompt de aprobación. Con los meses son
decenas, y muchas son el comando literal completo que se ejecutó ese día, con sus
argumentos exactos. Basta con que uno solo de esos comandos haya llevado un token
o una clave en la línea para que el secreto quede persistido en texto plano.

Es un patrón fácil de alcanzar sin darse cuenta: cada regla individual parece
inofensiva en el momento en que se aprueba.

**Costo.** Dos costos distintos y ambos serios.

*Seguridad:* un secreto pegado en un comando queda escrito en el archivo de
configuración, en el historial de shell, en el transcript de la sesión y
probablemente en algún backup. Deja de ser un secreto en el momento en que se
pega, aunque el archivo esté gitignored. Y como está gitignored, ningún escáner
de secretos del repo lo va a detectar: la misma propiedad que lo mantiene fuera
del control de versiones lo mantiene fuera de la auditoría.

*Mantenibilidad:* decenas de reglas literales no describen ninguna política.
Nadie puede leerlas y decir qué está permitido; solo se puede consultar si una
invocación exacta ya fue aprobada antes. La lista crece de forma monótona y nunca
se poda, porque nadie sabe cuáles siguen siendo necesarias.

**Cómo evitarlo.**
- **Nunca pegues un comando que contenga un secreto.** Ni para probar, ni "solo
  esta vez". El valor queda persistido en varios sitios a la vez, fuera de tu
  control. Pon el secreto en `.env`, referencialo por nombre de variable, y pega
  el comando que lee la variable.
- Escribe reglas por **forma**, no por invocación: patrones sobre el comando
  base, no la línea completa con argumentos.
- Poda la lista al cerrar cada fase. Si la lista solo crece, no es política, es
  sedimento.
- Trata el archivo de configuración local como si fuera a filtrarse. Auditalo con
  esa hipótesis: si se filtra hoy, ¿qué pierdo?
- Si un secreto ya quedó escrito: **rótalo**. Borrarlo del archivo no lo
  desfiltra.

---

## 5. El estado actual degenera en log histórico

**Síntoma.** El documento de estado del proyecto pesa 64 KB en 125 líneas: líneas
individuales de miles de caracteres. La causa es un campo narrativo libre (`nota:`)
en cada artefacto, donde se fue **acumulando** la historia de cada revisión en vez
de reemplazar el estado. También `gates_aprobados` y `gate_pendiente` acumulan
paréntesis, fechas y matices hasta volverse ilegibles.

**Costo.** El documento se llama "estado actual" pero es un log. Para saber en
qué versión está un artefacto hay que leer un párrafo y descartar cinco versiones
anteriores. Nadie lo lee entero, así que deja de ser fuente de verdad justo
cuando más se necesita: al retomar el proyecto después de un tiempo, o al abrir
una sesión nueva de agente. Y sí existe ya un log histórico aparte — el runlog —
así que la información está duplicada en dos sitios que pueden divergir.

**Cómo evitarlo.**
- Separación estricta: **estado = presente, se sobrescribe**. **Log = pasado, se
  agrega**. Cada hecho vive en uno de los dos, nunca en ambos.
- Los campos de estado son estructurados y acotados: identificador, versión,
  estado, fecha. Sin campos narrativos libres.
- Si un artefacto necesita explicación, el campo apunta a dónde está
  (`ver runlog 2026-09-20`), no la reproduce.
- Límite duro verificable: si el documento de estado supera ~200 líneas o
  cualquier línea supera ~200 caracteres, degeneró. Es un chequeo mecánico, no un
  juicio de estilo.
- Al actualizar el estado, la pregunta correcta es "¿esto sigue siendo cierto?",
  no "¿qué le agrego?".

---

## Chequeos de higiene al cerrar cada fase

Cinco verificaciones, todas mecánicas, ninguna opinable. Cada una viene con su
comando: un chequeo sin comando es una intención, y eso es justo la deuda que
este documento denuncia.

**1. No hay cambios de spec implementados y sin archivar.**

```bash
# Changes con todas sus tareas marcadas que siguen fuera de archive/
for d in openspec/changes/*/; do
  [ "$(basename "$d")" = archive ] && continue
  [ -f "$d/tasks.md" ] || continue
  grep -q '^\s*[-*] \[ \]' "$d/tasks.md" || echo "sin archivar: $d"
done
# Y la alarma mayor: specs vigentes vacio habiendo changes ya escritos.
# Ojo: `ls dir | head -1` NO sirve como test, porque ls sale 0 en un directorio
# vacio y el || nunca corre. Hay que preguntar por el CONTENIDO.
if [ -z "$(ls -A openspec/specs 2>/dev/null)" ] && [ -n "$(ls -A openspec/changes 2>/dev/null)" ]; then
  echo "ALARMA: specs/ vacio con changes existentes. Nunca se corrio sync."
fi
```

**2. La numeración de `decisions/` no tiene huecos, no repite y nada queda fuera.**

```bash
# Huecos y duplicados en la secuencia
ls decisions/ | grep -oE '^[0-9]{4}' | sort | awk '
  NR==1 { prev=$1+0; if (prev!=1) print "no arranca en 0001"; next }
  { n=$1+0
    if (n==prev)      print "DUPLICADO: " $1
    else if (n>prev+1) for (i=prev+1;i<n;i++) printf "hueco: %04d\n", i
    prev=n }'
# ADRs extraviados fuera del directorio canonico
find . -path ./decisions -prune -o -name '[0-9][0-9][0-9][0-9]-*.md' -print
```

**3. La numeración de documentos de cada fase no tiene huecos sin justificar.**

```bash
for d in phases/*/; do
  ls "$d" 2>/dev/null | grep -oE '^[0-9]{2}' | sort | awk -v f="$d" '
    NR==1 { prev=$1+0; next }
    { n=$1+0; if (n>prev+1) for (i=prev+1;i<n;i++) printf "%s hueco: %02d\n", f, i; prev=n }'
done
```

**4. La lista de permisos del agente está podada y sin credenciales.**

```bash
# Cuantas reglas hay (si crece y nunca baja, es sedimento, no politica)
python3 -c "import json;d=json.load(open('.claude/settings.local.json'));print(len(d.get('permissions',{}).get('allow',[])),'reglas')" 2>/dev/null
# Cualquier cosa con forma de credencial
grep -nE '(sk-|pk-|ghp_|xox[baprs]-|Bearer |[A-Za-z0-9_-]{32,})' .claude/settings*.json 2>/dev/null \
  && echo "REVISAR: posible credencial en texto plano. Si es real, ROTALA."
```

**5. El estado sigue siendo un estado y no un log.**

```bash
wc -l STATE.md            # si crece monotonamente fase tras fase, ya es un log
# El campo narrativo del gate no deberia acumular historia
awk '/^gate_pendiente:/{print length($0), "caracteres en gate_pendiente"}' STATE.md
```

El umbral del punto 5 no es un número universal: lo que importa es la **derivada**.
Un `STATE.md` que solo crece nunca se está podando, y un archivo que nadie poda es
un archivo que en algún momento nadie lee.
