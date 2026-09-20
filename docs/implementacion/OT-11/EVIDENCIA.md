# OT-11 — Rendimiento y seguridad estática · EVIDENCIA

**Unidad:** OT-11 · **Implementador:** Muse Spark 1.3 Contributor · **Fecha (UTC):** 2026-09-20
**Base:** dist técnico tras `pnpm build` (2 páginas, 1 CSS, 0 scripts, 0 imágenes servidas, tipografías no cableadas).
**Alcance respetado:** solo `apps/oterco/scripts/medir.mjs` (nuevo), `apps/oterco/tests/presupuesto.test.mjs` (nuevo),
`docs/implementacion/OT-11/EVIDENCIA.md` (nuevo). `public/_headers` se inspeccionó, se probó un cambio y se
**revirtió** (sigue idéntico a OT-08); `src/config/publico.ts`, especificaciones y estado del coordinador intactos.

## 1. Medición reproducible (`node scripts/medir.mjs`)

Método registrado (exigido por OT-Q037): **gzip RFC 1952 vía `node:zlib gzipSync`, nivel 9 (defecto de zlib)**,
herramienta `node v26.8.2 + zlib 1.3.1.zlib-ng`, plataforma `linux-x64`. **Brotli no usado** (prohibido comparar
Brotli con gzip para aparentar cumplimiento). Salida: `node scripts/medir.mjs [--json]` (exit 0).

| Archivo dist | Crudo (B) | gzip (B) |
|---|---|---:|
| index.html | 12.389 | 3.558 |
| _astro/index.Bv-PV3J3.css | 6.111 | 1.931 |
| favicon.svg | 355 | 268 |
| privacidad/index.html | 2.487 | 1.243 |
| 404.html | 1.904 | 967 |
| robots.txt | 189 | 178 |
| sitemap.xml | 344 | 278 |
| _headers | 890 | — (config Cloudflare Pages, no transferencia) |

**Transferencia inicial de la portada** (caché vacía, sin interacción: `index.html` + CSS referenciado + favicon):
**18.855 B crudos / 5.757 B gzip**. **Carga incremental del preparador: 0 bytes** (módulo deshabilitado,
`PREPARADOR_ENABLED=false`; dist sin `data-preparador`, sin mailto, sin scripts). Fuentes servidas: ninguna
(no cableadas). Fotos servidas: ninguna (derivados pendientes del operador).

## 2. Presupuestos vs límites

| Medida | Valor | Límite / objetivo | Estado |
|---|---|---:|---|
| Transferencia inicial (OT-Q037) | 18.855 B | ≤ 1.000.000 B | **CUMPLE** (1,9 %) |
| JS inicial gzip (OT-Q037) | 0 B | ≤ 15.000 B | **CUMPLE** |
| JS incremental preparador gzip (OT-Q038) | 0 B | ≤ 10.000 B | **CUMPLE** |
| CSS inicial gzip (OT-Q038) | 1.931 B | ≤ 40.000 B | **CUMPLE** (4,8 %) |
| Fuentes totales (objetivo) | 0 B | ≤ 160.000 B | medido, sin deuda |
| Foto principal (objetivo) | 0 B | ≤ 250.000 B | medido, pendiente operador |

Ningún presupuesto se excede ⇒ **sin optimización localizada** (no se tocó 404, base.css ni contenidos;
contacto/contraste/lectura intactos). Re-medición obligatoria cuando se cableen fuentes, fotos o preparador.

## 3. Decisiones de cabeceras (sin cambios aplicados)

- **CSP vigente (OT-08, intacta):** `default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self';
  frame-ancestors 'self'; form-action 'none'`. `script-src 'none'` verificado contra dist sin `<script>` (test).
- **Cambio evaluado y REVERTIDO:** se probó añadir `style-src 'self' 'unsafe-inline'` + `img-src 'self'` y se
  revirtió porque el criterio OT-08 vigente lo prohíbe (`seo.test.mjs:195` «sin aperturas inseguras») y el
  encargo prohíbe modificar criterios para hacer pasar fallos. `public/_headers` = `dist/_headers` = salida de
  `generarHeaders()` (coherencia verificada por suite previa, en verde).
- **img-src aplicable actual:** sin directiva ⇒ rige `default-src 'self'`; `data:` innecesario y coherente con
  la prohibición de base64 fotográfico. Sin cambios.
