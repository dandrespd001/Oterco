# OT-12 — Pipeline y candidato independiente · EVIDENCIA

**Unidad:** OT-12 · **Implementador:** Muse Spark 1.3 Contributor · **Fecha (UTC):** 2026-09-21
**Base:** dist técnico estable OT-11 (8 ficheros, 24.577 B); `medir.mjs`/presupuestos OT-11; suite 216 en verde.
**Alcance respetado:** solo `apps/oterco/scripts/release/*.mjs` (3 nuevos + `lib.mjs`),
`apps/oterco/tests/release.test.mjs` (nuevo), `apps/oterco/package.json` (3 scripts),
raíz `.gitignore` (1 línea) y `docs/implementacion/OT-12/` (este archivo + `PIPELINE_DRAFT.md`).
Especificaciones, `00_CONTROL`, `07_PLAN`, `10_OPENCODE`, `.opencode` y `dist`: **intactos**.
**El candidato queda LOCAL (`apps/oterco/releases/`, ignorado por git); publicar o release
remoto = OT-16/17 con operador. Sin red remota, sin secretos, sin cuentas, sin despliegue.**

## 1. Decisiones (códigos y campos del manifiesto)

- `siteId` esperado: **`OTERCO-oterco`** (patrón `OTERCO-<slug>`); cualquier otro se rechaza (exit 1).
- Propósitos autorizados: **`candidato-tecnico`** | **`candidato-comercial-aprobado`**; otro valor → exit 1.
  Comercial exige puerta real (`isPublicable(perfilBase)==="comercial"` + `DOMINIO_APROBADO` +
  contacto aprobado+verificado); hoy las tres fallan → comercial rechazado, queda técnico.
- Manifiesto `releases/<id>.json` + carpeta `releases/<id>/` con **copia de bytes de dist
  (sin recompilar, sin modificar el origen; integridad verificada en ambos sentidos)**.
- Campos: `formato` (`oterco-candidato/1`), `id`, `siteId`, `proposito`, `commit{sha,corto,
  seguimientoLimpio,sinSeguimiento}`, `fecha`, `versiones` (node/pnpm/astro/TS/check +
  fuente `VERSIONES.md`), `dominio`/`contacto` = `pendienteAP`, `aprobacionesComercial[]`,
  `origen{dist relativo a `apps/oterco`, ficheros, totalBytes, copiadoSinRecompilar}`,
  `archivos[{ruta,bytes,sha256}]`, `arbolHash` (SHA-256 sobre `ruta\tsha256\tbytes`),
  `totalBytes`, `presupuestos{metodo,filas,cumple}` (re-ejecución OT-11 en origen),
  `notas` (local, sin publicar). `origen.dist` es relativo (H-1): el manifiesto no filtra
  rutas absolutas del operador.
- `verificar.mjs`: re-hash por fichero + árbol (con contador local de integridad: el resumen
  se imprime aunque haya fallos previos de formato/siteId — H-4), `siteId`/propósito,
  detector de origen ajeno (`/puerta[\s_\-]?abierta/i`, hoy ausente en dist), cordura por
  propósito (técnico: 0 `<script>` + `noindex`; comercial: 0 `<script>` + sin `noindex`,
  hoy inalcanzable), presupuestos re-run, cuotas Free (Q053). Borradores no publicables:
  sin detector explícito; se excluyen por la puerta comercial (`comprobarAprobacionComercial`,
  hoy bloquea) + cordura `noindex` del técnico (H-7). Salida `PASA/FALLA` + `RESULTADO:`;
  exit 0/1/2 (2 = uso).
- `promocionar.mjs` (solo local): rehúsa árbol alterado, copia bytes, exige árbol igual
  (sin rebuild), humo efímero 127.0.0.1 (`/`→200, inexistente→404) y registro
  `promocion/<id>.json` (huellas solamente). `_headers` viaja como fichero; su aplicación
  por destino se verifica en OT-16.
- `apps/oterco/releases/` ignorado por git (patrón anclado en raíz `.gitignore:28`;
  `git check-ignore` → `.gitignore:28:apps/oterco/releases/`); artefactos NO en commit.
