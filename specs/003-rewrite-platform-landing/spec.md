# Feature Specification: Contenido de la landing para la plataforma ciudadana del organigrama del Estado

**Feature Branch**: `003-rewrite-platform-landing`

**Created**: 2026-09-24

**Status**: Draft

**Input**: User description: "La landing era una maqueta con datos de ejemplo; ahora el proyecto es real. Reescribir el contenido de toda la landing para que presente la plataforma que centraliza y mantiene actualizado el organigrama del Estado peruano y su cartera de funcionarios públicos, con documentos públicos y enlaces a noticias, para ciudadanos y periodistas."

## Clarifications

### Session 2026-09-24

- Q: ¿Para quién es la plataforma? → A: Ciudadanos y periodistas.
- Q: ¿Qué alcance tiene la primera versión? → A: Los tres poderes del Estado: Ejecutivo hasta las direcciones de línea (organismos adscritos, solo alta dirección); Legislativo: mesas directivas, parlamentarios, presidentes de comisión y alta dirección administrativa; Judicial: Presidencia, jueces supremos, presidentes de cortes superiores y gerencia general. Los organismos constitucionales autónomos quedan fuera.
- Q: ¿Cómo se actualiza? → A: Corte semanal los lunes con lo validado hasta el viernes; un backoffice con validación humana confirma cada cambio.
- Q: ¿Qué pasa con la sección "Plataforma" (spec 002)? → A: Se conserva tal cual; esta feature no la modifica.
- Q: ¿Cómo se llama la plataforma? → A: Organigrama Abierto (reemplaza "Gob Perú", que se parecía al portal oficial del Estado).
- Q: ¿Cuál es la acción principal y su destino? → A: "Conoce la plataforma", que lleva a la sección de las cinco propuestas de valor (#plataforma).
- Q: ¿Dónde van el alcance por poder, el corte semanal y la validación humana? → A: En la sección "Cómo funciona", como parte del ciclo de la plataforma.
- Q: ¿Qué se hace con las secciones actuales? → A: Reescribir y reordenar: se conserva la estructura visual, cada sección cambia de propósito (problema, cómo funciona, para quién, Plataforma, principios, cierre) y se fusionan o eliminan las que sobren.
- Q: ¿Qué se comunica sobre el lanzamiento? → A: "En construcción", sin fecha ni promesas de lanzamiento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender en la primera pantalla qué es la plataforma (Priority: P1)

Como ciudadano o periodista que llega a la página, quiero entender en la primera pantalla qué es la plataforma, para quién es y qué puedo hacer después, para decidir si sigo leyendo.

**Why this priority**: Hoy la primera pantalla habla de "capacidad pública" en general; sin este cambio el visitante no sabe que la página presenta una plataforma del organigrama del Estado.

**Independent Test**: Abrir la página en escritorio y a 360 px y verificar que marca, titular, explicación breve y acción principal describen la plataforma, sin desplazarse más de una pantalla.

**Acceptance Scenarios**:

1. **Given** una visita inicial, **When** carga la página, **Then** el titular y la explicación dicen qué es la plataforma (quién ocupa cada cargo del Estado, con su fuente) y para quién es.
2. **Given** la primera pantalla, **When** el visitante busca la acción principal, **Then** encuentra una sola acción principal, válida, cuyo destino está definido en esta spec.
3. **Given** cualquier texto de la primera pantalla, **When** se lee, **Then** presenta la plataforma como iniciativa en construcción y no como servicio oficial ni operativo.

---

### User Story 2 - Recorrer una narrativa coherente con la plataforma (Priority: P2)

Como visitante, quiero que cada sección de la página cuente una parte de la misma historia (el problema, cómo funciona, para quién es, qué cubre y con qué principios) para comprender la propuesta completa.

**Why this priority**: Las secciones actuales conservan textos de la maqueta que contradicen o diluyen la propuesta real.

**Independent Test**: Recorrer la página completa y verificar que ninguna sección conserva textos de la maqueta y que cada una tiene un propósito identificable dentro de la narrativa.

**Acceptance Scenarios**:

1. **Given** la página completa, **When** se recorre, **Then** ninguna sección conserva textos de la maqueta sobre "capacidad pública" genérica.
2. **Given** la navegación principal y la móvil, **When** se activa cualquier enlace, **Then** lleva a una sección existente cuya etiqueta coincide con su contenido.
3. **Given** la sección que explica cómo funciona, **When** se lee, **Then** describe el ciclo fuentes oficiales → validación humana → publicación, sin cifras ni fuentes no confirmadas.

---

### User Story 3 - Confiar en quién está detrás y en lo que la página no promete (Priority: P3)

Como periodista, quiero que la página deje claro qué es y qué no es la plataforma (independiente o no, en construcción, sin datos todavía) para citarla con precisión.

**Why this priority**: La confianza del público objetivo depende de no confundir la iniciativa con un canal oficial del Estado.

**Independent Test**: Leer marca, principios, cierre y footer y confirmar que ningún elemento sugiere que es un portal oficial del Estado peruano.

**Acceptance Scenarios**:

1. **Given** la marca y el footer, **When** se leen, **Then** no reproducen nombres, emblemas ni dominios del Estado de un modo que sugiera un canal oficial.
2. **Given** la sección de principios, **When** se lee, **Then** incluye como mínimo: cada dato con su fuente, neutralidad (se enlaza, no se opina) y protección de datos personales.
3. **Given** el cierre, **When** se lee, **Then** invita a la acción principal sin prometer fechas ni funcionalidades no confirmadas.

### Edge Cases

- Si JavaScript falla, el contenido principal sigue visible (mismo criterio que la opción A de la spec 002).
- A 360 px y con texto al 200 %, ningún titular nuevo produce desbordamiento horizontal ni solapes.
- Si la acción principal no tiene destino confirmado, apunta a una sección interna válida, nunca a un correo o dominio ficticio.
- Las imágenes provistas conservan su rol narrativo aunque cambie el texto de su sección.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página MUST presentar la plataforma con la marca "Organigrama Abierto" en navegación, título del documento, hero y footer, reemplazando "Gob Perú".
- **FR-002**: El hero MUST mostrar titular, explicación breve y una única acción principal, "Conoce la plataforma", que lleva a la sección #plataforma.
- **FR-003**: La página MUST seguir esta narrativa, en este orden: hero; el problema (información pública dispersa y desactualizada); cómo funciona; para quién (ciudadanos y periodistas); Plataforma (spec 002); principios; cierre; footer. Las secciones actuales se reescriben con ese propósito y las que no encajen se fusionan o se eliminan; el plan MUST declarar el destino de cada una.
- **FR-004**: La página MUST incluir una sección que explique cómo funciona la plataforma: fuentes oficiales, validación humana previa a publicar y publicación periódica.
- **FR-005**: La sección "Cómo funciona" MUST incluir el alcance por poder con su profundidad (y la exclusión de los organismos constitucionales autónomos), el corte semanal de los lunes con lo validado hasta el viernes y la validación humana previa a publicar.
- **FR-006**: La sección de principios MUST incluir al menos: cada dato con su fuente, neutralidad y protección de datos personales.
- **FR-007**: La página MUST NOT presentarse como canal oficial del Estado ni como servicio operativo; MUST comunicar que la iniciativa está "en construcción", sin fechas ni promesas de lanzamiento.
- **FR-008**: La página MUST NOT incluir nombres de funcionarios, cifras, normas específicas, enlaces externos ni datos no suministrados o verificables.
- **FR-009**: La navegación principal y la móvil MUST reflejar la nueva estructura, con enlaces a secciones existentes.
- **FR-010**: La sección "Plataforma" (spec 002) MUST conservarse sin cambios de contenido ni de diagramas.
- **FR-011**: La página MUST conservar el manual de marca (tinta única vino, fondo cálido, Source Serif 4 y Geist Sans), las imágenes provistas y el comportamiento verificado de accesibilidad, teclado, movimiento reducido y rendimiento.
- **FR-012**: El respaldo estático (opción A) MUST reflejar el contenido nuevo.

### Key Entities *(include if feature involves data)*

- **Brand**: Nombre, marca gráfica y relación declarada con el Estado.
- **Section**: Propósito narrativo, etiqueta de navegación, titular y cuerpo.
- **Primary action**: Etiqueta y destino de la acción principal.
- **Principle**: Título y explicación de una regla editorial de la plataforma.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ninguna sección conserva textos de la maqueta de la spec 001 (verificable con una lista de frases retiradas).
- **SC-002**: El 100 % de los enlaces de navegación y de la acción principal resuelve a un destino válido definido en esta spec.
- **SC-003**: Ningún texto, marca ni footer sugiere un canal oficial del Estado (revisión independiente con criterio explícito).
- **SC-004**: No existe desbordamiento horizontal en 360, 390, 768, 1024 y 1440 px.
- **SC-005**: Todas las pruebas previas siguen pasando, ajustadas solo donde el texto cambió por diseño, junto con las nuevas pruebas de contenido.
- **SC-006**: La auditoría final mantiene al menos 95 en accesibilidad, SEO y buenas prácticas.
- **SC-007**: La página no contiene nombres de funcionarios, cifras, normas específicas ni enlaces externos.

## Assumptions

- Esta feature cambia contenido y estructura de secciones, no el stack: sigue sin backend, CMS, analítica ni formularios conectados (constitución vigente).
- Construir el núcleo real (datos, backoffice, fuentes) es otra feature y requerirá enmendar la constitución.
- Las imágenes provistas se reutilizan; no se agregan imágenes nuevas.
- El texto se escribe en español, con el registro editorial de la landing.
