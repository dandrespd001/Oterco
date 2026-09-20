# OT-07 «Preparador local de consulta» — Evidencia de implementación

**ID:** OT-07 · **Fecha:** 2026-09-20 · **Escritor:** Muse Spark 1.3 Contributor (implementador)
**Base:** apps/oterco Astro estático · contacto de `perfilBase.contacto` SIN aprobar (OT-02)

## 1. Decisión de mailto/copia con estados

- `destino.ts:resolverDestino()` habilita `mailto:` **solo si** `contacto.estado === "aprobado"`
  **+** `verificado === true` **+** token `"contacto"` en `aprobaciones` **+** formato de buzón
  revalidado. Cualquier otro caso → modo copia.
- En dist vigente (contacto pendiente, `aprobaciones: []`) la decisión es `pendienteAP`:
  el preparador muestra el segmento «contacto pendiente de aprobación», el correo queda
  deshabilitado con el motivo en `title` y el buzón real nunca llega al HTML.
- `PREPARADOR_ENABLED = false` (`config.ts`): la página no importa el componente; dist no
  publica ningún recurso exclusivo del módulo (verificado en test: sin `data-preparador`,
  sin ancla `preparar-consulta`, sin `mailto:`). El flag se consume de verdad en
  `index.ts:cargarPreparador()` (punto único de entrada: con el flag apagado resuelve
  `null` sin importar nada; test runtime incluido) — corrección F1.
- El cableado a la página (import + ancla) queda pendiente de decisión del coordinador/
  aprobaciones OT-15; esta unidad es coherente y autocontenida sin fingir integración.

