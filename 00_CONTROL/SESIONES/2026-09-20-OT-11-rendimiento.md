# Acta 2026-09-20 — OT-11 Rendimiento y seguridad estática

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f3efc7b8fffejiScXxYc0WwRWo + corrección ses_f3ef92253ffe3Kjmy5SlQ6xkJu) · **Revisor:** proporcional sin ronda dedicada — hallazgos críticos ya pasaron por revisor en OT-08/OT-09; los tests de presupuesto y la decisión R1 quedan expuestos en acta para seguimiento.

## Resultados

- `scripts/medir.mjs` (sin deps): bytes/gzip por asset, transferencia inicial de portada 19.017 B crudo / 5.789 gzip (límite 1.000.000), JS inicial 0/15.000, CSS 2.005/40.000 — todo CUMPLE; incremento preparador 0 B (deshabilitado).
- `tests/presupuesto.test.mjs` (15 tests): presupuestos, coherencia `_headers` (solo hash immutable), secretos/API/IA ausentes, `0 style= inline` en dist html.
- **Decisión R1 (coordinador): vía (c)** — inline `style="aspect-ratio"` ×6 externalizado a 5 clases `.slot--WxH` en base.css; `<style>` embebido de 404 eliminado (reversión de OT-10.F4, documentada en su evidencia: sin él, degradación aceptable, skip-link nativo). CSP estricta intacta; cero aperturas.

## Casos

- OT-Q021 ✓ · Q022 ✓ (aspect-ratio acreditado en CSS emitido; srcset/sizes reales pend. derivados) · Q037 ✓ (método registrado `node:zlib gzipSync` 9) · Q038 ✓ · Q042 ✓ tras externalización · Q043 ✓ · Q050 ✓ · **Q039 no ejecutado** (Lighthouse ×3 móvil: procedimiento exacto en EVIDENCIA §6 → operador/OT-16).

## Limitaciones

- Medición local ≠ hosting real (cabeceras `_headers` y Llickr effect effectson exposure at OT-16); re-medir tras cablear tipografías/fotos/preparador.
- Riesgo aceptado: 404 sin foco visible custom (nativo del navegador) — reabrir si el operador lo percibe así.

## Próximo paso

OT-12 — Pipeline y candidato independiente (con huellas, sin recompilar al promover, permisos/mcuotas), necesitando la evidencia visual/buzón del operador para pruebas Q045-Q048.
