# OT-03 — Extraer e inventariar recursos · Evidencia

**Fecha:** 2026-09-19 · **Implementador:** Muse Spark 1.3 Contributor · **Base:** OT-02 realizada (commit `1c5b5b6`).
**Alcance:** inventario tipado + generador + pruebas OT-Q011/Q020/Q021/Q022/Q024 (+ nota Q023), `@font-face` local sin binarios, evidencia. Sin publicar, sin fotos inventadas, sin red remota, sin tocar `00_CONTROL/07_PLAN/10_OPENCODE/.opencode`, especificaciones, `perfil.datos.ts` ni `publicacion.ts`.

## 1. Decisiones

- **Módulo `src/assets/resources.ts` (nuevo):** tipos `SourceId` (O-IMG01..06), `EstadoPermiso`, `Derivado`; `FUENTES_ORIGINALES` con las seis huellas SHA-256/dimensiones/bytes de `09_FUENTES/INVENTARIO_RECURSOS.md`; `DERIVADOS` vacío (preprint sin fotos). `resolverRecurso()` devuelve `ausente` con motivo, nunca un `src` roto. `altParaPublicar()` devuelve `null` siempre mientras no haya derivado aprobado (el alt del HTML nunca identifica raza/propiedad). Validadores `validarDerivado()` (OT-Q022), `validarAlt()` (OT-Q024), `trazabilidadCompleta()` + `esPublicableDerivado()` (OT-Q020), `estrategiaCarga()` (OT-Q023: bebedero contenido sin ampliación; solar lazy con opt-out hero documentado) y `contenidoDistProhibido()` (OT-Q021). Cero base64, cero rutas privadas.
- **Generador `scripts/generar-derivados.mjs` (nuevo, Node sin dependencias):** verifica 6 SHA-256 contra el espejo documental, magia JPEG, dimensiones vía SOF propio y coherencia con `inventory.json` de `extraer.py`; retira segmentos APPn/COM (EXIF-strip real, sin dependencias); emite base + `derivados-manifiesto.json` con plan de anchos topado al natural, `srcset`/`sizes`, `crop`, `altRevisado: null` y permiso `pendiente`. Sin carpeta → exit 2 «originales ausentes — operador encargado»; huella/formato mal → exit 1 sin escribir; no corre en `astro build`. Script registrado como `pnpm recursos:derivados` (único cambio en `package.json`). **No ejecutado en modo generación** (sin originales; solo rutas negativas en tests y una invocación manual exit 2).
- **Fuentes:** `src/styles/fonts.css` con 4 `@font-face` (Libre Caslon Display 400; Work Sans 400/500/700), `font-display: swap`, solo `url()` locales, sin CDN. Binarios NO descargados (red remota no autorizada en esta unidad); `src/assets/fonts/` solo con `README.md`; licencias en `LICENCIAS_TIPOGRAFICAS.md`. `fonts.css` a propósito sin importar desde páginas hasta que existan los `.woff2` (evita 404); el fallback sigue siendo el stack del sistema en `base.css`.
- **Tests `tests/recursos.test.mjs` (nuevo, `node:test`):** 20 its en 7 suites; dos `skip` dinámicos honestos (binarios WOFF2, dist ausente) en lugar de fingir. Iteración: el conteo de `@font-face`/`swap` incluía menciones en comentarios y se ancló a bloques reales (`@font-face\s*\{`, `^\s*font-display`).
- **Sin stock/IA/finca inventada:** ningún fixture fotográfico; el derivado de ejemplo en tests es un objeto sintético (`hashPropio: "a"×64`) que nunca se publica ni se presenta como foto.

