# OT-04 — Wireframes y ficha de composición editorial

**Fecha:** 2026-09-19 · **Implementador:** Muse Spark 1.3 Contributor · **Base:** OT-02 realizada, OT-03 realizada (parcial por bloqueo de originales).
**Estado:** prototipo wireframe, fixture no publicable. Ninguna decisión de composición queda aprobada sin validación humana del operador.
**Fuentes de diseño:** `03_INTERFAZ/DISENO.md`, `INDEPENDENCIA_VISUAL.md`, `AUDITORIA_HTML_BASE.md`, `CHECKLIST_VISUAL.md`.

## 1. Ficha visual local (tokens implementados en `src/styles/base.css`)

| Token | Valor | Uso |
|---|---|---|
| `--ot-paper` | `#EDE6D2` | Fondo general |
| `--ot-paper-alt` | `#E3D8BB` | Alternancia limitada (fincas, infra) |
| `--ot-forest` | `#1F3327` | Títulos, masthead, botón principal, filetes |
| `--ot-forest-deep` | `#16241B` | Cierre y pie editoriales |
| `--ot-ink` | `#1C2019` | Cuerpo |
| `--ot-muted` | `#55594B` | Ayudas, metas, filetes deshabilitados |
| `--ot-clay` | `#7A3B24` | Enlaces, kickers, etiquetas |
| `--ot-ochre` | `#B07A2C` | Decoración/filete hero, ficha solar |

Tipografía: stacks del sistema como herramienta de trabajo (serif Georgia para
titulares, system-ui para cuerpo). Las familias autorizadas viven en
`fonts.css`, que sigue **sin cablearse** hasta los binarios + licencias del
operador. El prototipo no anuncia el fallback como tipografía aprobada.

Escalas: H1 `clamp(2.75rem, 6.2vw, 5rem)` hasta 16ch; H2 32–48 px; cuerpo
18 px/1.65 hasta 62ch; contenedor 1120 px con padding móvil 20 px; ritmo
40–64 px móvil y 72–112 px escritorio. Botones rectos (radio 2 px), táctil
≥44 px. Masthead no sticky. Índice nativo `<details>` (teclado + sin JS).
Cierre oscuro de una columna protagonista. `prefers-reduced-motion` elimina
transiciones; contenido visible en estado inicial.

## 2. Wireframes (C: wireframe ↔ C: implementación)

Orden de capítulos (DISENO.md §Organización): hero → portafolio (3 filas) →
fincas (2 capítulos asimétricos) → manejo (estructura reservada) →
infraestructura (bebederos/feedlot/solar con anclas) → cierre editorial
(sin contacto ni preparador: OT-07/OT-15). Correspondencia verificada por
`tests/diseno.test.mjs` (secciones en orden, 5 destinos, bloques
`pendienteAP`).

### 2.1 Móvil 320 px (una columna, índice plegado)

```text
+--------------------------------+
| OTERCO                 [Índice▾]|  masthead + filete bosque
|--------------------------------|
| REGIÓN (kicker terracota)      |
| Titular serif                  |
| grande, hasta 16ch             |
| Razón social · enfoque         |
| [Consultar portafolio]         |
| [Cierre editorial]             |
| . . . . . . . . . . . . . . .  |  textura abstracta CSS
| [ Imagen pendiente AP ]        |  dashed, sin <img>
+--------------------------------+
| OFERTA AL COMPRADOR            |
| Portafolio                     |
| ─────────────                  |
| CATEGORÍA                      |
| Título fila 1                  |
| Descripción…                   |
| ───────────── (filas 2, 3)     |
+--------------------------------|
| DOS TERRITORIOS (fondo alt)    |
| Hacienda Beraka                |
| San Onofre · cría              |
| Texto… [etiquetas filtradas]   |
| [ Imagen pendiente AP ]        |
| ─────────────                  |
| Hacienda Puerta Roja (igual)   |
+--------------------------------+
| HATO Y MANEJO                  |
| Estructura reservada…          |
| [ Galería pendiente AP ]       |
+--------------------------------+
| INFRAESTRUCTURA (fondo alt)    |
| Bebederos y agua               |
| [ bloque contenido ≤560px AP ] |  OT-Q023
| - - - - - - - - - - - - - - -  |
| Feedlot y praderas             |
| [ Imagen pendiente AP ]        |
| - - - - - - - - - - - - - - -  |
| Solar en Beraka                |
| | Ficha secundaria pendiente   |  filete ocre, sin cifras
+--------------------------------+
| CIERRE (bosque profundo)       |
| Consulta y cierre              |
| Omitidos por puerta editorial  |
| · nit / contacto / solar…      |
+--------------------------------+
| Pie: fixture, sin foto, nivel  |
+--------------------------------+
```

