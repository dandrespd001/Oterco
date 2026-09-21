# OT-14 — Bloqueos que requieren operador/propietario o destino real · BLOQUEOS_EXTERNO.md

**Unidad:** OT-14 · **Fecha (UTC):** 2026-09-21 · **HEAD:** `c4798cf`
Lista EXHAUSTIVA de pendientes que solo el operador/propietario puede resolver. Cada item
lleva ID, criterio bloqueado, cómo se satisface y evidencia esperada. Nada de esto es fallo
de código (suite 234 verde); sin estas aprobaciones no hay publicación (OT-15/16/17).

| ID | Criterio bloqueado | Cómo se satisface | Evidencia esperada |
|---|---|---|---|
| B-01 | OT-Q012 + V-15/V-17: comparación visual completa vs PA | Operador ejecuta OT-10 §5 pasos 1 y 4 y DIFERENCIAS_PA.md §5 con navegador real y capacidad de visión | Capturas por viewport/ruta + copia gris/sin logos + acta firmada en `00_CONTROL/SESIONES/` |
| B-02 | OT-Q048: práctica de la persona receptora | Receptora edita texto, foto y contacto de prueba y ejecuta verificaciones (RUNBOOK §6), con vuelta atrás | Acta con los 3 cambios + salidas de tests + firma |
| B-03 | OT-Q052 + Q013/Q015–Q018 (parte manual): axe + teclado vivo + lector + capturas | Operador ejecuta OT-10 §5 pasos 1–4 (viewports, Tab/Enter/Espacio/Escape, NVDA-Narrador-Orca, axe DevTools gratuita) | Exportes axe por página + notas de teclado/lector + capturas inspeccionadas |
| B-04 | OT-Q039: Lighthouse ×3 móvil | En destino Free aprobado, 3 ejecuciones móviles comparables sobre el candidato; mediana ≥ 90 | 3 JSON + acta (navegador, throttling, commit) en `docs/implementacion/OT-16/` |
| B-05 | OT-Q020/Q021/Q022 (parte real): fotos | Operador ejecuta `extraer.py` + aporta 6 originales, genera derivados (`generar-derivados.mjs`), registra huellas/permisos/captions | Originales + derivados + tabla de licencias; Q011-derivados sale de skip |
| B-06 | OT-Q011: tipografía real | Aportar `.woff2` + licencias de Caslon + Work Sans, cablear `fonts.css`, verificar carga sin fallback accidental | Binarios + licencias + captura V-03 + suite verde |
| B-07 | OT-Q008/Q051/O-D03: NIT e identidad comercial | Aprobación de NIT/enfoque con discrepancia registral documentada | Documento de aprobación + acta (→ OT-15) |
| B-08 | Buzón/dominio/contactos (Q035, Q040/Q041) | Buzón real probado por operación humana; dominio y hostname canónico aprobados; sin comprar/cambiar MX sin autorización | Buzón verificado + hostname + acta (→ OT-15/16) |
| B-09 | Solares O-D04 (Q006) | Confirmar potencia/unidad/área y rol solar, u omitir el apartado explícitamente | Dato aprobado o acta de omisión (→ OT-15) |
| B-10 | OT-Q003: copia limpia | Borrar `node_modules` y reinstalar con red al registro; lockfile auténtico revalidado | Salida de instalación limpia + `git status` (→ CI/OT-16) |
| B-11 | Q046/CI workflow real | Materializar `PIPELINE_DRAFT.md` en workflow con plan Free real; PRs no confiables sin secretos; permisos/cuotas revisados | YAML + revisión de permisos + acta (→ OT-16) |
| B-12 | OT-15/16/17 con checks y allowlists | Aprobaciones comerciales, destino Free + plan/cuotas, autorización expresa URL/fecha/artefacto, smoke y rollback tras publicar | Actas de coordinador + humo remoto + autorización firmada |

Notas: V-03/V-08 dependen de B-05/B-06; B-04/B-10/B-11 se ejecutan en OT-16 sobre destino
aprobado (B-08). El orden sugerido al operador: B-05 + B-06 + B-07/B-08/B-09 (OT-15) →
B-01 + B-03 (revisión visual y accesibilidad) → B-02 → B-04/B-10/B-11 (OT-16) → B-12 (OT-17).
