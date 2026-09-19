# Alcance y entregables

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Propósito y fuente

Construir una web corporativa de una página comercial para ganadería de cría y ceba en la Costa Norte, orientada a compradores y aliados. Base: perfil DOCX y visualización HTML recién aportados. No se deduce un catálogo eléctrico del certificado para esta web. El cambio de enfoque comercial no modifica el registro mercantil ni certifica condiciones sanitarias.

Entregar `/`, `/privacidad/` y 404; la política auxiliar no convierte la web en un portal multipágina comercial. Navegación interna, fichas editoriales de dos fincas, portafolio de tres líneas, galería/información de ganado e infraestructura, apartado solar acotado y contacto directo. El cuerpo editorial puede reordenarse con [trazabilidad](CONTENIDO_Y_TRAZABILIDAD.md), sin perder los datos de las fuentes ni dar por aprobadas afirmaciones pendientes.

## Incluido

- Una aplicación Astro estática, TypeScript estricto y CSS local; repositorio y publicación independientes de Puerta Abierta.
- Sistema visual editorial rural basado en la referencia, corregido para lectura, móvil, accesibilidad, recursos y contacto.
- Imágenes extraídas y optimizadas localmente durante desarrollo, una vez disponibles los originales; inventario, hashes y revisión de derechos.
- Preparador local de consulta: genera un borrador revisable/copiable, sin enviar datos a un servidor ni dar una cotización.
- Contacto por canales aprobados. El correo que aparece en el perfil no se da por operativo hasta probarlo.
- Validación de contenido y build, pruebas unitarias/E2E, presupuestos, pipeline, recuperación y manuales.

## No incluido

API receptora, D1, Turnstile, formularios almacenados, newsletter, notificaciones automáticas, panel, inventario ganadero, reservas/venta online, pagos, ERP, IoT, telemetría solar, asesor veterinario, estimaciones de raciones/capacidad de carga o IA en producción. No son necesarios para este alcance; algunos pueden ser gratuitos, pero no se implementan sin nueva decisión. Ver [exenciones](../08_FUTURO/EXENCIONES.md).

Puerta Abierta tiene ahora contacto directo, sin captación web. La reutilización será técnica y selectiva, nunca visual ni una dependencia funcional de la otra web. No completar datos desconocidos con contenido genérico. Los bloqueos comerciales no impiden el desarrollo local con fixtures inequívocos.

## Terminación

La entrega técnica requiere código reproducible, recorridos completos con datos de prueba, recursos locales, evidencia visual real, instrucciones de edición y recuperación. La publicación requiere fuentes/contactos aprobados y destino autorizado. Con fuentes visuales todavía sin permiso, se puede aprobar la estructura técnica, no simular que las fotos están autorizadas.
