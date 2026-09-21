# OT-14 — Cierre técnico · CIERRE.md

**Unidad:** OT-14 "Cerrar entrega técnica y diferencias" · **Implementador:** Muse Spark 1.3 Contributor
**Fecha (UTC):** 2026-09-21 · **HEAD:** `c4798cf` (OT-13) · **Rango auditado:** `481f4f4..c4798cf`
**Alcance respetado:** solo `docs/implementacion/OT-14/` (3 archivos nuevos). Sin cambios de código,
sin publicación, sin dependencias nuevas, sin edición de tests existentes, sin red remota.

## 1. Suite completa re-ejecutada desde cero (2026-09-21)

Comando (cwd `apps/oterco`): `node --test tests/` → **234 tests · 229 pass · 0 fail · 5 skipped · 0 todo** · exit 0.

### 1.1 Tests por tema (números reales de esta ejecución)

| Tema pedido en el encargo | Fichero real | tests | pass | fail | skipped |
|---|---|---:|---:|---:|---:|
| acc | `acc.test.mjs` | 23 | 23 | 0 | 0 |
| capitulos | `capitulos.test.mjs` | 12 | 12 | 0 | 0 |
| — (diseño; sin tema pedido) | `diseno.test.mjs` | 10 | 8 | 0 | **2** |
| frontera | `frontera.test.mjs` | 21 | 20 | 0 | **1** |
| integración | `integracion.test.mjs` | 14 | 14 | 0 | 0 |
| perfend (perfil/datos) | `perfil.test.mjs` | 19 | 19 | 0 | 0 |
| preparador | `preparador.test.mjs` | 24 | 24 | 0 | 0 |
| preparador (dist) | `preparador-dist.test.mjs` | 19 | 19 | 0 | 0 |
| secup-main (presupuestos/seguridad) | `presupuesto.test.mjs` | 15 | 15 | 0 | 0 |
| — (recuperación; sin tema pedido) | `recuperacion.test.mjs` | 3 | 3 | 0 | 0 |
| resources (recursos) | `recursos.test.mjs` | 21 | 19 | 0 | **2** |
| release | `release.test.mjs` | 15 | 15 | 0 | 0 |
| seo | `seo.test.mjs` | 19 | 19 | 0 | 0 |
| shell | `shell.test.mjs` | 19 | 19 | 0 | 0 |
| **Total** | 14 ficheros | **234** | **229** | **0** | **5** |

Los 5 skips son honestos y preexistentes (ninguno introducido por OT-14):

| Skip | Motivo | Dueño |
|---|---|---|
| `diseno` OT-Q011 | binarios `.woff2` + licencias pendientes; `fonts.css` sin cablear a propósito | operador (OT-03/OT-15) |
| `diseno` OT-Q012 | comparación visual completa requiere capturas + visión humana | operador (OT-14) |
| `frontera` OT-Q003 | copia limpia (borrar `node_modules` + red al registro) | operador/CI |
| `recursos` ×2 | sin `dist` compilado en ese contexto / sin originales de `extraer.py` | entorno / operador |

### 1.2 Conjuntos re-ejecutados desde cero (cambiaron desde OT-01)

| Comando (cwd `apps/oterco`) | Salida resumida | Exit |
|---|---|---:|
| `pnpm build` | 2 páginas (`/`, `/privacidad/`), static, completo en 821 ms | 0 |
| `pnpm check` | 27 ficheros: 0 errors, 0 warnings, 1 hint (preexistente, `execCommand` en preparador deshabilitado) | 0 |
| `node scripts/medir.mjs` | portada inicial 19.017 B crudo / 5.789 B gzip; CSS 2.005 B gzip; JS 0; preparador incremental 0; 4× CUMPLE | 0 |
| `node --test tests/` | 234 · 229 pass · 5 skipped · 0 fail | 0 |
| `node scripts/release/candidato.mjs` | `CANDIDATO CREADO candidato-c4798cf` · 8 ficheros · 24.577 B · árbol `77d096aa…294` | 0 |
| `node scripts/release/verificar.mjs --candidato candidato-c4798cf` | 12× PASA + `RESULTADO: PASA` | 0 |
| `node scripts/release/promocionar.mjs --candidato candidato-c4798cf --forzar` | bytes idénticos + humo `/`→200 + inexistente→404 + `PROMOCIÓN LOCAL OK` | 0 |

Nota: los scripts `release:verify` / `release:promote:local` de `package.json` pasan
`--candidato` sin valor y fallan por uso (exit 2); es un defecto menor de ergonomía del
script npm, no del pipeline — con valor explícito todo PASA (arriba). Se registra como
discrepancia §5 (D4), sin tocar código en esta unidad.

