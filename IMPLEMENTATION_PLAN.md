# Plan de implementación — Landing Gob Perú

## 1. Objetivo

Crear una landing institucional inspirada en la composición editorial de `answerr.ai`: ritmo vertical amplio, títulos serif, interfaz sobria y grandes ilustraciones monocromáticas.

Las imágenes finales ya existen en la carpeta del proyecto. La implementación debe integrarlas, recortarlas y optimizarlas; no requiere una fase de generación visual.

## 2. Dirección visual confirmada

### Concepto

**Institucional, arquitectónico y contemporáneo.**

- Fondo marfil cálido.
- Texto carbón de alto contraste.
- Tinta vino o burdeos como color distintivo.
- Ilustración arquitectónica tipo sketch.
- Línea fina, tramado y sombreado tipo grabado.
- Tarjetas blancas superpuestas sobre escenas ilustradas.
- Bordes finos y espacios amplios.
- Movimiento sutil, sin convertir la página en una experiencia ornamental.

### Paleta inicial

| Token | Uso | Valor inicial |
|---|---|---|
| `--paper` | Fondo principal | `#FCF7EF` |
| `--surface` | Tarjetas | `#FFFFFF` |
| `--ink` | Texto principal | `#25211F` |
| `--muted` | Texto secundario | `#6E6863` |
| `--wine` | Acentos e ilustraciones | `#551027` |
| `--wine-soft` | Fondos secundarios | `#EBD8DA` |
| `--rule` | Líneas divisorias | `#D8D0C7` |

El color final deberá ajustarse contra las imágenes optimizadas para evitar diferencias visibles entre la tinta de las ilustraciones y la interfaz.

## 3. Sistema tipográfico

### Revisión de la referencia

La landing de referencia combina:

- **Source Serif 4** para titulares editoriales.
- **Geist Sans** para navegación, párrafos, botones, etiquetas y datos de interfaz.

Esta combinación funciona para Gob Perú porque equilibra autoridad institucional y claridad digital. Las dos familias tienen variantes variables y soporte completo para español.

### Decisión

Usar:

```css
--font-display: "Source Serif 4", Georgia, serif;
--font-sans: "Geist Sans", Arial, sans-serif;
```

Las fuentes se alojarán localmente en formato WOFF2. No dependerán de Google Fonts ni de servicios externos.

### Escala tipográfica

| Elemento | Escritorio | Móvil | Peso | Interlineado |
|---|---:|---:|---:|---:|
| Hero `h1` | `clamp(56px, 5.4vw, 78px)` | mínimo 42 px | 550–600 | 0.98–1.04 |
| Título de sección `h2` | `clamp(36px, 3.2vw, 48px)` | mínimo 32 px | 550–600 | 1.08–1.16 |
| Título de tarjeta `h3` | 24–30 px | 22–26 px | 500–600 | 1.15–1.25 |
| Introducción | 20–22 px | 18–20 px | 400 | 1.45–1.55 |
| Cuerpo | 16–18 px | 16 px | 400 | 1.55–1.7 |
| Navegación | 13–14 px | 14–16 px | 500–600 | 1.2 |
| Eyebrow o kicker | 11–12 px | 11–12 px | 600 | 1.2 |
| Botón | 12–13 px | 13–14 px | 600 | 1 |
| Métrica | 36–48 px | 32–40 px | 500 | 1 |

### Reglas tipográficas

- Titulares en Source Serif 4 con `letter-spacing` entre `-0.02em` y `-0.035em`.
- No usar serif en párrafos largos, formularios o navegación.
- Eyebrows en mayúsculas, con `letter-spacing: 0.1em`; nunca usar mayúsculas para párrafos.
- Limitar titulares principales a 12–14 palabras.
- Limitar párrafos a aproximadamente 60–70 caracteres por línea.
- Usar números tabulares de Geist Sans en métricas y tablas.
- Mantener los pesos entre 400 y 600; evitar titulares excesivamente negros.
- Conservar tildes, signos de apertura y nombres oficiales en todas las variantes.
- No convertir texto importante en imágenes.

## 4. Inventario de imágenes existente

### `panoramic-footer.jpeg`

- Resolución: 3652 × 1152 px.
- Contenido: composición panorámica de la Casa de Pizarro.
- Uso: cierre visual y fondo inferior del footer.
- Tratamiento: conservar la fachada completa en escritorio y preparar un recorte central específico para móvil.
- El CTA y la navegación deben aparecer antes de la ilustración, no encima de sus detalles principales.

### `box-right.jpeg`

- Resolución: 2390 × 1792 px.
- Contenido: escena de exposición, mediación y participación institucional.
- Uso: bloque editorial de dos columnas, con texto a la izquierda e imagen a la derecha.
- Tratamiento: priorizar el grupo central y reducir la presencia de los elementos cortados en primer plano cuando se use en móvil.

### `metric.jpeg`

- Resolución: 2390 × 1792 px.
- Contenido: vista urbana e infraestructura institucional.
- Uso: fondo de una sección de impacto, cobertura o métricas.
- Tratamiento: tarjeta blanca superpuesta con cifras; la tarjeta debe construirse en HTML y no incrustarse en la imagen.

