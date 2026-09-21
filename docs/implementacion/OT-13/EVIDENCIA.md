# OT-13 — Recuperación y manual de edición · EVIDENCIA

**Unidad:** OT-13 · **Implementador:** Muse Spark 1.3 Contributor · **Fecha (UTC):** 2026-09-21
**Base:** pipeline OT-12 (`candidato/verificar/promocionar` locales); dist técnico noindex
(8 ficheros, 24.577 B, árbol `77d096aa…86e294`); suite 231 verde; perfil/contacto `pendienteAP`.
**Alcance respetado:** `apps/oterco/tests/recuperacion.test.mjs` (nuevo),
`docs/implementacion/OT-13/` (`RUNBOOK.md` + este archivo). Sin cambios en código de
release ni gates, sin publicar, sin deps nuevas, sin tocar especificaciones,
`00_CONTROL`, `07_PLAN`, `10_OPENCODE`, `.opencode`, ni binarios. `dist` **intacto**;
`releases/` solo tocado en `promocion/` (ignorado por git, regenerable).

## 1. Decisiones

- Sin commit previo que restaurar (repo con un solo historial útil para release:
  el candidato vigente `candidato-c6a8c24` = HEAD `c6a8c24` limpio): el ensayo
  altera 1 byte de la **copia de promoción** (nunca `dist`), detecta la
  diferencia contra el manifiesto y restaura con `promocionar --forzar`.
- `tests/recuperacion.test.mjs`: 3 tests con fixture temporal en `/tmp/opencode`
  (repliegue a `os.tmpdir()`), sin tocar `dist/` ni `releases/` reales:
  copia→corrompe→`verificar` FALLA; re-copia desde la fuente (`candidato --forzar`)
  →`verificar` PASA; `promocionar --dest-dir` temporal → humo 200/404.
- `RUNBOOK.md` (no publicable): texto (único editable `perfil.datos.ts` +
  validador por constantes en `perfil.esperado.ts`, con tabla de qué toca cada
  dato confirmable), fotos (`generar-derivados.mjs` + `estadoPermiso`, todo
  pendiente de aprobación), contacto (`perfilBase.contacto` + prueba humana del
  buzón, pasos sin envío automático), recurso deshabilitado (`PREPARADOR_ENABLED`,
  solar bloqueado por aprobaciones/etiquetas vía `proyeccionPublica`), nunca
  tocar `dist` (rebuild tras edición), tabla que indica antes de cada paso cómo
  repetir sus tests, y QUÉ NO cubre la recuperación (DNS/buzón/datos externos;
  copias = git + releases locales; responsables: operador).

## 2. Comandos y salidas (exit codes)

| Comando (cwd `apps/oterco` salvo nota) | Salida resumida | Exit |
|---|---|---:|
| `node --test tests/recuperacion.test.mjs` | 3 tests, 3 pass, 0 fail | 0 |
| `node --test tests/` (suite completa) | 234 tests · 229 pass · 5 skipped (preexistentes OT-11) · 0 fail | 0 |
| `node scripts/release/verificar.mjs --candidato candidato-c6a8c24` | 12× PASA + `RESULTADO: PASA` | 0 |
| `node scripts/release/promocionar.mjs --candidato candidato-c6a8c24 --forzar` | bytes idénticos + humo `/`→200 + inexistente→404 + `PROMOCIÓN LOCAL OK` | 0 |
| corrupción 1 byte en `releases/promocion/candidato-c6a8c24/index.html` + sha256 vs manifiesto | `DIFIERE (corrupción detectada)` (`386ef040…` ≠ `fa78ba6d…`) | 0 |
| `promocionar … --forzar` (restaura) + `verificar` | humo 200/404 + `RESULTADO: PASA`; copia restaurada COINCIDE con manifiesto | 0 |
| `git status --short` (raíz) | solo `?? apps/oterco/tests/recuperacion.test.mjs` (+ este `docs/`, sin commit por encargo) | 0 |
| `git check-ignore -v apps/oterco/releases/promocion/…` (raíz) | `.gitignore:28:apps/oterco/releases/` (ignorado) | 0 |

## 3. Estado de casos

| Caso | Estado | Nota |
|---|---|---|
| OT-Q047 | **pasado** | ensayo local: copia corrompida difiere → restauración re-copia → `verificar` PASA + humo 200/404; cubierto además por `tests/recuperacion.test.mjs` (3/3) |
| OT-Q048 | **manual entregado; práctica pendiente del operador** | `RUNBOOK.md` documenta texto/foto/contacto con dato de prueba y sus verificaciones; la práctica por la persona receptora (tres cambios + volver atrás) no la puede ejecutar el agente |

Casos no ejecutados: práctica receptora Q048 (operador). Sin fallos.

## 4. Diff de la unidad

- `apps/oterco/tests/recuperacion.test.mjs` (nuevo, 3 tests OT-Q047).
- `docs/implementacion/OT-13/RUNBOOK.md` (nuevo, manual no publicable §0–§6).
- `docs/implementacion/OT-13/EVIDENCIA.md` (este archivo).
- Regenerado ignorado: `apps/oterco/releases/promocion/candidato-c6a8c24/` (no en commit).

## 5. Riesgos y siguiente acción

- **R1 (limitación honesta):** recuperación remota/backup cloud = operador; DNS/buzón/
  cuentas no están en git y un rollback no los revierte. Sin prometerlos.
- **R2:** `RUNBOOK.md` exige práctica receptora; sin ella Q048 no cierra.
- **Siguiente acción:** el coordinador valida esta evidencia y agenda OT-14; el operador
  ejecuta la práctica del RUNBOOK §6 (Q048) y conserva originales/DNS/buzón (OT-15/16).
