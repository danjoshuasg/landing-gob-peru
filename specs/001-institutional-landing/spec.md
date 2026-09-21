# Feature Specification: Landing institucional editorial

**Feature Branch**: `001-institutional-landing`

**Created**: 2026-09-20

**Status**: Approved

**Input**: User description: "Recrear el formato visual de answerr.ai para Gob Perú, con una nueva carpeta, un plan de implementación, énfasis en imágenes ya provistas y Casa de Pizarro como ilustración arquitectónica del footer."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comprender la propuesta institucional (Priority: P1)

Como visitante, quiero entender en la primera pantalla el propósito editorial de la iniciativa para decidir si continúo explorando.

**Why this priority**: La landing no entrega valor si su propósito y jerarquía no se comprenden de inmediato.

**Independent Test**: Abrir la página en escritorio y móvil y verificar que marca, titular, explicación y acción principal sean visibles, legibles y mantengan un orden de lectura inequívoco.

**Acceptance Scenarios**:

1. **Given** una visita inicial en escritorio, **When** carga la página, **Then** el visitante ve marca, propuesta principal, explicación breve y CTA interno sin desplazarse más de una pantalla.
2. **Given** una visita desde 360 px de ancho, **When** carga la página, **Then** el contenido no desborda horizontalmente y conserva la jerarquía titular → explicación → CTA → imagen.
3. **Given** que todavía no existe un destino institucional confirmado, **When** el visitante usa un CTA, **Then** navega a una sección válida de la misma página y nunca a un correo o dominio ficticio.

---

### User Story 2 - Explorar capacidades y principios (Priority: P2)

Como visitante, quiero recorrer una narrativa clara sobre visión, método, capacidades y principios para comprender la propuesta completa sin enfrentar bloques densos.

**Why this priority**: La referencia se sostiene por su narrativa progresiva, no solo por su hero.

**Independent Test**: Recorrer por teclado y desplazamiento las secciones y confirmar que cada bloque tiene propósito, título, contenido y relación visual reconocibles.

**Acceptance Scenarios**:

1. **Given** la navegación principal, **When** se activa cualquiera de sus enlaces, **Then** la página desplaza el foco visual a una sección existente.
2. **Given** un usuario de teclado, **When** recorre enlaces y controles, **Then** todos muestran foco visible y el menú móvil puede abrirse y cerrarse.
3. **Given** una preferencia de movimiento reducido, **When** se visita la página, **Then** el contenido aparece sin transiciones de desplazamiento o revelado significativas.

---

### User Story 3 - Reconocer una identidad visual coherente (Priority: P3)

Como visitante, quiero ver las imágenes proporcionadas integradas en una misma familia editorial para percibir una identidad institucional propia y consistente.

**Why this priority**: Las imágenes son la prioridad declarada por el cliente y diferencian la experiencia de una plantilla genérica.

**Independent Test**: Verificar que las tres imágenes locales aparezcan en sus secciones previstas, con recortes útiles, formatos optimizados y textos alternativos.

**Acceptance Scenarios**:

1. **Given** un navegador compatible con AVIF, **When** carga una imagen, **Then** recibe una variante AVIF responsive y no el maestro JPEG de varios megabytes.
2. **Given** un navegador sin AVIF pero con WebP, **When** carga una imagen, **Then** recibe la variante WebP correspondiente.
3. **Given** la llegada al footer, **When** se muestra la Casa de Pizarro, **Then** la ilustración mantiene reconocimiento arquitectónico y funciona como cierre panorámico sin ocultar navegación.

### Edge Cases