El candidato `candidato-c4798cf` queda LOCAL en `apps/oterco/releases/` (ignorado por git,
`.gitignore:28`); `dist/` intacto tras rebuild (solo regenerado, `git status` limpio).

## 2. Commits raíz → `c4798cf` (desde la primera evidencia `481f4f4`)

`git rev-list --count 481f4f4..HEAD` = **14 commits**. Lista (`git log --oneline`):

| # | Commit | Unidad |
|---|---|---|
| 1 | `ffe5d20` | Registros post-OT-01: acta, ESTADO, ESTADO_TAREAS, preflight |
| 2 | `1c5b5b6` | OT-02: contratos de datos + ajustes H1+H2 |
| 3 | `7bbffaa` | Registros post-OT-02: ESTADO_TAREAS y acta |
| 4 | `1be1db0` | OT-03: recursos, derivados con guards, fuentes en cuarentena + ajustes |
| 5 | `008e998` | OT-04: composición editorial, tokens, prototipo fixture + ajustes A–D |
| 6 | `f9e35b5` | OT-05: shell propio, enlaces sin `file://` + ajustes F1–F4 |
| 7 | `87361d4` | OT-06: bloques reales, slots foto pendientes, solar bloqueado + ajustes |
| 8 | `8c72b6f` | OT-07: preparador local deshabilitado + ajustes F1–F9 |
| 9 | `491a9cd` | OT-08: configuración pública, SEO fixture, 404, privacidad + ajustes F1–F8 |
| 10 | `83d9049` | OT-09: integración y frontera sobre dist + ajustes H1–H4 |
| 11 | `d114fe4` | OT-10: auditoría programática, skip-link 404 + ajustes |
| 12 | `9189a8c` | OT-11: `medir.mjs`, presupuestos, externalización inline (R1 vía c) |
| 13 | `c6a8c24` | OT-12: pipeline candidato/verificar/promocionar + ajustes H-1..H-8 |
| 14 | `c4798cf` | OT-13: RUNBOOK + test de recuperación (HEAD) |

OT-14 no añade commit de código (solo estos 3 documentos, sin commit por encargo).

## 3. Estado de los casos de esta ficha

| Caso | Estado | Base |
|---|---|---|
| OT-Q010 (wireframes + ficha propia, sin clonar PA) | **pasado** (4 its en `diseno.test.mjs`, verdes hoy) | suite §1.1 |
| OT-Q012 (comparación visual completa vs PA) | **PENDIENTE explícito** — skip honesto; conceptual en `OT-04/fonts/COMPARACION.md`, visual con capturas = operador | DIFERENCIAS_PA.md §5, BLOQUEOS_EXTERNO.md B-01 |
| OT-Q048 (receptora edita + verifica) | **PENDIENTE explícito** — RUNBOOK entregado (OT-13); práctica de la persona receptora sin ejecutar | BLOQUEOS_EXTERNO.md B-02 |
| OT-Q049 (Task real + estado/comandos/resultados persistidos) | **pasado parcial** — la delegación Task real de cada unidad queda acreditada por las actas del coordinador en 00_CONTROL/SESIONES (OT-01..OT-13); el cierre de esta ficha se completa con el acta OT-14 | este archivo + actas del coordinador |
| OT-Q050 (nada fuera de alcance: API/D1/IA/CRM/oscuro/autoplay) | **pasado** (its en `frontera.test.mjs` + `presupuesto.test.mjs`, verdes hoy) | suite §1.1 |
| OT-Q052 (axe + manual + capturas inspeccionadas) | **PENDIENTE explícito** — proxies programáticos verdes; axe/teclado vivo/lector/capturas = operador (OT-10 §5) | BLOQUEOS_EXTERNO.md B-03 |

Casos no ejecutados en OT-14: ninguno nuevo automatizable; los 3 pendientes son **tareas de
operador con capacidad real** (visión, navegador, manos), no comandos omitidos por el agente.
Sin fallos. Sin inflación: lo pendiente no se marca pasado.

## 4. Acta de estado real (sitios noindex/fixture, sin publicar)

- `dist/` técnico: 8 ficheros, 24.577 B, árbol `77d096aa…294`. Las 3 páginas llevan
  `noindex, nofollow` (verificado por grep hoy); cero `<img>`, cero `<script>`, cero
  `mailto:`, 11 marcas `data-estado` en portada (verificado hoy en `dist/index.html`); fuentes y fotos sin servir (0 B).
- Contacto/NIT/dominio/solares: **fixture bloqueado** (`pendienteAP`), sin envío de ningún
  tipo (preparador deshabilitado, `form-action 'none'`, sin fetch/XHR).
- Hosting **no despublicado**: no hay dominio canónico, ni cuenta/destino Free confirmado, ni
  CI remota, ni despliegue; el candidato es local e ignorado por git. Nada de lo anterior se
  afirma como publicado.
