# OT-08 «SEO y configuración pública» — Evidencia de implementación

**ID:** OT-08 · **Fecha:** 2026-09-20 · **Escritor:** Muse Spark 1.3 Contributor (implementador)
**Base:** apps/oterco Astro estático · puerta `isPublicable(perfilBase) === "tecnica"` (OT-02, sin aprobaciones)

## 1. Decisiones de entorno

- **Hostname aprobado = pendienteAP (OT-15/OT-16).** Ningún artefacto inventa dominio real:
  base reservada no vinculante (NO-BINDING) `https://oterco-pendiente-ap.invalid`
  (sufijo `.invalid`, nunca resuelve), marcada `pendienteAP` en `publico.ts`,
  `robots.txt`, `sitemap.xml` y comentarios de canonical.
- **La salida NO depende de contacto/NIT.** Esos campos solo entran vía
  `proyeccionPublica()` cuando la puerta da `"comercial"`; el canonical real exige
  además `DOMINIO_APROBADO` (hoy `null`), así que incluso la rama comercial emite
  `canonical: null` con motivo pendienteAP. NIT/buzón sin resolver: OT-15.
- **Dist técnico intacto:** portada conserva title/description/robots fixture de OT-05
  y cero elementos ejecutables (OT-Q013/Q015/Q024 sin tocar). El bloque LD+JSON solo
  existe como constructor puro para la rama comercial; en técnico `jsonLdParaPagina`
  devuelve `null` (cableado en BaseLayout pendiente de OT-15).
- **schema.org no define tipo Granja/Finca:** las fincas se expresan como `Place` en
  `department` de `Organization`, con solo transcripción no conflictiva. Solar, NIT,
  contacto y afirmación de fotos entran únicamente si la proyección los trae aprobados.
- **robots/sitemap por entorno:** técnico = `Disallow: /` (coherente con noindex);
  la variante comercial (`Allow` + `Sitemap` sobre base reservada) vive en
  `generarRobots("comercial")` para el release futuro, no en `public/`.
- **404 y privacidad no son relleno:** 404 estático en `public/404.html` (sin SSR, sin
  fallback SPA, sin ejecutables, `noindex`); privacidad autónoma sin banner
  (cero cookies ⇒ nada que consentir) y sin canales publicados.

