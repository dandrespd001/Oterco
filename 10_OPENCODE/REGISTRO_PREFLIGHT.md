# Registro real del preflight — OTERCO

Fecha/operador: pendiente. CLI/Node/pnpm/Git: no comprobados en equipo del usuario. CuentaGo: no conectada aquí. Modelos: IDs documentados, acceso no ejecutado. Configuración global/MCP: pendiente.

- [ ] Carpeta correcta y diferencias anteriores revisadas.
- [ ] Configuración generada/validada sin sobrescritura.
- [ ] Versiones y catálogo verificados.
- [ ] Use balance apagado y sin fallbacks de pago.
- [ ] Roles/permisos efectivos comprobados sin secretos.
- [ ] Delegación Task y retorno observados.
- [ ] Fixture de permisos revisado, sin prometer sandbox.
- [ ] Próxima tarea OT-01 o estado existente confirmado.

Resultados, comandos, limitaciones y responsable de correcciones: pendientes. No marcar por anticipado.

## 2026-09-19 — Segunda actualización de preflight (sesión coordinador ses_f452eb8eeffeQJGEN8CFk4jaxV)

**Comprobaciones locales efectadas (permisos allow del perfil):**

- `git status --short` y `git rev-parse --show-toplevel` → **no existe repositorio git** (ningún padre). Sin cambios confirmables; no se usa reset/clean.
- `node --version` → v26.8.2 · `pnpm --version` → 11.26.0 · `git --version` → 2.55.0.
- CLI: OpenCode v2.0.8 (hecho del operador). Cuenta Go conectada de facto vía esta sesión; sin lectura de secretos.
- Carpeta raíz correcta; `opencode.json` y `.opencode/agents/` materializados sin sobrescritura; 4 agentes `ot-*` correctos.
- `apps/` no existe todavía: corresponde crearla dentro de OT-01.

**Migración:** el paquete es un ZIP documental sin `.git`; la migración desde Puerta Abierta no importa estados automáticos ([TRASPASO_Y_SESIONES]). OTERCO arranca con su plan OT-xx intacto.

**Bloqueos/incidencias:**

- Sin repositorio git: la inspección de Git de OT-01 no tiene objeto ejecutable; el implementador puede intentar `git init` en esta raíz si su permiso lo permite; en su defecto queda pendiente del operador.
- Intento de edición de `10_OPENCODE/PREFLIGHT.md` denegado por permisos del coordinador (su ruta no está en la allowlist). Resultado de preflight queda registrado aquí. Propuesto al operador: añadir `10_OPENCODE/PREFLIGHT.md` a los edit-allow del coordinador en una migración autorizada, o que el operador lo marque manualmente.
- Limpieza de opciones ignoradas en `opencode.json`: sigue pendiente (turno anterior); no bloquea.

**Delegación:** arranque de OT-01 autorizado explícitamente por el operador en esta sesión (instrucción directa). Se prepara Task real a ot-implementador con encargo delimitado. No se marca ninguna casilla de pruebas no ejecutadas.

## 2026-09-19 — Actualización de preflight (sesión coordinador ses_f452eb8eeffeQJGEN8CFk4jaxV)

**Hechos aportados por el operador (aceptados como registrados, no revalidados aquí):**

- CLI OpenCode instalada: v2.0.8.
- El catálogo carga los cuatro agentes `ot-*` con los modelos previstos.
- OpenCode omite en la raíz: `subagent_depth`, `provider.opencode-go.whitelist` y `compaction.prune`. **Estos tres campos no se consideran controles efectivos.**

**Comprobaciones inocuas efectadas por el coordinador (solo inspección local con ls/cat/grep; sin acercamiento a secretos, producción ni servicios externos):**

- `.opencode/agents/`: presentes y correctos los cuatro `ot-*` con mode/model/permission previstos.
- Delegación de ot-coordinador: `task: '*' deny` con allow explícito únicamente a ot-implementador, ot-revisor y ot-explorador. **Restricción aplicada.**
- Sin subdelegación: ot-implementador, ot-revisor y ot-explorador declaran `task: deny` (y todowrite deny). **Restricción aplicada por permisos por agente, independientemente de la omisión de `subagent_depth`.**
- Expediente de modelado de modelos: al ser la whitelist inefectiva, la fijación de modelos por agente recae en el campo `model:` de cada `ot-*.md`; se mantendrá como control primario documentado.

**Clasificación:** sin bloqueo obligatorio. La restricción de delegación/subdelegación está efectiva por permisos por agente; no depende de los campos ignorados.

**Pendiente de configuración (no ejecutado ahora; requiere acto del operador):**

- [ ] Limpiar las opciones antiguas ignoradas en `opencode.json` (subagent_depth, provider whitelist idealizado, compaction.prune) tras validación del operador; no sustituyen controles ni extienden permisos.
- [ ] Confirmar versiones Node/pnpm/Git y CuentaGo (sigue sin comprobarse en equipo).

**No modificado en esta pasada:** `opencode.json`, agentes, especificaciones, fichas y Puerta Abierta. No se ha marcado ninguna casilla de pruebas no ejecutadas ("Delegación Task y retorno observados" sigue pendiente hasta la primera Task real del arranque de OT-01).
