# Feature Specification: Propuesta de plataforma ciudadana del organigrama del Estado

**Feature Branch**: `002-citizen-platform-proposal`

**Created**: 2026-09-24

**Status**: Approved

**Input**: User description: "Incorporar a la landing, con su manual de marca, una sección con las 5 propuestas de valor de una plataforma que centraliza y actualiza el organigrama del Estado peruano y su cartera de funcionarios, para ciudadanos y periodistas, con un diagrama por tarjeta."

## Clarifications

### Session 2026-09-24

- Q: ¿Qué son los "5 servicios"? → A: Cinco propuestas de valor que ofrece la plataforma.
- Q: ¿Para quién es la plataforma? → A: Ciudadanos y periodistas.
- Q: ¿Qué alcance tiene la v1? → A: Gobierno Nacional: los tres poderes del Estado hasta una profundidad definida.
- Q: ¿Con qué frecuencia se actualiza? → A: Cada semana: corte los lunes con lo validado hasta el viernes.
- Q: ¿Quién valida los cambios? → A: Un backoffice con validación humana, operado por 5 personas.
- Q: ¿Dónde se presenta la propuesta? → A: Dentro de esta landing, con su manual de marca, y con diagramas en cada tarjeta.
- Q: ¿La sección debe mostrar la franja de alcance, actualización y validación? → A: No es necesario mostrarla (decisión del usuario tras verla implementada; enmienda de la spec aprobada).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender qué ofrecerá la plataforma (Priority: P1)

Como ciudadano o periodista, quiero ver en una sola sección las cinco propuestas de valor de la plataforma para entender qué podré consultar y por qué me sirve.

**Why this priority**: Es el contenido central pedido; sin él la sección no existe.

**Independent Test**: Llegar a la sección desde la navegación y verificar que las cinco tarjetas muestran título, promesa y descripción legibles, en el orden definido, en escritorio y en 360 px.

**Acceptance Scenarios**:

1. **Given** la navegación principal, **When** el visitante activa el enlace de la sección, **Then** la página lo lleva a la sección y el foco visual queda en su título.
2. **Given** la sección en escritorio, **When** se recorre, **Then** aparecen exactamente cinco tarjetas con título, promesa y descripción, en este orden: quién ocupa cada cargo hoy; cada dato con su prueba; la trayectoria de cada funcionario; lo que cambió esta semana; contexto verificado en un solo lugar.
3. **Given** un viewport de 360 px, **When** se muestra la sección, **Then** las tarjetas se apilan sin desbordamiento horizontal y conservan la jerarquía diagrama → título → promesa → descripción.

---

### User Story 2 - Comprender cada propuesta sin leerla completa (Priority: P2)

Como visitante, quiero que cada tarjeta tenga un diagrama que represente literalmente su propuesta para captarla de un vistazo.

**Why this priority**: Los diagramas son parte explícita del pedido y distinguen la sección de un listado de texto.

**Independent Test**: Ocultar el texto de cada tarjeta y comprobar, en una revisión visual independiente, que el diagrama sugiere su propuesta y que los cinco diagramas son distinguibles entre sí.

**Acceptance Scenarios**:

1. **Given** cada tarjeta, **When** se observa su diagrama, **Then** representa un objeto literal de la propuesta (por ejemplo, un organigrama, un documento con sello, una línea de trayectoria, un calendario semanal, una carpeta con documentos y recortes).
2. **Given** los cinco diagramas, **When** se comparan, **Then** ninguno repite la silueta de otro ni la de las imágenes existentes de la landing.
3. **Given** un lector de pantalla, **When** recorre la sección, **Then** los diagramas no añaden ruido (son decorativos) y el significado queda en el texto de la tarjeta.

### Edge Cases

