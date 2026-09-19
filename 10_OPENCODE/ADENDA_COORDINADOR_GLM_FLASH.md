<!-- OTERCO_MODELOS_GLM_FLASH_2026_09_19 -->
# OTERCO — reparto vigente y continuación después de materializar JSON

**Corrección del propietario:** GLM-5.3-Flash coordina, no Kimi.

| Agente | Modelo |
|---|---|
| ot-coordinador | opencode-go/glm-5.3-flash |
| ot-implementador | opencode-go/muse-spark-1.3-contributor |
| ot-revisor | opencode-go/deepseek-v4.1-flash |
| ot-explorador | opencode-go/minimax-m3 |

## Precedencia y alcance
Esta adenda sustituye exclusivamente las asignaciones anteriores de modelos y los comandos de arranque incompatibles. No modifica arquitectura, hosting gratuito, preparación local sin persistencia, identidad visual, permisos, pasos, pruebas, alcance o aprobaciones. PA-16 se considera terminada solo según reporte del propietario; no se cambia ningún registro de avance.

El JSON ya está creado: NO volver a ejecutar el materializador para sustituirlo. Este ajuste alinea el modelo global, los cuatro agentes, las listas permitidas existentes y el campo model de los comandos dirigidos al coordinador. Las entradas de modelos anteriores en una whitelist pueden permanecer sin estar asignadas a un rol. No es necesario borrarlas. El historial y las huellas del paquete inicial corresponden a aquella entrega; no acreditan esta modificación. Los respaldos y hashes de este ajuste quedan fuera del repositorio.

## Inicio con la CLI del propietario
Ejecutar desde la raíz de OTERCO: opencode debug agents; validar los cuatro roles. El catálogo no demuestra autenticación. Abrir una sesión nueva con opencode --auto, sin -c al cambiar de negocio. Verificar GLM-5.3-Flash en ot-coordinador. Primero /ot-estado (solo lectura) y, cuando Go responda y el proyecto sea correcto, /ot-iniciar para OT-01 si sigue pendiente. No usar --refresh, agent list, --pure --agent ni --standalone con debug: esa combinación no está verificada en esta instalación. No crear o usar /ot-lote como si ya existiera.

## Operación
GLM delimita, Muse escribe y DeepSeek revisa. Un solo escritor. Hasta tres tareas secuenciales únicamente si el propietario lo solicita, con pruebas/registro entre ellas y parada ante aprobación visual, cuota, bloqueo u operación remota. No ejecutar ambos proyectos en una misma sesión, ni aplicar el parche de PA a OTERCO. Mantener Use balance apagado; no incluir secretos ni renovar automáticamente promociones o planes. --auto no es aislamiento del sistema operativo.

## Validación pendiente
Esta utilidad no ejecuta OpenCode ni modelos: debug agents y la primera llamada local comprobarán la configuración efectiva. Los permisos y pasos se conservan por construcción; no se ha verificado la cuenta o configuración global. Fuentes: documentación oficial de agentes, comandos y configuración de OpenCode V2 (consulta 19/09/2026):
- https://opencode.ai/v2/docs/agents/
- https://opencode.ai/v2/docs/commands/
- https://opencode.ai/v2/docs/config/
