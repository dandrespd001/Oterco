# Nota de vigencia de esta revisión

La sección que sigue conserva referencias de la entrega anterior de OTERCO. No implica que todas se hayan vuelto a consultar ni probado en este turno. En esta revisión se comprobaron las capacidades relevantes de Static Assets sin script, CLI/configuración/agentes/comandos de OpenCode Go y permisos. Los valores exactos de versiones se resuelven en OT-01 y los planes de la cuenta antes de publicar. Las menciones a servicios de recepción en fuentes históricas no reactivan esas funciones en Puerta Abierta.

No usar una versión, cuota o dato anterior como sustituto de la comprobación real. El informe actual de validación documental sustituye las afirmaciones de pruebas de la entrega anterior.

---

# Fuentes técnicas contrastadas y alcance de la comprobación

Consulta: **17 de septiembre de 2026**. Son fuentes oficiales de producto, W3C o MDN. Los presupuestos, la selección de roles y la organización del proyecto son decisiones de esta especificación, no conclusiones de un benchmark. Revalidar al bootstrap y antes de una operación remota; no cambiar de stack por preferencia del modelo.

| ID | Fuente oficial | Uso y límite |
|---|---|---|
| V01 | https://opencode.ai/docs/go/ | Catálogo, IDs `opencode-go/`, cuotas y Use balance. Cuenta del propietario no inspeccionada |
| V02 | https://opencode.ai/docs/agents/ | Agentes Markdown, modos, permisos Task, modelos y steps |
| V03 | https://opencode.ai/docs/config/ | Configuración acumulativa, default_agent, proveedores, compaction, profundidad |
| V04 | https://opencode.ai/docs/permissions/ | Permisos por herramienta/patrón; no sandbox del sistema operativo |
| V05 | https://opencode.ai/docs/commands/ | Comandos Markdown y `$ARGUMENTS` |
| V06 | https://opencode.ai/docs/cli/ | Versión, modelos, agentes y `--pure`; comprobar ayuda instalada |
| V07 | https://opencode.ai/config.json | Esquema publicado; no se afirma validación de carga por una CLI instalada |
| V08 | https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/ | Assets gratuitos; rutas run_worker_first excedidas pueden devolver 429 |
| V09 | https://developers.cloudflare.com/workers/platform/limits/ | Free 100.000 peticiones/día por cuenta, CPU 10 ms, 20.000 assets, 25 MiB por archivo |
| V10 | https://developers.cloudflare.com/d1/platform/pricing/ | Free: filas leídas/escritas y almacenamiento; no equivalen a número de visitantes |
| V11 | https://developers.cloudflare.com/d1/platform/limits/ | 500 MB por base Free, 5 GB/cuenta y recuperación limitada |
| V12 | https://developers.cloudflare.com/turnstile/plans/ | Free: uso SMB/producción y límites; no retirar branding exigido |
| V13 | https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ | Siteverify obligatorio; token de un uso y 300 s; validar hostname/action |
| V14 | https://developers.cloudflare.com/workers/static-assets/binding/ | Separar rutas API y assets sin SSR global |
| V15 | https://developers.cloudflare.com/workers/static-assets/headers/ | `_headers` para assets; respuestas de Worker necesitan cabeceras propias |
| V16 | https://developers.cloudflare.com/d1/reference/time-travel/ | Recuperación de datos no equivale a rollback del código; operación destructiva |
| V17 | https://developers.cloudflare.com/email-service/platform/pricing/ | Destinatarios internos verificados posibles en Free; arbitrarios requieren Paid |
| V18 | https://docs.github.com/en/billing/concepts/product-billing/github-actions | Cuotas compartidas de Actions: minutos/artefactos, plan por comprobar |
| V19 | https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments | No asumir required reviewers protegidos en repo privado Free |
| V20 | https://docs.astro.build/en/guides/deploy/cloudflare/ | Static sin adaptador SSR; funciones acotadas según necesidad |
| V21 | https://docs.astro.build/en/guides/typescript/ | `astro check` explícito; build no lo sustituye |
| V22 | https://docs.astro.build/en/install-and-setup/ | Requisitos de instalación; parche compatible a resolver |
| V23 | https://nodejs.org/en/about/previous-releases | Node 24 LTS como línea propuesta; fijar parche probado |
| V24 | https://www.w3.org/TR/WCAG22/ | Objetivo AA, no certificado por este documento |
| V25 | https://playwright.dev/docs/test-snapshots | Comparación con referencia propia en entorno reproducible |
| V26 | https://playwright.dev/docs/accessibility-testing | Axe complementa, no sustituye revisión manual |
| V27 | https://docs.astro.build/en/guides/images/ | Imágenes locales y optimización en compilación |
| V28 | https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control | Revalidación HTML y assets inmutables con hash |
| V29 | https://normograma.dian.gov.co/dian/compilacion/docs/ley_1581_2012.htm | Tratamiento de datos y autorización; aprobación jurídica del responsable pendiente |
| V30 | https://pnpm.io/workspaces | Workspace pequeño dentro de cada repo; no dependencia entre negocios |
| V31 | https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ | Dirección incluida útil para pruebas; revisar idoneidad empresarial de producción |

Los nombres de fuentes tipográficas son propuestas de diseño. Sus archivos/licencias concretos se revisan al obtenerlos; no se ha descargado ni distribuido una fuente. No se han consultado cuentas, usado claves Go, ejecutado OpenCode, instalado dependencias de las webs o medido CPU de Worker en producción. La revisión web no demuestra que el entorno particular del usuario ya cumpla esos límites.