- **Caché:** `/*` → `max-age=0, must-revalidate` (HTML mutable sin `immutable` ✓); `/_astro/*` →
  `max-age=31536000, immutable` (solo hashed ✓). 404 efectivo verificado (existe, sin scripts ni refresco;
  humo remoto con estado real pendiente en OT-16).

## 4. Comandos y salidas (exit codes)

| Comando | Salida | Exit |
|---|---|---:|
| `node scripts/medir.mjs` | tabla §1 + 4× CUMPLE | 0 |
| `node --test tests/presupuesto.test.mjs` | 14 tests, 14 pass | 0 |
| `pnpm build` | 2 páginas, completo | 0 |
| `pnpm test` (suite completa) | 215 tests · 210 pass · 5 skipped (preexistentes) · 0 fail | 0 |
| `npx --no-install lighthouse --version` | `lighthouse` ausente; npm intentó descarga y se canceló (sin red remota autorizada) | — (no ejecutado) |

## 5. Estado de casos

| Caso | Estado | Nota |
|---|---|---|
| OT-Q021 | **pasado** | dist sin base64/privados/certificados (complemento OT-11; base en recursos.test.mjs) |
| OT-Q022 | **pasado** | slots con `data-dims` + `aspect-ratio`; srcset/sizes cubiertos en recursos.test.mjs |
| OT-Q037 | **pasado** | 18.855 B ≤ 1 MB; JS 0 ≤ 15.000 gzip; método registrado §1 |
| OT-Q038 | **pasado** | incremental 0 ≤ 10.000 gzip; CSS 1.931 ≤ 40.000; fuentes/foto medidas (0 B) |
| OT-Q039 | **no ejecutado** | Lighthouse ausente en el entorno; procedimiento para operador en §6 (→ OT-16) |
| OT-Q042 | **pasado con riesgo R1** | CSP/caché/404 coherentes; tensión inline-styles documentada abajo, sin romper criterio OT-08 |
| OT-Q043 | **pasado** | sin sourcemaps/.env/.pem/inventory/secretos/config OpenCode en dist |
| OT-Q050 | **pasado** | sin API/D1/IA/CRM/analítica/CAPTCHA/persistencia/autoplay; preparador sin recursos exclusivos |

Casos no ejecutados: OT-Q039 (Lighthouse, pendiente operador). Sin fallos. Skips de suite: 5 preexistentes
(fuentes WOFF2 y cruce de hash con originales del operador), ajenos a esta unidad.

## 6. Procedimiento Lighthouse para el operador (OT-Q039 → OT-16)

Sin simular scores. En máquina con Chrome + `lighthouse` instalado, sobre el **candidato publicado en destino
Free aprobado** (no localhost de desarrollo), viewport móvil, red/CPU simuladas por Lighthouse, caché vacía:

```
npx lighthouse <URL_CANDIDATO> --preset=desktop --output=json --output-path=./lh-escritorio.json
npx lighthouse <URL_CANDIDATO> --only-categories=performance,accessibility,best-practices,seo \
  --throttling-method=simulate --form-factor=mobile --screenEmulation.mobile \
  --output=json --output-path=./lh-movil-1.json
# Repetir la ejecución móvil 2 veces más (lh-movil-2.json, lh-movil-3.json) en condiciones comparables
# (misma hora/red, sin otras cargas). Mediana de las 3 puntuaciones móviles ≥ 90.
```

Registrar navegador/versión, viewport, CPU/red simuladas, caché, commit, momento y las 3 puntuaciones.
Archivar JSON + acta en `docs/implementacion/OT-16/`. Las mediciones de laboratorio no sustituyen rendimiento
de campo (no afirmar field data).

## 7. Riesgos y siguiente acción

- **R1 (Q042, abierto):** con CSP aplicada, los `style="aspect-ratio…"` (×6, OT-06) y el `<style>` autónomo del
  404 (OT-10.F4) quedarían bloqueados por `default-src 'self'` sin `style-src`. Opciones para el coordinador:
  (a) aceptar degradación cosmética bajo CSP; (b) autorizar `style-src 'self' 'unsafe-inline'` (relaja criterio
  OT-08, exige acta); (c) externalizar estilos inline (nueva unidad, toca OT-06/OT-10). Ninguna aplicada aquí.
- **R2:** al cablear fuentes/fotos/preparador, re-ejecutar `medir.mjs` + suite; los presupuestos pueden
  tensionarse (foto principal ≤ 250.000 B, fuentes ≤ 160.000 B).
