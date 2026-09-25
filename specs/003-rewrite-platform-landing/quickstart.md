# Verificación rápida — 003

1. Confirmar el hash SHA-256 de `spec.md`: `c4a88ee0c54f14ed5a01253d22aa7094ffad9460f86948eda111bcd52d5706a1`.
2. Ejecutar los tests nuevos primero, antes de editar la aplicación; registrar fallos de contenido.
3. Actualizar copy y fallback, sin tocar Plataforma ni diagramas.
4. Ejecutar `npm run typecheck`, `npm run build`, `npm run test:e2e` dos veces; archivar salida literal en `artifacts/003-final.txt`.
5. Inspeccionar el orden de secciones, enlaces, overflow a 360/390/768/1024/1440, zoom 200 %, fallback sin JS y revisión independiente. No hacer commit.
