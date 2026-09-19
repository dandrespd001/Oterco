# OT-06 — Evidencia: capítulos y portafolio

**Unidad:** OT-06 "Implementar capítulos y portafolio" · **Fecha:** 2026-09-19 · **Escritor:** Muse Spark 1.3 Contributor
**Base:** apps/oterco Astro static con OT-02 (perfilBase/proyeccionPublica), OT-03 (resources.ts, DERIVADOS vacío) y OT-05 (BaseLayout/Header/Indice/Footer/navegacion.ts) · **Estado:** unidad coherente implementada, pendiente cierre del coordinador.

## Decisiones

- Cuatro bloques en `src/components/` + un slot compartido `FotoPendiente.astro` (5 archivos UI, dentro de la guía): `BloquePortafolio` (3 filas literales por props), `BloqueFincas` (2 capítulos asimétricos por props, slots O-IMG01/O-IMG02), `BloqueGanadoManejo` (roles por finca derivados de props + slot O-IMG03, sin redactar pilares no transcritos), `BloqueInfraestructura` (bebederos O-IMG04 + feedlot O-IMG05 + cobertizo de texto + solar deshabilitado con slot O-IMG06).
- La página importa de forma real `proyeccionPublica(perfilBase)` y reparte `publica.oferta` / `publica.fincas` por props; ningún literal de contenido vive en los bloques (OT-Q009 verificado por estructura).
- Foto: sin derivados aprobados, cada slot usa `resolverRecurso()` real e informa el motivo de ausencia; emite figure sin elemento img, con `data-source`/`data-dims` de la huella documental y aspect-ratio en línea (OT-Q022). Se eliminó la rama futura con elemento img (rompía la guarda "cero fotos" de diseno.test sobre fuentes crudas y era generalidad especulativa): la unidad de aprobación la añadirá con puertas `esPublicableDerivado` + `altParaPublicar`, registrado como pendiente.
- Bebedero O-IMG04: proporción 485/650 declarada en `base.css` + aspect-ratio del slot + topes 22rem/35rem (OT-Q023); nota de composición en regla y pie visibles, además del comentario.
- Solar: ancla `#solar` válida y existente (navegacion.ts ya la lista como válida); ficha secundaria deshabilitada sin cifras, sin NIT/contacto/fotos en dist (puerta editorial intacta). El índice/masthead no enlaza a solar: cero anclas rotas. Cobertizo como subapartado de texto con id propia (`#cobertizo`, sin enlaces entrantes: no rompe nada); su foto se reserva una sola vez en ganado, sin duplicar slots.
- Ganado/manejo: roles interpolados desde props (`{nombre}: {funcion}`); el texto "no afirma razas, genética ni propiedad" es autolimitación explícita, no certificación (OT-Q024 distingue cláusulas certificadoras; ver lista en el test).
- `tests/diseno.test.mjs`: ajuste mínimo de composición (lista SHELL_OT05 incluye los 5 componentes nuevos; mismas aserciones, sin relajar criterios) — ver §Riesgos.

## Archivos / diff

- Nuevos: `src/components/FotoPendiente.astro`, `src/components/BloquePortafolio.astro`, `src/components/BloqueFincas.astro`, `src/components/BloqueGanadoManejo.astro`, `src/components/BloqueInfraestructura.astro`, `tests/capitulos.test.mjs`, `docs/implementacion/OT-06/EVIDENCIA.md`.
- Modificados: `src/pages/index.astro` (reensamblada sobre bloques; secciones/ids/orden/hero/cierre intactos), `src/styles/base.css` (+28 líneas OT-06: reserva de slots y contención 485/650), `tests/diseno.test.mjs` (+8 líneas: SHELL_OT05 ampliada).
- Exclusiones respetadas: sin tocar especificaciones, 00_CONTROL, 07_PLAN, 10_OPENCODE, publicacion.ts, resources.ts, perfil.datos.ts, perfil.esperado.ts, package.json (0 scripts nuevos, 0 dependencias).

## Mapa de bloques / estados / anchors (dist/index.html)

| Bloque | Ancla | Estado | Slots / trazabilidad |
|---|---|---|---|
| Hero tipográfico | — | fixture, pendienteAP (reserva genérica, sin O-IMG asignado) | sin slot dedicado |
| Portafolio (3 filas) | `#portafolio` válida | contenido transcrito visible (nivel técnica) | 3× `data-fuente="O-D01"` |
| Fincas (2 capítulos) | `#fincas` válida | contenido transcrito; etiqueta solar filtrada | `data-fuente="O-D01"`; O-IMG01 603x423, O-IMG02 1100x733 |
| Ganado y manejo | `#manejo` válida | roles por finca; pilares sin transcribir | O-IMG03 1100x733 |
| Bebederos | `#bebederos` válida | declarativo + slot contenido | O-IMG04 485x650, `detalle-vertical`, pendienteAP |
| Feedlot | `#feedlot` válida | declarativo + slot | O-IMG05 1208x605, pendienteAP |
| Cobertizo | `#cobertizo` (nueva, sin enlaces) | solo texto, sin slot duplicado | `data-fuente="O-D02"` |
| Solar Beraka | `#solar` válida | deshabilitado, sin cifras | O-IMG06 986x638, pendienteAP |
| Cierre | `#cierre` válida | omitidos de `proyeccionPublica` (5 entradas) | — |