- Si JavaScript tarda o falla, la estructura principal y las imágenes siguen siendo visibles mediante HTML semántico y CSS.
- Si una fuente local no carga, las fuentes fallback conservan legibilidad y jerarquía.
- Si una imagen moderna no es compatible, el navegador usa el JPEG maestro local como fallback.
- En textos ampliados al 200 %, no aparecen solapamientos ni controles inaccesibles.
- Con viewport entre 360 y 390 px, ninguna tarjeta o CTA produce desplazamiento horizontal.
- El menú móvil bloquea el fondo mientras está abierto y recupera el estado normal al cerrarse.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página MUST presentar una navegación con marca, enlaces internos y un CTA válido.
- **FR-002**: La página MUST incluir hero, contexto, método, bloque institucional, capacidades, visión territorial, principios, CTA final y footer.
- **FR-003**: Todos los enlaces de navegación MUST apuntar a identificadores existentes dentro de la página mientras no se proporcionen destinos oficiales.
- **FR-004**: El menú móvil MUST exponer su estado con `aria-expanded`, cerrar al elegir un enlace y ser operable por teclado.
- **FR-005**: La experiencia MUST respetar `prefers-reduced-motion`.
- **FR-006**: La implementación MUST usar Source Serif 4 en títulos y Geist Sans en cuerpo e interfaz, servidas localmente.
- **FR-007**: La implementación MUST integrar `metric.jpeg`, `box-right.jpeg` y `panoramic-footer.jpeg` mediante variantes AVIF/WebP responsive y fallback local.
- **FR-008**: Cada imagen informativa MUST tener texto alternativo y dimensiones explícitas.
- **FR-009**: La Casa de Pizarro MUST cerrar visualmente el footer en escritorio y móvil sin superponer la navegación sobre detalles densos.
- **FR-010**: Tarjetas, métricas, etiquetas y diagramas MUST construirse como HTML o SVG accesible, no como texto rasterizado.
- **FR-011**: La página MUST evitar datos, cifras, nombres de programas, direcciones o contactos oficiales no suministrados.
- **FR-012**: El proyecto MUST producir un build de producción sin errores de TypeScript.
- **FR-013**: La página MUST evitar desplazamiento horizontal a partir de 360 px de ancho.
- **FR-014**: Los controles interactivos MUST mostrar un indicador de foco visible.
- **FR-015**: El contenido editorial provisional MUST presentarse como concepto y no como anuncio oficial verificable.

### Key Entities *(include if feature involves data)*

- **Section**: Bloque narrativo con identificador, título, contenido y destino de navegación opcional.
- **Navigation item**: Etiqueta y ancla interna que conecta navegación con una sección existente.
- **Image asset**: Maestro local, derivados optimizados, tamaños, texto alternativo y rol editorial.
- **Principle**: Título y explicación corta de una regla institucional presentada en la página.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los enlaces internos resuelve a una sección existente y no usa dominios ni correos ficticios.
- **SC-002**: La página compila en modo producción con cero errores de TypeScript.
- **SC-003**: No existe desbordamiento horizontal en 360, 390, 768, 1024 y 1440 px.
- **SC-004**: Las tres imágenes provistas se muestran y cada una dispone de AVIF, WebP y fallback local.
- **SC-005**: Todos los controles interactivos son alcanzables por teclado y muestran foco visible.
- **SC-006**: La auditoría final alcanza al menos 95 en accesibilidad, SEO y buenas prácticas. Una categoría no medible se considera pendiente y bloquea el cierre.
- **SC-007**: La carga inicial no solicita ninguna imagen o fuente desde un dominio externo.
- **SC-008**: Una revisión visual independiente no identifica placeholders, recursos rotos ni inconsistencias graves de jerarquía tipográfica.

## Assumptions

- La entrega es una landing estática sin backend, CMS, analítica ni autenticación.
- Las tres imágenes disponibles están aprobadas por el cliente para esta implementación.
- Los textos actuales son una propuesta editorial y podrán reemplazarse cuando exista contenido institucional definitivo.
- Los CTA permanecen como navegación interna hasta recibir destinos oficiales.
- La publicación, el dominio, logos oficiales y datos de contacto quedan fuera de esta entrega.
