# Informe de verificación — OTERCO

Este flujo se distribuye también por separado. Las cifras generales siguientes corresponden al conjunto verificado; las filas por sitio identifican el alcance de esta carpeta.

**Fecha:** 17 de septiembre de 2026. **Resultado de controles locales:** sin incidencias abiertas en los controles descritos. **Objeto:** Markdown, configuración propuesta, trazabilidad y utilidades auxiliares; no las webs finales.

## Alcance y mediciones reales

| Comprobación | Resultado |
|---|---|
| Archivos del conjunto | 183 Markdown: 91 PA, 83 OT y 9 generales |
| Enlaces internos de contenido, excluidos bloques de código | 551 resolubles; ningún flujo requiere salir de su propia raíz |
| Bloques JSON | 5 parseados; configuraciones Go coherentes con roles y ejemplos de hosting sin handler |
| Frontmatter nativo de OpenCode | 18 parseados: 8 agentes y 10 comandos |
| Puerta Abierta | 25 requisitos, 19 fichas de tarea, 64 casos; IDs únicos, cobertura completa y dependencias sin ciclos |
| OTERCO | 20 requisitos, 17 fichas de tarea, 54 casos; IDs únicos, cobertura completa y dependencias sin ciclos |
| Utilidad Node de configuración | 10 casos ejecutados en directorios temporales: creación, no sobrescritura, proveedor ajeno, JSON inválido y raíz incorrecta, para ambos sitios |
| Extracción de fotos de OTERCO | 6 JPEG; 1.010.599 bytes decodificados; huellas coincidentes con inventario; rechazo de destino existente |
| Fuentes originales | 8 huellas SHA-256 recalculadas y coincidentes con los registros |
| Transcripciones de PA | Cuerpo original de guía/dossier preservado; notas editoriales cambiadas y precedencia explícita |
| Paletas propuestas | 8 pares de contraste recalculados; ocre decorativo con ratio insuficiente para texto normal reconocido |
| Integridad | Manifiestos SHA-256 y tres ZIP comprobados según procedimiento del cierre |

Entorno auxiliar: Python 3.13.5 y Node v22.16.0. Esas versiones ejecutaron las utilidades, no fijan las versiones del futuro proyecto Astro.

## Revisión de coherencia realizada

Se eliminó la carpeta activa 04_CAPTACION, los esquemas SQL, las fichas DEV y el documento de avisos internos de PA. Se comprobaron arquitectura, contacto, privacidad, pipeline, tareas, checklists, agentes y archivos de continuación. Se corrigió una referencia editorial antigua de la guía que todavía remitía al formulario retirado. No se han eliminado las palabras originales de los documentos aportados: están señaladas como historia no normativa.

No hay especificación activa para API, base de datos, CAPTCHA, formulario receptor o servicio equivalente de PA. Sus menciones se limitan a prohibiciones, migración, fuentes históricas y pruebas negativas. Las configuraciones de alojamiento propuestas sirven assets sin `main` o binding de datos. OTERCO conserva su preparador local autorizado; la prohibición de campos inmobiliarios de PA no se aplica indiscriminadamente a ese módulo.

Las fuentes públicas relevantes de Astro, Cloudflare, OpenCode y estándares se consultaron para confirmar capacidades y sintaxis. El JSON se parseó y se revisaron claves contra documentación/esquema visible, **no se ejecutó una validación integral del JSON con la CLI instalada del propietario**. La consulta documental no verifica sus cuentas ni permisos efectivos.

## Cómo se comprobó el paquete

1. Leer textos UTF-8 y comprobar delimitadores de código, enlaces relativos e independencia de raíces.
2. Parsear JSON y YAML, comprobar roles/modelos/comandos y configuración de publicación solo estática.
3. Extraer IDs de requisitos, tareas, casos y dependencias; comprobar unicidad, cobertura y aciclicidad.
4. Ejecutar las utilidades de creación de configuración y extracción en carpetas temporales con entradas válidas/negativas.
5. Comparar fuentes e inventarios mediante SHA-256 y recalcular contraste de los pares documentados.
6. Calcular manifiestos, comprimir y verificar CRC, rutas seguras, extensión Markdown y equivalencia exacta entre cada miembro del ZIP y el archivo fuente final.

## Lo que no se ha hecho

No se ha ejecutado OpenCode ni una llamada real a Go, probado su configuración global, consumido cuotas de modelos, instalado dependencias de las webs, implementado interfaces, corrido sus E2E, comprobado accesibilidad real o medido su Lighthouse. No se han conectado cuentas, creado/eliminado servicios remotos, retirado un endpoint del usuario, enviado mensajes, verificado contactos, comprado dominios, tocado DNS ni publicado sitios.

La auditoría visual histórica del HTML de OTERCO se conserva identificada como antecedente; esta revisión no afirma una nueva renderización del diseño final. La extracción de seis imágenes no demuestra derechos ni aprobación. Las 118 pruebas del producto siguen pendientes; las comprobaciones documentales no cambian ese estado.

El resultado permite comenzar la implementación con un contexto consistente en los controles descritos, no prometer ausencia absoluta de errores futuros. Las condiciones de servicios y modelos se revalidan en preflight y antes de publicar. Si ya existen servicios/datos antiguos, su retirada necesita decisión del operador; no se ha ejecutado aquí.
