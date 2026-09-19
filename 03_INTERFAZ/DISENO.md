# Diseño editorial ganadero: refinamiento de la referencia

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Dirección

Conservar la personalidad rural cálida del HTML, la tipografía serif de titulares, fondos de papel y acentos terrosos. Mejorar proporción, jerarquía, navegación y uso de fotografía; no convertirla en el diseño corporativo frío de Puerta Abierta. Las decisiones siguientes son especificación propuesta, no identidad aprobada por el propietario.

## Tokens, tipografía y escalas

| Uso/token local | Valor propuesto | Observación |
|---|---|---|
| Fondo `--ot-paper` | `#EDE6D2` | Conserva la referencia |
| Alternativo `--ot-paper-alt` | `#E3D8BB` | Alternancia limitada, no franjas repetidas cada bloque |
| Profundo `--ot-forest` | `#1F3327` | Títulos/acciones/recuadros, con crema como texto |
| Pie `--ot-forest-deep` | `#16241B` | Cierre editorial |
| Texto `--ot-ink` | `#1C2019` | Cuerpo |
| Secundario `--ot-muted` | `#55594B` | Ayudas legibles |
| Terracota `--ot-clay` | `#7A3B24` | Enlaces/etiquetas, contraste a probar |
| Ocre `--ot-ochre` | `#B07A2C` | Decoración; no texto normal sobre crema sin validar |

Libre Caslon Display para H1/H2/citas, peso 400; Work Sans para lectura y controles, pesos 400/500/600. Son las familias declaradas en la fuente; el HTML guardado no trae sus archivos. Verificar licencia, procedencia y WOFF2 durante OT-03/OT-04; no publicarlas sin esa verificación. No reutilizar Manrope/Source Sans3 de PA. El fallback Georgia/system-ui sirve para trabajar, no para aprobar capturas finales.

H1 `clamp(2.75rem, 6.2vw, 5rem)` (44–80 px en raíz 16); línea 1.03–1.1, ancho hasta 16ch. H2 32–48 px, cuerpo 18 px/línea 1.65 y hasta 62ch; captions 14–15 px; labels 16 px. No confundir tamaño de titular con longitud excesiva. Ajustar saltos con texto real y a 320 px. Contenedor 1120 px, padding móvil 20 px; ritmo 72–112 px escritorio y40–64móvil. Márgenes y captions editoriales, no tarjetas uniformes con sombras.

Botones rectangulares con radio 0–3 px: principal bosque/crema, secundario enlace con subrayado visible. No heredar píldoras ni radios 16 px del panel de contacto de Puerta Abierta. Tipos de botón conservan significado y áreas táctiles≥44 px como objetivo del proyecto.

## Organización refinada (todos los contenidos trazados)

| Bloque nuevo | Estructura | Origen preservado |
|---|---|---|
| Masthead + portada | Marca tipográfica, índice corto; título serif y una imagen de paisaje/pastoreo autorizada; CTA Consultar portafolio + contacto | Hero original; cifras solo aprobadas |
| Oferta al comprador | Tres filas editoriales sin tarjetas iguales; categoría, alcance y acción | Portafolio del perfil, antes relegado al final |
| Dos territorios | Dos capítulos de finca con foto/contexto y roles; disposición asimétrica, no 2 tarjetas copiadas | Fincas + referencias territoriales |
| Ganado y manejo | Galería sobria de búfalos/Brahman y cuatro pilares, evitando duplicar textos | HTML ganado + pilares DOCX |
| Operación e infraestructura | Corrales/praderas, agua y feedlot/sorgo como subapartados con sus anclas | Infraestructura + bebederos + feedlot |
| Solar en Beraka | Imagen y ficha secundaria, solo datos aprobados | Sección solar del HTML/perfil |
| Consulta y cierre | Preparador local opcional, contactos aprobados y cita editorial | Contacto/visión + utilidad propuesta |

Esta secuencia es una mejora explícita de organización. Los nombres comerciales y textos originales se conservan en datos/fuentes. No convertir las fincas en dos sucursales ni interpretar la infraestructura solar como un servicio eléctrico ofrecido al público.

## Masthead y móvil

En escritorio, masthead editorial no sticky por defecto, con cinco destinos: Portafolio, Fincas, Manejo, Infraestructura, Contacto. Los subapartados Bebederos/Feedlot/Solar siguen accesibles desde el índice o enlaces de capítulo. Nunca 9 enlaces apretados a 860 px.

En móvil, índice plegable nativo o patrón progresivo con estado, nombre accesible, foco y Escape cuando proceda. Aun sin JS existen los destinos. Evitar `nav{display:none}` sin alternativa. El flujo de capítulos conserva distintos encuadres y jerarquías, no se aplana a la misma lista de tarjetas de PA.

## Fotografías y composición

No colocar el bebedero vertical 485×650 a todo el ancho del contenedor: limitar a una columna de detalle o máximoalto~560 px, junto a texto corto. Mantener contexto de animales, infraestructura y paisaje, sin recortar partes importantes por simetría. Las fotos Brahman pueden formar un díptico deliberado; dimensiones reservadas y tamaños responsive. Usar paisaje real apropiado para hero cuando exista; si no, portada tipográfica con texturaSVG abstracta, no obra/finca generada presentada como real.

No deformar/estirar ni aplicar filtro que altere la percepción del ganado. Saturación y contraste coherentes, sin huella visual de la inmobiliaria. No reutilizar una misma imagen en varias secciones solo para llenar espacio. Galería estática, sin carrusel ni lightbox obligatorio. La referencia solar no se trata como certificación.

## Transiciones y superficies

220–280 ms para cambios modestos de enlace/imagen cuando aporten respuesta; no escalado exagerado. Contenido siempre visible en estado inicial. Sin entrada en cascada, parallax, autoplay, WebGL, spinner ornamental o scroll secuestrado. Con reduced-motion, eliminar desplazamientos y smooth scroll. Pie oscuro editorial con una columna protagonista y datos secundarios; no replicar el pie claro compacto de PA.

Modo claro único en la primera entrega. El tema automático oscuro del HTML se difiere por coste de diseño/pruebas, **no porque el hosting lo impida**. Mantener superficies con contraste probado. No usar ocre de adorno como único color de error/foco.

## Aprobación

OT-04 produce ficha y wireframes; OT-10 revisa acceso/viewport; OT-14 cierra diferencias visuales con capturas de PA ya disponibles. Aplicar [checklist](CHECKLIST_VISUAL.md). No prometer imposibilidad de atribución al mismo desarrollador: el resultado exigido es identidad y composición independientes, no ocultación forense.
