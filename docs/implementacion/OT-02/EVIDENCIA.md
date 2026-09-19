# OT-02 — Modelar contenido y discrepancias · Evidencia

**Fecha:** 2026-09-19 · **Implementador:** Muse Spark 1.3 Contributor · **Base:** commit `481f4f4` (OT-01).
**Alcance:** esquema tipado + validación del perfil transcrito, puerta editorial leída de datos y pruebas OT-Q005..OT-Q009. Sin publicar, sin contactos/NIT reales nuevos, sin HTML ancestral.

## 1. Decisiones

- **Sin Zod ni Vitest nuevo:** la red remota no está autorizada en esta unidad, por lo que no se instaló ninguna dependencia. Validación en TS estricto puro (`src/content/perfil.ts`) y pruebas con el runner estándar de Node (`node --test tests/`, ejecutable como `pnpm --filter oterco test`). Vitest queda como pendiente de decisión del coordinador (requiere red para `pnpm add -D vitest`).
- **Dos archivos en `content/`:** `perfil.datos.ts` (ÚNICO archivo editable de contenido; cambio localizado OT-Q009) + `perfil.ts` (tipos y `validarPerfil()` que devuelve lista de errores sin lanzar).
- **Vocabulario editorial `fixture|pendiente|aprobado`:** `pendiente` cubre `draft`/`blocked` de la especificación. Todo lo conflictivo nace `pendiente` con `aprobaciones: []`.
- **Mención solar de Beraka separada:** `texto` (literal no conflictivo) + `anexoSolarLiteral` (oración solar literal) + etiquetas verbatim. La proyección pública filtra etiquetas solares mientras el bloque siga pendiente. Clasificación editorial, no invención: ambos literales son verbatim.
- **Puerta única `isPublicable()`:** lee `Perfil.aprobaciones` (tokens `nit|contacto|solar|fotos`), nada hardcodeado. Comercial exige NIT aprobado + contacto aprobado **y** buzón verificado; un `"aprobado"` sin entrada en el registro es error de validación y mantiene el nivel técnico. Solar/fotos pendientes se **omiten** (no bloquean por sí solos la vía comercial futura, pero hoy todo es técnico); los mensajes de `omitidos`/`motivosBloqueo` no repiten cifras bloqueadas (hallazgo de prueba corregido).
- **`index.astro` sin cambios:** ya tiene skip-link, `main`, un H1 y 0 scripts; solo muestra el fixture OT-01, sin NIT/contacto/solar. No había aria/dedup que corregir ni justificación para tocar estilos.
- **Sin campo registral:** el modelo no tiene `ciiu`/actividad; un campo así se rechaza como "no permitido (posible inferencia)".

## 2. Archivos creados/modificados (diff)

| Archivo | Líneas | Rol |
|---|---|---|
| `apps/oterco/src/content/perfil.ts` | 470 | Tipos + `validarPerfil()` (literales, spellings, 2 fincas/3 líneas, estados, registro de aprobaciones, anti-inferencia) |
| `apps/oterco/src/content/perfil.datos.ts` | 118 | Datos transcritos O-D01/O-D02, todo `pendiente`, `aprobaciones: []` |
| `apps/oterco/src/config/publicacion.ts` | 143 | `isPublicable()`, `motivosBloqueo()`, `alcancesAprobados()`, `proyeccionPublica()` |
| `apps/oterco/tests/perfil.test.mjs` | 186 | 14 its en 5 suites (OT-Q005..009) |
| `apps/oterco/package.json` | +2/-1 | Script `test: node --test tests/` |

`git status`: 1 modificado (`package.json`), 4 rutas nuevas. No se tocaron `index.astro`, estilos, `00_CONTROL/07_PLAN/10_OPENCODE`, `.opencode`, ni especificaciones.

## 3. Comandos y resultados (salida resumida, exit code)

| Comando (local, sin red) | Resultado | Exit |
|---|---|---|
| `node --test tests/` (en `apps/oterco`) | 14 tests, 14 pass, 0 fail (5 suites) | 0 |
| `pnpm --filter oterco check` | 0 errores, 0 avisos (6 ficheros) | 0 |
| `pnpm --filter oterco build` | 1 página, `/index.html`, static | 0 |
| `grep` datos conflictivos en `dist/index.html` (`11.6`, `contacto@`, `830.128`, `Fotografias`) | 0 menciones | — |
| `grep -c "<script" dist/index.html` | 0 scripts | — |

Iteración intermedia: un test detectó que `omitidos` repetía las cifras solares (`11.6 MW / 21 ha`); se corrigieron los mensajes de `publicacion.ts` para no dejar rastros y la suite pasó completa.

## 4. Estado por caso

- **OT-Q005** (fuentes clasificadas; sin CIIU inferido): **pasado** (3 its: ausencia de campo registral + serializado sin `CIIU/4321/4620`, rechazo de `ciiu` inventado, base válida).
- **OT-Q006** (solar/contacto/NIT/fotos ausentes sin aprobación): **pasado** (2 its: proyección nula en los cuatro + barrido de rastros en el JSON; filtro de etiqueta solar de Beraka).
- **OT-Q007** (2 fincas / 3 líneas según transcripción): **pasado** (2 its: spellings de nombres/municipios/departamentos/funciones + fragmentos literales; categorías/títulos/descripciones).
- **OT-Q008** (sin aprobación → técnica, no comercial): **pasado** (3 its: base → `tecnica` con motivos nit+contacto; fixture aprobado NIT+contacto → `comercial` con solar aún omitido; `aprobado` sin registro → error + sigue técnica).
- **OT-Q009** (cambio localizado + rechazo de inválidos): **pasado** (4 its: edición de texto revalida; estado `borrador` → error explícito; tercera finca y clave desconocida → error; spellings con espacio/`Cria` → error).

