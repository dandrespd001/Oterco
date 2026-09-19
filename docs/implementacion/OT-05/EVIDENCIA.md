# OT-05 — Evidencia: shell y navegación

**Unidad:** OT-05 "Construir shell y navegación" · **Fecha:** 2026-09-19 · **Escritor:** Muse Spark 1.3 Contributor
**Base:** apps/oterco Astro static con composición OT-04 · **Estado:** unidad coherente implementada, pendiente cierre del coordinador.

## Decisión de diseño

- Shell propio sin renderer compartido con Puerta Abierta: `src/layouts/BaseLayout.astro` (head SEO mínimo, skip-link, `main#contenido`) + `src/components/Header.astro` (masthead tipográfico, sin sticky) + `Indice.astro` (details nativo extraído de la portada) + `Footer.astro` (pie oscuro, contacto bloqueado declarativo).
- Fuente única de ruteo `src/config/navegacion.ts`: 9 destinos válidos (anclas existentes) + 1 pendiente (`contacto` → repliegue `#cierre` con `data-estado="pendienteAP"`). Las 13 rutas `file:///` de la referencia **no se transcriben** (carpetas locales); se mapean por categoría en `MAPEO_REFERENCIA` con marcador `file:///…` (elipsis, sin ruta real).
- CSS: una sola piel OT-05 añadida a `src/styles/base.css` (~25 líneas: subrayado discontinuo para `a[data-estado="pendienteAP"]` + `.pie__fila/.pie__contacto` que hereda la ficha secundaria). Sin duplicar los estados pendienteAP de OT-04. Cero `<script>` en shell, portada y dist.

## Archivos / diff

- Nuevos: `src/config/navegacion.ts`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Indice.astro`, `src/components/Footer.astro`, `tests/shell.test.mjs`, `docs/implementacion/OT-05/EVIDENCIA.md`.
- Modificados: `src/pages/index.astro` (reensamblada sobre `BaseLayout`; capítulos OT-04 intactos), `src/styles/base.css` (piel OT-05), `tests/diseno.test.mjs` (ajuste mínimo de compatibilidad de composición: lee portada+layout+componentes+ruteo con las mismas aserciones; la aserción de destinos acepta la forma ruteada `href: "#…"` además de la en línea — ver §Riesgos).
- Exclusiones respetadas: sin tocar especificaciones, 00_CONTROL, 07_PLAN, 10_OPENCODE, perfil, publicacion.ts, recursos, ni contacto real/preparador (OT-07).

## Mapa de navegación (compilado dist/index.html)

| href emitido | Veces | Estado | Destino resuelve |
|---|---|---|---|
| `#contenido` | 2 (marca, skip-link) | válido | sí, `main#contenido` único |
| `#portafolio` | 2 (índice, CTA hero) | válido | sí |
| `#fincas` | 1 (índice) | válido | sí |
| `#manejo` | 1 (índice) | válido | sí |
| `#infraestructura` | 1 (índice) | válido | sí |
| `#cierre` | 3 (índice Contacto pendienteAP, CTA hero, pie pendienteAP) | 1 válido + 2 pendienteAP | sí, con `title` de motivo |
| `/_astro/*.css` | 1 | asset local | sí |

13 categorías `file:///` → 13 filas en `MAPEO_REFERENCIA` (5 nav + 2 CTA hero + 2 capítulos finca + 3 subanclas + 1 pie). Cero `file://`, cero `javascript:`, cero rutas personales, cero URL inventada en dist y fuentes (solo el marcador `file:///…` documentado en `navegacion.ts`, cubierto por prueba).

## Comandos y resultados (local, sin red)

| Comando | Salida / exit |
|---|---|
| `pnpm build` | 1 página en ~700 ms, `Complete!`, exit 0 |
| `pnpm check` (astro check + TS estricto) | 13 ficheros, 0 errores/avisos, exit 0 |
| `node --test tests/` (suite completa) | 69 tests, 65 pass, 0 fail, 4 skipped (skips honestos preexistentes OT-Q011/Q012), exit 0 |
| `node --test tests/shell.test.mjs` | 4 suites OT-Q013–Q016 en verde |

Iteración honesta: 4 aserciones propias fallaron primero por regex que alcanzaban comentarios (`Cero <script>.`, `nav{display:none}` documentado, `file:///…` marcador) y por formato multilínea; se corrigieron las pruebas (quitar comentarios antes de afirmar; tolerar formato), no el código. El ajuste a `diseno.test.mjs` se documenta arriba.

## Estado OT-Q013…Q016

