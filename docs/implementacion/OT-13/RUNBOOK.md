# OT-13 — Manual de edición y recuperación (RUNBOOK, no publicable)

**Proyecto:** OTERCO · **Fecha (UTC):** 2026-09-21 · **Unidad:** OT-13
**Estado del sitio:** dist técnico noindex; perfil/contacto `pendienteAP`; suite 234 en verde
(231 OT-12 + 3 OT-13 `tests/recuperacion.test.mjs`).
**Este documento NO se publica** (no va a `dist`, no se enlaza desde la web):
es la guía de la persona receptora para editar sin romper la cadena
`candidato → verificar → promocionar` (OT-12).

## 0. Regla de oro y mapa de archivos

- **Nunca editar `apps/oterco/dist/` a mano.** `dist` es salida generada:
  toda edición se hace en fuente y se reconstruye con `pnpm build`
  (desde `apps/oterco`). Editar `dist` invalida los hashes del manifiesto
  y `verificar` lo rechazará.
- **Un solo archivo de contenido editable:** `apps/oterco/src/content/perfil.datos.ts`
  (único con literales de negocio). Ningún literal de contenido vive en
  componentes `.astro` (OT-Q009): solo interpolan props.
- **Validador:** `src/content/perfil.ts:validarPerfil()`; sus literales
  esperados viven en `src/content/perfil.esperado.ts` (§1: qué toca cada dato).
- **Fotos:** originales fuera del repo + `scripts/generar-derivados.mjs` +
  registro `src/assets/resources.ts` (todo `pendiente`, §2).
- **Contacto/preparador:** `perfilBase.contacto` + `src/tools/preparador/`
  (`config.ts`, `destino.ts`). Sin envío automático: el buzón se prueba
  con operación humana (§3).
- **Bloques deshabilitados:** se activan con **datos aprobados**, no tocando
  componentes (§4).
- Tras CUALQUIER edición: `pnpm build` + tests del recorrido afectado
  (tabla del §6) + `node scripts/release/candidato.mjs --forzar` si se quiere
  nuevo candidato. Publicar o tocar DNS/cuentas = operador (OT-16/17).

## 1. Cambiar un texto

**Dónde:** solo `apps/oterco/src/content/perfil.datos.ts`.

**Qué se puede cambiar libremente (con validación de forma):**

| Campo | Regla del validador |
|---|---|
| `identidad.perfil`, `identidad.region` | texto no vacío |
| `fincas[].texto`, `oferta[].descripcion` | texto no vacío |
| `fincas[].etiquetas` | lista no vacía de textos; si el bloque solar sigue pendiente, las etiquetas que mencionen solar/MW se filtran en la salida pública (§4) |
| `fincas[0].anexoSolarLiteral` (Beraka) | **conservar literal**: la mención solar debe mantenerse tal cual hasta que el conflicto se resuelva con aprobación |
| `nit.valorCompletoPropuesto` | **confirmable**: formato `NNN.NNN.NNN-D` (`NIT_PROPUESTO_FORMATO`), no literal congelado |
| `solar.potencia` | **confirmable**: cifra + unidad MW/MWp (`SOLAR_POTENCIA_FORMATO`); no reconciliar MW con MWp por redondeo |
| `oferta[].titulo` | **confirmable**: texto no vacío, sin literal congelado |
| `contacto.email` | formato de buzón estricto; ver §3 antes de darlo por bueno |

**Qué NO tocar sin aprobación registrada del operador:**

| Campo | Motivo |
|---|---|
| `ESPERADO_*` en `perfil.esperado.ts` (`RAZON_SOCIAL`, `ENFOQUE`, `NIT_TRANSCRITO`, `EMAIL`, `SOLAR_AREA`, `FOTOS_AFIRMACION`, `FINCAS_ESPERADAS`, `OFERTA_ESPERADA`) | son los literales transcritos de O-D01/O-D02; si el dato real confirmado cambia, se editan **juntas** `perfil.datos.ts` y la constante equivalente, con documento y responsable |
| `estado: "aprobado"` y entradas de `aprobaciones[]` | solo el operador las añade (responsable, fecha, alcance, documento); poner `"aprobado"` sin token de alcance no publica nada y rompe la puerta comercial |

**Procedimiento (texto):**

1. Editar `perfil.datos.ts` (ese archivo y ningún otro).
2. Repetir la verificación correspondiente **antes de compilar**:
   `node --test tests/perfil.test.mjs` (valida forma, literales y puerta editorial).
3. Reconstruir: `pnpm build` (desde `apps/oterco`).
4. Repetir la verificación del recorrido afectado sobre el compilado:
   `node --test tests/capitulos.test.mjs` (textos de fincas/oferta en `dist`)
   y `node --test tests/seo.test.mjs` (título/descripción/robots/sitemap).
5. Si algo falla, volver atrás con git (`git diff` / `git checkout -- <archivo>`);
   `dist` se regenera, no se parcha.

