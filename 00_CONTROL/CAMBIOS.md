# Qué cambia respecto a la planificación inicial

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


Se sustituye la hipótesis inicial de web eléctrica por el enfoque comercial ganadero aportado en los nuevos archivos. El certificado anterior se conserva como evidencia registral a su fecha, sin reinterpretarlo. La infraestructura solar pasa a un capítulo secundario, no prueba de un servicio EPC/eléctrico.

La arquitectura conserva Astro estático y modularidad, pero elimina trabajo de segundaapp compartida en PA: será repo independiente. Ambas webs son ahora estáticas; no se trasladan receptores ni servicios de datos de planes retirados. La visualización HTML se usa como referencia, no código final: URLs de archivos locales, navegación móvil, fotosbase64, fuentes faltantes y proporciones se corrigen mediante tareas.

La recepción en servidor no se justifica aquí; el preparador local puede serútil sin almacenar datos. Funciones opcionales se clasifican por economía/alcance/datos, no como imposibles genéricamente. La aprobación visual demuestra identidad independiente, no garantiza que alguien no relacione la autoría.

## Retirada de recepción en el primer flujo

Puerta Abierta pasa a contacto directo estático. OTERCO conserva su alcance; se actualizan políticas, agentes y reserva visual. Ningún backend del plan antiguo es una utilidad compartida o una tarea futura autorizada. No se han retirado servicios remotos desde esta revisión.
