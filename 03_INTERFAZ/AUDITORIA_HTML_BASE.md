> **Procedencia:** auditoría conservada del paquete anterior sobre la referencia original. En esta revisión del alcance no se ha renderizado una web nueva de OTERCO ni repetido sus métricas de navegador. Las cifras de este documento no validan el futuro sitio.

# Auditoría de la visualización recibida

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Qué se inspeccionó

Archivo HTML original, perfil DOCX y fotografías embebidas. Se parseó su estructura y se renderizó su contenido con Chromium local mediante `set_content`, bloqueando cargas externas. Se inspeccionó una vista completa de escritorio. No es un sitio alojado, no demuestra fuentes originales cargadas ni interacción final. El stylesheet de fuente referido a una carpeta hermana no se aportó.

## Mediciones efectivamente obtenidas

| Comprobación | Observación |
|---|---|
| Tamaño HTML original | 1.378.401 bytes |
| Imágenes JPEG embebidas | 6; total 1.010.599 bytes decodificados |
| Anchors totales | 14; de ellos 13 usan `file:///` hacia una carpeta local |
| Scripts / elemento main | 0 scripts; 0 elementos `<main>` |
| Dimensiones de imágenes en atributos | Ninguna de las 6 fija width/height |
| Carga diferida declarada | Solo la foto solar declara lazy; no reduce el peso del base64 ya incluido en HTML |
| 1440×1000 CSS px | scrollWidth1440, documento 9719 px; navegación visible |
| 390×844 CSS px | scrollWidth390, documento 12480 px; navegación ocultada |
| 320×700 CSS px | scrollWidth325, documento 14180 px; navegación ocultada y desborde 5 px |

Son resultados sobre la referencia con fallback tipográfico y recursos externos bloqueados, no presupuestos ni pruebas de la futura web. El screenshot completo no activó automáticamente la imagen solar lazy fuera de vista; su ausencia en esa captura no prueba corrupción del JPEG. Los seis JPEG se pudieron decodificar.

## Correcciones obligatorias

| Problema | Tratamiento de implementación | Prueba |
|---|---|---|
| Enlaces locales absolutos | Anclas/URLs web permitidas, retirar comentario saved-from con ruta personal | Escanear salida y click real |
| Menú desaparece en móvil | Índice/nav progresivo operable | Teclado y sin JS a320/390 |
| HTML monolítico con CSS/base64 | Componentes y datos locales; extraer fotos y generar derivados | Build sin base64fotográfico ni recursos privados |
| Fuentes dependen de carpeta faltante | Archivos locales verificados y fallback intencional | Red/console/fonts realmente usados |
| Primer CTA solo al final | Contacto/oferta desde hero y recorrido claro | Localización sin scroll excesivo |
| Secciones demasiado similares | Capítulos, dípticos y filas de portafolio diferenciados | Revisión páginas completas |
| Bebedero vertical sobredimensionado | Contener en columna de detalle, respetar resolución | Capturas/crops/dimensiones |
| Estadísticas solares repetidas/conflictivas | Un registro editorial y aprobación explícita | Ninguna cifra bloqueada en HTML/SEO |
| Consentimiento y privacidad no definidos para contacto | Aviso acorde al tratamiento real; herramienta local minimiza datos | No envíos automáticos ni terceros invisibles |
| Darkmode automático multiplica estados | Diferido explícito, claro coherente | No inversión inesperada por sistema |
| Falta main/salto/estructura completa | HTML semántico, un H1, jerarquía y skiplink | Navegación de regiones/encabezados |
| Alt/títulos posiblemente descriptivos de raza | Conservar fuente y revisar exactitud; no inferir certificaciones genéticas por foto | Registro editorial |

## Límite

El HTML aporta una dirección visual útil, no es la aplicación a publicar sin cambios. No se reemplazó el original ni se reconstruyó aquí la web; estas observaciones se incorporan a tareas y criterios de aceptación.
