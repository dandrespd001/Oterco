# Seguridad operacional de los agentes

La configuración es de desarrollo local, no un perímetro de seguridad absoluto. OpenCode combina niveles de configuración; permisos de terminal pueden ejecutar scripts con efectos indirectos. Revisar permisos efectivos e instrucciones heredadas antes de usar. Mantener credenciales, datos de clientes y producción fuera del entorno.

Coordinador: editar solo ESTADO, SESIONES, APROBACIONES, ESTADO_TAREAS y registro preflight; las aprobaciones del propietario solo se registran con su mensaje/evidencia. Implementador: código y evidencia en rutas asignadas, sin cambiar agentes/contratos normativos. Revisor/explorador: sin edición de fuentes. Terminal ask por defecto salvo lecturas simples; scripts locales se autorizan después de revisarlos.

No autorizar todo pnpm/node/bash para evitar molestias. Instalación ejecuta código de dependencias: versiones/lockfile y revisión importan. Previews de prueba ligadas a localhost y sin datos privados; no abrir servidores de desarrollo a interfaces públicas innecesariamente.

Prohibidas operaciones de publicación, DB, secretos, DNS, eliminación de servicios/datos, push y compras desde los agentes. El operador puede ejecutar una acción de release aprobada fuera de esta sesión. No relajar las reglas del coordinador para que se autorice a sí mismo.

El scanner del producto no garantiza confidencialidad de la máquina; los perfiles de herramientas tampoco. Si hay repositorios/servicios anteriores, inventariar y migrar con permisos expresos. No exponer un endpoint viejo solo porque la nueva interfaz ya no lo usa.
