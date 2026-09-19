# Inicio — OTERCO

<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->
> **Decisión vigente:** GLM-5.3-Flash coordina; Muse Spark 1.3 Contributor implementa; DeepSeek V4.1 Flash revisa; MiniMax M3 explora. [Adenda](10_OPENCODE/ADENDA_COORDINADOR_GLM_FLASH.md). No reintroducir Kimi como coordinador. El cambio no autoriza publicación ni modifica criterios o estados.

**Contexto vigente: webs estáticas, 17 de septiembre de 2026.** Este es un flujo independiente con 17 tareas y 54 casos de aceptación pendientes. No es una aplicación ya implementada.

OTERCO mantiene su interfaz rural/editorial y su preparador de consulta local. No lo conviertas en receptor: solo preparar/copiar o abrir el canal aprobado, sin envío automático ni persistencia. Puerta Abierta también es estática y ya no recibe formularios.

## 1. Preparar el directorio correcto

Extrae esta carpeta en un directorio de trabajo propio, conserva `.opencode/` aunque tu explorador oculte carpetas con punto, y ábrela como raíz de proyecto. No ejecutes los dos coordinadores desde la carpeta paraguas. Mantén repositorio y publicación separados del otro sitio.

Comienza tras el cierre de Puerta Abierta y la autorización de traspaso. Su diseño es una referencia de diferenciación, nunca una plantilla para copiar.

Detén escritores anteriores, revisa `git status` y conserva copia antes de integrar. No uses reset/clean ni sobreescritura masiva. [AGENTS](AGENTS.md), [alcance](01_PRODUCTO/ALCANCE.md) y [decisiones](00_CONTROL/DECISIONES.md) gobiernan la implementación.

## 2. Herramientas y configuración

Necesitas Git, Node admitido por Astro, pnpm y OpenCode. Consulta las fuentes oficiales desde los documentos del stack; registra versiones realmente instaladas. El proyecto fijará el conjunto durante OT-01. Python solo se usa opcionalmente para utilidades documentales; no es un requisito de la web.

El paquete contiene únicamente Markdown. Sigue [BOOTSTRAP](10_OPENCODE/BOOTSTRAP.md): guarda su bloque JavaScript como `materializar-config.mjs` en esta raíz y ejecútalo con Node. Obtiene `opencode.json` del bloque exacto de CONFIGURACION, sin dependencias ni red, y se niega a sobrescribir. No guardes claves en estos archivos.

```bash
node materializar-config.mjs
opencode --version
opencode models
opencode debug agents
```

Comprueba el [preflight](10_OPENCODE/PREFLIGHT.md). Si falta la conexión Go, ejecuta `/connect` en OpenCode y elige Go; introduce la clave allí, no en el chat. Desactiva Use balance en la cuenta. Revisa configuraciones globales, MCP y permisos heredados. El JSON no es una sandbox ni una prueba de que tu cuenta tenga los modelos.

## 3. Arrancar el flujo

```bash
opencode --auto
```

En la interfaz de OpenCode:

```text
/ot-iniciar
```

Ese comando comprueba el contexto y empieza OT-01 cuando el entorno está listo. No lances la misma tarea otra vez si ya está en curso. Para dirigir una tarea pendiente explícita, utiliza `/ot-tarea OT-01` reemplazando el ID por el del [estado vivo](07_PLAN/ESTADO_TAREAS.md).

El coordinador delega mediante Task real a un implementador; después solicita revisión proporcional. Un solo escritor y una unidad acotada por encargo. No autorices el plan completo como una escritura sin puntos de control.

## 4. Revisar y continuar

Usa `/ot-estado` para consultar, `/ot-revisar ID` para revisión y `/ot-guardar` antes de cerrar o cambiar de sesión. El coordinador actualiza [estado](00_CONTROL/ESTADO.md), [tareas](07_PLAN/ESTADO_TAREAS.md) y actas; no reescribe criterios para hacer pasar resultados.

Los comandos `pnpm check`, `pnpm test`, `pnpm verify` y de publicación son contratos que se implementan en el repositorio: no están operativos por el solo hecho de extraer este ZIP. Aprueba primero scripts locales concretos y no reglas amplias `pnpm *` o `bash *`.

Revisa wireframes y el primer prototipo móvil/escritorio antes de completar todas las secciones. Los datos sin aprobación son fixtures, nunca hechos inventados. Usa [el prompt](PROMPT_INICIO.md) si necesitas iniciar manualmente una sesión.

## 5. Publicación y mantenimiento

Las [puertas de publicación](07_PLAN/BLOQUEOS_DE_PUBLICACION.md) son distintas del cierre técnico. El operador confirma canales, contenido, imágenes, privacidad, cuenta Free, dominio/destino y recuperación. Los agentes no publican, alteran DNS ni se conceden credenciales.

Sigue [despliegue](05_INFRAESTRUCTURA/DESPLIEGUE.md) para promover los archivos ya comprobados, sin recompilación oculta. La denominación Workers Static Assets no obliga a crear un handler: solo se publica el resultado estático. Revisa la URL, estado 404, HTTPS, contacto y cabeceras. No uses el historial de Git como única copia de la release.

## Recursos de entrada

Los originales privados, imágenes y fuentes tipográficas no están dentro de este ZIP Markdown. Las transcripciones y huellas están en 09_FUENTES. Para OTERCO se necesita el HTML original al recuperar sus seis fotos mediante la utilidad documentada; el operador las extrae, revisa y aporta los derivados autorizados. No cargar base64 completo o certificados privados a cada agente.

[Informe de verificación del paquete](99_VALIDACION/INFORME.md). Ni la CLI OpenCode, ni las webs, ni sus despliegues se han ejecutado en esta entrega documental.
