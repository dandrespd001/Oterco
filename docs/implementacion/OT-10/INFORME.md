# OT-10 — Informe de accesibilidad y móvil

**Unidad:** OT-10 "Accesibilidad y móvil" · **Fecha:** 2026-09-20
**Base:** dist técnico (portada + privacidad + 404), 178 tests verdes antes de la unidad.
**Módulo preparador:** deshabilitado (cero scripts en dist); sus fuentes se auditan pero no se activan.
**Límite de capacidad:** sin navegador gráfico garantizado ni axe-core en este entorno;
no se instaló nada ni se usó red. Lo programático está medido abajo; lo visual,
el teclado en vivo, el lector y axe quedan como pasos exactos del operador (§5).
Ninguna afirmación visual se basa solo en DOM.

## 1. Auditoría programática ejecutada

Fichero: `apps/oterco/tests/acc.test.mjs` (Node --test, sin paquetes nuevos).
Cubre sobre el compilado: jerarquía H y saltos; figuras (cero `<img>`, notas con
figcaption + aria-label); cero campos sin etiquetar en dist; nombres accesibles
de enlaces y resolución de aria-*; skip-link; landmarks; tabindex; atrapamiento;
foco visible (reglas focus-visible + outline ≥3px + offset); taborder frente a
orden visual; contraste WCAG calculado desde los tokens de `base.css`;
táctiles ≥44px por tamaños declarados; zoom/reflow por unidades y reglas;
reduced-motion; lang y titles por página.

## 2. Hallazgo → evidencia → corrección o pendiente

| # | Hallazgo | Evidencia | Estado |
|---|---|---|---|
| H1 | `404.html` sin skip-link ni destino `#contenido` | `acc.test.mjs` falló en antes (skip-link ausente en 404); portada y privacidad sí lo tenían | **Corregido**: `public/404.html` + rebuild (§3) |
| H2 | Enlaces del índice en escritorio (≥48rem) sin área táctil (`display:inline; padding-block:0`) | Regla en `base.css` media 48rem; en móvil sí hay `padding-block:0.6rem` (~46px) | **Documentado, sin cambio**: fila editorial de puntero fino; pendiente tacto real del operador (§5 paso 1) |
| H3 | `.territorio--invertido > :first-child { order: 2 }` reordena visual vs DOM en escritorio | Único `order:` del CSS; los dos `<article class="territorio">` no contienen `<a>`, `<button>` ni `<summary>` (test) | **Sin cambio**: el Tab no se altera (nada enfocable dentro); orden de lectura SR = DOM = lógico; pendiente oído del operador (§5 paso 3) |
| H4 | `figure.foto-pendiente` con `role="note"` pisa el rol figura pese a tener `<figcaption>` | 6 figuras en dist con figcaption + aria-label; cero `<img>` | **Sin cambio** (plaza reservada, no contenido): pendiente lector del operador (§5 paso 3) |
| H5 | Ocre `--ot-ochre` ≈ 2.97:1 sobre papel, bajo el 4.5:1 | Cálculo del test; grep: ocre solo en `border-bottom/left`, jamás en `color:` ni `outline:` | **Sin cambio**: prohibido "arreglar" contraste cambiando colores; el ocre nunca es texto ni foco |
| H6 | Sin axe-core ni navegador en este entorno | No instalado a propósito (permiso); proxies de código en tests | **Pendiente operador**: orden axe acotada sin paquetes de pago (§5 paso 4) |
| H7 | `404.html` sin hoja de estilos: el skip-link nuevo usa el foco por defecto del navegador, no el corporativo | `public/404.html` no puede referenciar el CSS con hash del bundle; no se cablea nada inventado | **Documentado, sin cambio**; el enlace es operativo con teclado y lector igualmente |
| H8 | Privacidad y 404 sin header/nav/footer | Solo `<main>` (+ skip-link); página de aviso y error mínimas | **Aceptado**: landmarks suficientes para su tamaño; pendiente revisión visual (§5 paso 1) |

## 3. Corrección aplicada: antes / después (único diff de interfaz)

`apps/oterco/public/404.html` (propagado a `dist/404.html` con rebuild local):

Antes:
```html
<body>
  <main>
```

Después:
```html
<body>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <main id="contenido">
```

Motivo: paridad de salto con portada y privacidad (OT-Q015/OT-Q016); sin scripts,
sin estilos nuevos, sin tocar datos, puertas ni contratos. Ningún test previo se
modificó para que pase: el fallo inicial quedó registrado en EVIDENCIA.md.

## 4. Contraste medido (cálculo WCAG del propio test, tokens de `base.css`)

Tokens: paper `#ede6d2`, paper-alt `#e3d8bb`, forest `#1f3327`, deep `#16241b`,
ink `#1c2019`, muted `#55594b`, clay `#7a3b24`, ocre `#b07a2c`.

| Par real clase↔token | Ratio | Criterio |
|---|---|---|
| Cuerpo ink/paper | 13.27:1 | ≥4.5 ✔ |
| Títulos/marca/índice forest/paper | 10.79:1 | ≥4.5 ✔ |
| Metas/reserva muted/paper | 5.78:1 | ≥4.5 ✔ |
| Enlaces/kickers/etiquetas clay/paper | 6.80:1 | ≥4.5 ✔ |
| Botón principal y skip-link paper/forest | 10.79:1 | ≥4.5 ✔ |
| Cierre y pie paper/deep | 12.94:1 | ≥4.5 ✔ |
| Kicker de cierre paper-alt/deep | 11.37:1 | ≥4.5 ✔ |
| Capítulo alt ink/paper-alt | 11.66:1 | ≥4.5 ✔ |
| Kicker en capítulo alt clay/paper-alt | 5.97:1 | ≥4.5 ✔ |
| Meta en capítulo alt muted/paper-alt | 5.08:1 | ≥4.5 ✔ |
| Botón secundario forest/paper | 10.79:1 | ≥4.5 ✔ |
| Foco forest/paper (3px, no texto) | 10.79:1 | ≥3:1 ✔ |
| Ocre decorativo/paper (solo bordes) | 2.97:1 | N/A: jamás texto ni foco ✔ |

