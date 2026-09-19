# Stack y arranque reproducible

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


| Capa | Elección |
|---|---|
| Generador | Astro estable, salida static |
| Lenguaje | TypeScript estricto, comprobación Astro explícita |
| Estilos | CSS local y variables; no runtime ni UI comercial obligatoria |
| Datos | JSON/Markdown + Zod compatible y tipos inferidos |
| Entorno | Node 24 LTS como línea inicial, parche probado |
| Gestor | pnpm workspace pequeño con una app; lockfile real |
| Unitarias | Vitest para contratos/preparador |
| Navegador | Playwright y axe, más revisión manual |
| Calidad | ESLint/Prettier compatibles con Astro, responsabilidades no duplicadas |
| Hosting | Wrangler fijado como dependencia de desarrollo, Assets estáticos |
| CI | GitHub Actions en Linux estándar dentro de cuotas |

OT-01 resuelve versiones exactas después de consultar compatibilidad primaria, instala y prueba. Fijar `.node-version`, `engines`, `packageManager` y lockfile. No usar `@latest` en cada build ni asumir que una versión recordada sigue siendo la adecuada. `astro build` no reemplaza `astro check` (V21–V23, V30).

Crear `docs/implementacion/VERSIONES.md` con tabla paquete/versión/compatibilidad/comando/resultado/fecha. Windows y Linux deben ejecutar scripts Node sin rutas personales o comandos exclusivos de una shell. No Docker obligatorio. OpenCode es herramienta de desarrollo externa, no dependencia del código publicado.

No instalar API ni DB: esas funciones se eliminaron del plan de Puerta Abierta y tampoco se requieren aquí. Zod puede usarse en build y lógica necesaria; evitar enviar al cliente todo el esquema editorial si no se utiliza. Revisar tamaños antes de aprobar librerías.
