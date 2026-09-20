# Acta 2026-09-19 — OT-07 Preparador local de consulta

**Sesión coordinador:** ses_f452eb8eeffeQJGEN8CFk4jaxV · **Implementador:** ot-implementador (ses_f3f33d6e4ffeLeQiCCAUhYKRGv + ajustes ses_f3f2980e6ffeblxe33Bw4WNAbn) · **Revisor:** ot-revisor (ses_f3f2b6582ffe31IbQTgtMh4bOY).

## Resultados

- Motor puro (`motor.ts`) con 3 categorías exactas al contrato (ganado-en-pie/hembras-reemplazo/pastaje-levante; límite 800/801 puntos de código; cuerpo con pie de no-cotización; vacío permitido; controles/CRLF normalizados).
- `destino.ts`: mailto solo con contacto aprobado+verificado+token y buzón revalidado; sin inyección (encodeURIComponent, rechazo CRLF/%0A/cabeceras); URI largo → copia; nunca se anuncia envío.
- `Preparador.astro` + `activador.ts` + `cliente.ts`: sin innerHTML (textContent/value), sin storage/cookies/fetch; copia manual siempre disponible (textbox seleccionable, execCommand solo fallback), carga con `import()` dinámico en el primer click; listeners idempotentes; desmontaje/voluntariado para borrador.
- **Deshabilitado por defecto** (PREPARADOR_ENABLED=false, ahora efectivo): dist sin recursos del módulo ni buzón — decisión del coordinador: cablear solo tras (a) aprobación del buzón OT-15, (b) E2E real en OT-10.
- Revisor: sin bloqueos; 120 pass/4 skip tras ajustes; check 25 ficheros 0/0 (1 hint execCommand justificado); dist sin script/mailto/buzón.

## Casos

- Pasados (puro/proxy): OT-Q025, Q026, Q027-render, Q028, Q029-texto, Q030, Q031, Q032 (cableado deshabilitado), Q033, Q034. E2E real (declaro pendiente): apertura viva, fallo real de Clipboard, doble instancia viva, teclado → OT-10.

## Pendientes operador

- Aprobación y verificación humana del buzón (sin ella no hay mailto).
- Decisión de cuándo cablear (coordinador propone post OT-10/15) con re-verificación de Q013/Q032.

## Próximo paso

OT-08 — SEO y configuración pública (metadatos aprobados, privacidad, 404, robots/sitemap, sin handler).