- Sin YAML real: `PIPELINE_DRAFT.md` es plantilla textual (un solo pipeline, PRs sin secretos,
  abortos Q045, promoción=bytes+huellas); la codificación del workflow la decide el operador
  (SIN ACCOUNTS). Q046 queda en **revisión documental** (sin CI remota que auditar hoy).
- Marca `pendienteAP` (minúsculas) = constante canónica de `src/config/publico.ts`; el encargo
  la cita como «PendienteAP» en prosa, sin cambio de criterio.

## 2. Comandos y salidas (exit codes)

| Comando (cwd `apps/oterco` salvo nota) | Salida resumida | Exit |
|---|---|---:|
| `node --test tests/release.test.mjs` | 15 tests, 15 pass, 0 fail | 0 |
| `pnpm --filter oterco test` (raíz; suite completa) | 231 tests · 226 pass · 5 skipped (preexistentes) · 0 fail | 0 |
| `node scripts/release/candidato.mjs` | `CANDIDATO CREADO candidato-9189a8c` · 8 ficheros · 24.577 B · árbol `77d096aa…294` | 0 |
| `node scripts/release/verificar.mjs --candidato candidato-9189a8c` | 12× PASA + `RESULTADO: PASA` | 0 |
| `node scripts/release/promocionar.mjs --candidato candidato-9189a8c` | bytes idénticos + humo 200/404 + `PROMOCIÓN LOCAL OK` | 0 |
| `candidato.mjs --proposito produccion-directa` | `FALLA propósito "produccion-directa" no autorizado` | 1 |
| `candidato.mjs --site-id PA-puerta-abierta` | `FALLA siteId "PA-puerta-abierta" ajeno` | 1 |
| `candidato.mjs --proposito candidato-comercial-aprobado` (tmp) | `FALLA propósito comercial bloqueado… nivel "tecnica" (nit…; contacto…) \| dominio sin aprobar… \| contacto sin aprobación…` | 1 |
| `candidato.mjs --dist ./dist-inexistente` | `FALLA dist ausente… (ejecutar pnpm build antes)` | 1 |
| `git check-ignore -v apps/oterco/releases/candidato-9189a8c.json` (raíz) | `.gitignore:28:apps/oterco/releases/…` (ignorado, patrón anclado) | 0 |

Perturbaciones cubiertas por la suite (fixtures en tmp, nunca sobre `dist` real):
alterar 1 byte → FALLA+exit 1; manifiesto comercial manipulado → FALLA por aprobaciones;
origen con marca PA inyectada → rechazo; comercial/promoción sobre árbol alterado → rechazo;
cuotas Q053 sintéticas (26 MiB > 25 MiB → limita/informa/sin pagos).

## 3. Manifiesto de ejemplo (extracto; el real vive solo en local ignorado)

> Extracto fiel del manifiesto regenerado el 2026-09-21T13:14:42Z (`candidato-9189a8c`,
> árbol `77d096aa…86e294`, `origen.dist` ya relativo — H-1): se abrevian hashes con `…` y
> `archivos[]` muestra 2 de 8 entradas; el resto de campos es literal.

