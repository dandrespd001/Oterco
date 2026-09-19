# OT-04 — Diseñar interfaz editorial propia · Evidencia

**Fecha:** 2026-09-19 · **Implementador:** Muse Spark 1.3 Contributor · **Base:** OT-02 realizada, OT-03 realizada (parcial por bloqueo de originales).
**Alcance:** ficha + prototipo wireframe + pruebas OT-Q010/Q011/Q012/Q023, evidencia. Sin tocar `00_CONTROL/07_PLAN/10_OPENCODE/.opencode`, especificaciones, `dist/`, `fonts.css`, datos de OT-02 ni recursos de OT-03. Sin red remota.

## 1. Decisiones

- **`src/styles/base.css` (reescrito, 444 líneas en revisión; 460 tras el ajuste A de esta corrección):** tokens de DISENO.md (`--ot-paper #EDE6D2`, `--ot-paper-alt #E3D8BB`, `--ot-forest #1F3327`, `--ot-forest-deep #16241B`, `--ot-ink #1C2019`, `--ot-muted #55594B`, `--ot-clay #7A3B24`, `--ot-ochre #B07A2C`); H1 `clamp(2.75rem,6.2vw,5rem)` peso 400; contenedor 1120 px; ritmo 40–112 px; botones rectos radio 2 px ≥44 px; masthead no sticky; índice `<details>` nativo; hero tipográfico con textura abstracta CSS; capítulos asimétricos 7/5 en escritorio; cierre bosque profundo; `.foto-pendiente[pendienteAP]` deshabilitado; `.detalle-vertical` máx. 22rem/35rem (OT-Q023); `prefers-reduced-motion` anula transiciones. Stacks del sistema como herramienta de trabajo, con advertencia explícita de no-aprobación; **no importa ni menciona como autorizada** ninguna fuente; `fonts.css` intacto y sin cablear.
- **`src/pages/index.astro` (prototipo wireframe):** masthead + índice de 5 destinos, hero tipográfico con CTAs, capítulos en orden (portafolio 3 filas → 2 territorios asimétricos → manejo reservado → infraestructura con anclas bebederos/feedlot/solar → cierre sin contacto ni preparador). Datos de `proyeccionPublica(perfilBase)` (etiquetas solares filtradas, sin NIT/contacto/solar/fotos). 6 bloques `pendienteAP`, cero `<img>`/`<script>`/`<canvas>`, todo rotulado FIXTURE. Cierre lista los omitidos como informe al operador.
- **`tests/diseno.test.mjs` (nuevo, 10 its):** OT-Q010 (4 its), OT-Q011 (guarda + skip binarios), OT-Q012 (conceptual + skip visual), OT-Q023 (2 its). Iteración: 2 fallos iniciales por regex `fonts.css` que coincidía con comentarios del prototipo; corregido a detección de cableado real (import/link).
- **Docs:** `DISENO.md` (ficha + wireframes 320/768/1280 + estados + correspondencia wireframe↔implementación), `fonts/COMPARACION.md` (conceptual vs matriz PA, sin capturas nuevas: cero imágenes en el repo).

## 2. Archivos (lista completa)

| Archivo | Acción | Rol |
|---|---|---|
| `apps/oterco/src/styles/base.css` | modificado | Ficha y composición editorial |
| `apps/oterco/src/pages/index.astro` | modificado | Prototipo wireframe índice-portal |
| `apps/oterco/tests/diseno.test.mjs` | nuevo | 10 its OT-Q010/Q011/Q012/Q023 |
| `docs/implementacion/OT-04/DISENO.md` | nuevo | Wireframes + estados |
| `docs/implementacion/OT-04/fonts/COMPARACION.md` | nuevo | Comparación conceptual PA |
| `docs/implementacion/OT-04/EVIDENCIA.md` | nuevo | Este archivo |

`git status`: 2 modificados (`base.css`, `index.astro`), resto rutas nuevas. `fonts.css`, datos, recursos y `dist/` no tocados por edición (dist regenerado por build local).

## 3. Comandos y resultados (locales, sin red; salida + exit)

| Comando (en `apps/oterco`) | Resultado | Exit |
|---|---|---|
| `node --test tests/` | 50 tests, 46 pass, 0 fail, 4 skipped | 0 |
| `pnpm check` | 0 errores, 0 avisos (8 ficheros) | 0 |
| `pnpm build` | 1 página `/index.html`, static | 0 |
| `grep -c "<img\|<script\|fonts.css\|mailto:\|data:image" dist/index.html` | 0 | 0 |
| `grep -c 'data-estado="pendienteAP"' dist/index.html` | 6 | 0 |

