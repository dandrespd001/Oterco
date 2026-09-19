# Casos de aceptación

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


Cada caso comienza **pendiente**. Registrar comando/entorno/commit, resultado esperado/observado y evidencia. Diferenciar `pasado`, `fallido`, `no ejecutado` y `bloqueado`. El resultado de una prueba local no acredita configuración de cuenta remota ni licencia de recurso.

| Caso | Requisito | Condición verificable |
|---|---|---|
| OT-Q001 | OT-R02 | Existe un único repositorio/app de OTERCO, sin imports, assets o lockfiles de Puerta Abierta. |
| OT-Q002 | OT-R03 | El operador confirma el plan y destino Free antes de operaciones remotas; no hay trial ni upgrade. |
| OT-Q003 | OT-R06 | La instalación limpia utiliza un lockfile auténtico y versiones registradas. |
| OT-Q004 | OT-R06 | Se ejecutan astro check y TypeScript estricto; el build no se presenta como sustituto. |
| OT-Q005 | OT-R01 / OT-R05 | Las fuentes están clasificadas; el perfil ganadero no se usa para afirmar un CIIU actualizado. |
| OT-Q006 | OT-R05 | Los datos solares conflictivos no aparecen en HTML ni metadatos hasta su aprobación. |
| OT-Q007 | OT-R07 | Las dos fincas y las tres líneas de oferta corresponden a las transcripciones aportadas. |
| OT-Q008 | OT-R05 | La falta de aprobación de NIT/contacto bloquea la release comercial, no la salida técnica. |
| OT-Q009 | OT-R06 | Un cambio de texto, foto o token se limita al archivo correspondiente y pasa la validación. |
| OT-Q010 | OT-R04 | Hay wireframes completos y una ficha propia, sin clonar el diseño de Puerta Abierta. |
| OT-Q011 | OT-R04 | Las fuentes elegidas son distintas, están autorizadas y se cargan realmente; no se aprueba un fallback accidental. |
| OT-Q012 | OT-R04 | La comparación visual completa frente a Puerta Abierta está documentada; no se limita a colores. |
| OT-Q013 | OT-R08 | La navegación funciona a 320 y 390 CSS px con y sin JavaScript. |
| OT-Q014 | OT-R08 | Los trece enlaces file:// de la referencia se sustituyen; todos los destinos públicos son válidos. |
| OT-Q015 | OT-R08 | Existen main, enlace de salto, un H1 y una jerarquía de encabezados/figuras coherente. |
| OT-Q016 | OT-R13 | El orden de foco y Tab/Escape/Enter funciona sin atrapamiento ni elementos enfocados ocultos. |
| OT-Q017 | OT-R13 | El contraste de texto, controles y foco cumple los criterios aplicables en todas las superficies. |
| OT-Q018 | OT-R13 | Zoom 200 %, reflow 400 % y vistas de 320/390/768/1440 CSS px no provocan desbordes injustificados. |
| OT-Q019 | OT-R13 | El movimiento reducido elimina desplazamientos; el contenido es visible antes de cualquier animación. |
| OT-Q020 | OT-R09 | Los seis JPEG mantienen trazabilidad, huellas y permisos registrados para los derivados que se publiquen. |
| OT-Q021 | OT-R09 | No se incluyen fotografías en base64, carpetas privadas o certificados en el directorio dist. |
| OT-Q022 | OT-R09 | Las imágenes reservan dimensiones, usan srcset/sizes correctos y recortes razonables. |
| OT-Q023 | OT-R09 | La foto vertical del bebedero se contiene en su composición y no se amplía de forma engañosa. |
| OT-Q024 | OT-R09 | Los textos alternativos y pies son apropiados; no certifican raza o propiedad a partir de una imagen. |
| OT-Q025 | OT-R10 | Las tres categorías del preparador generan asunto y cuerpo correctos; se permite mensaje vacío. |
| OT-Q026 | OT-R10 | Un mensaje de 800 caracteres se acepta y uno de 801 se rechaza; Unicode y saltos se conservan correctamente. |
| OT-Q027 | OT-R10 | Una entrada que contiene HTML se muestra como texto y no se ejecuta mediante innerHTML. |
| OT-Q028 | OT-R10 | El destinatario de correo procede de configuración aprobada; no admite inyección de cabeceras o destinatarios. |
| OT-Q029 | OT-R10 | El enlace mailto está codificado; un URI demasiado largo ofrece copia. Nunca se anuncia envío confirmado. |
| OT-Q030 | OT-R10 | Si Clipboard no existe o se deniega, el texto permanece seleccionable para copia manual. |
| OT-Q031 | OT-R11 | Las reaperturas y dos instancias no duplican listeners, identificadores ni estado. |
| OT-Q032 | OT-R11 | El módulo cerrado no descarga su lógica; el módulo deshabilitado no publica recursos exclusivos. |
| OT-Q033 | OT-R12 | El borrador no se guarda en almacenamiento del navegador, logs o peticiones automáticas. |
| OT-Q034 | OT-R12 | Un fallo de JavaScript no rompe contacto o portafolio; la limpieza del borrador es voluntaria. |
| OT-Q035 | OT-R12 | El buzón se prueba mediante operación humana; teléfono y WhatsApp solo aparecen tras aprobación. |
| OT-Q036 | OT-R12 | La privacidad corresponde a canales y proveedores reales; no se instala un banner decorativo. |
| OT-Q037 | OT-R14 | La transferencia inicial es como máximo 1.000.000 bytes y el JS inicial 15.000 bytes gzip, con método registrado. |
| OT-Q038 | OT-R14 | El módulo agrega como máximo 10.000 bytes gzip y el CSS inicial 40.000; fuentes y fotografía se miden. |
| OT-Q039 | OT-R14 | La mediana de tres ejecuciones móviles comparables de Lighthouse es al menos 90; no se afirma rendimiento de campo. |
| OT-Q040 | OT-R15 | Título, descripción, canonical, robots y sitemap son correctos, propios y coherentes con el destino. |
| OT-Q041 | OT-R15 | Una ruta inexistente devuelve 404 real, sin fallback SPA; HTTPS y hostname están aprobados. |
| OT-Q042 | OT-R16 | CSP, caché y cabeceras efectivas no rompen recursos; el HTML mutable no lleva cache immutable. |
| OT-Q043 | OT-R16 | No se publican secretos, documentos internos, configuración OpenCode o sourcemaps por defecto. |
| OT-Q044 | OT-R17 | Existe una sola cadena de publicación con commit, huellas y configuración; no recompila al promover. |
| OT-Q045 | OT-R17 | Se rechazan artefactos técnicos, alterados, de Puerta Abierta o con borradores no publicables. |
| OT-Q046 | OT-R17 | Los permisos y cuotas de CI están revisados; ningún PR no confiable recibe secretos. |
| OT-Q047 | OT-R18 | La recuperación de un artefacto probado restaura la web y repite las comprobaciones de producción. |
| OT-Q048 | OT-R18 | La persona receptora puede editar texto, foto y contacto de prueba y ejecutar las verificaciones. |
| OT-Q049 | OT-R19 | La delegación mediante Task es real y quedan persistidos el estado, comandos y resultados. |
| OT-Q050 | OT-R20 | No se instalan API, D1, IA, CRM, modo oscuro ni autoplay fuera del alcance aprobado. |
| OT-Q051 | OT-R05 | La producción se bloquea sin derechos de recursos, contactos, afirmaciones y aprobador. |
| OT-Q052 | OT-R13 | Se combina axe con revisión manual y las capturas se inspeccionan realmente. |
| OT-Q053 | OT-R03 | La superación de una cuota limita o suspende la función y se informa; no activa pagos automáticamente. |
| OT-Q054 | OT-R17 | La prueba remota autorizada y el acta de entrega reflejan el estado real de publicación. |

## Evidencia y decisión

Unitarias prueban lógica/configuración sin DOM; E2E consume compilado, no solo astro dev. Capturas corresponden al commit. Pruebas visuales usan mismo entorno y referencias locales. Contraste, teclado, coherencia/fotografías y diferencias entre marcas necesitan revisión contextual. No aumentar presupuestos ni borrar tests para aprobar.

Los campos editoriales/críticos pueden impedir publicar sin impedir entregar código. OT-14 cierra la entrega técnica; OT-15 resuelve aprobaciones; OT-16 comprueba el destino Free; OT-17 publica tras autorización. Cualquier N/A requiere justificación real y autorización; no elimina el requisito.
