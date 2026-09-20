# OT-09 «Integración funcional y fronteras» — Reporte de implementación

**ID:** OT-09 · **Fecha:** 2026-09-20 · **Escritor:** Muse Spark 1.3 Contributor (implementador)
**Base:** dist vigente tras `pnpm build` (2 páginas + 404/robots/sitemap/_headers/favicon + 1 CSS con hash);
preparador deshabilitado (`PREPARADOR_ENABLED === false`); puerta editorial en `tecnica`.

## 1. Decisiones

- **Dos suites nuevas, cero cambios de código.** La integración no detectó defectos
  funcionales (todas las anclas resuelven, la emisión 200/404 es correcta, los
  artefactos son coherentes entre sí), así que no hubo correcciones antes/después
  que registrar: `git status` muestra solo los dos tests nuevos, ningún fuente tocado.
- **`apps/oterco/tests/integracion.test.mjs`** (7 suites, 14 tests): integración sobre
  el compilado con servidor local efímero (`node:http` en 127.0.0.1, sin paquetes
  nuevos). Cubre carga de index/privacidad/404, resolución de anclas en las 3 páginas,
  coherencia noindex⟺robots⟺sitemap⟺CSP, emisión 200/404 real (incluida `/privacidad`
  con y sin barra), navegación sin JS y registro honesto con JS.
