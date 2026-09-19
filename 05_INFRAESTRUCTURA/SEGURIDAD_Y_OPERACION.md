# Seguridad proporcional, mantenimiento y continuidad

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Seguridad

No hay API de captación ni DB, por lo que no se guardan secretos de aplicación en el frontend. Las claves de despliegue y Go son credenciales externas del operador, no archivos para el modelo. No publicarlas en variables `PUBLIC_`, JSON, Git, logs, capturas o artefactos. MFA, responsable y recuperación externa al dominio. Accesos mínimos por destino; no incluir claves PA.

Cualquier contenido libre se maneja como texto, no HTML ejecutable. Revisar URLs por protocolo permitido, no `javascript:`. `.private-references`, Markdown de planificación, reportes y certificados no se copian apublic. Deshabilitar sourcemaps públicos por defecto sin considerarlos mecanismo de protección de secretos.

Dependencias fijadas, licencias examinadas, scripts npm inspeccionados cuando proceda, actualizaciones mayores en rama separada y con migración/pruebas. No `audit --fix --force` automático. El análisis de vulnerabilidades se interpreta con alcance; no prometer cero vulnerabilidades.

## Rutinas del responsable

| Frecuencia propuesta | Actividad | Registro |
|---|---|---|
| Cada cambio | Verificar datos/build/interacciones; candidato probado y aprobación | Acta de release |
| Mensual | Contacto, enlaces, fotos/fuentes, dependencias y errores | Registro de mantenimiento |
| Trimestral | Permisos, cuota, renovaciones y recuperación | Acta de revisión |
| Incidente | Valorar impacto, congelar cambios, restaurar versión si procede | Incidente con acciones/evidencia |

Estas frecuencias son propuestas operativas. Tratar una vulnerabilidad/incidente crítico cuando ocurra, no esperar al calendario. Mantener copias separadas de activos originales y distribución pública aprobada.

## Facilitar la edición

Editar textos en `content`, datos de configuración en `config`, apariencia en `styles/components`, y lógica del preparador en `tools`. Después ejecutar `check`, unitarias aplicables, build y E2E del recorrido afectado. Una corrección de texto no debe requerir modificar la infraestructura. Una foto nueva se incorpora por el pipeline y registro de derechos, no pegando base64.

La persona que reciba el proyecto debe practicar tres cambios: un texto, una foto y un canal de contacto (con dato de prueba). Puede localizar los archivos, validar, revisar preview y explicar cómo volver atrás. Sin panel CMS no se promete edición visual para cualquier usuario.

## Gratuidad y cuotas

Leer [reglasFree](REGLAS_FREE.md). Revisar la cuenta real antes de publicar; no activar trials, tarjetas, productos Paid ni autoescalado. Las peticiones estáticas están separadas de CPUWorker (V08), y OTERCO no incorpora un Worker aplicativo. No ofrecer SLA. Si el contenido crece más que el plan, optimizar/retirar funciones; no pagar silenciosamente.
