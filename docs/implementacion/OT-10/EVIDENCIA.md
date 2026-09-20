# OT-10 — Evidencia de comandos y resultados

**Unidad:** OT-10 · **Fecha:** 2026-09-20 · **Entorno:** linux local, sin red remota,
sin installs, sin navegador gráfico. `dist/` está gitignorado: el rebuild es local
para que los tests consuman compilado real.

## Comandos y salidas (exit codes registrados)

1. `node -e '<cálculo WCAG>'` — contraste de tokens → exit 0.
   ink/paper 13.27, forest/paper 10.79, muted/paper 5.78, clay/paper 6.80,
   ocre/paper 2.97 (decorativo), paper/forest 10.79, paper/deep 12.94,
   paperAlt/deep 11.37, ink/paperAlt 11.66, clay/paperAlt 5.97,
   muted/paperAlt 5.08, forest/paperAlt 9.48.
2. `node --test tests/acc.test.mjs` (antes de correcciones) → 3 fallos honestos:
   - `skip-link visible con foco… presente en 404` (H1: 404 sin skip-link);
   - `zoom/reflow… topes de línea` (patrón `60ch` erróneo: ese tope vive en
     `Preparador.astro`, no en `base.css`; se corrigió el test y se añadió
     auditoría de la fuente deshabilitada);
   - `informe del operador…` (INFORME.md aún no existía).
3. `pnpm build` → exit 0 (2 páginas Astro + copia de `public/404.html` a `dist/`).
4. `node --test tests/acc.test.mjs` (tras H1 + INFORME.md) → 22 tests, 22 pass,
   0 fail, 0 skipped. Exit 0.
5. `node --test tests/` (suite completa) → 200 tests, 195 pass, 0 fail,
   5 skipped, 0 todo. Exit 0. Los 5 skips son preexistentes (`acc.test.mjs`
   contiene 0 `skip(` verificado por grep).

## Diff de la unidad (único cambio de interfaz)

- `apps/oterco/public/404.html`: +skip-link a `#contenido`, `main` con
  `id="contenido"` (2+/1-). Propagado a `dist/404.html` vía rebuild.
- Nuevo `apps/oterco/tests/acc.test.mjs` (22 tests, 0 scripts nuevos de pnpm).
- Nuevo `docs/implementacion/OT-10/INFORME.md` (este registro + pasos operador).
- Cero cambios en datos, puertas, contratos, snapshots o tests previos.

## Casos no ejecutados (pendientes del operador, §5 del INFORME.md)

- Navegación real a 320/390/768/1440 + zoom 200% + reflow 400% con capturas
  completas inspeccionadas (OT-Q013/Q018, V-10/V-11/V-15).
- Teclado vivo Tab/Shift+Tab/Enter/Espacio/Escape (OT-Q016, V-12).
- Lector Edge/Windows + Orca/Linux (OT-Q015/Q052).
- axe DevTools gratuito acotado a WCAG 2.2 AA en las 3 páginas (OT-Q052).
- Confirmación de contraste en pantalla + copia en gris (OT-Q017, V-17).

## Riesgos

- El cálculo de contraste es sobre tokens, no medición de captura.
- `order: 2` y `role="note"` quedan documentados; si el lector los anuncia mal,
  reabrir OT-10.A con la evidencia del operador.
- Sin capturas inspeccionadas no hay publicación (OT-15/OT-17).

## Ajustes de cierre del revisor (2026-09-20, sin commit)

1. **F1 — viewport 1280→1440 (coherencia OT-Q018):** `INFORME.md` §5 paso 1
   (título + punto 1), `EVIDENCIA.md` "Casos no ejecutados" y el marcador de
   `apps/oterco/tests/acc.test.mjs` (OT-Q052) ahora exigen 320/390/768/**1440**.
   El 1280 de `diseno.test.mjs`/`DISENO.md` (OT-04, wireframes de diseño) no se
   toca: es alcance de otra unidad.
2. **Cosmético:** `ni(scroll horizontal` → `ni (scroll horizontal` en la
   cabecera de `acc.test.mjs` (línea 14).
3. **F4 — 404 con foco visible propio:** `apps/oterco/public/404.html` suma un
   `<style>` embebido mínimo (`.skip-link` fuera de vista + `:focus` que lo
   revela, `a:focus-visible` con outline 3px) con los valores literales de
   `base.css` (#1f3327/#ede6d2). No referencia el bundle con hash, no añade
   scripts, mantiene `noindex` y carácter estático. Nota: la fila H7 del
   INFORME.md ("404 sin hoja de estilos, foco por defecto del navegador")
   queda superada por este cambio; el INFORME no se edita aquí por límite de
   alcance — el coordinador lo actualiza al archivar.
4. **F3 — aserción sobre CSS emitido:** nuevo `it("OT-10.F3 …")` en
   `acc.test.mjs` que lee `dist/_astro/*.css` y exige `prefers-reduced-motion:
   reduce` + `transition: none` + `animation: none` (regex tolerantes al
   minificado). Cubre que el bundle conserva el bloque, no solo la fuente.

Comandos re-ejecutados tras los ajustes (exit codes registrados):

- `pnpm build` → exit 0 (2 páginas Astro + copia de `public/404.html` a `dist/`).
- `node --test tests/acc.test.mjs` → 23 tests, 23 pass, 0 fail. Exit 0.
- `node --test tests/` (suite completa) → 201 tests, 196 pass, 0 fail,
  5 skipped (preexistentes), 0 todo. Exit 0. El +1 respecto a la evidencia
  anterior es el test F3; `acc.test.mjs` sigue con 0 `skip(`.
- Verificación: `dist/404.html` contiene el `<style>` del skip-link
  (5 menciones de `skip-link`); el bundle emitido conserva
  `prefers-reduced-motion:reduce…{transition:none!important;animation:none!important}`.

## Siguiente acción

Coordinador: registrar OT-10 como REALIZADA-parcial (programático verde +
manual pendiente del operador), archivar capturas/axe al recibirse y continuar
OT-11. No se finge revisión visual.
