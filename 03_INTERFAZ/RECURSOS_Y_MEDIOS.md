# Imágenes, fuentes y recursos públicos

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Disponibilidad y transferencia

El paquete de entrega contiene exclusivamente Markdown. **No incluye fotografías ni archivos de fuentes.** El desarrollador debe disponer de los dos originales O-D01/O-D02 para extraer sus recursos; no necesita una nueva sesión del chat para entenderlos porque las transcripciones y el inventario están incluidos. Si faltan originales, continuar con fixtures locales no publicables y registrar el bloqueo de recursos, sin buscar por nombre de empresa fotos ajenas.

Guardar originales en `.private-references/`, ignorado por Git y nunca en `public`. No leer el HTML con base64 entero dentro del prompt de cada agente. Extraer una sola vez con un script local revisado, mantener un manifiesto de huellas y referenciar solo los derivados que utiliza la app. Ver [inventario](../09_FUENTES/INVENTARIO_RECURSOS.md).

## Pipeline de fotos

1. Decodificar JPEG usando un parser HTML, no copiar cadenas base64 a componentes. Validar formato/dimensiones y asignar IDs estables.
2. Registrar fuente, texto alternativo propuesto, función, permiso, fecha y responsable. No tratar el alt original como prueba de raza/propiedad.
3. Preparar tamaños de salida compatibles con el ancho real; AVIF/WebP y fallback apropiado. No aumentar resolución original para simular calidad. Separar recorte móvil solo cuando sea necesario.
4. Importar recursos en `src/assets`; generar srcset/sizes/dimensiones en compilación. Hero/LCP no lazy; debajo del primer viewport lazy y decoding cuando corresponda. Evitar preload masivo.
5. Retirar EXIF no necesario de derivados, confirmar orientación y color. Mantener original privado intacto. No entregar certificados como imágenes públicas.
6. Medir red/cache vacía, comprobar bytes, alt, crop y ausencia de referencias rotas. Licencias visibles cuando exijan atribución real.

## Tipografías/iconos

Obtener Libre Caslon Display y Work Sans de distribución autorizada; guardar licencia y registro en desarrollo, no archivos tipográficos dentro de esta entrega. Solo pesos/glifos útiles, WOFF2 local. No Googlefonts remoto en runtime. `font-display: swap` con fallback ajustado para reducir saltos; no bloquear texto. Íconos SVG locales pequeños con licencia/autoría documentada, decorativos ocultos al lector, controles con nombres.

## Video y mapas

El video solar anterior no es requisito de esta entrega. No se afirma que todo video requiera pago: un archivo que quepa en límites puede servirse como asset, pero reproducción/consumo/permiso deben definirse. Se difiere para priorizar una portada liviana basada en fotos. Sin streaming, transcodificación remota, embeds de redes, geolocalización ni mapas prediales interactivos. Se puede usar un esquema abstracto decorativo no geográfico, sin inventar coordenadas.

## Puerta de recursos

Bloquear producción si falta un recurso crítico o permiso; omitir de forma explícita un bloque opcional. Nunca esconder `onerror` para simular imagen correcta ni usar stock/generación IA como evidencia de una finca. Todos los recursos cargados deben pertenecer al sitio OTERCO; no descargar fuentes, iconos comerciales o fotos de PA.
