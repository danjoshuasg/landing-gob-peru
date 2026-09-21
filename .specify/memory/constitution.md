<!--
Sync Impact Report
- Version change: template → 1.0.0
- Added principles: I. Veracidad institucional; II. Imágenes provistas como fuente visual; III. Accesibilidad y adaptación responsive; IV. Rendimiento medible; V. Verificación independiente
- Added sections: Restricciones de producto; Flujo de desarrollo y calidad
- Removed sections: none
- Templates requiring updates: none
- Deferred TODOs: contenido institucional definitivo, CTA y destino de publicación requieren confirmación del cliente
-->
# Landing Gob Perú Constitution

## Core Principles

### I. Veracidad institucional

La landing MUST evitar cifras, programas, autoridades, enlaces, correos o afirmaciones institucionales no proporcionados o verificables. El contenido provisional MUST identificarse como tal y no puede simular una publicación oficial. La claridad editorial nunca justifica inventar datos públicos.

### II. Imágenes provistas como fuente visual

Las tres imágenes entregadas por el cliente MUST integrarse como recursos locales y ser la fuente de verdad de la dirección gráfica: tinta vino o burdeos, fondo cálido y dibujo arquitectónico tipo grabado. Los originales MUST conservarse sin modificación; la web MUST consumir derivados optimizados y responsive. No se permiten hotlinks ni imágenes provisionales.

### III. Accesibilidad y adaptación responsive

La experiencia MUST funcionar mediante teclado, respetar `prefers-reduced-motion`, mantener contraste legible y proporcionar alternativas textuales útiles. El contenido MUST conservar jerarquía y comprensión desde 360 px hasta escritorio amplio. Los recortes móviles MUST proteger el foco narrativo de cada imagen.

### IV. Rendimiento medible

Las imágenes MUST servirse en formatos modernos con `srcset`, dimensiones explícitas y carga diferida fuera de la primera pantalla. La aplicación MUST compilar sin errores de TypeScript. El objetivo de entrega es Lighthouse ≥95 en accesibilidad, SEO y buenas prácticas en condiciones reproducibles.

### V. Verificación independiente

Todo cambio de implementación MUST pasar una verificación ejecutable y una revisión independiente de QA y alcance. Quien produce no puede firmar su propio gate. Los hallazgos MUST citar evidencia reproducible; `UNKNOWN` no cuenta como éxito.

## Restricciones de producto

- Stack aprobado: React, TypeScript y Vite, sin backend ni CMS en esta entrega.
- Tipografía aprobada: Source Serif 4 para títulos y Geist Sans para navegación, cuerpo e interfaz; ambas alojadas localmente.
- La paleta MUST derivarse de los recursos entregados y usar una sola tinta principal con fondos neutros.
- Las tarjetas, métricas y textos MUST construirse como HTML accesible; no se rasterizan dentro de imágenes.
- La primera entrega es una landing editorial estática. Autenticación, analítica, formularios conectados, panel administrativo y publicación oficial quedan fuera de alcance.

## Flujo de desarrollo y calidad

1. Spec Kit posee la especificación, el plan y las tareas de la feature.
2. `clarify` y `analyze` son obligatorios antes de cerrar la construcción.
3. Las verificaciones mínimas son typecheck, build de producción, revisión responsive y prueba de navegación/semántica.
4. Los gates del harness responden por separado si funciona y si era lo solicitado.
5. Un cambio de hash en una especificación aprobada exige nueva aprobación humana.
6. La implementación iniciada antes de instalar el harness se registra como desviación de proceso; no exime la convergencia ni los gates finales.

## Governance

Esta constitución prevalece sobre planes y decisiones de implementación. Las enmiendas requieren motivo, impacto y aprobación de Daniel Santiváñez. Los cambios incompatibles incrementan versión MAJOR; nuevos principios o ampliaciones sustanciales, MINOR; aclaraciones sin cambio semántico, PATCH. Toda revisión debe comprobar cumplimiento constitucional antes de firmar GO.

**Version**: 1.0.0 | **Ratified**: 2026-09-20 | **Last Amended**: 2026-09-20
