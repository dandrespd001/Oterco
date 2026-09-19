# Archivos operativos que se crearán — OTERCO

Los archivos noMarkdown se generan durante la primera tarea de desarrollo: manifiestos de paquetes, lockfile, configuración Astro/TypeScript/QA/hosting y automatización. Este documento no finge que ya existen. El bootstrap OpenCode es el único paso previo que materializa JSON desde el contexto.

## Git e inventario

Crear un `.gitignore` revisado que excluya node_modules, dist, `.wrangler`, entornos locales con secretos, logs, copias de bases, `.private-references`, archivos de autenticación y reportes temporales voluminosos. Permitir los ejemplos de variables sin credenciales. Mantener en Git las fuentes del sitio y el lockfile y snapshots de referencia autorizados con tamaño controlado. No ignorar todos los PNG/JSON indiscriminadamente: algunos son recursos o fixtures necesarios.

No versionar archivos tipográficos si su licencia/proceso de distribución no lo permite; revisar cada recurso. Mantener permiso y atribución exigidos. El ZIP de contexto no contiene fuentes tipográficas ni activos binarios.

## Scripts mínimos

Instalación bloqueada, dev, check (Astro/TS/lint/formato/config), test, build:test, test:e2e, verify, release:prepare, release:publish y release:rollback. Solo crear aliases que realmente existan. Los comandos de publicación requieren autorización y deben operar sobre un candidato identificado; no hacer build implícito ni desplegar ambas empresas.

El workflow se verifica con Linux estándar y scripts multiplataforma. Dependencias, versiones y acciones de CI quedan fijadas tras comprobación; las acciones de terceros se revisan y se prefieren referencias inmutables verificadas. Conservar actualización controlada, no congelar herramientas indefinidamente.

## Estado del repositorio

Antes de cada tarea revisar cambios existentes, archivos sin seguimiento y rama. No reset/clean destructivo. El lockfile lo genera el gestor real; no editarlo para simular una instalación. La instalación y pruebas de la web se registran en docs/implementacion, distintas de las comprobaciones de este paquete.