- **Siguiente acción:** coordinador valida esta evidencia, decide R1 y agenda OT-12; operador ejecuta §6 en OT-16.

## 8. Corrección delimitada OT-11 (2026-09-20) — R1 resuelto por vía (c)

**Decisión del encargo:** externalizar estilos inline; CSP estricta intacta
(`script-src 'none'`, sin allowlist `unsafe-inline`).

- `src/components/FotoPendiente.astro`: eliminados los 6 `style="aspect-ratio:
  W/H"` inline; cada slot suma la clase utilitaria `.slot--WxH` (mapa
  estático dims→clase; O-IMG02/O-IMG03 comparten `slot--1100x733`).
- `src/styles/base.css`: 5 clases nuevas
  (`.slot--603x423`, `.slot--1100x733`, `.slot--485x650`, `.slot--1208x605`,
  `.slot--986x638` con su `aspect-ratio`); la regla del bebedero
  `detalle-vertical[data-dims="485x650"]` conserva solo topes de columna
  (la proporción la aporta `.slot--485x650`). Sin `style=` ni `<style>` en
  `dist/*.html` (verificado por grep + tests).
- `public/404.html`: revertido el `<style>` embebido OT-10.F4 por decisión de
  la coordinadora (CSP eficaz a futuro, Q042; nota en
  `docs/implementacion/OT-10/EVIDENCIA.md`). Skip-link a `#contenido`
  funcional y visible en flujo nativo (sin absolutizar). Sin scripts, sin
  `noindex` alterado.
- Tests: `capitulos.test.mjs` verifica clase `.slot--WxH` + `aspect-ratio` en
  `base.css` y ausencia de `style=` por slot; `presupuesto.test.mjs` añade la
  aserción "0 style= inline en `dist/*.html`" (index/404/privacidad, Q042/CSP)
  y reescribe la prueba de tensión R1 como resolución. `seo.test.mjs` intacto
  (criterio OT-08 sin aperturas).
- **CSS emitido con hash nuevo** por el cambio de contenido:
  `_astro/index.Bv-PV3J3.css` → `_astro/index.C1V1LZ87.css`.

### 8.1. Re-medición (`node scripts/medir.mjs`, exit 0)

| Archivo dist | Crudo (B) | gzip (B) | Δ crudo vs §1 |
|---|---|---:|---:|
| index.html | 12.275 | 3.516 | −114 |
| _astro/index.C1V1LZ87.css | 6.387 | 2.005 | +276 (hash nuevo) |
| favicon.svg | 355 | 268 | = |
| privacidad/index.html | 2.487 | 1.243 | = |
| 404.html | 1.650 | 881 | −254 (sin `<style>`) |
| robots.txt | 189 | 178 | = |
| sitemap.xml | 344 | 278 | = |
| _headers | 890 | — (config) | = |

**Transferencia inicial de la portada:** **19.017 B crudos / 5.789 B gzip**
(§1: 18.855/5.757; +162/+32 por las clases utilitarias). **CSS inicial:
2.005 B gzip** (límite 40.000, 5,0 %). JS inicial 0, incremental preparador 0.
Todos los presupuestos **CUMPLEN**.

### 8.2. Comandos re-ejecutados (exit codes)

| Comando | Salida | Exit |
|---|---|---:|
| `pnpm build` | 2 páginas, completo | 0 |
| `pnpm test` (suite completa) | 216 tests · 211 pass · 5 skipped (preexistentes) · 0 fail | 0 |
| `pnpm check` | 0 errors, 0 warnings, 1 hint (preexistente, `execCommand` en preparador deshabilitado) | 0 |
| `node scripts/medir.mjs` | tabla §8.1 + 4× CUMPLE | 0 |

Casos: Q042 pasa con **R1 cerrado** (vía (c), sin `unsafe-inline`); resto sin
cambios (§5). `seo.test.mjs` sin tocar. Sin commits.

## Diff de la unidad

- `apps/oterco/scripts/medir.mjs` (nuevo, ~200 líneas, node sin deps).
- `apps/oterco/tests/presupuesto.test.mjs` (nuevo, 14 tests OT-Q021/Q022/Q037/Q038/Q042/Q043/Q050).
- `docs/implementacion/OT-11/EVIDENCIA.md` (este archivo).
- `public/_headers`, `src/*`, `dist/*` (rebuild), especificaciones: **sin cambios netos**.