- La puerta comercial (`candidato-comercial-aprobado`) sigue rechazada por el propio pipeline
  (verificado en OT-12); la salida técnica no la sustituye.

## 5. Notas de discrepancia ficha ↔ implementado (no registradas como fallo)

- **D1 — Nombres de temas del encargo vs ficheros reales:** el encargo pide listing por
  "perfend … secup-main"; los ficheros son `perfil.test.mjs` y `presupuesto.test.mjs`
  (más `diseno` y `recuperacion`, sin tema pedido). Mapeo en §1.1; sin renombres.
- **D2 — Q049 sin test dedicado:** la ficha lo exige como caso, pero ninguna suite lo
  automatiza (es criterio de proceso). Se acredita por persistencia documental, sin fingir its.
- **D3 — Q046 (CI) solo documental:** `PIPELINE_DRAFT.md` es plantilla textual; no hay
  workflow real que auditar hasta OT-16. No se marca pasado.
- **D4 — `release:verify` / `release:promote:local` con `npm_config_candidato`:** los
  scripts npm interpolan el ID (`--candidato=${npm_config_candidato:-}`, forma `=` porque
  pnpm no exporta `npm_config_candidato` y añade la bandera literal, lo que rompía el
  `parseArgs` con la forma separada). Uso: `pnpm release:verify --candidato=<id>`
  (también vale `--candidato <id>`); verificado hoy con
  `pnpm release:verify --candidato=candidato-c4798cf` → `RESULTADO: PASA`, exit 0 (§7).
  El camino directo `node scripts/release/verificar.mjs --candidato <id>` sigue funcionando.
- **D5 — OT-Q003 en copia limpia:** skip permanente hasta que operador/CI borre
  `node_modules` con red al registro; el lockfile vigente es auténtico pero no revalidado en
  limpio por el agente.

## 6. Riesgos y siguiente acción

- **R1:** mismo autor de implementación en ambas marcas; la diferenciación es de identidad y
  composición, verificable solo por el operador (ver DIFERENCIAS_PA.md §5).
- **R2:** presupuestos holgados hoy (1,9 % del límite) pero sensibles a fuentes/fotos/preparador;
  re-medir al cablear (OT-15/16).
- **Siguiente acción (coordinador):** validar esta evidencia, registrar OT-14 y agendar
  OT-15 (aprobaciones) / OT-16 (destino Free + Lighthouse + humo remoto); el operador ejecuta
  BLOQUEOS_EXTERNO.md empezando por B-01/B-02/B-03.

## 7. Ajustes de cierre del revisor (2026-09-21, sin commit)

| ID | Cambio | Archivo(s) |
|---|---|---|
| F1 | `DIFERENCIAS_PA.md:20` → "texto ~62 ch (`--ot-medida`)" (valor real de `base.css:39`) | DIFERENCIAS_PA.md |
| F2 | Frase de capturas: redacción mínima factual ("esta unidad no genera capturas de PA para evitar colisión") | DIFERENCIAS_PA.md §intro |
| F3 | OT-Q049 → "pasado parcial — la delegación Task real de cada unidad queda acreditada por las actas del coordinador en 00_CONTROL/SESIONES (OT-01..OT-13); el cierre de esta ficha se completa con el acta OT-14" | CIERRE.md §3 |
| F4/D4 | `release:verify` y `release:promote:local` interpolan `npm_config_candidato` (forma `=`; la forma separada fallaba porque pnpm no exporta la variable y `parseArgs` rechazaba la bandera duplicada) | `apps/oterco/package.json` |
| F5 | B-01 → "OT-10 §5 pasos 1 y 4" | BLOQUEOS_EXTERNO.md |
| F6 | Encabezado BLOQUEOS → "Bloqueos que requieren operador/propietario o destino real" | BLOQUEOS_EXTERNO.md |
| F7 | "11 marcas `data-estado`" (verificado en `dist/index.html`) | CIERRE.md §4 |

Re-ejecución tras los ajustes (cwd `apps/oterco`):

| Comando | Salida resumida | Exit |
|---|---|---:|
| `node --test tests/` | 234 tests · 229 pass · 0 fail · 5 skipped · 0 todo | 0 |
| `node scripts/release/verificar.mjs --candidato candidato-c4798cf` | 12× PASA + `RESULTADO: PASA` | 0 |
| `pnpm release:verify --candidato=candidato-c4798cf` | `RESULTADO: PASA` (vía script npm con `npm_config_candidato`) | 0 |

`git status`: solo `docs/implementacion/OT-14/` (nuevo, sin commit por encargo) +
`apps/oterco/package.json` modificado (fix tiny F4). Sin casos no ejecutados nuevos;
los 3 pendientes de operador (§3) siguen vigentes.