## 5. Casos no ejecutados / pendientes de la unidad

- Vitest: no instalado (requiere red). Pruebas equivalentes ejecutadas con `node:test`; migración a Vitest pendiente de autorización de red del operador.
- Captura visual: no aplica (sin cambios de UI; `index.astro` intacto).
- Resto de casos OT-Q*: fuera del alcance de esta ficha.

## 6. Riesgos y límites

- El validador es manual (sin Zod): si el modelo crece, considerar Zod cuando haya red autorizada.
- `import type` + imports con extensión `.ts` explícita en tests: necesario para que Node aplique type-stripping sin resolver como bundler; Astro/Vite no se ven afectados (`check`/`build` en verde).
- Los textos son transcripción, no hechos certificados; NIT con DV, email, solar y fotos siguen pendientes (ver §7).

## 7. Pendientes del operador (no bloquean entrega técnica)

1. **NIT:** confirmar `830.128.652-4` contra certificado O-D03 antes de publicar.
2. **Contacto:** prueba humana del buzón `contacto@oterco.com.co`; sin ella no hay `verificado:true` ni release comercial. No comprar el dominio por inferencia.
3. **Solar:** confirmar potencia/unidad, relación con el proyecto y estado real (conflicto O-D04 sin reconciliar); bloqueado mientras tanto.
4. **Fotos:** registrar licencias/consentimientos de las 6 imágenes antes de aprobar la afirmación de origen.
5. **Aprobaciones:** cada futura entrada necesita responsable, fecha, alcance, documento y observaciones; `estado:"aprobado"` sin entrada se rechaza.

## 8. Siguiente acción propuesta

OT-03 (o la que defina el coordinador): usar `proyeccionPublica()` en la página real cuando el diseño lo requiera, manteniendo la página técnica actual como salida no publicable; el coordinador decide sobre Vitest vs `node:test`.

## 9. Corrección post-revisión (2026-09-19, mismo implementador)

**Alcance:** H1 (media) + H2 (baja). Solo se tocaron `src/content/perfil.ts`, `src/content/perfil.esperado.ts` (nuevo), `src/config/publicacion.ts`, `tests/perfil.test.mjs` y esta evidencia. Sin commit, sin dependencias, sin red.

- **H1 — literales en lugar único:** nuevo `src/content/perfil.esperado.ts` con las constantes de igualdad (`ESPERADO_RAZON_SOCIAL`, `ESPERADO_ENFOQUE`, `ESPERADO_NIT_TRANSCRITO`, `ESPERADO_EMAIL`, `ESPERADO_SOLAR_AREA`, `ESPERADO_FOTOS_AFIRMACION`, `FINCAS_ESPERADAS`, `OFERTA_ESPERADA` sin títulos) + formatos (`NIT_PROPUESTO_FORMATO`, `SOLAR_POTENCIA_FORMATO`). `perfil.ts` importa esas constantes (ya no duplica literales en el validador); los tipos de igualdad derivan de ellas vía `typeof`, y los confirmables (`nit.valorCompletoPropuesto`, `solar.potencia`, `oferta[].titulo`) son `string` validados por formato/estructura (título: no vacío). Cambiar un dato confirmado exige editar solo `perfil.datos.ts` (+ la constante equivalente aquí si se mantiene igualdad). Se mantiene el rechazo de claves desconocidas y el no-lanzar (`validarPerfil` devuelve lista).
- **H2 — puerta ante perfil inválido:** `motivosBloqueo()` antepone un motivo `validacion:` cuando `validarPerfil(perfil)` no está vacío, por lo que `isPublicable()` y `proyeccionPublica().nivel` (que delega) devuelven `tecnica` aunque las aprobaciones parezcan completas.
- **Nota de resolución:** los imports de valor entre módulos usan extensión `.ts` explícita (`./perfil.esperado.ts`, `../content/perfil.ts`), necesaria para el type-stripping de Node (el nombre con punto impedía la resolución sin extensión; el import solo-`type` anterior nunca se resolvía en runtime). `allowImportingTsExtensions` ya está activo en el tsconfig base de Astro, por lo que `check` sigue en verde.
- **Tests nuevos (5 its):** H1 (lugar único refleja la base; confirmado con formato válido edita solo datos; formatos inválidos se rechazan sin lanzar) + H2 (clave desconocida con todo aprobado → técnica con motivo `validacion:` y nivel técnico en proyección; título vacío → técnica). Los 14 its previos siguen pasando sin cambios.

| Comando (local, sin red) | Resultado | Exit |
|---|---|---|
| `node --test tests/` (en `apps/oterco`) | 19 tests, 19 pass, 0 fail (7 suites) | 0 |
| `pnpm --filter oterco check` | 0 errores, 0 avisos (7 ficheros) | 0 |
| `pnpm --filter oterco build` | 1 página, `/index.html`, static | 0 |

Casos no ejecutados: ninguno nuevo (Vitest/captura visual siguen según §5; sin cambios de UI).