- **`apps/oterco/tests/frontera.test.mjs`** (7 suites, 19 tests + 1 skip): verificadores
  de frontera Q001/Q003/Q004/Q009/Q021/Q031–Q034/Q050. "Código efectivo" = fuente sin
  comentarios: una mención nominativa en un comentario ("NO es la identidad de Puerta
  Abierta") o en prosa de un README no es un import/recurso; el test lo distingue y
  deja constancia explícita (test `.md` propio).
- **Falsos positivos del primer run, corregidos en el test (no en el sitio):**
  1. `README.md` de fuentes con mención nominativa → el barrido Q001 de código se
     restringe a `.astro/.ts/.css/.js/.mjs` + test `.md` separado.
  2. `http://www.w3.org/2000/svg` (favicon) y `http://www.sitemaps.org/...` (sitemap)
     no son red remota sino identificadores de esquema → eximidos con comentario.
- **"Con JS" honesto, no falsado.** dist publica 0 scripts y 0 puntos de montaje, así
  que el comportamiento con JS habilitado es idéntico al sin JS por construcción. El
  test lo afirma estructuralmente y registra que el E2E con navegador real queda para
  OT-10/OT-12, sin fingir una ejecución que no ocurrió.
- **Q003 copia limpia = skip honesto** (precedente OT-01): requiere borrar
  `node_modules` y red al registro; queda al operador/CI. Todo lo verificable en
  estático (pin, lockfile, VERSIONES.md) se afirma.

## 2. Archivos (2 nuevos; 0 modificados)

| Archivo | Tests | Rol |
|---|---|---|
| `apps/oterco/tests/integracion.test.mjs` | 14 pass | E2E local sobre dist: páginas, anclas, coherencia, emisión 200/404, sin/con JS, preparador apagado |
| `apps/oterco/tests/frontera.test.mjs` | 19 pass + 1 skip | Fronteras Q001/Q003/Q004/Q009/Q021/Q031–Q034/Q050 en código efectivo y dist |
| `docs/implementacion/OT-09/REPORTE.md` | — | Este fichero |

## 3. Comandos y resultados (locales, sin red)

| Comando (apps/oterco salvo nota) | Salida | Exit |
|---|---|---|
| `pnpm test` (línea base, antes de OT-09) | pass 139, fail 0, skip 4 (143 tests) | 0 |
| `pnpm check` (línea base) | 0 errores, 0 avisos, 1 hint heredado (`execCommand` OT-07) | 0 |
| `pnpm build` (tras OT-09, verifica dist fresco) | 2 páginas (`/`, `/privacidad/`) en 741 ms | 0 |
| `node --test tests/integracion.test.mjs tests/frontera.test.mjs` | **pass 33, fail 0, skip 1** (34 tests; skip = Q003 copia limpia) | 0 |
| `pnpm test` (suite completa tras OT-09) | **pass 172, fail 0, skip 5** (177 tests; 4 skips heredados OT-03 + 1 Q003) | 0 |
| `pnpm check` (tras OT-09, 27 ficheros) | 0 errores, 0 avisos, 1 hint heredado | 0 |
| `node --test tests/integracion.test.mjs tests/frontera.test.mjs` (tras ajustes H1/H2) | **pass 34, fail 0, skip 1** (35 tests; +1 test frontera de host H1, título honesto H2) | 0 |
| `pnpm test` (suite completa tras ajustes H1/H2) | **pass 173, fail 0, skip 5** (178 tests; 4 skips heredados OT-03 + 1 Q003) | 0 |
| `git status --short` (raíz 02_OTERCO) | `?? apps/oterco/tests/frontera.test.mjs`, `?? apps/oterco/tests/integracion.test.mjs`, `?? docs/implementacion/OT-09/` | 0 |

## 4. Estado por caso (ficha OT-09)

| Caso | Estado | Dónde / nota |
|---|---|---|
| OT-Q001 sin restos de PA | **pasado** | `frontera`: código efectivo sin marca/imports/recursos PA (rutas conocidas verificadas por inspección: blocks/channels/coverage/features, tokens/global, Manrope/Source Sans, coverage-interaction/hero-urban); dist limpio; 1 app + 1 lockfile |
| OT-Q003 lockfile auténtico | **pasado parcial** | `frontera`: pin pnpm 11.26.0 = gestor en ejecución; astro 5.15.9/@astrojs/check 0.9.6/TS 5.9.3 en package.json, lockfile y VERSIONES.md. Copia limpia **no ejecutada** (skip honesto) |
| OT-Q004 astro check en pipeline | **pasado** | `frontera`: `check → astro check` en app y raíz; tsconfig `strict` heredado de Astro; run real `pnpm check` en §3 (0 errores) |
| OT-Q009 cambio localizado | **pasado** | `frontera`: 9 literales de contenido solo en `perfil.datos.ts` + espejos declarados (`perfil.esperado.ts`, `resources.ts` huella, `motor.ts` con paridad); capa de render (pages/components/layouts) sin duplicar |
| OT-Q021 dist sin privados | **pasado** | `frontera`: allowlist de primer nivel (8 entradas); `_astro` solo CSS con hash; sin base64/PEM/inventory/ocultos |
| OT-Q031 sin duplicar listeners | **pasado (frontera; comportamiento real → OT-10/OT-15)** | `frontera`: `addEventListener` solo en `src/tools/preparador/` (fuera de dist); dist con 0 scripts/listeners |
| OT-Q032 módulo apagado | **pasado (frontera; comportamiento real → OT-10/OT-15)** | `frontera` + `integracion`: flag `false`; 3 páginas sin ancla/marcas/recursos del módulo |
| OT-Q033 sin persistencia | **pasado (frontera; comportamiento real → OT-10/OT-15)** | `frontera`: dist sin localStorage/sessionStorage/indexedDB/cookie |
| OT-Q034 sin JS intacto | **pasado** | `frontera` + `integracion`: `#portafolio`/`#cierre` en estático; sin mailto/tel; índice `<details>` operativo |
| OT-Q050 sin extras | **pasado** | `frontera`: código efectivo y dist sin fetch/XHR/D1/API/CRM/IA/analytics/autoplay/modo oscuro; sin URL remota real (namespaces XML eximidos) |
| Emisión 404 real (Q041, integración) | **pasado (humo local)** | `integracion`: `/` y `/privacidad[​/]` → 200; 3 rutas inexistentes → 404 con cuerpo |
| Anclas/enlaces (Q014, integración) | **pasado** | `integracion`: toda ancla resuelve a id único en las 3 páginas; índice = secciones; repliegues `/` |

## 5. Hallazgos reproducibles

- **H1 (verificado, no defecto):** las ocurrencias de "puerta" en dist son "Puerta Roja"
  (finca transcrita) y "puerta editorial" (concepto de OT-02), nunca la marca Puerta
  Abierta. Comando: `grep -rIo "puerta-abierta\|Puerta Abierta" apps/oterco/dist` → 0.
- **H2 (verificado, no defecto):** `mailto:`/`tel:` solo existen en `src/tools/preparador/`
  (módulo deshabilitado, decisión por puerta editorial); dist limpio en las 3 páginas.
- **H3 (test, corregido):** dos falsos positivos del barrido inicial (namespace SVG y de
  sitemap; mención nominativa en README) — corregidos en el test con exención
  documentada, sin tocar el sitio. No hay corrección antes/después de código.
- **Reproducibilidad del build:** `pnpm build` tras OT-09 no alteró ningún rastreado
  (`git status` limpio salvo los 2 tests) — el dist es estable.

## 6. Casos no ejecutados / pendientes

- **Q003 copia limpia:** skip honesto (borrado de `node_modules` + red; operador/CI).
- **Navegador real con/sin JS** (teclado, foco visible, 320/390 px, zoom, contraste):
  no ejecutado — sin capacidad de captura en esta unidad; pendiente **OT-10/OT-12**.
- **Humo remoto** (HTTPS, 404 y cabeceras `_headers` en destino Free): pendiente **OT-16**.
- **Revisión independiente** (DeepSeek V4.1 Flash) y cierre/ESTADO por el coordinador.

## 7. Riesgos y límites

- Los tests de emisión usan un servidor local mínimo, no el hosting real: acreditan
  códigos y cuerpos, no HTTPS ni cabeceras efectivas (OT-16).
- La allowlist de dist deberá ampliarse cuando se publiquen derivados/fuentes (OT-03)
  o se cablee el preparador (OT-15): hoy son 8 entradas de primer nivel.
- Dependencias sin cambios: Astro 5.15.9, @astrojs/check 0.9.6, TS 5.9.3 —
  `VERSIONES.md` no requirió actualización.
- Alcance respetado: sin ampliar funciones, sin publicar, sin tocar
  especificaciones, `00_CONTROL`, `07_PLAN`, `10_OPENCODE` ni `.opencode`; 0 scripts y
  noindex intactos en dist.

## 8. Siguiente acción propuesta

Revisión independiente de la unidad y cierre del coordinador (ESTADO/acta);
continuar con **OT-10** (E2E con navegador real: teclado, foco, 320/390, capturas).