## 2. Archivos (6 nuevos de código/contenido + 1 test + evidencia; 0 modificados)

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/oterco/src/config/publico.ts` | ~230 | Fuente única: entorno, metadatos, canonical, LD+JSON, robots, sitemap, headers |
| `apps/oterco/public/robots.txt` | 4 | Cierre total técnico + base reservada marcada |
| `apps/oterco/public/sitemap.xml` | 6 | `/` y `/privacidad/` sobre base reservada marcada |
| `apps/oterco/public/_headers` | 14 | CSP cero-scripts, nosniff, referrer/permissions base, cache por destino |
| `apps/oterco/public/404.html` | ~35 | 404 estático noindex con enlace útil |
| `apps/oterco/src/pages/privacidad.astro` | ~80 | Aviso técnico autónomo (canales pendientes, cero cookies/analítica) |
| `apps/oterco/tests/seo.test.mjs` | ~300 | 18 pruebas Q035/036/040/041/043 (dist + unidades puras) |
| `docs/implementacion/OT-08/EVIDENCIA.md` | — | Este fichero |

`git status` (apps/oterco): solo `?? public/`, `?? src/config/publico.ts`,
`?? src/pages/privacidad.astro`, `?? tests/seo.test.mjs`. Ningún archivo rastreado
modificado: BaseLayout, tests previos y datos intactos.

## 3. Comandos y resultados (locales, sin red)

| Comando (apps/oterco) | Salida | Exit |
|---|---|---|
| `pnpm build` (Astro estático) | 2 páginas (`/`, `/privacidad/`) + públicos copiados a dist | 0 |
| `node --test tests/seo.test.mjs` | **pass 18, fail 0** (5 suites Q040/Q041/Q043/Q035/Q036) | 0 |
| `pnpm test` (suite completa tras build) | **pass 138, fail 0, skip 4** (142 tests; skips heredados OT-03) | 0 |
| `pnpm check` (astro check + TS estricto, 27 ficheros) | 0 errores, 0 avisos, 1 hint heredado (`execCommand` OT-07) | 0 |

Dist verificado: `404.html`, `_headers`, `robots.txt`, `sitemap.xml`, `privacidad/index.html`
presentes. `dist/robots.txt`, `dist/sitemap.xml`, `dist/_headers` idénticos a la salida de
`generarRobots/generarSitemap/generarHeaders` (aserción en test, no afirmación manual).

## 4. Mapa pruebas ↔ casos

| Caso | Estado | Dónde se prueba |
|---|---|---|
| OT-Q040 metadatos/robots/sitemap coherentes | **pasado** | `seo.test.mjs`: head técnico = fuente única; rama comercial sintética sin promesas; LD+JSON solo aprobados; robots/sitemap/headers = generadores |
| OT-Q041 404 real sin fallback SPA | **pasado (fichero + humo local)** | `seo.test.mjs`: `404.html` estático (noindex, sin ejecutables/refresco/SPA) + servidor 127.0.0.1 efímero: `/ruta-inexistente` → 404 con cuerpo, `/` → 200 |
| OT-Q043 sin secretos/internos | **pasado** | `seo.test.mjs`: barrido de todo dist textual (email, NIT, opencode, sourcemaps, pem, privados, `.env`); HTML sin URLs remotas reales ni file:// |
| OT-Q035 contacto tras preparador deshabilitado | **pasado** | `seo.test.mjs`: portada pendienteAP sin mailto/tel/mensajería; privacidad sin canales publicados |
| OT-Q036 privacidad fiel, sin banner | **pasado** | `seo.test.mjs`: H1 único, cero cookies declarado, ningún elemento banner/consentimiento, proveedores reales (estático, sin analítica, humo OT-16) |

## 5. Casos no ejecutados / pendientes del operador

- **Humo remoto (OT-16):** HTTPS, 404 con estado real en destino, cabeceras efectivas
  (`_headers`), canonical tras dominio aprobado. El test Q041 solo demuestra emisión
  contra servidor local; la verificación en destino Free la hace el operador.
- **Hostname/HTTPS final = OT-15/OT-16 (bloqueo documentado, no stop):** al aprobarse el
  dominio, regenerar `robots.txt`/`sitemap.xml` con la base real, cablear canonical +
  LD+JSON comercial en BaseLayout y re-verificar Q040/Q042 en humo.
- **Revisión visual:** no aplica (sin cambios de UI en la portada; 404/privacidad usan
  marcado base sin diseño nuevo). Sin capacidad de captura en esta unidad; no se afirma
  revisión visual.
- **Revisión independiente** (DeepSeek V4.1 Flash) de la unidad; luego el coordinador
  actualiza ESTADO/acta.

## 6. Riesgos y límites

- `public/_headers` usa sintaxis de cabeceras estáticas por destino; su efecto real solo
  se acredita con el humo de OT-16 (las cabeceras las aplica el hosting, no el build).
- El perfil comercial de `seo.test.mjs` es un clon sintético de prueba, no una aprobación;
  `perfil.datos.ts` sigue con `aprobaciones: []` y la puerta sigue en `tecnica`.
- `script-src 'none'` en CSP es coherente con el dist actual (cero scripts); al cablear
  el preparador o LD+JSON comercial deberá revisarse (OT-10/OT-15).

## 7. Corrección delimitada post-revisión (F1–F8, 2026-09-20, sin commits)

Hallazgo de la revisión: los marcadores internos (`09_FUENTES/…`, `O-D01..O-D04`,
`O-IMG01..06`, `OT-Q*`) no deben salir en dist. Ajustes aplicados (código real +
pruebas; sin tocar especificaciones, actas ni planes):

- **F1 — dist sin marcadores internos.** Retirados de todo lo emitido:
  `data-fuente`/`data-tratamiento` de `BloqueGanadoManejo`, `BloqueInfraestructura`
  (párrafos y comentarios HTML `OT-Q023`/`OT-Q006` → texto neutro),
  `BloqueFincas` (`data-fuente="O-D01"`) y `BloquePortafolio` (filas);
  `data-source`/`data-fuente` de `FotoPendiente` (etiqueta `aria-label` neutra,
  motivo `resolverRecurso()` sustituido por texto neutro — la ruta interna de
  extracción ya no se emite) y `data-source="sin-asignar"` del hero de
  `index.astro`; pie `figcaption` → "Fuente interna reservada. Fotografía de la
  finca — pendiente de aprobación."; lista de omitidos del cierre → un `li`
  neutro por omisión ("detalle interno reservado"); comentarios CSS con códigos
  → texto neutro. La trazabilidad viva queda en código fuente (props `sourceId`,
  `SLOTS`, comentarios de código, `resources.ts` y datos): **`resources.ts` no
  requirió cambios** — sus literales (`usoPropuesto`, motivo de
  `resolverRecurso()`, huellas `O-IMG`) nunca se renderizan; la fuga estaba en
  el punto de emisión (`FotoPendiente`), ya neutralizado. Barrido de
  `seo.test.mjs` ampliado con `data-source` (además de `09_FUENTES`, `O-D0`,
  `O-IMG0`, `OT-Q`, `data-fuente` y resto); `capitulos.test.mjs` actualizado: la
  correspondencia huella↔slot se verifica por orden de documento contra
  `FUENTES_ORIGINALES` (código), no por atributos trazadores. Verificación:
  `grep -rIno '09_FUENTES|O-D0[1-4]|O-IMG0[1-6]|OT-Q[0-9]*|data-fuente|data-source'
  dist/` → **0 coincidencias** tras `pnpm build`.
- **F2 — favicon + OpenGraph locales.** `public/favicon.svg` (monograma
  tipográfico "O", sin marca ajena) + en `BaseLayout`: `link rel="icon"`,
  `og:title`/`og:description` (metadatos actuales) y `og:type=website`; sin
  `og:url`/`og:image` hasta dominio/fotos aprobados. Test propio en
  `seo.test.mjs` ("head local: favicon propio + OpenGraph mínimo…"): pasado.
- **F4 — sitemap técnico sin elementos `url`.** `public/sitemap.xml` y
  `generarSitemap()` emiten `urlset` vacío con solo comentario fixture
  pendienteAP (base reservada + rutas reservadas para la release comercial).
  Incidencia hallada al re-ejecutar: el comentario original contenía el literal
  `<url>` y disparaba el propio barrido negativo; reescrito como "sin elementos
  url" en generador y fichero (salidas idénticas, aserción en test). Pasado.
- **F6 — conteo `_headers`:** 13→**14** líneas (tabla §2 corregida; `wc -l`
  `public/_headers` = 14, idéntico en `dist/_headers`).
- **F8 — `location` en vez de `department`.** `publico.ts` expresa las fincas
  como `Place` en `location` de `Organization` (`department` espera
  `Organization` según esquema); test actualizado (`grafo.location.length ===
  2`, sin tipo `Farm` inventado). Pasado.
- **F3/F5 — decisiones documentadas:** la base reservada NO-BINDING aparece
  **solo** en `robots.txt` y `sitemap.xml` (verificado con grep en dist: 2
  ficheros), nunca como canonical/OG/URL real; páginas auxiliares decididas:
  `404.html` estático + `privacidad.astro` autónoma (sin banner, cero cookies);
  idioma `lang="es"` en las 3 páginas del dist (decisión del coordinador;
  contenido sin variante regional aún).

### Comandos re-ejecutados (locales, sin red; apps/oterco)

| Comando | Salida | Exit |
|---|---|---|
| `pnpm build` (tras F1/F4) | 2 páginas + públicos copiados a dist | 0 |
| `pnpm test` (suite completa tras build) | **pass 139, fail 0, skip 4** (143 tests; 4 skips heredados OT-03; `seo.test.mjs` 19/19) | 0 |
| `pnpm check` (astro check + TS estricto, 27 ficheros) | 0 errores, 0 avisos, 1 hint heredado (`execCommand` OT-07) | 0 |

Nota de cuentas: `seo.test.mjs` contiene 19 bloques `it` (no 18) y ~344 líneas;
la tabla §2 queda como historia de la primera emisión y esta sección como fe de
la corrección. Archivos tocados por la corrección (además de los §2):
`src/components/FotoPendiente.astro`, `BloqueFincas/GanadoManejo/Infraestructura/
Portafolio.astro`, `src/layouts/BaseLayout.astro`, `src/pages/index.astro`,
`src/styles/base.css`, `src/config/publico.ts` (comentario sitemap),
`public/sitemap.xml`, `tests/seo.test.mjs`, `tests/capitulos.test.mjs`.
Sin commits (el operador/coordinador decide el siguiente).
