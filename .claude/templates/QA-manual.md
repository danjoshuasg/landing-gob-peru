# Pruebas manuales, {{TICKET_ID}} ({{FEATURE_NAME}})

Guía para verificar a mano lo que entrega este ticket, contra el sistema REAL
(no mocks, no fixtures de test unitario). Fase {{PHASE_ID}}.

**Alcance.** Qué cubre esta guía y qué NO. Sé explícito con lo excluido: lo que
no está listado aquí, nadie lo probó.

- Cubre: …
- NO cubre: … (y a qué ticket pertenece cada exclusión)

---

## 0. Levantar el entorno

Los comandos exactos, en orden, copiables. Quien siga esta guía no debe tener que
adivinar ni leer otro documento.

```bash
# 1. Dependencias de infraestructura local (almacenes, colas, servicios de apoyo)
<comando>

# 2. El sistema bajo prueba
<comando>
```

**Verificación de que arrancó** — un comando con salida esperada explícita, para
no confundir "no arrancó" con "arrancó y está roto":

```bash
<comando de health-check>   # esperado: <salida exacta>
```

**Configuración local requerida.** Qué variables deben estar puestas y con qué
forma de valor. Nombres y forma, nunca valores reales — los valores salen de
`.env.example`, que dice de dónde sacar cada uno.

```
VAR_A=<forma del valor>
VAR_B=<forma del valor>
```

> Si cambias la configuración, reinicia el proceso: la mayoría de runtimes lee
> el entorno solo al arrancar.

---

## 1. Datos sembrados

Todo lo que la guía asume que existe: cuentas, credenciales, identificadores,
archivos de entrada, fixtures. Sin esta tabla la guía no es reproducible.

| Qué | Valor | Para qué caso |
|---|---|---|
| … | … | … |

> **Volatilidad.** Di explícitamente qué se rompe si se resetea el almacén:
> qué identificadores cambian y cómo se vuelve a sembrar el estado.

---

## 2. Superficies bajo prueba

El inventario de puntos de entrada que toca este ticket, con quién puede usarlos.
Adapta la primera columna a la forma real del sistema:

- Interfaz gráfica → ruta o pantalla
- CLI → comando y subcomando
- API / servicio → método + endpoint
- Pipeline de datos → job, etapa o disparador
- Librería → función o entrada pública exportada

| Superficie | Audiencia / rol | Control de acceso |
|---|---|---|
| … | … | … |

---

## 3. Casos por audiencia e interfaz

Marca cada caso. Un caso = una acción concreta + un resultado esperado
**observable**. "Funciona bien" no es un resultado esperado; "devuelve código 2 y
escribe `<mensaje>` en stderr" sí lo es.

Agrupa por audiencia (quién ejecuta) y, dentro de cada una, por superficie. Si el
sistema no tiene múltiples audiencias, agrupa por superficie sola.

En cada caso, verifica los **estados completos** donde apliquen, no solo el
happy-path: vacío, cargando/en progreso, error, éxito. La mayoría de los defectos
reales viven en los otros tres.

### 3.A `<audiencia 1>` — `<superficie>`

- [ ] **A1. `<acción con entradas exactas>`.**
  Esperado: `<salida, estado o efecto observable, con valores concretos>`.
- [ ] **A2. `<entrada inválida>`.**
  Esperado: error legible para esa audiencia, sin filtrar detalle interno
  (stack trace, SQL, ruta de archivo, nombre de tabla). El sistema queda en
  estado usable, no a medias.
- [ ] **A3. `<caso límite: vacío, límite superior, concurrencia, reintento>`.**
  Esperado: `<…>`.

### 3.B `<audiencia 2>` — `<superficie>`

- [ ] **B1. …**

### 3.C Seguridad y control de acceso

Verificable desde fuera, sin leer el código.

- [ ] **C1. Acceso cruzado.** Autenticado como `<rol A>`, intenta ejecutar
  `<superficie de rol B>`.
  Esperado: denegado. No basta con que esté oculto en la interfaz — la
  denegación debe ocurrir del lado del servidor / del proceso.
- [ ] **C2. Sin credenciales.** Ejecuta `<superficie protegida>` sin sesión ni
  token, en un contexto limpio.
  Esperado: rechazo, no comportamiento degradado.
- [ ] **C3. Fin de sesión / revocación.** Cierra sesión o revoca la credencial y
  reintenta.
  Esperado: el acceso previo deja de funcionar de inmediato.
- [ ] **C4. Secretos fuera de canales observables.** Revisa URL, argumentos de
  línea de comandos, logs, mensajes de error y respuestas.
  Esperado: ninguna credencial, token ni dato sensible aparece ahí.

### 3.D Accesibilidad y ergonomía

Reformula esta sección según la forma del sistema. Ejemplos por tipo:

- **Interfaz gráfica** — operable solo con teclado, foco visible, contraste
  legible, tamaño de objetivo suficiente, funciona en ambos temas si hay dos.
- **CLI** — `--help` es suficiente para usarlo sin leer docs; los códigos de
  salida distinguen fallo de usuario de fallo del sistema; la salida es
  parseable cuando se redirige (sin color ni barras de progreso en tubería).
- **API** — los errores traen código estable y mensaje accionable; los contratos
  publicados coinciden con la respuesta real.
- **Pipeline** — un fallo a mitad deja rastro suficiente para diagnosticar y
  reanudar; reejecutar la misma entrada no duplica efectos.

- [ ] **D1. …**
- [ ] **D2. …**

---

## 4. Notas conocidas (no son bugs)

Comportamientos raros que ya conocemos y decidimos aceptar. Sin esta sección,
quien prueba reporta como defecto algo que era una decisión — y ese ruido cuesta
más que escribir la nota.

Cada nota lleva: qué se observa, por qué es así, y dónde se resuelve (ticket,
fase, o "no se resuelve").

- `<observación>`. Motivo: `<decisión>`. Se cierra en: `<ticket / fase / nunca>`.
- `<observación>`. Motivo: `<limitación conocida de una dependencia>`. Se cierra
  en: `<…>`.
