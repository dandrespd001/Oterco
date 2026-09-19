# Acta 2026-09-19 — OT-03 Extracción e inventario de recursos

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (unidad ses_f44c6e98affeH72X9TIKgE6qi5 + ajustes ses_f44becaafffe7g81julHUwU78l) · **Revisor:** ot-revisor (ses_f44c0d75cffem6aKFnvUd8IhFT).

## Alcance real

Los seis originales JPEG y el HTML fuente NO están en esta raíz: su extracción con `extraer.py` en carpeta privada esiveringo paso del operador. La unidad entrega la infraestructura y gates sin adelantar aprobaciones ni bytes.

## Resultados

- `src/assets/resources.ts`: inventario tipado con las 6 huellas documentales (cruzadas contra INVENTARIO_RECURSOS.md por el revisor, 6/6 coinciden), `resolverRecurso()`/`altParaPublicar()` devuelven "ausente"/null sin derivado aprobado; nada publicable sin permiso+trazabilidad+validación.
- `scripts/generar-derivados.mjs`: verificación SHA-256/dimensiones/inventory.json, strip EXIF uni APPn/COM own, jamás autoexec en build; guard de origen y **destino** `public/` (ajuste H1). Exits 0/1/2 únicos.
- `tests/recursos.test.mjs`: 40 tests — 38 pass, 2 skip honestos (WOFF2 pendientes, cruce de hash con bytes reales).
- `src/styles/fonts.css`: 4 @font-face locales (Libre Caslon Display, Work Sans 400/500/700), swap, cero remoto; **sin importar** hasta binarios disponibles (los binarios y licencias quedan a operador).
- `dist/` limpio: sin base64/private-references/certs/http; 1 página; `astro check` 0/0.

## Casos

- OT-Q020 **parcial** (puertas verificadas; huellas reales y derivados pendientes de la acción del operador) · OT-Q021 ✓ · OT-Q022 ✓ · OT-Q024 ✓ · nota Q023 ✓ (bebedero contenido; solar lazy/opt-out hero pendiente de integración) · OT-Q011 **parcial** (declaración viva, binarios abortados pendientes).

## Revisión y ajustes

APROBADO CON AJUSTES (sin bloqueos). H1 (seguridad: guard de destino bajo `public/`), H2 (etiquetado honesto de tests), H3 (contract exit only 0/1/2), H4 (etiqueta parcial de Q020), H8 (gitignore derivados) aplicados. H5 (rotación por EXIF Orientation), H6 (constante vs regex), H7 (ruta relativa del script), H5-H7 quedan como riesgos documentados en EVIDENCIA y pendientes de futura unidade com originales.

## Bloqueos (no son fallos)

- Operador debe: ejecutar `extraer.py` sobre el HTML original y aportar/informar carpeta privada, luego `pnpm recursos:derivados` → revisar huellas y derivados; registrar licencias/consentimientos de las 6 fotos antes de publicar cualquier imagen; descargar `.woff2` OFL + registrar licencias y cablear `fonts.css`(o validar el fetch por agentes para la autorización).

## Próximo paso

OT-04 — Diseño editorial propio, sin usar fotografías no aprobadas (con fixtures legales) y sin importar aún `fonts.css` fuera de configuración pendiente.
