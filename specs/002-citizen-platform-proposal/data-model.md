# Data model: contenido editorial

Modelo conceptual estático, sin BD, migraciones, API ni funcionarios reales. Ver [contrato UI](contracts/platform-section.md).

## ValueProposition

| Campo | Tipo / regla |
|---|---|
| `order` | Entero único 1–5, consecutivo; orden de lectura fijo. |
| `title` | Texto obligatorio en español, una de cinco propuestas aprobadas. |
| `promise` | Frase obligatoria; no implica servicio operativo. |
| `description` | Texto breve obligatorio, prospectivo/verificable; sin nombres, cifras institucionales no aprobadas, normas ni enlaces externos. |
| `diagram` | Un componente JSX sin props, SVG inline decorativo `aria-hidden="true"`, viewBox fijo, tinta `var(--wine)` sobre `var(--paper)`; autor: diagramas (Claude). |

**Orden invariante**: 1 quién ocupa cada cargo hoy; 2 cada dato con su prueba; 3 trayectoria de cada funcionario; 4 lo que cambió esta semana; 5 contexto verificado en un solo lugar. Cada `<article>` contiene diagrama → título → promesa → descripción. Texto completo entendible sin dibujo.

## Diagram

Cinco conceptos 1:1: organigrama, documento sellado, trayectoria, calendario semanal, carpeta de contexto. Siluetas diferentes entre sí y distintas a imágenes actuales; sin `<image>`, raster ni URL externa. Dibujos en componentes y fallback no-JS pertenecen exclusivamente a diagramas (Claude). Sin motion inicial.

## ScopeStatement y UpdateCycle (retirados)

Retirados el 2026-09-24 por la enmienda aprobada por el usuario (FR-005 y FR-006 de spec.md): la sección no muestra alcance por poder, corte semanal ni validación humana. Ese contenido pasa a la sección "Cómo funciona" de la spec 003.

## Relationships and transitions

`PlatformSection` contiene cinco `ValueProposition`. Cada propuesta tiene exactamente un `Diagram`. No hay estado ni transiciones runtime: el ciclo semanal es promesa de plataforma futura, no proceso ejecutable de esta landing.
