# Fuentes locales (OT-03) — carpeta intencionalmente vacía

**Estado:** pendiente del operador. No hay binarios `.woff2` en el repo.

Archivos esperados (solo pesos útiles, formato WOFF2):

- `libre-caslon-display-400.woff2` (titulares)
- `work-sans-400.woff2` (texto)
- `work-sans-500.woff2` (texto medio / UI)
- `work-sans-700.woff2` (énfasis / UI)

Pasos del operador (red y decisión suyas, fuera de esta unidad):

1. Descargar ambas familias desde distribución autorizada (Google Fonts,
   licencia OFL) sin alterar los ficheros.
2. Registrar en `docs/implementacion/OT-03/LICENCIAS_TIPOGRAFICAS.md`:
   versión, origen exacto y SHA-256 de cada fichero.
3. Copiar aquí los `.woff2` y el/los `LICENSE`/`OFL.txt` que acompañen la
   descarga; no guardar archivos tipográficos en carpetas documentales.
4. Avisar al implementador para cablear `@import "../styles/fonts.css"`
   (hoy sin importar: evita 404 hasta que existan los binarios) y medir
   OT-Q037/OT-Q038 con las fuentes reales.

Prohibido: CDN en runtime, TTF/OTF pesados sin justificación, y copiar
fuentes de la otra marca (Puerta Abierta).