Dist: 0 `<img>`, 0 base64, 6/6 slots con dims de huella, 0 file://, 0 scripts, NIT/contacto/solar/fotos ausentes salvo informe de omitidos.

## Comandos y resultados (local, sin red)

| Comando | Salida / exit |
|---|---|
| `pnpm build` | 1 página, `Complete!`, exit 0 |
| `pnpm check` (astro check + TS estricto) | 18 ficheros, 0 errores/avisos, exit 0 |
| `node --test tests/` (suite completa) | 81 tests, 77 pass, 0 fail, 4 skipped (skips honestos preexistentes OT-Q011/Q012/generador), exit 0 |
| `node --test tests/capitulos.test.mjs` | 12 tests OT-Q007/Q009/Q022/Q023/Q024 en verde |

## Casos no ejecutados

- Ninguno de OT-06: Q007/Q009/Q022/Q023/Q024 ejecutados en verde sobre el compilado. Skips heredados (no son de esta unidad): binarios .woff2 (OT-Q011), comparación visual con capturas (OT-Q012), cruce de hash con originales (generador). Capturas reales de UI: no generadas ni afirmadas (sin capacidad de visión en esta sesión; DOM ≠ visión).

## Riesgos y límites

- Secciones sin imagen real hasta que el operador apruebe derivados (extraer.py + licencias + rama publicada con puertas); solar sin cifras hasta O-D04 (conflicto MW/MWp sin reconciliar).
- `diseno.test.mjs` SHELL_OT05 ampliada a los 5 componentes: las aserciones no cambian, pero el coordinador/revisor debe confirmar que la ampliación de cobertura no cuenta como relajación de criterio.
- `resolucion` en FotoPendiente solo distingue `ausente` hoy; si DERIVADOS deja de estar vacío sin la rama publicada, el slot sigue en placeholder (fallo seguro, visible en tests Q022).
- Falta de dominio/contactos no impidió el desarrollo; sí bloquea publicación (puerta `tecnica`, OT-15).

## Siguiente acción propuesta

- Cierre OT-06 por el coordinador (revisión proporcional: límites de datos) y actualización de ESTADO_TAREAS; siguiente unidad OT-07 (preparador local + contacto) tras aprobaciones OT-15. Operador: derivados, .woff2 + licencias, validación visual.

## Ajustes de cierre (revisor, no bloqueantes) — 2026-09-19

- **Prosa editorial vs transcripción:** los párrafos redactados (no literales) de `BloqueGanadoManejo.astro` (2×) y `BloqueInfraestructura.astro` (3×) llevan ahora `data-fuente="O-D0x"` + `data-tratamiento="resumen"`; solo el listado de roles `{nombre}: {funcion}` y los bloques Portafolio/Fincas conservan `data-fuente` plano (transcripción literal por props). Se eligió la variante `fuente + data-tratamiento` (equivalente a `data-fuente="resumen-editorial O-D0x"`) para no romper la aserción OT-Q007 de trazabilidad (`html.includes('data-fuente="O-D01/O-D02"')`).
- **Códigos de caso fuera del HTML publicable:** `(OT-Q023)` (bebederos) y `(OT-Q006)` (ficha solar) retirados del texto visible → comentarios HTML `<!-- OT-Q023: … -->` / `<!-- OT-Q006: … -->` junto al párrafo correspondiente; quedan en tests/evidencia. Verificado en dist: 0 ocurrencias de `(OT-Q023)`/`(OT-Q006)` fuera de comentarios.
- **Hero alineado con FotoPendiente (mínimo sin romper tests):** se mantuvo la reserva genérica `div.foto-pendiente` (no es un slot O-IMG; convertirla en `FotoPendiente` añadiría un 7.º `figure[data-source]` y rompería OT-Q022 "seis slots", además de exigir `sourceId` nulo contra el tipo `SourceId`), con marcador explícito `data-source="sin-asignar"` + comentario `<!-- Hero sin slot O-IMG asignado … -->`. Mismo vocabulario (`data-source`, `pendienteAP`, `foto-pendiente`) sin fingir trazabilidad O-IMG.
- **Re-verificación local (sin red):** `pnpm build` exit 0 (1 página, `Complete!`); `node --test tests/` exit 0 (81 tests, 77 pass, 0 fail, 4 skipped heredados); `pnpm check` exit 0 (18 ficheros, 0 errores/avisos). Dist: 5× `data-tratamiento="resumen"`, 7× `data-fuente="O-D01/O-D02"`, 6/6 slots O-IMG intactos, hero con `data-source="sin-asignar"`.