```json
{
  "formato": "oterco-candidato/1",
  "id": "candidato-9189a8c",
  "siteId": "OTERCO-oterco",
  "proposito": "candidato-tecnico",
  "commit": { "sha": "9189a8c54cc73b…", "corto": "9189a8c", "seguimientoLimpio": false, "sinSeguimiento": 2 },
  "fecha": "2026-09-21T13:14:42.953Z",
  "versiones": { "node": "v26.8.2", "pnpm": "11.26.0", "astro": "5.15.9", "typescript": "5.9.3", "check": "0.9.6" },
  "dominio": "pendienteAP", "contacto": "pendienteAP",
  "aprobacionesComercial": [],
  "origen": { "dist": "dist", "ficheros": 8, "totalBytes": 24577, "copiadoSinRecompilar": true },
  "archivos": [
    { "ruta": "404.html", "bytes": 1650, "sha256": "84ef38fedcef14d5…12528b" },
    { "ruta": "_astro/index.C1V1LZ87.css", "bytes": 6387, "sha256": "db4279c269553b4e…0f820d" }
  ],
  "arbolHash": "77d096aa649d4f4b…082dd1be766de8456e7136f32011fee71286e294",
  "totalBytes": 24577,
  "presupuestos": {
    "metodo": { "algoritmo": "gzip (RFC 1952) vía node:zlib gzipSync, nivel 9 (defecto de zlib)", "sistema": "linux-x64" },
    "filas": [
      { "medida": "transferencia inicial (crudo)", "valor": 19017, "limite": 1000000, "cumple": true },
      { "medida": "JS inicial (gzip)", "valor": 0, "limite": 15000, "cumple": true },
      { "medida": "JS incremental preparador (gzip)", "valor": 0, "limite": 10000, "cumple": true },
      { "medida": "CSS inicial (gzip)", "valor": 2005, "limite": 40000, "cumple": true }
    ],
    "cumple": true
  },
  "notas": [
    "candidato LOCAL: no publicado, sin DNS, sin cuentas remotas (publicar = OT-16/17 con operador)",
    "la promoción copia bytes sin recompilar; las cabeceras por destino se registran aparte (OT-16)"
  ]
}
```

`seguimientoLimpio:false` es honesto: el candidato referencia el commit `9189a8c` (OT-11) y se
generó con los ficheros nuevos de OT-12 aún sin commit; el coordinador decide el commit integrado.

## 4. Estado de casos

| Caso | Estado | Nota |
|---|---|---|
| OT-Q044 | **pasado** | una sola cadena: commit+huellas+config; promoción local sin recompilar (bytes idénticos, árbol igual) |
| OT-Q045 | **pasado** | rechazos verificados: propósito indebido, siteId ajeno, byte alterado, marca PA, dist ausente; borradores no publicables excluidos por la puerta comercial (hoy bloquea, queda técnico) + cordura `noindex` del técnico — sin detector explícito de borradores |
| OT-Q046 | **revisión documental** | plantilla sin secretos y PRs no confiables sin credenciales especificadas; sin CI remota que auditar (SIN ACCOUNTS) → operador |
| OT-Q049 | **pasado** | delegación real por Task; comandos/salidas/exit codes y diff registrados aquí |
| OT-Q053 | **pasado** | árbol recalculable por terceros + cuotas Free: exceso limita/informa sin pagos (test sintético 26 MiB) |

Casos no ejecutados: ninguno de los cinco; Q046 queda documental hasta que exista CI remota (OT-16).
Sin fallos. Skips de suite: 5 preexistentes (OT-11), ajenos a esta unidad.

## 5. Diff de la unidad

- `apps/oterco/scripts/release/lib.mjs` (nuevo): constantes, huellas/SHA-256, árbol, git, versiones,
  origen ajeno, corduras, aprobaciones, presupuestos re-run, cuotas, parseArgs.
- `apps/oterco/scripts/release/candidato.mjs` (nuevo): CLI de generación local.
- `apps/oterco/scripts/release/verificar.mjs` (nuevo): CLI PASA/FALLA con exit codes.
- `apps/oterco/scripts/release/promocionar.mjs` (nuevo): promoción local + humo efímero.
- `apps/oterco/tests/release.test.mjs` (nuevo): 15 tests (Q044/Q045/Q047/Q053).
- `apps/oterco/package.json`: `release:prepare`, `release:verify <id>`, `release:promote:local <id>`
  (solo locales; `release:publish/rollback` remotos NO implementados: OT-16/17).
- Raíz `.gitignore`: `apps/oterco/releases/` (patrón anclado; artefactos nunca en commit).
- `docs/implementacion/OT-12/`: `EVIDENCIA.md` (este archivo) + `PIPELINE_DRAFT.md` (sin YAML).
- Ajustes de cierre del revisor (H-1/H-3/H-4, ver §7): `origen.dist` relativo a `RAIZ_APP`,
  limpieza del candidato previo con `--forzar` (`rmSync`), contador local de integridad en
  `verificar.mjs`; `.gitignore` anclado a `apps/oterco/releases/`.