### 2.2 Tableta 768 px (una columna ancha; oferta en 2 columnas etiqueta/texto)

Igual secuencia que 320. `.fila-oferta` pasa a `12rem + 1fr`
(categoría a la izquierda, contenido a la derecha). Territorios aún
apilados (texto sobre bloque pendiente). Índice `<details>` operativo;
al abrirse lista los 5 destinos sin modal ni JS.

### 2.3 Escritorio 1280 px (asimetría 7/5, ≠ retícula uniforme)

```text
+==================================================+
| OTERCO — Ganadería · Costa Norte    Portafolio Fincas Manejo Infra Cierre |
+==================================================+
| REGIÓN                                           |
| Titular serif gran formato (16ch)                |
| [Consultar portafolio] [Cierre editorial]        |
| [ Imagen pendiente AP — reserva asimétrica ]     |
+==================================================+
| OFERTA | CATEGORÍA (12rem) | Título + descripción  |
+==================================================+
| FINCAS (fondo alt)                               |
| [Texto Beraka 7fr]        [bloque AP 5fr]        |
| [bloque AP 5fr]           [Texto Puerta Roja 7fr]|  invertido
+==================================================+
| MANEJO | reservado + galería AP                  |
+==================================================+
| INFRA (fondo alt): bebederos (contenido) / feedlot / solar |
+==================================================+
| CIERRE bosque profundo: protagonista + omitidos  |
+==================================================+
```

## 3. Estados

| Estado | Tratamiento wireframe → implementación |
|---|---|
| Teclado | Skip-link, `<details>` nativo, foco visible 3 px bosque en enlaces/botones/summary; sin atrapamiento (sin modales ni JS). |
| No-JS | Cero scripts; `<details>` funciona sin JS; anclas a las 5 secciones y a `#bebederos/#feedlot/#solar`; contenido completo en HTML. |
| Contraste | Tinta sobre pergamino, crema sobre bosque, terracota solo para texto grande/enlaces subrayados (no ocre sobre crema para texto). Validación instrumental/manual pendiente de operador (V-04). |
| Reflow/zoom | Sin anchos fijos que corten texto; filetes y grillas `fr` + `flex-wrap`; 320 px sin scroll horizontal injustificado (auditoría base exigía corregir el desborde de 5 px de la referencia). Verificación con zoom 200 %/reflow 400 % pendiente de operador (V-10/V-11). |
| Movimiento | Sin animación de entrada; `prefers-reduced-motion` anula transiciones. |
| Foto pendiente | `.foto-pendiente[data-estado="pendienteAP"]`: borde dashed, sin `<img>`, sin alt fotográfico, etiqueta FIXTURE. Bebedero además con `.detalle-vertical` (máx. 560 px). |

## 4. Lo expresamente no incluido (exclusiones OT-04)

Contacto/preparador (OT-07), binarios tipográficos y cableado de `fonts.css`
(operador, OT-03/OT-15), fotografías/derivados (operador, OT-03), cifras
solares y NIT (puerta OT-15), comparación visual con capturas (operador,
OT-14). El cierre lista los omitidos de la proyección pública como informe
al operador, nunca como contenido comercial.
