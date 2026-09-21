# OT-14 — Matriz de diferencias frente a Puerta Abierta · DIFERENCIAS_PA.md

**Unidad:** OT-14 · **Fecha (UTC):** 2026-09-21 · **HEAD:** `c4798cf`
**Método:** comparación de código implementado contra `03_INTERFAZ/INDEPENDENCIA_VISUAL.md`
y `docs/implementacion/OT-04/fonts/COMPARACION.md`. **Sin capturas nuevas en esta unidad:**
no existen capturas aprobadas de PA en este repo y esta unidad no genera capturas de
PA para evitar colisión. La comparación visual queda como **deuda del operador** (§5), separada de los
fallos de código (cero hoy: suite 234 en verde).

## 1. Matriz por dimensión

| Dimensión | Puerta Abierta (referencia matriz) | OTERCO implementado (`c4798cf`) | Verificación |
|---|---|---|---|
| Hero | Foto comercial panorámica con velo oscuro, texto blanco, CTA sólido | Titular editorial sobre fondo claro + textura abstracta CSS; bloque `pendienteAP` sin foto; cero texto blanco superpuesto | `index.astro` + `base.css`; `grep <img` = 0 |
| Tipografía / familias | Manrope (títulos) + Source Sans 3 (cuerpo) | Stacks de trabajo hacia Libre Caslon Display + Work Sans; `fonts.css` **sin cablear** (cero familias de PA en el CSS); carga real pendiente | `diseno.test.mjs` guarda verde + skip Q011 |
| Organización / capítulos | Oferta → ventajas → método → comparación → cobertura → contacto → cierre | Hero → portafolio (3 filas) → territorios/fincas (2 asimétricos) → manejo reservado → infraestructura (bebederos/feedlot/solar) → cierre editorial sin contacto ni preparador | `capitulos.test.mjs` 12/12 |
| Fotos | Fachadas/locales urbanos, geometría controlada | 6 slots `FotoPendiente` con `data-dims` + clase `.slot--WxH`, sin `<img>`; bebedero contenido (topes 22rem/35rem); `srcset`/`sizes` cubiertos en tests | `recursos.test.mjs` 19+2 skips; chunked/derivados pendientes |
| Pie / contacto | Breve y luminoso, identificación y privacidad; panel de canales directos (sin formulario) | Cierre verde bosque profundo, una columna protagonista; contacto editorial `pendienteAP`; preparador local **deshabilitado** (cero scripts, sin mailto, sin envío) | `seo/shell/frontera` verdes; `preparador-dist` 19/19 |
| Móvil / índice | Navegación plegable + acceso breve a contacto; canales visibles | Índice editorial `<details>` nativo (plegado solo <48rem, en línea ≥48rem); sin barra flotante; fotos con crop aprobado pendiente; capítulos sin pila de tarjetas | `shell.test.mjs` 19/19; navegación real pendiente (§5) |
| Contenedor / ritmo | 1216 px, texto ~65 ch, 56–80 px | 1120 px, texto ~62 ch (`--ot-medida`), capítulos 7/5, ritmo 40–112 px | `base.css` tokens; `diseno` 8+2 skips |
| H1 | clamp medio, peso 650–700 | `clamp(2.75rem, 6.2vw, 5rem)`, peso 400, interlineado 1.05 | `base.css` |
| Movimiento | 120–180 ms feedback | Sin animación de entrada; `prefers-reduced-motion` anula todo; fotos quietas | `acc.test.mjs` Q019 verde |
| Superficies | Azul cobalto / blanco frío / lavanda | Pergamino `#EDE6D2` / bosque `#1F3327` / terracota `#7A3B24` / ocre solo bordes | contraste calculado §4 OT-10 |

## 2. Prohibiciones de la matriz (cumplimiento en código)

- Sin hero/footer/CSS de PA duplicado con otros colores: `base.css` propio (tokens `--ot-*`), sin imports cruzados — verificado (`release` detector de origen ajeno PASA).
- Sin `theme === empresa` ni imports entre apps: repo único OTERCO, sin lockfiles/assets de PA (Q001, suite verde).
- Sin galería/fuente pública común: cero imágenes y cero fuentes servidas en `dist/`.
- Sin diferencias forzadas (controles incomprensibles, contraste insuficiente, movimiento
  excesivo): contraste ≥4.5 en todo texto real; ocre 2.97 solo en bordes, jamás texto/foco.
- Sin porcentajes de originalidad ni promesa de anonimato: COMPARACION.md lo declara
  explícitamente; mismo autor en ambas marcas asumido como riesgo, no ocultado.

## 3. Contacto / pie: pendienteAP (detalle)

El cierre lista como informe al operador todo lo omitido (sin NIT, sin buzón, sin teléfono/
WhatsApp, sin solares O-D04, sin envío). El preparador existe como motor puro local,
deshabilitado por configuración (`PREPARADOR_ENABLED=false`), sin recursos exclusivos
publicados y sin anuncio de envío confirmado. Cableado real tras OT-15.

## 4. Móvil / índice (detalle)

`<details>` nativo: operable con teclado y sin JS en móvil; en escritorio (≥48rem) el resumen
se oculta y la lista queda en línea con independencia del estado `open`. Sin `nav{display:none}`,
sin `position:fixed/sticky` en cabecera, sin scroll horizontal por unidades (`acc` + `shell` verdes
a nivel proxy). Confirmación en pantalla real = operador (§5).

## 5. Deuda de comparación visual del operador (NO es fallo de código)

Referencia completa: OT-10 INFORME §5 + CHECKLIST_VISUAL. Pendiente 100 % operador:

- **V-15:** capturas completas + detalles inspeccionados de verdad (portada, privacidad, 404;
  viewports 320/390/768/1440; zoom 200 %; reflow 400 %).
- **V-17:** comparación conjunta en color + copia en gris/sin logos contra capturas aprobadas de PA.
- **V-03:** fuentes efectivamente cargadas sin fallback accidental (tras OT-15).
- **V-08:** fotos pertinentes con procedencia y recortes (tras derivados + licencias).
- **V-18:** aprobación o cambios pendientes firmados por el propietario; sin porcentajes.

Criterio bloqueado: **OT-Q012** (comparación visual completa). Cómo se satisface: el operador
ejecuta los pasos, archiva capturas + acta en `docs/implementacion/OT-16/` (o acta del
coordinador en `00_CONTROL/SESIONES/`), y solo entonces Q012 sale de skip. Ningún análisis
DOM/Lighthouse sustituye esta revisión.
