# Presupuestos y medición

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


| Medida | Presupuesto propuesto |
|---|---:|
| Transferencia inicial móvil, caché vacía, sin interacción | ≤1.000.000 bytes |
| JS inicial total, incluido inline/dependencias | ≤15.000bytesgzip |
| JS incremental preparador | ≤10.000bytesgzip |
| CSS inicial | ≤40.000bytesgzip |
| Fuentes iniciales totales transferidas | Objetivo≤160.000 bytes |
| Primer recurso fotográfico principal | Objetivo≤250.000 bytes sin pérdida visual inaceptable |
| Lighthouse móvil | Mediana de3 ejecuciones comparables≥90 |
| Recursos exclusivos PA / herramienta apagada | Cero publicados/descargados en su alcance exclusivo |

Son objetivos por demostrar, no mediciones obtenidas. Optimizar derivadas según imagen real, no forzar codec/peso si genera mala calidad. HTML sin base64fotográfico. Medir activos, gzip y transferencia HTTP por separado; no comparar Brotli con gzip para aparentar cumplimiento. Indicar navegador, versión, viewport, CPU/red simuladas, caché, commit y momento. Inspeccionar script insertado inline y dependencias transitivas.

No cargar imágenes offscreen salvo justificación; no lazyLCP; reservar dimensiones; fonts swap y fallback medido. Comprobar que desactivar módulo elimina sus recursos y abrirlo permite una carga única. No imágenes generadas/dataURIs para eludir inventario. Las mediciones de laboratorio no sustituyen rendimiento de campo.

Cuotas del proveedor según REGLAS_FREE: assets≤20.000 y25MiB/archivo; CIcuenta Free controla minutos/artefactos. La app no debe hacer fetch a una API de producción ni añadir backend para contar visitas. Escalar funcionalmente exige decisión, nunca upgrade automático.
