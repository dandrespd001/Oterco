# Preparador local de consulta: contrato funcional

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Propósito y alcance

Utilidad propuesta por esta especificación, no descrita como software existente en las fuentes. Ayuda a preparar una consulta sobre las tres líneas de portafolio, sin precio, diagnóstico, valoración genética, recomendación nutricional, solicitud almacenada ni envío automático. Se ejecuta en navegador tras apertura. No necesita servidor/IA/DB ni servicio de correo transaccional.

## Entradas y salida

| Campo | Regla |
|---|---|
| `topic` | Enum `ganado-en-pie`, `hembras-reemplazo`, `pastaje-levante`; elegir antes de generar |
| `message` | Texto libre opcional≤800 caracteres; trim exterior, conservar párrafos, rechazar controles no imprimibles salvo salto/tab apropiados |
| Campos que NO se piden | Nombre/cédula/teléfono/ubicación exacta/documentos/fotos/precio/pesos; no necesarios para esta utilidad |

Resultado determinista: asunto fijo por categoría y cuerpo en texto plano, que comienza “Deseo consultar sobre [línea de portafolio]” y añade el mensaje introducido. Indicar “Borrador de consulta, no cotización ni confirmación de disponibilidad”. Los textos provienen del catálogo local permitido, nunca de una ruta o plantilla ejecutable del visitante.

## Recorrido

Abrir→cargar módulo→seleccionar tema/escribir→preparar→revisar→copiar o abrir aplicación de correo. La página indica antes de la salida que al abrir correo la información pasa a esa aplicación y el usuario decide enviarla. `mailto:` solo a dirección verificada de configuración, asunto/cuerpo codificados con `encodeURIComponent`; no permite destinatario arbitrario ni nuevas cabeceras/caracteres de control.

Si URI queda demasiado largo, ofrecer copiar y abrir correo sin cuerpo. La disponibilidad de cliente de correo no puede comprobarse universalmente: no mostrar éxito de envío por abrir una URL. Clipboard requiere soporte/permisos; en fallo, mantener textarea seleccionable y explicar copia manual. Nunca borrar un borrador antes de un resultado confirmado de la propia acción. La acción “Limpiar” sí vacía estado local voluntariamente.

## Datos y seguridad

Estado en memoria de la instancia, sin localStorage/sessionStorage/indexedDB/cookies propias para guardar contenido. No añadir PII a parámetros del URL de la web, logs, analítica o capturas de QA. El URI `mailto:` es una salida voluntaria, no un envío oculto: su contenido lo gestiona el cliente externo. Renderizar mediante textContent/propiedades seguras, nunca innerHTML/eval. Protección no equivale a sanitizar toda expresión escrita por el usuario: el texto solo es texto.

## Modularidad

`logic.ts` recibe entradas normalizadas y devuelve strings/errores; `client.ts` conecta alDOM local y limpia listeners; `Shell.astro` define campos y alternativas. Configuración `enabled` controla importación en build y anclas. Abierto dos veces no duplica handlers; dos instancias tienen IDs/estado independientes. No descargar código del módulo antes de interacción ni dejar recursos exclusivos cuando está deshabilitado.

## Casos mínimos

Tres temas, mensaje vacío, español con tildes, salto de línea, 800/801 caracteres, payload HTML, caracteres de control, copiar con/sin Clipboard, correo no configurado, URLlargo, cierre/reapertura, reset voluntario, JS bloqueado, doble instancia y deshabilitación. No red excepto apertura externa explícita; sin endpoint POST de OTERCO.