## 2. Archivos creados/modificados (diff)

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/oterco/src/assets/resources.ts` | ~380 | Inventario tipado + validadores + estrategias |
| `apps/oterco/scripts/generar-derivados.mjs` | ~230 | Verificador EXIF-strip + manifiesto (exit 2/1/0) |
| `apps/oterco/tests/recursos.test.mjs` | ~330 | 20 its OT-Q011/Q020/Q021/Q022/Q024 + Q023 + generador |
| `apps/oterco/src/styles/fonts.css` | ~50 | 4 `@font-face` locales con swap, sin remoto |
| `apps/oterco/src/assets/fonts/README.md` | ~30 | Carpeta vacía intencional + pasos operador |
| `apps/oterco/package.json` | +1 | Script `recursos:derivados` |
| `docs/implementacion/OT-03/EVIDENCIA.md` | — | Este archivo |
| `docs/implementacion/OT-03/LICENCIAS_TIPOGRAFICAS.md` | — | Registro de licencias (pendiente de valores) |

`git status`: 1 modificado (`package.json`), resto rutas nuevas. No se tocaron `index.astro`, `base.css`, `perfil.datos.ts`, `publicacion.ts`, `00_CONTROL/07_PLAN/10_OPENCODE`, `.opencode` ni especificaciones.

## 3. Comandos y resultados (locales, sin red; salida resumida, exit code)

| Comando (en `apps/oterco` salvo indicación) | Resultado | Exit |
|---|---|---|
| `node --test tests/` | 39 tests, 38 pass, 0 fail, 1 skipped (WOFF2 pendientes) | 0 |
| `pnpm --filter oterco check` (desde raíz) | 0 errores, 0 avisos (8 ficheros) | 0 |
| `pnpm --filter oterco build` (desde raíz) | 1 página `/index.html`, static | 0 |
| `node scripts/generar-derivados.mjs /tmp/opencode/oterco-originales-inexistentes` | «originales ausentes — operador encargado…» | 2 |
| `grep -rEl "data:image/…base64,{512,}" dist/` | 0 ficheros | — |
| `grep -rEl "private-references\|inventory\.json\|BEGIN …\|\\.pem" dist/` | 0 ficheros | — |
| `grep -c "http" dist/index.html` | 0 | — |

Iteración intermedia: 1 fallo inicial (conteo `@font-face`/`swap` con falsos positivos de comentarios) corregido anclando la regex; suite posterior en verde. Casos OT-02 previos intactos (19 its siguen pasando dentro de los 39).

## 4. Estado por caso

- **OT-Q011** (fuentes distintas, autorizadas, realmente cargadas; sin fallback accidental): **parcial — pasado en declaración, pendiente en binarios**. Pasa: 4 `@font-face` reales con swap, ambas familias, cero URL remotas/CDN/`@import`. Skip honesto: binarios `.woff2` ausentes (red no autorizada) → las fuentes aún NO se cargan realmente; `fonts.css` sin cablear hasta entonces.
- **OT-Q020** (trazabilidad, huellas y permisos de derivados a publicar): **parcial — puertas/estructura verificadas; huellas reales y derivados pendientes de acción del operador** (4 its: seis fuentes con SHA-256/dimensiones/permiso pendiente; preprint vacío → todo `ausente` sin rotos; pendiente no publicable / aprobado válido sí / sin hash no; generador refleja las 6 huellas; el cruce de hash individual con originales queda pendiente del operador).
- **OT-Q021** (sin base64, privados ni certificados en dist): **pasado** (2 its: `src/`+`scripts/` sin base64 ≥ umbral; `dist/` sin los 6 patrones prohibidos; doble comprobación por grep en §3 con 0 coincidencias).
- **OT-Q022** (dimensiones reservadas, srcset/sizes correctos, recortes razonables): **pasado** (4 its: ejemplo válido; rechazo de dims ausentes y ampliación sobre el original; srcset sin sizes/malformado/no ascendente; src remoto/data y destino fuera de `src/assets/`).
- **OT-Q024** (alt/pies apropiados; sin certificar raza/propiedad): **pasado** (3 its: los alt de raza/propiedad de la fuente se rechazan como alt; `altParaPublicar()` null en las seis; neutro aceptado, vacío/excesivo/certificador rechazados).
- **Nota OT-Q023** (bebedero contenido; solar lazy): **pasado** (2 its: O-IMG04 `contenido` + sin ampliación + no hero; O-IMG06 lazy + opt-out hero documentado + nota de intersección en capturas).
- Generador sin originales: **pasado** (3 its: carpeta inexistente → exit 2 + mensaje; sin `inventory.json` → exit 2; recuento de inventario inesperado → exit 1 sin escribir). Cruce de hash individual con originales: **pendiente de ejecutar con originales** (it con `skip` honesto). Guardia `--dest` bajo `public/`: verificado por invocación manual (exit 1, §9). Generación real: **no ejecutada** (bloqueo operador, ver §5).

## 5. BLOQUEO EXPLÍCITO — extracción de fotos pertenece al operador

1. **Originales ausentes:** las seis fotos no están en el repo (solo huellas en `09_FUENTES/INVENTARIO_RECURSOS.md`). El operador debe aportar el HTML autorizado y ejecutar `extraer.py` (`09_FUENTES/EXTRACCION_LOCAL.md`) en carpeta privada; después `pnpm recursos:derivados <carpeta>` verifica huellas y emite base+manifiesto. **Huellas pendientes de verificación** hasta ese momento.
2. **Permisos pendientes:** las seis fuentes nacen `pendiente`; ninguna foto es publicable (`esPublicableDerivado()` exige `aprobado` + trazabilidad + alt válido). Registrar licencias/consentimientos antes de aprobar la afirmación de origen (puerta OT-15).
3. **Tipografías pendientes:** binarios `.woff2` + `LICENSE` OFL por descargar desde distribución autorizada (ver `LICENCIAS_TIPOGRAFICAS.md`); cablear `fonts.css` y medir OT-Q037/OT-Q038 después.
4. **Reescalado responsive pendiente:** el generador deja plan de anchos + base EXIF-strip; emitir webp/avif por ancho requiere herramienta del operador (p. ej. sharp) — documentado en el manifiesto, no fingido.
5. **Sin material fabricado:** no se usó stock, IA ni fotos de otra marca como evidencia de finca; el preprint publica cero fotos.

## 6. Casos no ejecutados

- Generación real de derivados (bloqueada §5.1; script sin probar con originales).
- Descarga/verificación de `.woff2` + medición de peso con fuentes reales (§5.3).
- Captura visual: no aplica (sin cambios de UI; `index.astro` intacto).
- Resto de casos OT-Q*: fuera del alcance de esta ficha.

## 7. Riesgos y límites

- El espejo de huellas vive en dos sitios (`resources.ts` canónico, `scripts/` operativo); un test los cruza (cada SHA documental debe aparecer en el script) para evitar deriva.
- El EXIF-strip propio maneja JPEG estándar (SOF0/SOF2, APPn/COM); un JPEG progresivo/exótico que el parser no reconozca aborta con exit 1 → revisión manual, no corrupción silenciosa.
- `fonts.css` sin cablear es código muerto temporal y deliberado; cablearlo sin binarios rompería la carga (404) — el test de binarios lo impide olvidar (skip visible).
- `validarAlt()` es lista de patrones, no juicio semántico: todo alt publicable exige además revisión humana (permiso `aprobado`).

## 8. Siguiente acción propuesta

Operador: extracción `extraer.py` + `pnpm recursos:derivados` + registro de permisos de las seis fotos; descarga de `.woff2` + licencias. Después, coordinador: OT-04 (o la que defina) para composición que consuma `resolverRecurso()`/`estrategiaCarga()` con derivados aprobados; sin aprobados, la web sigue publicando cero fotos.

## 9. Corrección post-revisión (2026-09-19 · H1/H2/H3/H4/H8, sin dependencias ni red)

- **H1:** `scripts/generar-derivados.mjs` valida el **destino** (`--dest`) con `esBajoPublic()` (cualquier segmento `public/` en la ruta resuelta) y lo rechaza con exit 1 y mensaje «Destino inválido (--dest): nunca escribir bajo public/ ni apps/oterco/public/; use src/assets/derivados/.» **antes** de `mkdir`. El guard de origen se mantiene intacto.
- **H2:** test «huella inesperada → exit 1» renombrado a «recuento de inventario inesperado → exit 1» (su fixture `[{…}]` de 1 entrada ejerce la puerta de recuento, no el cruce de hash); cruce de hash individual añadido como it con `skip` honesto «pendiente de ejecutar con originales del operador».
- **H3:** docstring del script corregido: solo existen los exits 0/1/2; eliminada la promesa de «exit 3 sin reescalador» (el reescalado queda como trabajo pendiente documentado en el manifiesto, sin código adicional).
- **H4:** OT-Q020 marcado parcial en §4 (puertas/estructura verificadas; huellas reales y derivados pendientes del operador).
- **H8:** `.gitignore` añade `apps/oterco/src/assets/derivados/` con comentario (bytes no versionados antes de aprobación).

| Comando (en `apps/oterco` salvo indicación) | Resultado | Exit |
|---|---|---|
| `node --test tests/` | 40 tests, 38 pass, 0 fail, 2 skipped (WOFF2 + cruce hash pendientes) | 0 |
| `pnpm --filter oterco check` (desde raíz) | 0 errores, 0 avisos (8 ficheros) | 0 |
| `pnpm --filter oterco build` (desde raíz) | 1 página `/index.html`, static | 0 |
| `node scripts/generar-derivados.mjs /tmp/opencode/oterco-orig-fiesta --dest public/salida-ficticia` (origen con `inventory.json` de 1 entrada) | «Destino inválido (--dest): nunca escribir bajo public/…» y `public/` NO creado | 1 |
| `node scripts/generar-derivados.mjs /tmp/opencode/oterco-orig-fiesta --dest /tmp/opencode/oterco-salida-normal` | «Cantidad inesperada en inventory.json…» (pasa el guard de destino, falla en recuento; sin escribir) | 1 |

Sin commit (indicación del encargo).