Iteración intermedia: 2 fallos (falsos positivos `fonts.css` en comentarios) corregidos; suite posterior en verde. Suites OT-02/OT-03 intactas (40 its previas siguen pasando; 4 skips totales = 2 pre-existentes + 2 de OT-04).

## 4. Estado por caso

- **OT-Q010** (wireframes + ficha propia, sin clonar PA): **pasado** (4 its: doc con 320/768/1280 + teclado/no-JS/contraste/reflow; estructura completa en orden; tokens sin material PA; negativos cero foto/script/canvas/CAPTCHA/contacto/preparador).
- **OT-Q011** (fuentes distintas, autorizadas, realmente cargadas): **skip honesto** — pasa la guarda (sin cableado, sin fallback anunciado como aprobado); la carga real de binarios queda pendiente del operador (OT-03/OT-15).
- **OT-Q012** (comparación visual completa): **skip honesto** — consta la comparación conceptual; la visual con capturas inspeccionadas es tarea de operador (OT-14).
- **OT-Q023** (bebedero contenido): **pasado** (2 its: regla 22rem/35rem vigente; cero `<img>`, figura contenida pendiente con ancla propia).

## 5. Casos no ejecutados / riesgos / siguiente acción

- **No ejecutados:** contraste instrumental, zoom 200 %/reflow 400 %, revisión visual con capturas (requieren operador con capacidad real de visión; DOM ≠ visión). Ninguna decisión de composición aprobada sin validación humana.
- **Riesgos:** mismo autor de implementación en ambas marcas (sin promesa de anonimato); terracota/ocre sin validación de contraste final; textos de manejo aún reservados (OT-02/OT-15).
- **Siguiente acción (coordinador):** OT-05 tras registrar esta evidencia; pendientes de operador: validación de diseño wireframe, binarios tipográficos + licencias, fotos/derivados, comparación visual OT-14.

## 6. Ajustes post-revisión (corrección delimitada 2026-09-19)

Corrección acotada a cuatro puntos del encargo; nada más tocado (`index.astro` conserva el prototipo OT-04 previo; sin commit).

- **A — Índice plegado solo en móvil:** `src/styles/base.css`: comentario del bloque `.indice` reescrito para describir el comportamiento real (plegado solo <48rem; resumen operable con teclado y sin JS; nunca `nav{display:none}`); en `@media (min-width: 48rem)` el resumen se oculta (`.indice__resumen{display:none}`) y la lista se fuerza visible en línea con independencia del estado open (`details[open]` y `details:not([open]) > .indice__lista{display:flex}`). `<details>` nativo conservado: no-JS y teclado intactos en móvil; en escritorio los 5 destinos son enlaces siempre visibles. Regla verificada en el CSS construido (`dist/_astro/index.*.css`).
- **B — Cifra de líneas:** `base.css` tenía 444 líneas en revisión (no ~470); tras el ajuste A queda en 460 (`wc -l`). §1 actualizado en consecuencia.
- **C — Reflow/zoom:** en `DISENO.md` la mención a `minmax` queda sustituida por grillas `fr` + `flex-wrap` (lo realmente implementado: `12rem + 1fr`, `7fr/5fr`, `flex-wrap`).
- **D — Test ASCII:** `apps/oterco/tests/diseño.test.mjs` → `diseno.test.mjs` (renombre por `mv`, sin commit); referencias actualizadas en `DISENO.md` y en §§1–2 de esta evidencia.

| Comando (en `apps/oterco`, local sin red) | Resultado | Exit |
|---|---|---|
| `node --test tests/` | 50 tests, 46 pass, 0 fail, 4 skipped (2 pre-existentes + 2 de OT-04) | 0 |
| `pnpm check` | 0 errores, 0 avisos (8 ficheros) | 0 |
| `pnpm build` | 1 página `/index.html`, static | 0 |
| `grep -c "<img\|<script\|fonts.css\|mailto:\|data:image" dist/index.html` | 0 | 0 |
| `grep -c 'data-estado="pendienteAP"' dist/index.html` | 6 | 0 |
| `grep -o 'indice__resumen{display:none}'` + `grep -o '.indice[^{]*{display:flex}' dist/_astro/*.css` | resumen oculto y lista forzada visible (`details[open]` y `:not([open])`) en el CSS construido | 0 |

**No ejecutados en esta corrección:** comprobación manual con teclado a <48rem y ≥48rem, contraste instrumental, zoom 200 %/reflow 400 %, revisión visual con capturas (requieren operador con capacidad real de visión; DOM ≠ visión).
**Riesgos:** el `display:none` del resumen solo aplica ≥48rem (verificado en CSS construido); en móvil el índice sigue dependiendo de la apertura nativa del `<details>`, conforme a DISENO.md.
**Siguiente acción (coordinador):** validar estos cuatro ajustes y registrar el cierre de OT-04; sin commit por parte del implementador.
