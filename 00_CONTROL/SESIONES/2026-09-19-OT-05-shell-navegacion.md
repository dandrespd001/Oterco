# Acta 2026-09-19 — OT-05 Shell y navegación

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f44b31bffffeB5s6Lk0qOL2u5P + ajustes ses_f44aa5c6cffe2yxIJv51NtiihH) · **Revisor:** ot-revisor (ses_f44ada852ffeHLyIP3e1t2BRo9).

## Resultados

- Shell propio: `src/layouts/BaseLayout.astro` + `Header/Indice/Footer`; `src/config/navegacion.ts` como fuente única de ruteo (9 destinos válidos + contacto pendienteAP con repliegue #cierre). Sin file:// ni javascript: ni URL inventadas; canonical solo comentario; contacto sin mailto.
- Reensamble mínimo de index.astro (capítulos OT-04 intactos); 0 scripts; jerarquía H con 1 H1; skip-link y foco íntegros.
- Revisor: sin bloqueos; 65 pass/4 skip, 13 ficheros check 0/0, build ~0,7s; anclas 10/10 resueltas, 17 ids únicos. Reprodujo todo.

## Casos

- OT-Q013 ✓ · OT-Q014 ✓ (0 file://; 13 file:/// de la referencia clasificados como marcador, no transcritos) · OT-Q015 ✓ · OT-Q016 ✓ (proxy programático; teclado real → OT-10/operador).

## Ajustes aplicados (post-revisión)

F1 táctil ≥44px en índice móvil (inline en escritorio documentado) · F2 reglas muertas del pie eliminadas · F3 ratificado el ajuste de diseno.test (verificación trasladada a shell.test — decisión del coordinador) · F4 etiqueta OT-05.

## Limitación declarada

El revisor no pudo verificar el plegado real de `<details>` en móvil (navegador no conectado en su entorno); queda pendiente de comprobación en navegador real (OT-10/OT-12 con operador). No hay 0 defectos confirmados.

## Próximo paso

OT-06 — Capítulos y portafolio desde `proyeccionPublica()` + inventario de recursos (bordes solares ⇢ bloque deshabilitado sin anclas rotas).
