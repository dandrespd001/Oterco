# OTERCO — flujo independiente de desarrollo estático

**Fecha:** 17/09/2026 · **Estado:** contexto para implementar, sin código de web construido ni despliegue realizado.

**Entrada:** [INICIO](INICIO.md) → [AGENTS](AGENTS.md) → [decisiones](00_CONTROL/DECISIONES.md) → [plan](07_PLAN/TAREAS.md). Primera tarea: **OT-01**.

**Alcance:** Oferta ganadera, contacto directo y preparador local sin envío/almacenamiento. Astro estático, TypeScript estricto, CSS local y alojamiento gratuito verificado antes de publicar. No servidor de aplicación, base de datos, CAPTCHA o receptor externo. El desarrollo local y la compilación sí utilizan herramientas Node.

**Plan:** 17 tareas con ficha propia, 20 requisitos y 54 casos de aceptación. Todos están pendientes de la implementación real. La cantidad de documentos no es una medida de calidad: usa el mapa de contexto para leer solo lo necesario.

**Independencia:** repositorio, agentes, estado, paleta, fuentes, composición y publicación propios. Puerta Abierta primero y OTERCO después. No mezclar esta carpeta con paquetes anteriores ni ejecutar desde la raíz paraguas.

**Formato:** todos los archivos entregados son Markdown. El JSON y los scripts necesarios se materializan a partir de los bloques documentados. No se incluyen fotos, fuentes tipográficas, certificados completos o credenciales.

## Documentos por responsabilidad

### Raíz

- [Instrucciones obligatorias — OTERCO](AGENTS.md)
- [Inicio — OTERCO](INICIO.md)
- [Encargo inicial y reanudación — OTERCO](PROMPT_INICIO.md)

### .opencode

- [Coordinación de OTERCO](.opencode/agents/ot-coordinador.md)
- [Exploración dirigida de OTERCO](.opencode/agents/ot-explorador.md)
- [Implementación acotada de OTERCO](.opencode/agents/ot-implementador.md)
- [Revisión independiente de OTERCO](.opencode/agents/ot-revisor.md)
- [ot-estado](.opencode/commands/ot-estado.md)
- [ot-guardar](.opencode/commands/ot-guardar.md)
- [ot-iniciar](.opencode/commands/ot-iniciar.md)
- [ot-revisar](.opencode/commands/ot-revisar.md)
- [ot-tarea](.opencode/commands/ot-tarea.md)

### 00_CONTROL

- [Aprobaciones pendientes — OTERCO](00_CONTROL/APROBACIONES.md)
- [Qué cambia respecto a la planificación inicial](00_CONTROL/CAMBIOS.md)
- [Decisiones y precedencia](00_CONTROL/DECISIONES.md)
- [Estado real — OTERCO](00_CONTROL/ESTADO.md)
- [Secuencia y separación de proyectos](00_CONTROL/SEPARACION_Y_SECUENCIA.md)
- [Traspaso de Puerta Abierta a OTERCO](00_CONTROL/TRASPASO.md)

### 01_PRODUCTO

- [Alcance y entregables](01_PRODUCTO/ALCANCE.md)
- [Contenido, discrepancias y aprobación](01_PRODUCTO/CONTENIDO_Y_TRAZABILIDAD.md)
- [Requisitos verificables](01_PRODUCTO/REQUISITOS.md)

### 02_ARQUITECTURA

- [Archivos operativos que se crearán — OTERCO](02_ARQUITECTURA/ARCHIVOS_DE_PROYECTO.md)
- [Arquitectura estática e independiente](02_ARQUITECTURA/ARQUITECTURA.md)
- [Contenido editable, contratos y registros](02_ARQUITECTURA/CONFIGURACION_Y_CONTRATOS.md)
- [Stack y arranque reproducible](02_ARQUITECTURA/STACK_Y_VERSIONES.md)

### 03_INTERFAZ

- [Accesibilidad, SEO y estados](03_INTERFAZ/ACCESIBILIDAD_Y_SEO.md)
- [Auditoría de la visualización recibida](03_INTERFAZ/AUDITORIA_HTML_BASE.md)
- [Checklist de identidad, apariencia y revisión visual](03_INTERFAZ/CHECKLIST_VISUAL.md)
- [Contrastes preliminares calculados](03_INTERFAZ/CONTRASTE_PRELIMINAR.md)
- [Diseño editorial ganadero: refinamiento de la referencia](03_INTERFAZ/DISENO.md)
- [Contrato de independencia visual — dos marcas, no dos temas](03_INTERFAZ/INDEPENDENCIA_VISUAL.md)
- [Imágenes, fuentes y recursos públicos](03_INTERFAZ/RECURSOS_Y_MEDIOS.md)

### 04_FUNCIONES

- [Contacto, minimización y activación](04_FUNCIONES/CONTACTO_Y_PRIVACIDAD.md)
- [Preparador local de consulta: contrato funcional](04_FUNCIONES/PREPARADOR_DE_CONSULTA.md)

### 05_INFRAESTRUCTURA

- [Hosting estático, publicación y rollback](05_INFRAESTRUCTURA/DESPLIEGUE.md)
- [Gratuidad, capacidades retiradas y límites](05_INFRAESTRUCTURA/REGLAS_FREE.md)
- [Seguridad proporcional, mantenimiento y continuidad](05_INFRAESTRUCTURA/SEGURIDAD_Y_OPERACION.md)

