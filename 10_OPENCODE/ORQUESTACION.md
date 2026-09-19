# Delegación acotada y continuidad

<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->
> **Decisión vigente:** GLM-5.3-Flash coordina; Muse Spark 1.3 Contributor implementa; DeepSeek V4.1 Flash revisa; MiniMax M3 explora. [Adenda](ADENDA_COORDINADOR_GLM_FLASH.md). No reintroducir Kimi como coordinador. El cambio no autoriza publicación ni modifica criterios o estados.

## Bucle por tarea

Estado→ficha→encargo pequeño→Task implementador→diff/pruebas→Task revisor cuando corresponda→corrección acotada→registro y siguiente tarea. Un subagente activo a la vez. No se necesitan plugins u otro orquestador para esta base.

Revisión obligatoria: datos/config de publicación, enlaces externos, privacidad, ausencia de backend, seguridad/cabeceras, CI, artefactos y recuperación. Ajustes cosméticos pequeños pueden agruparse. Revisar layout/capturas en hitos visuales; la elección de un modelo no garantiza que la integración entregue imágenes. No usar una puntuación o DOM como sustituto.

## Contrato de encargo

```text
Proyecto e ID:
Objetivo de esta unidad:
Dependencias y estado comprobados:
Rutas permitidas y archivos fuera de alcance:
Documentos y rangos mínimos:
Criterios/casos con resultados esperados:
Comandos locales autorizados:
Prohibiciones (recepción/DB/CAPTCHA/terceros/pagos/publicación):
Evidencia y formato de retorno:
Condición para detener/escalar:
```

Hasta cinco archivos principales de lógica/UI por unidad como guía, más pruebas. Si hace falta más, justificar y partir secuencialmente sin dejar una unidad inconsistente. No asignar “haz toda la web”. Evitar relectura de fuentes originales/base64; usar transcripciones/rangos.

## Estado durable

El implementador escribe evidencia, no el plan. El coordinador escribe ESTADO_TAREAS/ESTADO y un acta; no reescribe definiciones de pruebas para cerrar. Guardar después de cada unidad y antes del límite de contexto/cuota. Conservar commands/exit codes y lo no ejecutado; una captura de un sitio antiguo no acredita el actual.

## Límites

steps controla iteraciones, subagent_depth anidamiento y un escritor es política operativa: no son barreras de coste o aislamiento completas. Mantener credenciales fuera del entorno y scripts revisados. Al agotar Go, pausar con estado; no tomar promociones o modelos gratuitos temporales como infraestructura garantizada. Cambios de modelo se aprueban y prueban sin alterar el contrato de la tarea.
