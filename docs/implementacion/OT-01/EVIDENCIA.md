# OT-01 — Inspeccionar e inicializar · Evidencia

**Fecha:** 2026-09-19 · **Implementador:** Muse Spark 1.3 Contributor · **Alcance:** base mínima reproducible, sin diseño final ni servicios remotos.

## 1. Inspección previa

- La carpeta NO era repositorio git (`git status` → «no es un repositorio git») y `apps/` no existía. Confirmado antes de actuar.
- `git init` ejecutado en la raíz del encargo: repo vacío inicializado, exit 0 (rama inicial `master` por defecto local; renombrar a `main`, si se desea, queda para el operador).
- No se tocó Puerta Abierta, fuentes históricas, `00_CONTROL`, `07_PLAN`, `10_OPENCODE` ni `.opencode`.

## 2. Archivos creados (ID OT-01)

- `package.json` (raíz: workspace privado, `packageManager` pnpm@11.26.0, `engines` node 26.8.2)
- `pnpm-workspace.yaml` (`apps/*` + `allowBuilds` explícito: esbuild/sharp)
- `.node-version` (26.8.2), `.gitignore`
- `apps/oterco/package.json` (astro 5.15.9, @astrojs/check 0.9.6, typescript 5.9.3 fijados)
- `apps/oterco/astro.config.mjs` (`output: static`, sin adaptador)
- `apps/oterco/tsconfig.json` (estricto, `noUnusedLocals/Parameters`)
- `apps/oterco/src/config/site.ts` (configuración local; valores de andamiaje, no marca/contacto)
- `apps/oterco/src/content/fixture.json` (datos sintéticos marcados `FIXTURE`, no publicables)
- `apps/oterco/src/lib/fixture.ts` (lógica pura: validación + conteo; sin CSS/DOM/marca)
- `apps/oterco/src/styles/base.css` (CSS propio, sin frameworks)
- `apps/oterco/src/pages/index.astro` (única página técnica: main, skip-link, un H1, 0 scripts)
- `pnpm-lock.yaml` (auténtico, generado por instalación real)
- `docs/implementacion/VERSIONES.md` (matriz de versiones reales)

Separación exigida: datos (`content/`), diseño (`styles/`, página), lógica (`lib/`), configuración (`config/`).

## 3. Comandos y resultados

| Comando | Salida resumida | Exit |
|---|---|---|
| `git init` | repo vacío inicializado en la raíz | 0 |
| `pnpm view astro@5.15.9 / @astrojs/check@0.9.6 / typescript@5.9.3 version` | las tres existen en el registro | 0 |
| `pnpm install` (primera) | +350 paquetes; exit 1 solo por `ERR_PNPM_IGNORED_BUILDS` (esbuild/sharp) | 1 (política, no fallo de resolución) |
| `pnpm approve-builds esbuild` | postinstall esbuild ejecutado | 0 |
| `pnpm approve-builds sharp` | script aprobado; su install intentó compilar desde fuente y falló (sin binario en este host) — registrado como limitación | 0 (aprobación) |
| `pnpm install` (final) | «Already up to date», sin errores | 0 |
| `pnpm install --frozen-lockfile` | «Already up to date» | 0 |
| `pnpm --filter oterco check` | 0 errores, 0 avisos (3 ficheros) | 0 |
| `pnpm --filter oterco build` | `mode: static`, 1 página, `dist/index.html` único (1462 B), 0 `<script` | 0 |

## 4. Casos de la ficha

- **OT-Q001** (repo/app únicos, sin restos de Puerta Abierta): **pasado**. Repo nuevo, una sola app, sin imports ni lockfiles ajenos.
- **OT-Q003** (instalación limpia con lockfile auténtico y versiones registradas): **pasado parcial**. Lockfile auténtico + `--frozen-lockfile` OK + VERSIONES.md. Reinstalación en copia totalmente limpia (borrado de `node_modules`) **pendiente** — `rm -rf` denegado por política; queda al operador/CI.
- **OT-Q004** (astro check + TS estricto; build no sustituye): **pasado**. `astro check` ejecutado explícitamente (0 errores) además del build.
- **OT-Q049** (delegación Task real con estado/comandos/resultados persistidos): **no ejecutado por esta unidad**. Lo cierra el coordinador con su acta; esta evidencia es el insumo.

## 5. Decisiones

- Fijar Astro 5.15.9 / @astrojs/check 0.9.6 / TS 5.9.3 tras verificar existencia en registro (no `@latest`).
- No actualizar pnpm a 12.x (aviso ignorado deliberadamente).
- `allowBuilds`: esbuild aprobado (cadena de compilación), sharp aprobado pero sin uso; su binario no funciona en este host.
- Página técnica `noindex, nofollow`; fixture y nombre interno marcados como no publicables.

## 6. Riesgos y limitaciones

- `sharp` no operativo en este host: una futura unidad con fotografía debe revalidar optimización de imágenes.
- Sin CI todavía: la reproducibilidad en máquina limpia no está demostrada de extremo a extremo.
- Rama inicial `master` (defecto local); normalizar a `main` si el coordinador lo decide.

## 7. Siguiente acción propuesta

OT-02 (o unidad que defina el coordinador): validación de la página técnica (negativos/no-JS/teclado) y, cuando corresponda, CI mínimo Linux con instalación limpia.