- **OT-Q013 pasado** (proxy programático): 0 scripts; details/summary nativo con nombre accesible; sin `nav{display:none}`; lista forzada visible en escritorio con/sin open; táctil ≥44 px (botones + resumen); viewport móvil; sin anchos fijos.
- **OT-Q014 pasado**: 0 `file://` en dist/fuentes; sin `javascript:`/rutas personales/`saved-from`; toda ancla resuelve a id único; 13/13 categorías mapeadas; pendientes con repliegue existente y motivo en `title`.
- **OT-Q015 pasado**: un `main#contenido`, un H1, skip-link primer enlace, jerarquía sin saltos (5+ H2), secciones con `aria-labelledby` resolvente, head fixture + `noindex` + canonical pendienteAP sin URL real.
- **OT-Q016 pasado**: sin `tabindex` positivo ni `-1`; sin `aria-hidden`/`inert`; summary nativo (Enter/Espacio); `:focus-visible` en a/button/summary con contorno 3 px; enlaces subrayados siempre y pendientes en discontinuo.

## Casos no ejecutados (skip honesto)

- **Navegación real en navegador a 320/390 px con/sin JS, teclado Tab/Escape/Enter manual y captura visual inspeccionada**: fuera de alcance (sin capacidad de visión ni navegador manual en esta unidad). Los proxies programáticos constan arriba; la verificación manual queda para OT-10/OT-14 con operador.
- **Lighthouse ≥90 / presupuestos de transferencia**: no corresponde a esta unidad (encargo: dist ≥90 no aquí).

## Riesgos y siguiente acción

- **Riesgo:** el ajuste de compatibilidad en `tests/diseno.test.mjs` (test ajeno) debe ser ratificado por el coordinador/revisor; si se rechaza, alternativa: revertirlo y aceptar su fallo documentado hasta OT-14.
- **Riesgo:** `MAPEO_REFERENCIA` clasifica por categoría presunta (las rutas exactas no se copiaron a propósito); si el coordinador dispone del listado literal, se puede auditar categoría por categoría sin tocar código.
- **Siguiente acción propuesta:** OT-06 tras cierre OT-05 por el coordinador (actualizar `07_PLAN/ESTADO_TAREAS.md` y acta; esta unidad no escribe el estado).

## Cierre OT-05 — Ajustes F1–F4 del revisor (2026-09-19)

- **F1 (táctil índice móvil):** `.indice__lista a` con `display: inline-block` + `padding-block: 0.6rem` en móvil (≈46 px totales ≥44 px); excepción de escritorio (≥48rem) documentada en el propio CSS: vuelven a `inline` sin padding para conservar la fila editorial en línea. Verificado en compilado: `dist/_astro/index.*.css` emite ambas reglas.
- **F2 (CSS muerto):** eliminadas `.pie__contacto p` (nunca casa: el contacto ES un `<p>` sin descendientes `<p>`; `.pie p` ya fija `margin: 0`) y el `max-width` de `.pie__contacto` (anulado por `.pie p{max-width:none}`, de mayor especificidad). Sin cambio visual: ambas reglas eran inertes.
- **F4 (etiqueta Header):** `marca__sub` pasa de "Prototipo OT-04" a "Prototipo OT-05" (coherente con pie y alcance de la unidad). `dist/index.html` lo emite 2 veces (cabecera + pie).
- **F3 (ratificación `tests/diseno.test.mjs`):** RATIFICADO POR EL COORDINADOR — **APROBADO conservar el ajuste**, con esta nota como constancia. La aserción de destinos acepta la forma ruteada `href: "#…"` (datos en `src/config/navegacion.ts`) además de la forma en línea. La capa de verificación no se pierde: `tests/shell.test.mjs` (OT-Q014) cubre emisión y resolución de cada ancla sobre `dist/index.html` (toda ancla resuelve a id único; 13/13 categorías mapeadas; pendientes con repliegue y `title`). **No merece revertir**: revertirlo rompería `diseno.test.mjs` sin ganar cobertura, pues el test original presupone destinos en línea y la arquitectura aprobada es fuente única de ruteo.

### Re-ejecución tras F1–F4 (local, sin red)

| Comando | Salida / exit |
|---|---|
| `node --test tests/` (post-build) | 69 tests, 65 pass, 0 fail, 4 skipped (OT-Q011/Q012 preexistentes), exit 0 |
| `pnpm check` | 13 ficheros, 0 errores/avisos, exit 0 |
| `pnpm build` | 1 página en ~668 ms, `Complete!`, exit 0 |

Sin commit (indicación del encargo).
