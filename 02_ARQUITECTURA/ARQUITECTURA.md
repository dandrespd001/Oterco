# Arquitectura estática e independiente

**Proyecto:** OTERCO · **Corte documental:** 17 de septiembre de 2026
**Estado:** especificación para desarrollar; no acredita implementación, aprobación comercial ni despliegue.


## Decisión

Una sola app Astro `output: static`. Node se ejecuta en desarrollo y compilación, no por visita. Sin adaptador SSR, runtime Worker propio, D1, KV, R2, APIs externas o secretos de aplicación. Workers Static Assets aloja `dist/` y configura cabeceras/404. El proveedor se puede cambiar publicando esa misma salida con adaptación explícita de headers/redirecciones. Fuentes V08, V14, V20, V27.

```text
oterco-web/                       # repo propio, no hijo de un workspace común
  apps/oterco/
    src/
      config/site.ts
      contracts/
      content/home.json
      content/legal/
      assets/{photos,icons,fonts}/
      layouts/EditorialLayout.astro
      components/{navigation,chapters,ui}/
      styles/{tokens,typography,base}.css
      tools/preparador/{Shell.astro,client.ts,logic.ts,logic.test.ts}
      pages/{index,privacidad,404}.astro
    public/                       # solo archivos públicos autorizados
    astro.config.mjs
    wrangler.jsonc
  scripts/                        # validación, assets y release multiplataforma
  tests/{unit,e2e,visual}/
  docs/implementacion/
  .opencode/{agents,commands}/
  package.json
  pnpm-workspace.yaml
  pnpm-lock.yaml                  # generado al instalar, no inventado
```

Los nombres de archivos representan el destino a implementar, no archivos incluidos en este paquete Markdown. La estructura pequeña con una app evita arrastrar contenido o diseño de Puerta Abierta.

## Dependencias y fronteras

Presentación consume datos normalizados; la lógica del preparador no conoce CSS, nombre de empresa, correo ni DOM. El adaptador UI usa la configuración local y transforma el resultado en texto escapado. Los contratos nunca importan componentes. No importar otro repo ni crear un SDK genérico de dos marcas. Solo extraer utilidades técnicas tras repetición demostrada y mediante un registro de procedencia.

Recursos originales en `.private-references/` fuera de publicación y del contexto habitual de los agentes. Los derivados públicos aprobados entran en `src/assets`, nunca todo el directorio original. `public` no debe contener .md, documentos internos, certificados, modelos, claves, datos de prueba o mapas de código.

## Módulos

Navegación y lectura deben funcionar sin JS. Preparador opcional con registro permitido local y carga dinámica tras apertura. La tarjeta y shell pueden ser HTML estático. No aplicar `client:*` a `.astro` esperando convertirlo en componente de otro framework. No incorporar React para tres campos.

Para módulo deshabilitado, excluir su importación y recursos exclusivos del build; para módulo cerrado, no descargar todavía su lógica. No basta `display:none`. Comprobar ambas garantías en archivos y red. Nada se elige según hostname en un bundle que contenga ambas empresas.

## Reproducibilidad

Lockfile/versiones propios del repo, comandos pnpm propios y CI propio. Transferir aprendizaje de Puerta Abierta por commit/nota, no copiar su lockfile a ciegas. Fijar configuraciones compatibles y ejecutar instalación limpia. Si existe código previo, migrar por cambios revisables; no borrar para acomodarlo al árbol.
