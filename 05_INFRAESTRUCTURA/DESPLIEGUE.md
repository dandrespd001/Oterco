# Hosting estático, publicación y rollback

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Destino elegido

Cloudflare Workers Static Assets en Free, sin script Worker de negocio. Servir la salida estática de Astro; no instalar adaptador SSR. Un `wrangler.jsonc` debe apuntar al `dist` real del build y declarar comportamiento 404 apropiado, no `single-page-application`. Sintaxis exacta y versión de Wrangler se comprueban en OT-01/OT-12 con documentación oficial vigente (V08, V14, V15, V20). No inventar account_id, dominio o fecha de compatibilidad ya probados.

Publicación independiente de PA. Registro de dominio, DNS y correo son servicios distintos; no hay compra incluida ni se cambia MX. Un subdominio de prueba del proveedor puede servir para verificar; antes de uso comercial resolver destino/dominio autorizado y canonical. No prometer disponibilidad absoluta (V31).

## Comandos a implementar, no ejecutables de este paquete

| Comando | Resultado |
|---|---|
| `pnpm dev` | Astro local, fixtures permitidos |
| `pnpm check` | Tipos Astro/TS, configuración, lint/formato, fuentes/anchors |
| `pnpm test` | Unitarias de contratos y preparador |
| `pnpm build:test` | Salida técnica no promocionable |
| `pnpm test:e2e` | Recorridos sobre archivos compilados, no solo astro dev |
| `pnpm verify` | Conjunto documentado de comprobaciones técnicas |
| `pnpm release:prepare` | Candidato de producción estricto y manifiesto |
| `pnpm release:publish --release <id>` | Subir artefacto ya probado, sin build implícito |
| `pnpm release:rollback --release <id>` | Restaurar artefacto conocido de OTERCO y hacer smoke |

Scripts Node multiplataforma; parámetros validados, rutas restringidas, no `rm -rf` ni expansión libre de argumentos del modelo. No confirmar una ejecución que no se hizo.

## Cadena única

Rama→check/test→build→E2E/medición→revisión→commit integrado→candidato identificado→preview autorizada→aprobación→publicación manual→smoke→registro. GitHub Actions y Wrangler; no habilitar simultáneamente Workers Builds como segundo autodeploy. Revisar scripts antes de permisos persistentes de terminal. No usar secretos en PR no confiables ni ejecutar código de un fork con credenciales.

Manifiesto: sitio `oterco`, propósito `technical|commercial`, commit limpio, versiones, digest de archivos y configuración, pruebas/revisión, fecha y aprobador. HTML/CSS/JS/assets del candidato no se recompilan al promoverlo. Headers/config por destino pueden diferir, pero se registran y hashean separadamente. No anunciar igualdad byte a byte si cambia un archivo.

Una liberación manual `workflow_dispatch` no equivale a doble aprobación protegida. Comprobar plan y permisos de GitHub; no asumir required reviewers para repo privado Free (V19). Usar runner Linux estándar, retención corta para artefactos técnicos, límites presupuestales y no servicios de pago por exceso.

## Cabeceras/rutas/cache

CSP compatible con recursos locales y scripts realmente emitidos, nosniff, referrer-policy, permisos restrictivos y frame-ancestors según necesidad. No `unsafe-eval` ni abrir orígenes indiscriminadamente. `_headers` sobre assets; confirmar cabeceras HTTP efectivas. Recursos con hash: cache larga e immutable; HTML/archivos mutables revalidación. No cache eterna de todo el sitio. 404 inexistente con estado 404 real y enlace útil; confirmar www/apex/redirecciones solo autorizadas (V15, V28).

## Recuperación y smoke

Conservar versión actual y dos anteriores fuera de almacenamiento temporal que caduque. Copia de fuente/recursos y registro DNS separado bajo control del propietario. Ensayar recuperar artefacto con fixture y luego en destino autorizado. No usar un rollback de otra marca. El rollback del código no revierte DNS/correo/cuentas.

Smoke: HTTPS, root 200, inexistente 404, canonical correcto, anclas y contacto, fotos y fuentes, preparador, sin errores de consola, sin descargas de PA ni documentos privados, sinnoindex en producción. Si falla, detener, recuperar candidato anterior, registrar incidente. Nunca borrar DNS o hacer upgrades para corregir una publicación.