- Si JavaScript tarda o falla, las cinco tarjetas y sus diagramas siguen visibles como HTML y SVG estáticos.
- Con preferencia de movimiento reducido, ningún diagrama se anima.
- En textos ampliados al 200 %, las tarjetas no se solapan ni cortan su contenido.
- Entre 360 y 390 px, ningún diagrama ni tarjeta produce desplazamiento horizontal.
- Si en el futuro se agrega motion a los diagramas, fuera del viewport no se reproduce.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La landing MUST incluir una sección nueva que presente la plataforma propuesta mediante exactamente cinco tarjetas de propuesta de valor.
- **FR-002**: Cada tarjeta MUST mostrar un diagrama, un título, una promesa de una frase y una descripción breve, como HTML accesible.
- **FR-003**: Las tarjetas MUST presentarse en el orden definido en la User Story 1.
- **FR-004**: La navegación principal y la móvil MUST incluir un enlace a la sección, que apunte a un identificador existente.
- **FR-005**: *(Retirado el 2026-09-24 a pedido del usuario: la sección no muestra ritmo de actualización, validación ni alcance.)*
- **FR-006**: *(Retirado el 2026-09-24 junto con FR-005.)*
- **FR-007**: La sección MUST presentarse como propuesta en desarrollo y no como servicio operativo.
- **FR-008**: La sección MUST NOT incluir nombres de funcionarios, cifras, normas específicas, enlaces a fuentes externas ni datos no suministrados o verificables.
- **FR-009**: Cada diagrama MUST ser un SVG en línea dibujado en línea de grabado con la tinta única de la marca sobre el fondo cálido, sin imágenes rasterizadas, hotlinks ni recursos externos.
- **FR-010**: Los diagramas MUST ser decorativos para tecnologías de asistencia; el significado MUST quedar en el texto de la tarjeta.
- **FR-011**: Los títulos MUST usar la tipografía de títulos de la marca y el cuerpo la tipografía de cuerpo, ya alojadas localmente.
- **FR-012**: La sección MUST ser operable por teclado, con foco visible en sus enlaces, y respetar `prefers-reduced-motion`.
- **FR-013**: La sección MUST evitar desplazamiento horizontal a partir de 360 px.
- **FR-014**: La incorporación MUST conservar el comportamiento verificado de la landing existente: sus pruebas previas siguen pasando.
- **FR-015**: Cualquier motion en los diagramas MUST ser opcional, sobrio, quedar pausado fuera del viewport y desactivarse con movimiento reducido; su diseño se aprueba después de los diagramas estáticos, uno a la vez.

### Key Entities *(include if feature involves data)*

- **Value proposition**: Número, título, promesa, descripción y diagrama asociado.
- **Diagram**: Ilustración decorativa en línea de grabado que representa literalmente una propuesta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La sección muestra exactamente cinco tarjetas, cada una con diagrama, título, promesa y descripción, en el orden definido.
- **SC-002**: El 100 % de los enlaces de navegación, incluido el nuevo, resuelve a una sección existente.
- **SC-003**: No existe desbordamiento horizontal en 360, 390, 768, 1024 y 1440 px.
- **SC-004**: Todas las pruebas previas de la landing siguen pasando, junto con las nuevas pruebas de la sección.
- **SC-005**: La auditoría final mantiene al menos 95 en accesibilidad, SEO y buenas prácticas.
- **SC-006**: La carga de la sección no solicita ningún recurso a dominios externos.
- **SC-007**: Una revisión visual independiente confirma que cada diagrama representa su propuesta sin depender del título y que los cinco son distinguibles entre sí.
- **SC-008**: La sección no contiene nombres de funcionarios, cifras, normas específicas ni enlaces externos.

## Assumptions

- La sección se ubica entre el bloque de roles y la visión territorial, y su enlace de navegación se llama "Plataforma".
- El texto de la sección se escribe en español, con el mismo registro editorial de la landing.
- El backoffice, las alertas por correo, el organigrama navegable y el archivo de documentos se describen como capacidades de la plataforma propuesta; construirlos queda fuera de esta feature.
- La composición exacta de cada poder, en especial del Congreso bicameral, se confirmará con fuentes oficiales antes de construir la plataforma; esta sección solo nombra niveles de cargo, no cifras.
- La dirección gráfica de los diagramas se deriva de las imágenes y tokens existentes; no se agregan imágenes nuevas.
