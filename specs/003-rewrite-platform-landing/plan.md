# Plan de implementación — Organigrama Abierto

**Feature**: 003-rewrite-platform-landing · **Spec aprobada**: SHA-256 `c4a88ee0c54f14ed5a01253d22aa7094ffad9460f86948eda111bcd52d5706a1` · **Track**: T4

## Technical Context

React + TypeScript + Vite; copy y secciones en `src/App.tsx`, metadatos y fallback en `index.html`, reglas responsive en `src/styles/global.css`, Playwright en `tests/`. Sin nuevas dependencias, backend, CMS ni endpoints. Imágenes, fuentes y diagramas existentes permanecen. `src/components/PlatformSection.tsx` y los archivos existentes de `src/components/diagrams/` quedan intactos. **Enmienda durante la ejecución (pedido explícito del usuario):** `src/components/diagrams/` suma archivos nuevos: las escenas isométricas del problema (`ScatteredDocsScene.tsx`, `PeopleGraphScene.tsx`, `iso.ts`) y las tres ilustraciones del método (`ArchiveDrawerScene.tsx`, `StampScene.tsx`, `NoticeBoardScene.tsx`), que reemplazan los íconos genéricos `.method-icon observe/connect/act` (ver T016). No hay contratos de API nuevos.

## Constitution Check

- I: ninguna autoridad, cifra, norma, enlace ni promesa inventada; aviso explícito de independencia y construcción.
- II: mantener imágenes locales originales y derivados; cambiar solo copy/alt pertinentes.
- III: preservar navegación por teclado, foco en #plataforma, responsive y movimiento reducido; probar 360–1440 y 200 %.
- IV: preservar formatos modernos, carga diferida y fuentes; typecheck/build y auditoría si hay herramienta disponible.
- V: pruebas rojas antes de cambios, suite verde y revisión independiente QA + alcance. No modificar spec aprobada.

## Destino de cada sección actual (FR-003)

| Sección actual | Destino | Función final |
|---|---|---|
| Hero | Reescribir | Presentación de Organigrama Abierto, audiencia, una acción principal a #plataforma. |
| Visión | Reescribir | El problema: información pública dispersa y desactualizada. |
| Método | Reescribir | Cómo funciona: fuentes oficiales → validación humana → publicación; alcance por poder y corte semanal. |
| Capacidades | Fusionar con roles | Integrar contexto para ciudadanos y periodistas en «Para quién», conservando imagen de la sección. |
| Roles | Reescribir | «Para quién»: tarjetas de ciudadanos y periodistas; continúa después del contexto fusionado. |
| Territorio | Eliminar como sección autónoma; fusionar su imagen con «Para quién» | Evitar un bloque sin función en el orden exigido; imagen como apoyo visual del público objetivo. |
| Principios | Reescribir | Fuentes por dato, neutralidad y protección de datos personales. |
| Cierre | Reescribir | En construcción, invitación interna a #plataforma sin promesas. |
| Footer | Reescribir | Marca independiente y navegación a secciones existentes. |
| Plataforma (spec 002) | Conservar | Componente, contenido y diagramas sin cambios. |

Orden final: hero → problema → cómo funciona → para quién (capacidad/roles/imagen de territorio fusionados) → Plataforma → principios → cierre → footer.

## Diseño y secuencia

1. Escribir pruebas Playwright de contenido y estructura, incluyendo fallback sin JS, frases retiradas, prohibiciones y regresiones existentes; ejecutar y registrar rojo.
2. Sustituir nav, copy y secciones de `App.tsx`, sin cambiar el JSX de Plataforma ni lógica de menú/reveal. Mantener las cuatro imágenes mediante integración de la imagen de territorio en «Para quién».
3. Sincronizar `index.html` (metadatos y fallback), ajustar solo CSS necesario para densidad de texto/anchos.
4. Ejecutar typecheck, build, e2e dos veces; capturar salida literal. Gate independiente de QA y alcance antes de entrega.

**Reevaluación constitucional**: sin excepciones propuestas. El texto «normas» dentro de Plataforma heredada no se modifica: FR-008 prohíbe normas específicas, no la categoría genérica.
