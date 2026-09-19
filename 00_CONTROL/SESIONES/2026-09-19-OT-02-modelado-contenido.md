# Acta 2026-09-19 — OT-02 Modelado de contenido y discrepancias

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f450fd09effepPqGg8kqSk67F1; corrección ses_f45094fcaffeezep90FYQiTE04) · **Revisor:** ot-revisor (ses_f450b2a57ffeNtRB2NTVdC2VE3).

## Ejecución

- Encargo delimitado a ot-implementador: contratos de datos tipados + puerta editorial en `apps/oterco/src/content/` y `src/config/`.
- Revisor (obligatorio: contrato de datos/publicación): **APROBADO CON AJUSTES**, sin bloqueos. 14/14 tests re-ejecutados, `astro check`/`build` verdes, `dist/` sin conflictivos ni scripts, sin secretos.
- Ajustes aplicados en segunda ronda: H1 (literales del validador movidas a `perfil.esperado.ts`; confirmables validadas por formato — un dato confirmado se edita solo en `perfil.datos.ts`), H2 (perfil con errores de validación ⇒ nivel `tecnica`). Tests: 19/19, check/build exit 0.

## Resultados técnicos

- `perfil.datos.ts` único archivo editable, todo `pendiente`, `aprobaciones: []`; mención solar (Beraka) en `anexoSolarLiteral` verbatim, filtrada hasta aprobación.
- `isPublicable()` lee tokens `nit|contacto|solar|fotos` de `Perfil.aprobaciones`; comercial exige NIT + contacto verificado; `"aprobado"` sin registro = error; perfil inválido nunca es comercial.
- Modelo sin campo `ciiu`: claves desconocidas rechazadas; perfil ganadero no induce registro.
- `dist/index.html` sin NIT/contacto/solar/cifras fotos; 0 scripts.

## Casos

- OT-Q005 ✅ · OT-Q006 ✅ (con matiz H4: dist limpia es hoy vacua — la página aún no consume perfil; integración real en OT-03) · OT-Q007 ✅ · OT-Q008 ✅ · OT-Q009 ✅ (mejorado por H1).
- No ejecutados: migración a Vitest (pendiente autorización de red; hoy `node:test`), comprobación visual (sin cambios UI).

## Pendientes del operador (OT-15)

- Confirmar NIT `…-4` (O-D03), prueba humana del buzón (sin ella no hay comercial), reconciliar solar O-D04, licencias de fotos, aprobaciones con responsable/fecha/alcance.
- Vitest (red) vs `node:test` definitivo.

## Próximo paso

OT-03 — Extraer e inventariar recursos (depende de OT-01, OT-02): fotos desde 09_FUENTES y validación de `sharp` en este host.