No es medición instrumental de captura; es cálculo sobre tokens fuente.
El operador confirma en pantalla real (§5 paso 1, comparación en gris incluida).

## 5. Pendiente del operador: pasos manuales exactos con navegador real

Requisito: misma máquina o dos comparables, commit registrado en EVIDENCIA.md,
anotar navegador, viewport, ruta y revisor por captura. Capturas completas
(página entera + detalle de foco), inspeccionadas de verdad, no solo DOM.

**Paso 1 — Viewports y reflow (320 / 390 / 768 / 1440 CSS px + zoom 200% + reflow 400%):**
1. Servir `dist/` en local (`pnpm preview` o servidor estático) y abrir `/`, `/privacidad/` y una ruta inexistente (404) en cada ancho 320, 390, 768 y 1440.
2. En cada una: verificar que no hay scroll horizontal de página, que ningún
texto se solapa, que el índice se pliega/despliega en móvil y queda en línea en
escritorio, y que el bebedero vertical sigue contenido (nunca a todo el ancho).
3. Repetir a zoom 200% y a 400% (reflow): lectura y controles conservados.
4. Captura completa por viewport y ruta; comparar color y copia en gris (V-17);
registrar qué se aprobó o qué cambió.

**Paso 2 — Teclado (Tab / Shift+Tab / Enter / Espacio / Escape):**
1. Desde la recarga, pulsar Tab: el primer foco es el skip-link visible
("Saltar al contenido") y Enter salta a `#contenido` en las tres páginas.
2. Recorrer toda la portada con Tab/Shift+Tab: foco siempre visible (contorno
3px, nunca solo color), sin atrapamiento, sin focos ocultos; el `<summary>`
"Índice" abre/cierra con Enter y Espacio sin JS.
3. Escape no deja foco colgado (no hay modales: el preparador es sección inline
y está deshabilitado). Registrar cualquier foco tapado por la cabecera.

**Paso 3 — Lector de pantalla (Edge en Windows + Orca en Linux):**
1. Con NVDA/Narrador en Edge (Windows) y Orca en Firefox (Linux), leer las tres
páginas: un H1 por página, jerarquía sin saltos, secciones con nombre,
figuras anunciadas como nota pendiente (H4) y orden de lectura lógico en los
territorios invertidos (H3).
2. Confirmar que los enlaces pendientes se anuncian con su motivo y que ningún
contenido depende solo del color. Registrar versión de lector y navegador.

**Paso 4 — axe acotado sin paquetes de pago:**
1. Instalar la extensión gratuita axe DevTools en Edge/Chrome (sin cuenta de pago).
2. Analizar por separado `/`, `/privacidad/` y la 404 servida en local, con las
reglas WCAG 2.2 AA; no usar visión por IA ni comparaciones de pago.
3. Alternativa sin extensiones (solo lectura de código, no sustituye el análisis):
revisar que no aparezcan `color-contrast`, `heading-order`, `landmark-*`,
`skip-link`, `focus-order-semantics` ni `target-size` como violaciones, y
cruzar cada una con H2–H5 de este informe.
4. Adjuntar el exporte de cada análisis al acta del coordinador; ningún "0
violaciones" por sí solo acredita conformidad completa.

## 6. Estado por caso

| Caso | Estado tras OT-10 | Base |
|---|---|---|
| OT-Q013 (navegación 320/390 con/sin JS) | Parcial: proxies verdes (0 scripts, details nativo, viewport, táctil declarado); **navegación real y capturas → operador §5.1** | acc.test + shell.test |
| OT-Q015 (main, salto, H1, jerarquía, figuras) | Programático verde en 3 páginas tras H1; **lectura SR → operador §5.3** | acc.test |
| OT-Q016 (foco y Tab/Escape/Enter) | Proxy verde (sin tabindex, foco 3px, H3 sin enfocables); **teclado vivo → operador §5.2** | acc.test + shell.test |
| OT-Q017 (contraste) | Verde por cálculo sobre tokens (§4); **confirmación en pantalla → operador §5.1** | acc.test |
| OT-Q018 (zoom 200%, reflow 400%, 4 viewports) | Proxy verde (unidades, sin fixed, topes); **scroll real y capturas → operador §5.1** | acc.test |
| OT-Q019 (movimiento reducido) | Verde (reduce elimina transiciones/animaciones; sin smooth scroll) | acc.test |
| OT-Q052 (axe + manual + capturas inspeccionadas) | **Pendiente operador**: §5 pasos 1–4; este informe no finge visión | acc.test (existencia de informe) |

## 7. Riesgos y siguiente acción

- Riesgo: el cálculo de contraste no detecta superposiciones reales ni la
reserva `.foto-pendiente` con overlay blanco; cubierto por §5.1 en gris.
- Riesgo: `order: 2` y `role="note"` son decisiones de composición; si el lector
las anuncia mal, volver a OT-10.A con la evidencia del operador.
- Siguiente acción: coordinador registra OT-10 como REALIZADA-parcial
(programático verde + manual pendiente), archiva capturas del operador y
continúa OT-11; sin capturas inspeccionadas no hay publicación (OT-15/OT-17).
