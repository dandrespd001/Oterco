# Acta 2026-09-19 — OT-04 Diseño editorial propio

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f44bb222effe6TFNelaUtN4g4L + ajustes ses_f44b581deffebcQKtqgo1K6aUP) · **Revisor:** ot-revisor (ses_f44b82385ffeAsJQo4I6oRe9WI).

## Ejecución

- Wireframe/composición editorial propia en `apps/oterco/src/styles/base.css` (tokens --ot-* de DISENO.md; paleta pergamino/bosque/terracota) y prototipo índice en `src/pages/index.astro` (6 bloques `pendienteAP`, 0 img/script/canvas, noindex fixture, hero tipográfico).
- Independencia de PA: comparación de 12 dimensiones en `docs/implementacion/OT-04/fonts/COMPARACION.md` contra matriz contractual del repo (capturas/código de PA no accesibles al flujo — constado como limitación).
- Revisor: sin bloqueos. 46 pass/4 skip, check 0/0, build static, dist limpio (0 script/img/data/mailto/fonts cableados), jerarquía H/skip-link/details nativos íntegros.

## Casos

- OT-Q010 ✓ (wireframes: 320/768/1280 + doc de composición) · OT-Q011 **skip honesto** (binarios woff2 operador) · OT-Q012 **skip honesto** (comparación conceptual constada; visual con capturas = operador/OT-14) · OT-Q023 ✓ (regla de composición registrada; integración real en OT-06).

## Ajustes aplicados (post-revisión)

A: índice `<details>` plegado solo <48rem; en escritorio resumen oculto y lista forzada inline sin JS. B/C: precisión documental (444→ comité 460 líneas tras ajuste; sin `minmax`). D: test renombrado ASCII `diseno.test.mjs`.

## Pendientes operador

- Validación humana del diseño wireframe (DOM ≠ visión; sin aprobación del coordinador/expediente).
- Binarios `.woff2` + licencias OFL y cableado de tipografías → cierra OT-Q011.
- Contraste instrumental y zoom 200/400 + reflow (identificado feriá UT-10) y comparación visual PA con capturas (OT-14).

## Próximo paso

OT-05 — Shell y navegación (layout, enlaces file:// removidos, focus/teclado).