## 6. Riesgos y siguiente acción

- **R1:** el candidato referencia `9189a8c` (pre-OT-12); tras el commit integrado de OT-12 el
  coordinador puede ordenar regenerarlo para fijar el nuevo sha. Los artefactos actuales son
  regenerables (`--forzar`) y están ignorados por git.
- **R2 (Q046):** sin cuentas/CI remota no hay auditoría de permisos reales; pendiente operador (OT-16).
- **Siguiente acción:** el coordinador valida esta evidencia y agenda OT-13; el operador decide el
  workflow real (PIPELINE_DRAFT §5) y aporta dominio/contactos/destino (OT-15/OT-16). Publicar o
  tocar cuentas remotas sigue prohibido para el agente.

## 7. Cierre del revisor — ajustes H-1/H-2/H-3/H-4/H-7/H-8 (2026-09-21, sin commit)

H-1 (`candidato.mjs:142`): `origen.dist` pasa de absoluto a `relative(RAIZ_APP, dirDist)`
(`"dist"` en el candidato real; verificado por lectura del manifiesto).
H-3 (campo real `--forzar`; en el código no existía el typo `--forzer`):
`rmSync(dirCandidato, { recursive: true, force: true })` antes de copiar solo con `--forzar`;
sin `--forzar` se mantiene la falla segura si el candidato existe.
H-4 (`verificar.mjs:101`): contador local `fallosIntegridadAntes`; el resumen
`PASA <n> ficheros con hash íntegro` se imprime aunque haya fallos previos de formato/siteId.
H-2: el manifiesto de §3 queda etiquetado como «extracto» con los campos antes ausentes
(`origen.dist` relativo, `aprobacionesComercial`, `archivos[]`, `presupuestos.metodo/filas`, `notas`).
H-7: Q045 redactado como exclusión de borradores por puerta comercial + cordura `noindex`
(sin detector explícito). H-8: `.gitignore` anclado a `apps/oterco/releases/`.

| Comando (cwd `apps/oterco` salvo nota) | Salida resumida | Exit |
|---|---|---:|
| `node scripts/release/candidato.mjs --forzar` (regenera; `dist` intacto, árbol `77d096aa…86e294`) | `CANDIDATO CREADO candidato-9189a8c` · 8 ficheros · 24.577 B | 0 |
| `node scripts/release/candidato.mjs` (sin `--forzar`, candidato existente) | `FALLA el candidato … ya existe … (usar --forzar para regenerar)` | 1 |
| `node scripts/release/candidato.mjs --forzar` (con `RESTO-INTRUSO.tmp` plantado) | regenera limpio: resto eliminado, `origen.dist="dist"` | 0 |
| `node scripts/release/verificar.mjs --candidato candidato-9189a8c` | 12× PASA + `RESULTADO: PASA` | 0 |
| `verificar.mjs` sobre copia en tmp con `formato`+`siteId` corruptos | `PASA 8 ficheros con hash íntegro` presente + `RESULTADO: FALLA (2 causa(s))` | 1 |
| `node scripts/release/promocionar.mjs --candidato candidato-9189a8c --forzar` | bytes idénticos + humo 200/404 + `PROMOCIÓN LOCAL OK` | 0 |
| `node --test tests/release.test.mjs` | 15 tests, 15 pass, 0 fail | 0 |
| `pnpm --filter oterco test` (raíz; suite completa) | 231 tests · 226 pass · 5 skipped (preexistentes) · 0 fail | 0 |
| `git check-ignore -v apps/oterco/releases/candidato-9189a8c.json` (raíz) | `.gitignore:28:apps/oterco/releases/…` (ignorado) | 0 |

Casos no ejecutados en este cierre: ninguno adicional; Q046 sigue documental (sin CI remota).
Sin commit, por encargo del coordinador.
