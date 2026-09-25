# T028 — Lighthouse del build local

## Resultados

| Modo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---:|---:|---:|---:|
| Móvil | 92 | 100 | 100 | 100 |
| Escritorio | 100 | 100 | 100 | 100 |

Las tres categorías objetivo (accesibilidad, buenas prácticas y SEO) alcanzan ≥95 en ambos modos. Rendimiento móvil queda bajo 95; no se modificó el producto.

## Hallazgo — rendimiento móvil

- Auditoría `largest-contentful-paint`: 3,0 s (score de auditoría 0,78; peso 25). Elemento LCP: `section#top > div.hero-stage > picture > img`. En `lcp-discovery-insight` figura `requestDiscoverable: false` para esta imagen, aunque tiene `fetchpriority="high"` y `loading="eager"`. `lcp-breakdown-insight` atribuye 889 ms a la demora de renderizado del elemento. Fuente: `mobile.report.json`, auditorías `largest-contentful-paint`, `lcp-discovery-insight` y `lcp-breakdown-insight`.
- Auditoría `first-contentful-paint`: 2,3 s (score de auditoría 0,76; peso 10). Métrica de documento, sin selector de elemento aplicable. `render-blocking-insight` señala la hoja `/assets/index-CyLhxu9w.css` (153 ms en la tabla de recursos); recurso URL, no selector DOM. Fuente: `mobile.report.json`, auditorías `first-contentful-paint` y `render-blocking-insight`.
- Auditoría `cumulative-layout-shift`: 0,042 (score de auditoría 0,99; peso 25). `layout-shifts` atribuye el desplazamiento a la carga de `/fonts/geist-sans.woff2` y `/fonts/source-serif-4-latin.woff2`; no devuelve selector DOM para ese desplazamiento. Fuente: `mobile.report.json`, auditorías `cumulative-layout-shift` y `layout-shifts`.

## Condiciones y reproducción

- Build: `npm run build` (salida en `build.log`); documento servido: `dist/index.html`, SHA-256 `6e710a2f101dde07d92ede9bba533fff86bf080715ff712cc4b21a2374ef99c9`.
- Preview: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort`; URL auditada: `http://127.0.0.1:4173/`. Servidor detenido al concluir; salida en `preview.log`.
- Lighthouse CLI 13.5.0 (`npx --no-install lighthouse`); Chrome Headless 154.0.0.0 (`CHROME_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, flags `--headless --no-sandbox`). Fecha UTC de los informes: móvil `2026-09-24T23:03:42.256Z`; escritorio `2026-09-24T23:03:53.762Z`.
- Misma configuración móvil base que el informe anterior `artifacts/lighthouse/report.json`: navegación local, Lighthouse CLI, emulación móvil 412 × 823 (DPR 1,75), throttling simulado (RTT 150 ms, 1638,4 Kbps, CPU ×4). Se agregaron rendimiento y escritorio para cubrir las cuatro categorías solicitadas. Escritorio: preset de Lighthouse, emulación 1350 × 940 (DPR 1), throttling simulado. Se audita la URL raíz de la página completa; `fullPageScreenshot` está presente en ambos JSON (sin deshabilitarlo). Resultados de rendimiento pueden variar entre ejecuciones.
- Reproducir después de `npm run build` y de arrancar el preview anterior:

```bash
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx --no-install lighthouse http://127.0.0.1:4173/ --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=artifacts/002-lighthouse/mobile --chrome-flags='--headless --no-sandbox'
CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npx --no-install lighthouse http://127.0.0.1:4173/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output=html --output-path=artifacts/002-lighthouse/desktop --chrome-flags='--headless --no-sandbox'
```

- Salidas crudas y legibles: `mobile.report.json`, `mobile.report.html`, `desktop.report.json`, `desktop.report.html`; logs CLI `mobile.log` y `desktop.log`. Ambas ejecuciones terminaron con código 0, sin `runWarnings` ni `runtimeError`. Árbol de trabajo ya tenía cambios sin confirmar; no se editaron `src/`, `tests/` ni `specs/`.
