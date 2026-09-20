# Acta 2026-09-20 — OT-08 SEO y configuración pública

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f3f22d104ffeoQ0UnFLhT7RlVa + ajustes ses_f3f13b894ffedRpCrE0IJvApTu; un reintento por fallo del proveedor con el mismo encargo) · **Revisor:** ot-revisor (ses_f3f1b63cbffef0aDinJ02KL4ic).

## Resultados

- `src/config/publico.ts`: fuente única (entornos técnico/comercial; canonical real exige dominio aprobado; LD+JSON null en técnico). Base reservada `.invalid` marcada; sin dominios inventados.
- Públicos: robots.txt (Disallow / técnica), sitemap sin urls en técnica, `_headers` (CSP script-src 'none', nosniff, referrer, permissions), 404 estático sin SPA/sin JS, favicon SVG + OG local.
- `privacidad.astro`: 0 cookies/almacenamiento/análisis; canales pendientes sin mailto.
- Revisor: sin bloqueos de seguridad/publicación; hallazgos aplicados o documentados: F1 (marcadores internos retirados de dist — verificado por coordinador con grep 0/0), F2 (favicon+OG), F4 (sitemap sin urls), F6 (14 líneas), F8 (location/LD correcto), F3/F5 documentados (lang "es" por decisión del coordinador).

## Casos

- OT-Q035 ✓ · OT-Q036 ✓ · OT-Q040 ✓ · OT-Q041 ✓ local (404 real; humo remoto HTTPS/hostname → OT-16 con operador) · OT-Q043 ✓ (barrido ampliado, dist sin secrets/sourcemaps/opencode/marcadores internos).

## Limitaciones

- `_headers` y canonical/correo solo acreditables en hosting real (OT-16).
- Buzón/NIT/hostname comercial bloqueados a OT-15 (sin aprobación no se emiten).

## Próximo paso

OT-09 — Integración funcional y fronteras sobre dist (con/sin JS, ninguna AK/D1/recursos de PA, reporte reproducible).