## 2. Cambiar una foto

**Estado actual honesto:** las 6 fotos originales NO están en el repo y los
6 permisos están en `pendiente`. La web muestra marcadores
(`FotoPendiente`), nunca una foto sin trazabilidad. Nada de este
procedimiento aprueba una foto para publicación: eso lo registra el
operador con licencias/consentimientos.

**Procedimiento (foto):**

1. El operador aporta los originales en carpeta privada mediante `extraer.py`
   (`original-01…06.jpg` + `inventory.json`; ver `09_FUENTES/EXTRACCION_LOCAL.md`).
   Esa carpeta nunca entra al repo ni a `public/`.
2. Generar derivados (utilidad local, no parte de la web):
   `node scripts/generar-derivados.mjs <carpeta-privada>`
   (exit 2 = originales ausentes, operador encargado; exit 1 = huella/formato
   inválido, sin escribir nada). Produce base EXIF-strip + manifiesto con
   plan de anchos topado a la resolución natural (sin simular calidad).
3. Registrar cada derivado publicado en `src/assets/resources.ts` (`DERIVADOS`):
   `sourceId`, SHA-256 propio, bytes, formato, dimensiones (nunca mayores que
   el original), `destino` bajo `src/assets/`, `src` local (prohibido
   remoto/`data:`/`file:`), `srcset`+`sizes` coherentes, `crop`, `carga`
   (O-IMG04 y O-IMG06 siempre `lazy`; O-IMG06 fuera del primer viewport) y
   `estadoPermiso` (nace `pendiente`).
4. Revisar el `alt` a mano: describe la escena, **sin certificar raza ni
   propiedad** (prohibido: Brahman/búfalo/cebuino, “Hacienda Beraka”,
   “nuestro ganado”, “raza”, “certifica/garantiza”). `validarAlt()` lo rechaza.
5. Solo un derivado con `estadoPermiso: "aprobado"` + validación OK + alt
   aceptable es publicable (`esPublicableDerivado()` / `altParaPublicar()`);
   el permiso lo cambia el operador con registro de derechos, no el editor.
6. Reconstruir (`pnpm build`) y repetir la verificación correspondiente:
   `node --test tests/recursos.test.mjs` (inventario, puertas, generador)
   y `node --test tests/capitulos.test.mjs` (Q022/Q023/Q024 sobre el compilado).

## 3. Cambiar un contacto (buzón) — prueba humana, sin enviar aún

**Estado actual honesto:** `contacto@oterco.com.co` sin comprobar
(`estado: "pendiente"`, `verificado: false`, `aprobaciones: []`). La web
muestra «contacto pendiente de aprobación» y el preparador trabaja en modo
copia: ningún `mailto:` con buzón sin aprobar sale a `dist`.

**Procedimiento (contacto):**

1. Editar solo `perfilBase.contacto.email` en `perfil.datos.ts`. Mantener
   `estado: "pendiente"` y `verificado: false` hasta completar el paso 3.
2. Validar forma sin publicar nada: `node --test tests/perfil.test.mjs`
   y `node --test tests/preparador.test.mjs` (formato de buzón, modo copia).
3. **Prueba humana del buzón (la hace una persona, nada automático):**
   a) desde un correo propio, enviar un mensaje de prueba al buzón nuevo;
   b) confirmar recepción **y** respuesta desde ese buzón (bandeja + remitente
   visibles); c) anotar fecha, responsable y resultado en el registro de
   mantenimiento; d) **no** instalar envío automático, formularios ni
   webhooks: abrir el cliente de correo no acredita entrega y nunca se
   anuncia «envío confirmado».
4. Solo tras 3c y con aprobación registrada (`aprobaciones[]` con alcance
   `"contacto"`, responsable y documento) poner `estado: "aprobado"` y
   `verificado: true`. Teléfono/WhatsApp, si algún día existen, siguen la
   misma regla: solo aparecen tras aprobación (OT-Q035).
5. Reconstruir y repetir: `pnpm build`, `node --test tests/preparador.test.mjs`,
   `node --test tests/preparador-dist.test.mjs` y `node --test tests/seo.test.mjs`
   (anclas y contacto en el compilado).

## 4. Activar o desactivar un recurso bloqueado

Los bloques se gobiernan con **datos**, no editando componentes.

**Preparador (`PREPARADOR_ENABLED`):**

- Hoy `false` en `src/tools/preparador/config.ts`: la página no importa el
  componente y `dist` no publica ningún recurso exclusivo del módulo (OT-Q032).
- Activarlo exige, en este orden: contacto aprobado y verificado (§3),
  ancla `#preparar-consulta` cableada en la página, y `PREPARADOR_ENABLED = true`.
  El destino del correo NO vive en la config: `destino.ts:resolverDestino()`
  deriva mailto/copia desde `perfilBase.contacto` + `aprobaciones` en build
  y en cliente. Sin aprobación sigue el modo copia con «contacto pendiente
  de aprobación».