## 5. Preparación técnica de imágenes

Las imágenes no se regenerarán. El trabajo pendiente es exclusivamente de producción web:

1. Mover los maestros a `public/images/source/`.
2. Conservar los JPEG originales sin modificaciones.
3. Crear derivados AVIF y WebP en `public/images/optimized/`.
4. Generar tamaños de 640, 960, 1440, 1920 y 2560 px cuando corresponda.
5. Crear recortes móviles aprobados para cada composición.
6. Usar `picture`, `srcset` y `sizes` en el frontend.
7. Definir `width`, `height` y `aspect-ratio` para prevenir saltos de layout.
8. Cargar con prioridad solo la imagen que aparezca en la primera pantalla.
9. Aplicar carga diferida a las demás.
10. Registrar cada derivado en `image-ledger.md`.

### Metas de peso

- Imagen inicial: máximo 350 KB en escritorio y 220 KB en móvil.
- Imágenes secundarias: máximo 280 KB por variante.
- Footer panorámico: máximo 320 KB en escritorio y 180 KB en móvil.
- Ninguna imagen debe cargarse desde un dominio externo.

## 6. Arquitectura visual propuesta

1. **Navegación mínima**
   - Marca.
   - Enlaces principales.
   - CTA de alto contraste.

2. **Hero editorial**
   - Titular Source Serif 4.
   - Introducción breve en Geist Sans.
   - Uno o dos CTA.
   - Composición visual que preserve una primera pantalla limpia.

3. **Problema o contexto**
   - Título editorial y texto corto.
   - Comparación, cifras o tarjetas sobrias.

4. **Sección institucional**
   - Diseño de dos columnas.
   - `box-right.jpeg` ocupando la columna visual.

5. **Impacto o métricas**
   - `metric.jpeg` como escenario.
   - Tarjeta HTML superpuesta con datos verificables.

6. **Bloques de servicio o propuesta**
   - Retícula de tres columnas.
   - Iconografía lineal en el mismo color vino.

7. **CTA final**
   - Titular corto y acción principal.
   - Mucho espacio en blanco antes del footer.

8. **Footer**
   - Navegación y datos institucionales en la zona superior.
   - `panoramic-footer.jpeg` como cierre panorámico.

## 7. Comportamiento responsive

### Escritorio

- Contenedor máximo de 1240–1320 px.
- Retícula de 12 columnas.
- Secciones con 120–180 px de separación vertical.
- Ilustraciones a sangre solo cuando aporten escala.

### Móvil

- Márgenes laterales de 20–24 px.
- Secciones con 72–96 px de separación.
- Orden de lectura: título, explicación, CTA e imagen.
- Evitar texto superpuesto sobre zonas densas de las ilustraciones.
- Usar recortes propios en lugar de reducir imágenes panorámicas completas.

## 8. Orden de implementación

### Etapa 1 — Fundaciones

- Confirmar objetivo, contenido, navegación y CTA.
- Crear el proyecto React con TypeScript.
- Instalar localmente Source Serif 4 y Geist Sans.
- Definir tokens de color, tipografía, espaciado y bordes.

### Etapa 2 — Preparación de recursos

- Organizar los tres maestros existentes.
- Generar derivados AVIF/WebP y recortes responsive.
- Verificar contraste entre tinta, fondo e interfaz.

### Etapa 3 — Construcción

- Implementar navegación, hero y estructura completa.
- Integrar las tres imágenes en los bloques definidos.
- Añadir tarjetas, métricas e iconografía como HTML/SVG.
- Incorporar movimiento sutil respetando `prefers-reduced-motion`.

### Etapa 4 — Verificación

- Revisar la composición en 1440, 1024, 768, 390 y 360 px.
- Verificar legibilidad tipográfica en español.
- Validar recortes de imágenes y ausencia de saltos de layout.
- Auditar teclado, foco, contraste, textos alternativos, SEO y rendimiento.

## 9. Criterios de aceptación

- Se utilizan los tres archivos existentes; no quedan imágenes provisionales.
- La tinta vino de la interfaz armoniza con las ilustraciones.
- Source Serif 4 se limita a títulos y momentos editoriales.
- Geist Sans mantiene legibles navegación, cuerpo, botones y datos.
- La Casa de Pizarro conserva protagonismo y reconocimiento en el footer.
- Las tarjetas superpuestas son HTML accesible, no texto rasterizado.
- Cada imagen tiene variantes responsive, dimensiones explícitas y texto alternativo.
- No hay recursos cargados desde terceros.
- Lighthouse objetivo: accesibilidad ≥ 95, SEO ≥ 95 y buenas prácticas ≥ 95.

## 10. Información pendiente

- Objetivo exacto de la landing.
- Texto final y secciones requeridas.
- Acción principal del visitante.
- Marca, logotipo y azul o color institucional obligatorio, si existe.
- Datos de contacto y enlaces oficiales.
- Dominio y destino de publicación.
