# Matriz de versiones reales — OTERCO

**Mantenimiento:** el coordinador actualiza esta tabla cuando OT-0X cambie el stack.
**Fecha de fijación OT-01:** 2026-09-19. **Entorno:** Linux, Node y pnpm locales del operador.

| Paquete | Versión fijada | Compatibilidad | Comando | Resultado | Fecha |
|---|---|---|---|---|---|
| node | 26.8.2 | `engines` + `.node-version` | `node --version` | OK | 2026-09-19 |
| pnpm | 11.26.0 | `packageManager` + `engines` | `pnpm --version` | OK | 2026-09-19 |
| astro | 5.15.9 | `output: static`, sin adaptador SSR | `pnpm --filter oterco build` | OK, `dist/index.html` único | 2026-09-19 |
| @astrojs/check | 0.9.6 | comprobación Astro + TS estricto | `pnpm --filter oterco check` | OK, 0 errores | 2026-09-19 |
| typescript | 5.9.3 | `extends: astro/tsconfigs/strict` | `pnpm --filter oterco check` | OK | 2026-09-19 |
| esbuild (transitiva) | 0.25.12 | cadena Astro/Vite | `pnpm approve-builds esbuild` | script aprobado y ejecutado | 2026-09-19 |
| sharp (transitiva) | 0.34.5 | solo optimización de imágenes; OT-01 no incluye ninguna | `pnpm approve-builds sharp` | script aprobado; binario precompilado no disponible en este host (intentó compilar desde fuente y falló) — sin uso en OT-01 | 2026-09-19 |

**Notas:**

- `pnpm install` y `pnpm install --frozen-lockfile` terminan con exit 0; `pnpm-lock.yaml` es auténtico (generado por instalación real).
- pnpm 11 exige aprobación explícita de scripts (`allowBuilds` en `pnpm-workspace.yaml`, persistido por `pnpm approve-builds`).
- Aviso de actualización a pnpm 12.4.2 ignorado deliberadamente: OT-01 fija pnpm 11.26.0; no se hacen upgrades mayores por cuenta propia.
- `sharp` queda como riesgo/limitación: si una unidad futura añade fotografía con optimización Astro, debe revalidarse en su entorno; hoy no bloquea nada.
- Reinstalación en copia totalmente limpia (borrado de `node_modules`) **no ejecutada** en OT-01; pendiente del operador o de la unidad que añada CI.
