# Contenido, discrepancias y aprobación

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Estados editoriales

`source_received` = aportado; `draft` = redacción propuesta; `approved` = revisión expresa registrada; `blocked` = dato conflictivo/falta de permiso; `omitted` = no se publica. Recibir el archivo no convierte sus afirmaciones en certificadas. Cada registro tiene ID, fuente/localizador, texto literal, propuesta de presentación, estado y evidencia de aprobación. Las notas editoriales no se serializan al navegador.

## Inventario de fuentes

| ID | Fuente | Papel |
|---|---|---|
| O-D01 | Oterco_Perfil_Corporativo.docx, cuatro páginas en extracción | Perfil ganadero, dos fincas, pilares, infraestructura, portafolio, contacto |
| O-D02 | Oterco LTDA — Ganadería de las Sabanas del Caribe.html | Referencia visual y ampliaciones de ganado/bebederos/feedlot/sorgo; fotos embebidas |
| O-D03 | Cámara de Comercio, 28-04-2025 | Identidad y clasificación registral a esa fecha, no contenido de marketing actual |
| O-D04 | Video previamente aportado, si se vuelve a utilizar | Datos solares de rótulos no reconciliados; fuera de reproducción obligatoria |

## Matriz de adaptación (organización original → propuesta)

| Sección/dato de origen | Localizador | Destino de diseño | Regla |
|---|---|---|---|
| Ganadería de cría y ceba, mercado nacional | DOCX p.1 y p.2 §1 | Portada y breve presentación | Sin atribuir liderazgo, volúmenes o capacidad no aportados |
| Beraka/San Onofre y Puerta Roja/Turbaco | DOCX pp.2–3 §2; HTML #fincas | Dos capítulos territoriales | Conservar sus funciones de cría y ceba; no agregar coordenadas prediales |
| Tres líneas de portafolio | DOCX pp.3–4 §5; HTML #portafolio | Índice de oferta anterior a historias de fincas | No equivalen a inventario/disponibilidad/precio |
| Cuatro pilares | DOCX p.3 §3; HTML #pilares | Manejo y operación | Conservar genética, nutrición, sostenibilidad, sanidad; revisar promesas |
| Infraestructura/capacidad | DOCX p.3 §4; HTML #infraestructura | Bloque editorial con detalles | No sumar capacidades, hectáreas ganaderas o cifras de hato |
| Búfalos/Brahman | Solo HTML #ganado | Galería/ganado | Distinguir ampliación del HTML de información del DOCX |
| Bebederos techados | Solo HTML #bebederos | Detalle de infraestructura | No perder contenido al dejar de ser sección de primer nivel |
| Feedlot y sorgo forrajero propio | Solo HTML #feedlot | Operación/alimentación | No inventar rendimiento, formulación ni disponibilidad anual |
| Solar 11.6 MW y 21 ha | DOCX p.2; HTML #fincas y .solar | Apartado solar secundario | Mantener literal en evidencia; publicar solo dato aprobado |
| Filosofía/cita | DOCX p.4 §6; HTML .vision | Cierre editorial | No atribuir la cita a una persona no identificada |
| contacto@oterco.com.co | DOCX p.4 §7; HTML footer | Canal público, tras prueba | Dominio y buzón no comprobados; no comprarlo por inferencia |

Esta reorganización es una propuesta de diseño explícita. Se conserva la transcripción original para no sustituirla por el resumen.

## Conflictos que NO se resuelven por intuición

1. **Enfoque registral y comercial:** el certificado de 2025 presenta CIIU 4321 principal y 4620 entre otras actividades; los nuevos materiales son ganaderos. No afirmar que la actividad registral ya cambió. El contenido nuevo dirige el boceto; el propietario valida la presentación legal.
2. **NIT:** perfil y HTML usan 830.128.652; el certificado agrega dígito 4. Proponer 830.128.652-4 como dato completo con procedencia, pendiente de confirmar antes de publicar. No tratar la ausencia de DV en el perfil como una sociedad distinta.
3. **Solar:** nuevos archivos indican “11.6 MW” y 21 ha. El video anterior mencionó 11, 65 MWp, 10, 39+1, 26 y 16.700×700 W (11, 69 MW nominales aritméticos). No equivaler MW y MWp, no escoger una cifra por redondeo, no añadir “instalado por OTERCO”. Confirmar potencia/unidad, relación con el proyecto y estado real. Guardar `blocked` mientras haya conflicto.
4. **Propiedad/operación/renta:** “opera dentro”, ingreso complementario y “no compite con pastoreo” no acreditan titularidad, EPC, operación técnica, impacto ambiental o renta garantizada. No ampliar esas expresiones.
5. **Sanidad/sostenibilidad:** el perfil declara protocolos y prácticas; no autoriza logotipos de certificación, garantías de salud ni cuantificaciones ambientales.
6. **Fotos:** el HTML afirma que fueron tomadas en fincas OTERCO, pero no trae licencias/consentimientos. Registrar esa afirmación como fuente, no convertirla en validación independiente.

## Puerta editorial

El build comercial rechaza campos críticos en `draft/blocked`, email sin verificación, imágenes sin aprobación, fuentes no autorizadas y tokens placeholder. Un bloque opcional bloqueado se omite con sus anclas y metadatos; no se reemplaza por estadísticas ficticias. Informar al propietario qué se ha omitido. Datos sintéticos solo en modo técnico marcado `publishable:false`.

Antes de aprobar: responsable, fecha, alcance de aprobación, documento/recurso y observaciones. No publicar los certificados ni identificaciones de personas, direcciones particulares, nombres locales de Windows o historial de esta conversación.