- Desactivar = volver a `false` y reconstruir. Verificación correspondiente:
  `node --test tests/preparador-dist.test.mjs` (con el módulo deshabilitado,
  `dist` sin recursos exclusivos) y `node --test tests/preparador.test.mjs`.

**Ficha solar (bloqueada por aprobaciones y etiquetas):**

- `proyeccionPublica()` (`src/config/publicacion.ts`) omite cifras solares,
  mención y etiquetas solares de Beraka (filtro `/solar|MW/i`) mientras
  `solar.estado` no esté `"aprobado"` con alcance `"solar"`.
  `BloqueInfraestructura.astro` muestra entonces «Ficha secundaria pendiente»,
  sin cifras en el HTML.
- Activar = resolver el conflicto O-D04 (11.6 MW frente a 11,65 MWp y
  variantes) con documento del operador, registrar la aprobación con alcance
  `"solar"` y reconstruir. Nunca escribir cifras a mano en el `.astro`.
- Verificación correspondiente: `node --test tests/perfil.test.mjs`
  (formato de potencia), `node --test tests/capitulos.test.mjs` y
  `node --test tests/seo.test.mjs` sobre el compilado.

## 5. Recuperación: restaurar una release anterior (local)

**Qué cubre:** restaurar los bytes de un candidato ya verificado y repetir
las comprobaciones. Ensayado en OT-13 sobre `candidato-c6a8c24`
(ver `EVIDENCIA.md` de esta unidad): copia de promoción con 1 byte alterado
→ hash difiere del manifiesto → `promocionar --forzar` re-copia desde el
candidato íntegro → `verificar` PASA + humo `/`→200, inexistente→404.

**Procedimiento (todos los comandos desde `apps/oterco`):**

1. Listar candidatos locales: `ls releases/` (carpeta ignorada por git;
   cada candidato = `releases/<id>/` + `releases/<id>.json`).
2. Verificar el candidato a restaurar:
   `node scripts/release/verificar.mjs --candidato <id>` (exige `RESULTADO: PASA`).
3. Restaurar la copia servible sin recompilar:
   `node scripts/release/promocionar.mjs --candidato <id> --forzar`
   (re-copia bytes, comprueba árbol idéntico y hace humo 200/404).
4. Repetir la suite que corresponda al cambio restaurado (§6); como mínimo
   `node --test tests/recuperacion.test.mjs` si se tocó el artefacto.
5. Registrar incidente: qué se restauró, causa, quién, cuándo
   (05_INFRAESTRUCTURA/SEGURIDAD_Y_OPERACION.md: rutina de incidente).

**QUÉ NO cubre (limitación honesta):**

- DNS, dominio, buzón/cuentas y cabeceras efectivas del destino: **no** están
  en git ni en ningún candidato; los controla el propietario/operador.
  Un rollback de código no revierte DNS/correo/cuentas.
- Copias de assets/configuración = repo git + releases locales ignoradas
  (`apps/oterco/releases/`); los originales fotográficos viven en carpeta
  privada del operador, fuera del repo.
- Recuperación remota o backup cloud = **operador** (sin prometer nada que
  git no contenga). La publicación y el rollback remotos reales son OT-16/17.

## 6. Tabla: cada cambio y cómo repetir sus tests

| Cambio | Tests correspondientes (desde `apps/oterco`) |
|---|---|
| Texto (§1) | `node --test tests/perfil.test.mjs` → `pnpm build` → `node --test tests/capitulos.test.mjs` → `node --test tests/seo.test.mjs` |
| Foto (§2) | `node --test tests/recursos.test.mjs` → `pnpm build` → `node --test tests/capitulos.test.mjs` |
| Contacto (§3) | `node --test tests/perfil.test.mjs` + `node --test tests/preparador.test.mjs` → prueba humana del buzón → `pnpm build` → `node --test tests/preparador-dist.test.mjs` + `node --test tests/seo.test.mjs` |
| Preparador on/off (§4) | `node --test tests/preparador.test.mjs` + `node --test tests/preparador-dist.test.mjs` tras `pnpm build` |
| Solar on/off (§4) | `node --test tests/perfil.test.mjs` → `pnpm build` → `node --test tests/capitulos.test.mjs` + `node --test tests/seo.test.mjs` |
| Restaurar release (§5) | `node scripts/release/verificar.mjs --candidato <id>` + `node scripts/release/promocionar.mjs --candidato <id> --forzar` + `node --test tests/recuperacion.test.mjs` |
| Cierre general | `node --test tests/` (suite completa) |

Sin panel CMS no se promete edición visual para cualquier usuario: la
persona receptora practica tres cambios (texto, foto y contacto con dato de
prueba), localiza los archivos, valida, revisa preview y explica cómo volver
atrás (§1 paso 5). La práctica queda pendiente del operador (OT-Q048).