## 2. Archivos (todos nuevos; ningún archivo rastreado fue modificado)

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/oterco/src/tools/preparador/motor.ts` | 200 | Puro, sin dependencias: 3 categorías, asunto/cuerpo, límite 800 exacto |
| `apps/oterco/src/tools/preparador/destino.ts` | 138 | Puro: decisión mailto/copia + construcción segura del URI |
| `apps/oterco/src/tools/preparador/config.ts` | 17 | `PREPARADOR_ENABLED=false` + ancla; controla importación en build |
| `apps/oterco/src/tools/preparador/index.ts` | 26 | Punto único de entrada (F1): reexporta flag/ancla + `cargarPreparador()` condicionado |
| `apps/oterco/src/tools/preparador/activador.ts` | 52 | Cliente ligero (F2): `import()` dinámico del conector en el primer click |
| `apps/oterco/src/tools/preparador/cliente.ts` | 214 | Conector DOM: solo exporta montar/desmontar (F2: sin auto-montaje); sin storage/red/innerHTML |
| `apps/oterco/src/tools/preparador/Preparador.astro` | 248 | Marcado + `<noscript>`; sin elemento ejecutable (OT-Q013 intacto) |
| `apps/oterco/tests/preparador.test.mjs` | 234 | Pruebas puras motor/destino |
| `apps/oterco/tests/preparador-dist.test.mjs` | 185 | Proxies de arquitectura + F1/F2/F5 + dist compilado |

Decisiones de diseño registradas:

- Fuente única de títulos de oferta: `perfil.datos` (transcripción O-D01) →
  `crearCatalogo()` construye etiqueta/asunto de forma coherente (categoría para
  ganado-en-pie, título en los otros dos) y el catálogo por defecto se deriva de
  esa misma función sobre un espejo transcrito (`motor.ts` sigue sin importar el
  perfil; test fija `CATALOGO_PREPARADOR ≡ crearCatalogo(perfilBase.oferta)`, sin
  literales paralelos que diverjan). Etiqueta/asunto de pastaje: «Pastaje y levante
  por contrato». Asunto `Consulta OTERCO — …`;
  cuerpo `Deseo consultar sobre <línea>.` + mensaje + aviso de borrador. Sin precios.
- Longitud en puntos de código Unicode (`Array.from`): 800 aceptado, 801 rechazado; CRLF→LF,
  trim solo exterior; controles salvo `\n`/`\t` rechazados.
- El texto de usuario viaja como texto plano; la presentación usa `value`/`textContent`,
  nunca `innerHTML` (Q027 se cierra entre motor y conector).
- `mailto:` solo con `subject`+`body` codificados (`encodeURIComponent`); destino validado
  (sin saltos/cabeceras: el formato no los admite). URI > 2000 → variante solo-asunto +
  instrucción de copia. Ningún texto afirma envío.
- Panel inline (no modal): `<button type="button">`, `aria-expanded`, cierre con Escape con
  retorno de foco, sin atrapar Tab. Sin `target=_blank`.
- `cliente.ts` separado de `Preparador.astro` (contrato: `client.ts` + `Shell.astro`) para que
  el marcado no emita ejecutables y el proxy cero-scripts de OT-Q013 siga válido.

## 3. Comandos y resultados (locales, sin red)

| Comando (apps/oterco) | Salida | Exit |
|---|---|---|
| `node --test tests/preparador.test.mjs tests/preparador-dist.test.mjs` | pass 39, fail 0 | 0 |
| `pnpm check` (astro check + TS estricto, 22 ficheros) | 0 errores, 0 avisos, 1 hint (`execCommand` deprecado, fallback intencional) | 0 |
| `pnpm build` (Astro estático, 1 página) | Complete, 744–830 ms | 0 |
| `pnpm test` (suite completa tras build) | **pass 116, fail 0** (incluye OT-Q013/Q014/Q015/Q016 sin tocar) | 0 |
| Carga humo `cliente.ts` sin DOM (type-stripping Node 26) | exporta `desmontarPreparador,montarPreparador`, sin tocar `document` | 0 |
| Carga humo `motor.ts` | asunto/cuerpo exactos | 0 |

Incidente durante la unidad: el primer `Preparador.astro` con lógica inline rompió el proxy
cero-scripts de OT-Q013 (`shell.test.mjs` escanea todo `src/`). Se resolvió por arquitectura
(extracción a `cliente.ts`, componente solo marcado), **sin modificar ningún test existente**.

## 4. Mapa pruebas ↔ casos OT-Q025…OT-Q034

| Caso | Estado | Dónde se prueba |
|---|---|---|
| OT-Q025 tres categorías + vacío | **pasado** | `preparador.test.mjs` (asunto/cuerpo por tema, vacío OK, `crearCatalogo` desde oferta) |
| OT-Q026 800/801 + Unicode/saltos | **pasado** | `preparador.test.mjs` (800 OK/801 rechazo, tildes/emoji por puntos de código, CRLF, controles) |
| OT-Q027 HTML como texto | **pasado (lógica) / proxy (render)** | payload literal intacto en `preparador.test.mjs`; ausencia de `innerHTML`+uso de `textContent/value` en `preparador-dist.test.mjs` |
| OT-Q028 destino aprobado + anti-inyección | **pasado** | `preparador.test.mjs` (pendienteAP base sin filtrar buzón; aprobado completo; `\r\n`/`%0A` rechazados; URI con destino único, sin `cc/bcc`) |
| OT-Q029 encode + URI largo, sin éxito | **pasado (lógica) / proxy (texto)** | `preparador.test.mjs` (codificación, variante sin cuerpo, umbral 2000); ausencia de frases de envío en `preparador-dist.test.mjs` |
| OT-Q030 Clipboard + fallback | **pasado (proxy)** | `navigator.clipboard` + `select()`/`execCommand` + copia manual + salida `readonly` + `<noscript>` |
| OT-Q031 reapertura/doble instancia | **pasado (proxy)** | guarda `preparadorMontado`, `AbortController`, `uid` por instancia, `desmontar`; botón `type=button` + Escape |
| OT-Q032 cerrado/deshabilitado | **pasado** | `PREPARADOR_ENABLED=false` + dist sin `data-preparador`/ancla/`mailto:` + fuentes sin red |
| OT-Q033 sin almacenamiento | **pasado (proxy)** | sin `localStorage/sessionStorage/indexedDB/cookie` en código efectivo; motor/destino sin imports |
| OT-Q034 no-JS + limpieza voluntaria | **pasado (proxy)** | `<noscript>` con contacto y modelo manual; panel nace `hidden`; limpieza solo en su botón |

**No E2E con navegador real en esta unidad** (sin capacidad de inspección visual ni DOM
programático sin dependencias remotas, prohibidas en la unidad): Q027-render, Q030-fallo real
de Clipboard, Q031-doble instancia viva, Q034-con-JS-roto quedan como proxies honestos de
arquitectura. **Navegador real pendiente OT-10.**

## 5. Casos no ejecutados / pendientes del operador

- E2E en navegador real (apertura, teclado Escape/Tab, copia con/sin permisos, mailto largo,
  dos instancias vivas, captura inspeccionada): pendiente OT-10.
- Cableado en página (`PREPARADOR_ENABLED=true` + import + ancla) y re-verificación de
  OT-Q013/Q032 entonces: decisión del coordinador tras aprobaciones OT-15.
- Prueba humana del buzón + aprobación `contacto` (OT-15): ajena a esta unidad; el código ya
  deriva el modo copia/mmailto de esos datos.

## 6. Riesgos y límites

- `document.execCommand("copy")` deprecado (hint de `pnpm check`): se conserva solo como
  respaldo tras Clipboard; el recuadro siempre queda seleccionable para copia manual.
- `cliente.ts` usa `document`/`window` bajo guarda `typeof document !== "undefined"`: seguro
  en build/Node, pero su comportamiento interactivo real solo se acredita con OT-10.
- `git status` muestra únicamente archivos nuevos (`src/tools/`, `tests/preparador*.test.mjs`);
  dist regenerado idéntico en contenido público (ignorado por git).

## 7. Siguiente acción propuesta

Revisión independiente (DeepSeek V4.1 Flash) de esta unidad; luego el coordinador decide el
cableado en página y agenda el E2E de navegador en OT-10. Sin publicar, sin DNS, sin pagos.

## 8. Corrección delimitada post-revisión (F1–F9, 2026-09-20; sin commit)

- **F1:** `index.ts` nuevo como punto único de entrada: reexporta flag/ancla y expone
  `cargarPreparador()`, que con `PREPARADOR_ENABLED=false` resuelve `null` sin importar
  nada (consumo real del flag, verificado con test runtime). Al activarse en el futuro,
  el import por aquí será el único camino a dist. Dist actual sin cambios (cero recursos).
- **F2:** `cliente.ts` ya no se monta al importar (eliminado el bloque de auto-montaje y
  el gancho global): solo exporta `montarPreparador`/`desmontarPreparador`. Nuevo
  `activador.ts` ligero: `Preparador.astro` lo importa en exclusiva (valor
  `UID_POR_DEFECTO`) y el activador trae el conector con `import()` dinámico en el
  primer click del botón de apertura (re-monta y reabre); criterio «carga al abrir» =
  apertura, no carga de página.
- **F3:** eliminada la ruta divergente: `CATALOGO_PREPARADOR` se deriva de
  `crearCatalogo()` sobre espejo transcrito O-D01 y el test fija su igualdad con
  `crearCatalogo(perfilBase.oferta)` (§2 corregido: fuente única perfil.datos →
  etiqueta/asunto coherentes).
- **F4:** párrafo de destino con una sola mención de «contacto pendiente de aprobación»
  (se eliminó la duplicación etiqueta fuerte + `destinoMostrado` en la misma frase).
- **F5:** botón de correo deshabilitado con `aria-describedby` al motivo visible
  (`<p id="prep-<uid>-motivo-correo">` con la razón; se conserva `title`).
- **F6:** eliminada la aserción tautológica (`|| true`) de `preparador.test.mjs`.
- **F7:** divergencia UTF-16 vs puntos de código documentada en comentario junto al
  `textarea`: `maxlength` nativo = prefiltro progresivo; límite contractual (800
  puntos de código, `Array.from`) lo aplica `motor.ts`. Tests 800/801 intactos.
- **F9:** ternario redundante de `motor.ts` simplificado
  (`ganado-en-pie ? categoria : titulo`).

Comandos tras la corrección (apps/oterco, locales, sin red):

| Comando | Salida | Exit |
|---|---|---|
| `pnpm build` (Astro estático, 1 página) | Complete, 743 ms | 0 |
| `pnpm check` (astro check + TS estricto, 25 ficheros) | 0 errores, 0 avisos, 1 hint (`execCommand` deprecado, fallback intencional) | 0 |
| `pnpm test` (suite completa tras build) | **pass 120, fail 0, skip 4** (124 tests; skips heredados: WOFF2/derivados pendientes) | 0 |

`git status` muestra solo la órbita OT-07 (`src/tools/`, `tests/preparador*.test.mjs`,
`docs/implementacion/OT-07/`), todo sin seguimiento y sin commit, según lo ordenado.