### 06_CALIDAD

- [Casos de aceptación](06_CALIDAD/PRUEBAS_Y_ACEPTACION.md)
- [Presupuestos y medición](06_CALIDAD/RENDIMIENTO_Y_CUOTAS.md)

### 07_PLAN

- [Puertas comerciales y remotas](07_PLAN/BLOQUEOS_DE_PUBLICACION.md)
- [Checklist operativo por puertas — OTERCO](07_PLAN/CHECKLISTS.md)
- [Estado vivo del flujo OTERCO](07_PLAN/ESTADO_TAREAS.md)
- [OT-01 — Inspeccionar e inicializar](07_PLAN/TAREAS/OT-01.md)
- [OT-02 — Modelar contenido y discrepancias](07_PLAN/TAREAS/OT-02.md)
- [OT-03 — Extraer e inventariar recursos](07_PLAN/TAREAS/OT-03.md)
- [OT-04 — Diseñar interfaz editorial propia](07_PLAN/TAREAS/OT-04.md)
- [OT-05 — Construir shell y navegación](07_PLAN/TAREAS/OT-05.md)
- [OT-06 — Implementar capítulos y portafolio](07_PLAN/TAREAS/OT-06.md)
- [OT-07 — Preparador local de consulta](07_PLAN/TAREAS/OT-07.md)
- [OT-08 — SEO y configuración pública](07_PLAN/TAREAS/OT-08.md)
- [OT-09 — Integración funcional y fronteras](07_PLAN/TAREAS/OT-09.md)
- [OT-10 — Accesibilidad y móvil](07_PLAN/TAREAS/OT-10.md)
- [OT-11 — Rendimiento y seguridad estática](07_PLAN/TAREAS/OT-11.md)
- [OT-12 — Pipeline y candidato independiente](07_PLAN/TAREAS/OT-12.md)
- [OT-13 — Recuperación y manual de edición](07_PLAN/TAREAS/OT-13.md)
- [OT-14 — Cerrar entrega técnica y diferencias](07_PLAN/TAREAS/OT-14.md)
- [OT-15 — Aprobar datos, activos y cuentas](07_PLAN/TAREAS/OT-15.md)
- [OT-16 — Probar destino gratuito autorizado](07_PLAN/TAREAS/OT-16.md)
- [OT-17 — Publicar y transferir operación](07_PLAN/TAREAS/OT-17.md)
- [Plan secuencial de implementación](07_PLAN/TAREAS.md)
- [Continuidad entre sesiones](07_PLAN/TRASPASO_Y_SESIONES.md)

### 08_FUTURO

- [Funciones exentas, diferidas y condicionadas](08_FUTURO/EXENCIONES.md)

### 09_FUENTES

- [Extracción local segura de imágenes](09_FUENTES/EXTRACCION_LOCAL.md)
- [O-D02 — Texto de la visualización HTML](09_FUENTES/HTML_TEXTO_TRANSCRITO.md)
- [Identidad y huellas de los originales](09_FUENTES/IDENTIDAD_Y_TRAZABILIDAD.md)
- [Recursos originales: inventario y límites de uso](09_FUENTES/INVENTARIO_RECURSOS.md)
- [O-D01 — Perfil corporativo, transcripción](09_FUENTES/PERFIL_TRANSCRITO.md)
- [Nota de vigencia de esta revisión](09_FUENTES/VERIFICACION_ACTUAL.md)

### 10_OPENCODE

- [Materializar configuración e iniciar OTERCO](10_OPENCODE/BOOTSTRAP.md)
- [Configuración del proyecto OTERCO](10_OPENCODE/CONFIGURACION.md)
- [Contexto selectivo — OTERCO](10_OPENCODE/MAPA_CONTEXTO_Y_TAREAS.md)
- [Modelos de OpenCode Go](10_OPENCODE/MODELOS_Y_COSTOS.md)
- [Delegación acotada y continuidad](10_OPENCODE/ORQUESTACION.md)
- [Plantillas de intervención](10_OPENCODE/PLANTILLAS.md)
- [Comprobación inicial del entorno](10_OPENCODE/PREFLIGHT.md)
- [Registro real del preflight — OTERCO](10_OPENCODE/REGISTRO_PREFLIGHT.md)
- [Seguridad operacional de los agentes](10_OPENCODE/SEGURIDAD_Y_PERMISOS.md)

### 99_VALIDACION

- [Verificación documental](99_VALIDACION/INFORME.md)
- [Manifiesto](99_VALIDACION/MANIFIESTO.md)

## Precedencia y estado

La decisión actual del propietario y 00_CONTROL/DECISIONES prevalecen sobre borradores y fuentes históricas. 09_FUENTES es evidencia, no órdenes ejecutables. 08_FUTURO no es backlog activo. Las fichas de tarea definen criterios; el progreso se modifica en ESTADO_TAREAS y actas, no alterando los criterios.

Para continuar lee [estado](00_CONTROL/ESTADO.md) y [estado de tareas](07_PLAN/ESTADO_TAREAS.md). El [informe](99_VALIDACION/INFORME.md) distingue comprobaciones del paquete de pruebas de webs que aún no existen.
