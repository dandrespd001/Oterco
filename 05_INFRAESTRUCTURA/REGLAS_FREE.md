# Gratuidad, capacidades retiradas y límites

**Revisión documental:** 17 de septiembre de 2026. **Cuentas del usuario:** pendientes de verificación.

## Arquitectura común de alojamiento

Ambas webs publican archivos estáticos en Cloudflare Workers Static Assets, sin script Worker de aplicación, SSR, API de captación, bindings de datos ni antispam. Wrangler es una herramienta local de subida, no un servidor comercial. El producto del proveedor puede denominarse “Worker” aunque el proyecto solo contenga assets.

Cloudflare documenta peticiones estáticas gratuitas y sin límite por petición publicado, sin coste adicional de almacenamiento de assets. El plan Free publica 20.000 assets por versión y 25MiB por archivo; son límites de plataforma, no objetivos de peso. GitHub Free publica 2.000 minutos/mes y 500MB de artefactos para Actions; se revisa el consumo compartido de la cuenta. Fuentes: [assets](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [límites](https://developers.cloudflare.com/workers/platform/limits/), [Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

No necesita cuentas de DB/CAPTCHA ni cálculo de filas/CPU por solicitud comercial. La ausencia de backend no elimina condiciones de uso, registro técnico del proveedor, dominio, actualización, soporte ni trabajo humano.

## Inventario y estados

| Estado | Significado |
|---|---|
| ACTIVA_FREE | Función necesaria diseñada para el plan gratuito; cuenta/resultado por comprobar |
| ELIMINADA_POR_DECISION | Retirada expresa del propietario; no reactivar aunque sea gratuita |
| EXENTA_POR_GRATUIDAD | Requiere pago o excede una cuota comprobada en la opción elegida |
| DIFERIDA_POR_ALCANCE | Puede ser gratuita, pero no pertenece a esta entrega |
| NO_VERIFICADA_FREE | Elegibilidad/coste no demostrado; no activar |
| PENDIENTE_DE_APROBACION | Dato, activo o permiso comercial sin aprobación |

La recepción, base de datos y antispam de Puerta Abierta son **ELIMINADA_POR_DECISION**, no “imposibles gratis”. No reemplazarlas por formularios externos gratuitos, webhooks o correo automático. OTERCO mantiene un preparador únicamente local y sin envío automático: no habilita recepción en ninguna web.

## Control de costes

No contratar hosting Paid/VPS, trials con renovación, upgrades automáticos ni múltiples cuentas para eludir cuotas. Antes de operar remotamente registrar plan real, facturación, cuotas, destino y responsable. Si una operación exige pago, detener y documentar EXENTA_POR_GRATUIDAD; no sacrificar seguridad ni falsear resultados.

Actions: runner Linux estándar, evitar ejecuciones duplicadas, cancelar corridas obsoletas por rama, retención técnica corta (propuesta7d) y solo evidencias útiles. Si se agota CI, pausar o verificar localmente con el mismo procedimiento y permiso explícito del operador; no improvisar un segundo autodeploy paralelo.

Dominio/renovación, buzón, OpenCode Go y trabajo humano son conceptos separados. No se prometen gratis ni se compran desde el agente. Use balance de Go permanece apagado; no controla costes de hosting. No cambiar MX/SPF/DKIM ni DNS por comodidad al desplegar.

## Disponibilidad y mantenimiento

No se promete SLA, capacidad infinita de todos los servicios, backup eterno o precio inmutable. Conservar artefactos verificados y procedimiento de recuperación. Revisar cuotas, condiciones y contacto periódicamente. No configurar monitorización remota o analítica sin una decisión adicional.
